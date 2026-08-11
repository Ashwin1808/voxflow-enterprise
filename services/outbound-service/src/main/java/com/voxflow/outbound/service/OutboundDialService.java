package com.voxflow.outbound.service;

import com.voxflow.outbound.dto.OutboundCallResponse;
import com.voxflow.outbound.telephony.CallProvider;
import com.voxflow.outbound.telephony.TwilioCallProvider;
import com.voxflow.workflow.event.dto.CallDecisionEvent;
import com.voxflow.outbound.event.CallEventPublisher;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class OutboundDialService {

    private static final Logger log = LoggerFactory.getLogger(OutboundDialService.class);

    private final CallProvider provider;
    private final CallEventPublisher publisher;
    private final Map<UUID, OutboundCallResponse> calls = new ConcurrentHashMap<>();

    @org.springframework.beans.factory.annotation.Value("${voxflow.call.provider:emulator}")
    private String providerName;

    public OutboundDialService(
            java.util.List<CallProvider> providers,
            CallEventPublisher publisher) {
        this.provider = providers.stream()
                .filter(p -> p.name().equalsIgnoreCase(providerName))
                .findFirst()
                .orElseGet(() -> providers.isEmpty() ? null : providers.get(0));
        if (this.provider == null) {
            throw new IllegalStateException("No call provider available for CALL_PROVIDER=" + providerName);
        }
        this.publisher = publisher;
        log.info("Outbound dialer provider: {}", this.provider.name());
    }

    /** Entry point for a queued fraud session — placed by the call.status listener. */
    public void dial(UUID sessionId, String phone, String workflowName) {
        try {
            CallProvider.ProviderCall placed = provider.place(sessionId, phone, workflowName);
            OutboundCallResponse call = new OutboundCallResponse(
                    UUID.randomUUID(),
                    phone,
                    workflowName,
                    provider.name(),
                    placed.status(),
                    1,
                    null,
                    OffsetDateTime.now(),
                    OffsetDateTime.now());
            calls.put(sessionId, call);
        } catch (Exception e) {
            log.warn("Dial failed for session {}: {}", sessionId, e.getMessage());
        }
    }

    /** Direct test-call entry point from the Providers page. */
    public OutboundCallResponse dial(com.voxflow.outbound.dto.OutboundCallRequest request) {
        UUID id = UUID.randomUUID();
        CallProvider.ProviderCall placed = provider.place(id, request.phone(), request.workflowName());
        OutboundCallResponse call = new OutboundCallResponse(
                id,
                request.phone(),
                request.workflowName(),
                provider.name(),
                placed.status(),
                1,
                null,
                OffsetDateTime.now(),
                OffsetDateTime.now());
        calls.put(id, call);
        return call;
    }

    /** Twilio status callback / poller output. */
    public void onProviderStatus(String providerCallId, String providerStatus) {
        for (CallProvider candidate : java.util.List.of(provider)) {
            if (candidate instanceof TwilioCallProvider twilio) {
                twilio.ingestStatus(providerCallId, providerStatus);
            }
        }
    }

    /** Twilio keypad gather: 1 = approve, 2 = block, 9 = repeat. */
    public void onDtmf(UUID sessionId, String digits) {
        String decision = switch (digits) {
            case "1" -> "APPROVE";
            case "2" -> "BLOCK";
            default -> null;
        };
        if (decision == null) {
            return;
        }
        publisher.publish("call.decision", new CallDecisionEvent(
                sessionId, decision, "fraud_verification", OffsetDateTime.now()));
        log.info("Keypad decision {} recorded for session {}", decision, sessionId);
    }

    public OutboundCallResponse sendVisualIvr(UUID id) {
        OutboundCallResponse current = getCall(id);
        OutboundCallResponse updated = new OutboundCallResponse(
                current.id(), current.phone(), current.workflowName(), current.provider(),
                "VISUAL_IVR_REQUESTED", current.attempts(), "/visual-ivr/outbound/" + id,
                current.createdAt(), OffsetDateTime.now());
        calls.put(id, updated);
        return updated;
    }

    public OutboundCallResponse getCall(UUID id) {
        OutboundCallResponse call = calls.get(id);
        if (call == null) {
            throw new IllegalArgumentException("Outbound call not found: " + id);
        }
        return call;
    }

    public List<OutboundCallResponse> listCalls() {
        return calls.values().stream()
                .sorted((a, b) -> b.createdAt().compareTo(a.createdAt()))
                .toList();
    }

    public ProviderConfig getConfig() {
        return new ProviderConfig(provider.name());
    }

    public record ProviderConfig(String provider) {}
}