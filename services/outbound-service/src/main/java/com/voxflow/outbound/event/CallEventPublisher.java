package com.voxflow.outbound.event;

import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;

@Component
public class CallEventPublisher {

    private static final String EXCHANGE = "voxflow.topic";

    private final RabbitTemplate rabbitTemplate;

    public CallEventPublisher(RabbitTemplate rabbitTemplate) {
        this.rabbitTemplate = rabbitTemplate;
    }

    public void publish(String routingKey, Object event) {
        rabbitTemplate.convertAndSend(EXCHANGE, routingKey, event);
    }
}