package com.voxflow.workflow.event;

public interface EventPublisher {
    void publish(String routingKey, Object event);
}
