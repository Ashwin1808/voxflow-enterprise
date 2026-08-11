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

/** Real PSTN dialing via Exotel (India). Requires EXOTEL_ACCOUNT_SID + EXOTEL_API_KEY + EXOTEL_API_TOKEN + EXOTEL_FROM_NUMBER. */
@Component
@ConditionalOnProperty(name = "voxflow.call.provider", havingValue = "exotel")
public class ExotelCallProvider implements CallProvider {

    private static final Logger log = LoggerFactory.getLogger(ExotelCallProvider.class);

    private final ExotelApiClient api;
    private final CallEventPublisher publisher;
    private final String fromNumber;
    private final String publicBaseUrl;
    private final int pollIntervalSeconds;

    private final Map<String, UUID> sidToSession = new ConcurrentHashMap<>();
    private final Map<String, String> sidToPhone = new ConcurrentHashMap<>();
    private final Map<String, String> sidToLastStatus = new ConcurrentHashMap<>();
    private final ScheduledExecutorService poller = Executors.newScheduledThreadPool(1);

    public ExotelCallProvider(
            ExotelApiClient api,
            CallEventPublisher publisher,
            @Value("${voxflow.call.exotel.from-number:}") String fromNumber,
            @Value("${voxflow.call.public-base-url:}") String publicBaseUrl,
            @Value("${voxflow.call.exotel.poll-interval-seconds:5}") int pollIntervalSeconds) {
        this.api = api;
        this.publisher = publisher;
        this.fromNumber = fromNumber;
        this.publicBaseUrl = publicBaseUrl;
        this.pollIntervalSeconds = pollIntervalSeconds;

        if (fromNumber == null || fromNumber.isBlank()) {
            throw new IllegalStateException("CALL_PROVIDER=exotel requires EXOTEL_FROM_NUMBER");
        }
        if (publicBaseUrl == null || publicBaseUrl.isBlank()) {
            poller.scheduleAtFixedRate(this::pollAll, pollIntervalSeconds, pollIntervalSeconds, TimeUnit.SECONDS);
            log.info("Exotel status polling enabled (no PUBLIC_BASE_URL configured)");
        }
    }

    @Override
    public String name() {
        return "EXOTEL";
    }

    @Override
    public ProviderCall place(UUID sessionId, String phone, String workflowName) {
        Map<String, String> params = new java.util.LinkedHashMap<>();
        params.put("CallbackUrl", "https://local.invalid/v1/exotel-notify");
        boolean webhooks = publicBaseUrl != null && !publicBaseUrl.isBlank();
        if (webhooks) {
            params.put("Url", publicBaseUrl + "/api/v1/outbound/provider/exotel/voice?sessionId=" + sessionId);
            params.put("CallbackUrl", publicBaseUrl + "/api/v1/outbound/provider/exotel/callbacks/status");
        }

        String sid = api.createCall(fromNumber, phone, params);
        sidToSession.put(sid, sessionId);
        sidToPhone.put(sid, phone);
        sidToLastStatus.put(sid, "queued");

        publisher.publish("call.status", new CallEvent(
                sessionId, phone, workflowName, "DIALING", null, OffsetDateTime.now()));
        log.info("[exotel] call {} placed to {}", sid, phone);
        return new ProviderCall(sid, "DIALING");
    }

    /** Called by the status webhook and the poller. */
    public void ingestStatus(String sid, String exotelStatus) {
        if (sid == null || exotelStatus == null) {
            return;
        }
        String previous = sidToLastStatus.put(sid, exotelStatus);
        if (exotelStatus.equals(previous)) {
            return;
        }
        String voxflow = toVoxflowStatus(exotelStatus);
        UUID sessionId = sidToSession.get(sid);
        String phone = sidToPhone.get(sid);
        if (voxflow == null || sessionId == null) {
            return;
        }
        publisher.publish("call.status", new CallEvent(
                sessionId, phone, "fraud_verification", voxflow, null, OffsetDateTime.now()));
        log.info("[exotel] call {} -> {}", sid, voxflow);
    }

    public void release(String sid) {
        sidToSession.remove(sid);
        sidToPhone.remove(sid);
        sidToLastStatus.remove(sid);
    }

    @Override
    public String toVoxflowStatus(String providerStatus) {
        return switch (providerStatus) {
            case "queued", "dialing" -> "DIALING";
            case "ringing" -> "RINGING";
            case "in-progress", "answered" -> "ANSWERED";
            case "completed", "busy", "no-answer", "canceled", "failed", "expired" -> "NO_ANSWER";
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
}
