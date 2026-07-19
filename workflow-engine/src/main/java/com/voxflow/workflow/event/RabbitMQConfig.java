package com.voxflow.workflow.event;

import org.springframework.amqp.core.*;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    // Exchange Definitions
    @Bean
    public TopicExchange topicExchange() {
        return new TopicExchange("voxflow.topic");
    }

    @Bean
    public DirectExchange dlxExchange() {
        return new DirectExchange("voxflow.dlx");
    }

    @Bean
    public TopicExchange retryExchange() {
        return new TopicExchange("voxflow.retry");
    }

    @Bean
    public DirectExchange paymentExchange() {
        return new DirectExchange("voxflow.payment");
    }

    // Queue Definitions
    @Bean
    public Queue campaignQueue() {
        return QueueBuilder.durable("campaign.queue").build();
    }

    @Bean
    public Queue callQueue() {
        return QueueBuilder.durable("call.queue").build();
    }

    @Bean
    public Queue visualIvrQueue() {
        return QueueBuilder.durable("visualivr.queue").build();
    }

    @Bean
    public Queue paymentQueue() {
        return QueueBuilder.durable("payment.queue")
                .withArgument("x-dead-letter-exchange", "voxflow.dlx")
                .withArgument("x-dead-letter-routing-key", "payment.dead")
                .build();
    }

    @Bean
    public Queue paymentRetryQueue() {
        return QueueBuilder.durable("payment.retry.queue")
                .withArgument("x-message-ttl", 30000) // 30 seconds
                .withArgument("x-dead-letter-exchange", "voxflow.topic")
                .build();
    }

    @Bean
    public Queue notificationQueue() {
        return QueueBuilder.durable("notification.queue").build();
    }

    @Bean
    public Queue workflowQueue() {
        return QueueBuilder.durable("workflow.queue").build();
    }

    // Bindings
    @Bean
    public Binding campaignBinding(Queue campaignQueue, TopicExchange topicExchange) {
        return BindingBuilder.bind(campaignQueue).to(topicExchange).with("campaign.*");
    }

    @Bean
    public Binding callBinding(Queue callQueue, TopicExchange topicExchange) {
        return BindingBuilder.bind(callQueue).to(topicExchange).with("call.*");
    }

    @Bean
    public Binding dtmfBinding(Queue callQueue, TopicExchange topicExchange) {
        return BindingBuilder.bind(callQueue).to(topicExchange).with("dtmf.received");
    }

    @Bean
    public Binding visualIvrBinding(Queue visualIvrQueue, TopicExchange topicExchange) {
        return BindingBuilder.bind(visualIvrQueue).to(topicExchange).with("visualivr.generated");
    }

    @Bean
    public Binding paymentBinding(Queue paymentQueue, TopicExchange topicExchange) {
        return BindingBuilder.bind(paymentQueue).to(topicExchange).with("payment.*");
    }

    @Bean
    public Binding notificationBinding(Queue notificationQueue, TopicExchange topicExchange) {
        return BindingBuilder.bind(notificationQueue).to(topicExchange).with("notification.sent");
    }

    @Bean
    public Binding workflowBinding(Queue workflowQueue, TopicExchange topicExchange) {
        return BindingBuilder.bind(workflowQueue).to(topicExchange).with("workflow.completed");
    }

    // JSON Message Converter
    @Bean
    public MessageConverter messageConverter() {
        return new Jackson2JsonMessageConverter();
    }
}
