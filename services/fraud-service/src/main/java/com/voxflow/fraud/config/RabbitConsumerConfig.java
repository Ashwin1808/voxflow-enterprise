package com.voxflow.fraud.config;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.QueueBuilder;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitConsumerConfig {

    @Bean
    public Queue fraudCallQueue() {
        return QueueBuilder.durable("fraud.call.queue").build();
    }

    @Bean
    public Queue fraudDecisionQueue() {
        return QueueBuilder.durable("fraud.decision.queue").build();
    }

    @Bean
    public Binding fraudCallBinding(Queue fraudCallQueue, TopicExchange topicExchange) {
        return BindingBuilder.bind(fraudCallQueue).to(topicExchange).with("call.status");
    }

    @Bean
    public Binding fraudDecisionBinding(Queue fraudDecisionQueue, TopicExchange topicExchange) {
        return BindingBuilder.bind(fraudDecisionQueue).to(topicExchange).with("call.decision");
    }
}