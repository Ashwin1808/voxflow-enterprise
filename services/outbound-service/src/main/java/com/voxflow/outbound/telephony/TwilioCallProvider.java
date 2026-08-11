package com.voxflow.outbound.telephony;

import com.voxflow.outbound.event.CallEventPublisher;
import com.voxflow.workflow.event.dto.CallEvent;
import java.time.OffsetDateTime;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

/** Real PSTN dialing via Twilio. Requires TWILIO_ACCOUNT_SID + TWILIO_AUTH_TOKEN + TWILIO_FROM_NUMBER. */
@Component
@ConditionalOnProperty(name = "voxflow.call.provider", havingValue = "twilio")
public class TwilioCallProvider implements CallProvider {

    private static final Logger log = LoggerFactory.getLogger(TwilioCallProvider.class);

    private final TwilioApiClient api;
    private final CallEventPublisher publisher;
    private final String fromNumber;
    private final String publicBaseUrl;
    private final int pollIntervalSeconds;

    private final Map<String, UUID> sidToSession = new ConcurrentHashMap<>();
    private final Map<String, String> sidToPhone = new ConcurrentHashMap<>();
    private final Map<String, String> sidToLastStatus = new ConcurrentHashMap<>();
    private final ScheduledExecutorService poller = Executors.newScheduledThreadPool(1);

    public TwilioCallProvider(
            TwilioApiClient api,
            CallEventPublisher publisher,
            @Value("${voxflow.call.twilio.from-number:}") String fromNumber,
            @Value("${voxflow.call.public-base-url:}") String publicBaseUrl,
            @Value("${voxflow.call.twilio.poll-interval-seconds:5}") int pollIntervalSeconds) {
        this.api = api;
        this.publisher = publisher;
        this.fromNumber = fromNumber;
        this.publicBaseUrl = publicBaseUrl;
        this.pollIntervalSeconds = pollIntervalSeconds;

        if (fromNumber == null || fromNumber.isBlank()) {
            throw new IllegalStateException("CALL_PROVIDER=twilio requires TWILIO_FROM_NUMBER");
        }
        if (publicBaseUrl == null || publicBaseUrl.isBlank()) {
            poller.scheduleAtFixedRate(this::pollAll, pollIntervalSeconds, pollIntervalSeconds, TimeUnit.SECONDS);
            log.info("Twilio status polling enabled (no PUBLIC_BASE_URL configured)");
        }
    }

    @Override
    public String name() {
        return "TWILIO";
    }

    @Override
    public ProviderCall place(UUID sessionId, String phone, String workflowName) {
        Map<String, String> params = new java.util.LinkedHashMap<>();
        String webhookBase = (publicBaseUrl == null || publicBaseUrl.isBlank()) ? null : publicBaseUrl;

        if (webhookBase == null) {
            params.put("Twiml", inlineTwiMl());
        } else {
            params.put("Url", webhookBase + "/api/v1/outbound/provider/twiml/voice?sessionId=" + sessionId);
            params.put("StatusCallback", webhookBase + "/api/v1/outbound/provider/callbacks/status");
            params.put("StatusCallbackEvent", "initiated,ringing,answered");
        }

        String sid = api.createCall(fromNumber, phone, params);
        sidToSession.put(sid, sessionId);
        sidToPhone.put(sid, phone);
        sidToLastStatus.put(sid, "queued");

        publisher.publish("call.status", new CallEvent(
                sessionId, phone, workflowName, "DIALING", null, OffsetDateTime.now()));
        log.info("[twilio] call {} placed to {}", sid, phone);
        return new ProviderCall(sid, "DIALING");
    }

    /** Called by the status webhook and the poller. */
    public void ingestStatus(String sid, String twilioStatus) {
        if (sid == null || twilioStatus == null) {
            return;
        }
        String previous = sidToLastStatus.put(sid, twilioStatus);
        if (twilioStatus.equals(previous)) {
            return;
        }
        String voxflow = toVoxflowStatus(twilioStatus);
        UUID sessionId = sidToSession.get(sid);
        String phone = sidToPhone.get(sid);
        if (voxflow == null || sessionId == null) {
            return;
        }
        publisher.publish("call.status", new CallEvent(
                sessionId, phone, "fraud_verification", voxflow, null, OffsetDateTime.now()));
        log.info("[twilio] call {} -> {}", sid, voxflow);
    }

    public void release(String sid) {
        sidToSession.remove(sid);
        sidToPhone.remove(sid);
        sidToLastStatus.remove(sid);
    }

    @Override
    public String toVoxflowStatus(String providerStatus) {
        return switch (providerStatus) {
            case "queued", "initiated" -> "DIALING";
            case "ringing" -> "RINGING";
            case "in-progress" -> "ANSWERED";
            case "no-answer", "busy", "failed", "canceled" -> "NO_ANSWER";
            default -> null;
        };
    }

    private void pollAll() {
        for (String sid : sidToSession.keySet()) {
            String status = api.fetchStatus(sid);
            if (status != null) {
                ingestStatus(sid, status);
            }
        }
    }

    private String inlineTwiMl() {
        return "<Response><Say voice=\"woman\">This is a fraud alert from your issuing bank. "
                + "A transaction was attempted with your card. If this was you, no action is needed. "
                + "If not, our fraud desk will contact you shortly.</Say></Response>";
    }
}