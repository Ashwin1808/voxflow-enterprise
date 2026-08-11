package com.voxflow.fraud.event;

import com.voxflow.fraud.dto.FraudDecision;
import com.voxflow.fraud.dto.FraudDecisionRequest;
import com.voxflow.fraud.service.FraudService;
import com.voxflow.workflow.event.dto.CallDecisionEvent;
import com.voxflow.workflow.event.dto.CallEvent;
import java.util.Set;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
public class FraudCallEventListener {

    private static final Logger log = LoggerFactory.getLogger(FraudCallEventListener.class);

    private static final Set<String> TRIGGERING_STATUSES = Set.of("DIALING", "RINGING", "ANSWERED", "NO_ANSWER");

    private final FraudService fraudService;

    public FraudCallEventListener(FraudService fraudService) {
        this.fraudService = fraudService;
    }

    @RabbitListener(queues = "fraud.call.queue")
    public void onCallStatus(CallEvent event) {
        if (event == null || event.sessionId() == null) {
            return;
        }
        if (!TRIGGERING_STATUSES.contains(event.status())) {
            return;
        }
        try {
            fraudService.applyCallStatus(event.sessionId(), event.status());
            log.info("Applied call status {} to session {}", event.status(), event.sessionId());
        } catch (Exception e) {
            log.warn("Could not apply call status {} to session {}: {}", event.status(), event.sessionId(), e.getMessage());
        }
    }

    @RabbitListener(queues = "fraud.decision.queue")
    public void onCallDecision(CallDecisionEvent event) {
        if (event == null || event.sessionId() == null) {
            return;
        }
        try {
            FraudDecision decision = FraudDecision.valueOf(event.decision());
            fraudService.decide(event.sessionId(), new FraudDecisionRequest(decision));
            log.info("Applied call decision {} to session {}", event.decision(), event.sessionId());
        } catch (IllegalArgumentException e) {
            log.warn("Ignoring unknown call decision {} for session {}: {}", event.decision(), event.sessionId(), e.getMessage());
        } catch (Exception e) {
            log.warn("Could not apply call decision {} to session {}: {}", event.decision(), event.sessionId(), e.getMessage());
        }
    }
}