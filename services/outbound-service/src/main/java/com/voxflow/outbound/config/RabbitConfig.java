package com.voxflow.outbound.config;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.QueueBuilder;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitConfig {

    public static final String EXCHANGE = "voxflow.topic";

    @Bean
    public TopicExchange topicExchange() {
        return new TopicExchange(EXCHANGE);
    }

    @Bean
    public Queue outboundCallQueue() {
        return QueueBuilder.durable("outbound.call.queue").build();
    }

    @Bean
    public Binding outboundCallBinding(Queue outboundCallQueue, TopicExchange topicExchange) {
        return BindingBuilder.bind(outboundCallQueue).to(topicExchange).with("call.status");
    }

    @Bean
    public MessageConverter messageConverter() {
        return new Jackson2JsonMessageConverter();
    }
}