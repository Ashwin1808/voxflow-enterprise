package com.voxflow.inbound.service;

import com.voxflow.inbound.domain.InboundSession;
import com.voxflow.inbound.dto.DtmfRequest;
import com.voxflow.inbound.dto.InboundCallRequest;
import com.voxflow.inbound.dto.InboundSessionResponse;
import com.voxflow.inbound.repository.InboundSessionRepository;
import com.voxflow.workflow.event.EventPublisher;
import com.voxflow.workflow.event.dto.CallEvent;
import java.time.OffsetDateTime;
import java.util.UUID;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class InboundService {

    private final InboundSessionRepository sessionRepository;
    private final EventPublisher eventPublisher;

    public InboundService(InboundSessionRepository sessionRepository, EventPublisher eventPublisher) {
        this.sessionRepository = sessionRepository;
        this.eventPublisher = eventPublisher;
    }

    public InboundSessionResponse createSession(InboundCallRequest request) {
        OffsetDateTime now = OffsetDateTime.now();
        InboundSession session = new InboundSession(
                UUID.randomUUID(),
                request.callerPhone(),
                "MAIN_MENU",
                "Press 1 payments, 2 claims, 3 agent",
                false,
                now,
                now);
        sessionRepository.save(session);
        
        eventPublisher.publish("call.requested", new CallEvent(
                session.getId(),
                session.getCallerPhone(),
                session.getCurrentMenu(),
                "REQUESTED",
                null,
                now));
                
        eventPublisher.publish("call.connected", new CallEvent(
                session.getId(),
                session.getCallerPhone(),
                session.getCurrentMenu(),
                "CONNECTED",
                null,
                now));
                
        return toResponse(session);
    }

    public InboundSessionResponse handleDtmf(UUID id, DtmfRequest request) {
        InboundSession current = getSessionEntity(id);
        String route = switch (request.digit()) {
            case "1" -> "PAYMENT";
            case "2" -> "CLAIMS_VISUAL_IVR";
            case "3" -> "AGENT_TRANSFER";
            default -> "MAIN_MENU";
        };
        
        current.setCurrentMenu(route);
        current.setPromptText(route);
        current.setAgentTransfer("AGENT_TRANSFER".equals(route));
        current.setUpdatedAt(OffsetDateTime.now());
        sessionRepository.save(current);
        
        eventPublisher.publish("dtmf.received", new CallEvent(
                id,
                current.getCallerPhone(),
                route,
                "DTMF_PROCESSED",
                request.digit(),
                OffsetDateTime.now()));
                
        return toResponse(current);
    }

    public InboundSessionResponse getSession(UUID id) {
        return toResponse(getSessionEntity(id));
    }

    private InboundSession getSessionEntity(UUID id) {
        return sessionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Inbound session not found: " + id));
    }

    @RabbitListener(queues = "call.queue")
    public void handleCallEvent(CallEvent event) {
        System.out.println("Inbound service received call event: " + event);
    }

    private InboundSessionResponse toResponse(InboundSession session) {
        return new InboundSessionResponse(
                session.getId(),
                session.getCallerPhone(),
                session.getCurrentMenu(),
                session.getPromptText(),
                session.isAgentTransfer(),
                session.getCreatedAt(),
                session.getUpdatedAt());
    }
}
