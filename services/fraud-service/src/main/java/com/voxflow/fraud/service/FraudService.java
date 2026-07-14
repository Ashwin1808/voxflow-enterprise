package com.voxflow.fraud.service;

import com.voxflow.fraud.dto.FraudDecision;
import com.voxflow.fraud.dto.FraudDecisionRequest;
import com.voxflow.fraud.dto.FraudSessionRequest;
import com.voxflow.fraud.dto.FraudSessionResponse;
import com.voxflow.fraud.dto.FraudStatus;
import java.time.OffsetDateTime;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.stereotype.Service;

@Service
public class FraudService {

    private final Map<UUID, FraudSessionResponse> sessions = new ConcurrentHashMap<>();

    public FraudSessionResponse createSession(FraudSessionRequest request) {
        OffsetDateTime now = OffsetDateTime.now();
        FraudSessionResponse response = new FraudSessionResponse(
                UUID.randomUUID(),
                request.customerPhone(),
                request.cardLastFour(),
                request.merchant(),
                request.amount(),
                FraudStatus.PENDING,
                "ACTIVE",
                null,
                now,
                now);
        sessions.put(response.id(), response);
        return response;
    }

    public FraudSessionResponse decide(UUID id, FraudDecisionRequest request) {
        FraudSessionResponse current = getSession(id);
        FraudStatus status = switch (request.decision()) {
            case APPROVE -> FraudStatus.APPROVED;
            case BLOCK -> FraudStatus.BLOCKED;
            case SEND_VISUAL_IVR -> FraudStatus.VISUAL_IVR_SENT;
        };
        String cardStatus = request.decision() == FraudDecision.BLOCK ? "BLOCKED" : current.cardStatus();
        String visualUrl = request.decision() == FraudDecision.SEND_VISUAL_IVR ? "/visual-ivr/fraud/" + id : current.visualIvrUrl();
        FraudSessionResponse updated = new FraudSessionResponse(
                current.id(), current.customerPhone(), current.cardLastFour(), current.merchant(), current.amount(),
                status, cardStatus, visualUrl, current.createdAt(), OffsetDateTime.now());
        sessions.put(id, updated);
        return updated;
    }

    public FraudSessionResponse getSession(UUID id) {
        FraudSessionResponse session = sessions.get(id);
        if (session == null) {
            throw new IllegalArgumentException("Fraud session not found: " + id);
        }
        return session;
    }
}
