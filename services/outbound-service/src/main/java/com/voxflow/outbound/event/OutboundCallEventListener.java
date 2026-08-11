package com.voxflow.outbound.event;

import com.voxflow.outbound.service.OutboundDialService;
import com.voxflow.workflow.event.dto.CallEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
public class OutboundCallEventListener {

    private static final Logger log = LoggerFactory.getLogger(OutboundCallEventListener.class);

    private final OutboundDialService dialService;

    public OutboundCallEventListener(OutboundDialService dialService) {
        this.dialService = dialService;
    }

    @RabbitListener(queues = "outbound.call.queue")
    public void onCallStatus(CallEvent event) {
        if (event == null || event.sessionId() == null || !"QUEUED".equals(event.status())) {
            return;
        }
        if (event.callerPhone() == null || event.callerPhone().isBlank()) {
            return;
        }
        try {
            dialService.dial(event.sessionId(), event.callerPhone(), event.currentMenu());
        } catch (Exception e) {
            log.warn("Dial failed for session {}: {}", event.sessionId(), e.getMessage());
        }
    }
}