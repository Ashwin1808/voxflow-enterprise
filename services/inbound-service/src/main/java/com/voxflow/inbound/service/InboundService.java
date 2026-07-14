package com.voxflow.inbound.service;

import com.voxflow.inbound.dto.DtmfRequest;
import com.voxflow.inbound.dto.InboundCallRequest;
import com.voxflow.inbound.dto.InboundSessionResponse;
import java.time.OffsetDateTime;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.stereotype.Service;

@Service
public class InboundService {

    private final Map<UUID, InboundSessionResponse> sessions = new ConcurrentHashMap<>();

    public InboundSessionResponse createSession(InboundCallRequest request) {
        OffsetDateTime now = OffsetDateTime.now();
        InboundSessionResponse session = new InboundSessionResponse(
                UUID.randomUUID(),
                request.callerPhone(),
                "MAIN_MENU",
                "Press 1 payments, 2 claims, 3 agent",
                false,
                now,
                now);
        sessions.put(session.id(), session);
        return session;
    }

    public InboundSessionResponse handleDtmf(UUID id, DtmfRequest request) {
        InboundSessionResponse current = getSession(id);
        String route = switch (request.digit()) {
            case "1" -> "PAYMENT";
            case "2" -> "CLAIMS_VISUAL_IVR";
            case "3" -> "AGENT_TRANSFER";
            default -> "MAIN_MENU";
        };
        InboundSessionResponse updated = new InboundSessionResponse(
                current.id(),
                current.callerPhone(),
                route,
                route,
                "AGENT_TRANSFER".equals(route),
                current.createdAt(),
                OffsetDateTime.now());
        sessions.put(id, updated);
        return updated;
    }

    public InboundSessionResponse getSession(UUID id) {
        InboundSessionResponse session = sessions.get(id);
        if (session == null) {
            throw new IllegalArgumentException("Inbound session not found: " + id);
        }
        return session;
    }
}
