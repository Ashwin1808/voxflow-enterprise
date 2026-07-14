package com.voxflow.outbound.service;

import com.voxflow.outbound.dto.OutboundCallRequest;
import com.voxflow.outbound.dto.OutboundCallResponse;
import java.time.OffsetDateTime;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.stereotype.Service;

@Service
public class OutboundService {

    private final Map<UUID, OutboundCallResponse> calls = new ConcurrentHashMap<>();

    public OutboundCallResponse requestCall(OutboundCallRequest request) {
        OffsetDateTime now = OffsetDateTime.now();
        OutboundCallResponse call = new OutboundCallResponse(
                UUID.randomUUID(),
                request.phone(),
                request.workflowName(),
                "SIMULATOR",
                "CALL_REQUESTED",
                1,
                null,
                now,
                now);
        calls.put(call.id(), call);
        return call;
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
}
