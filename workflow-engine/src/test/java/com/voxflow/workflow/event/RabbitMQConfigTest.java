package com.voxflow.workflow.event;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.springframework.amqp.core.*;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;

class RabbitMQConfigTest {

    private final RabbitMQConfig config = new RabbitMQConfig();

    @Test
    void verifiesExchangeDeclarations() {
        assertThat(config.topicExchange().getName()).isEqualTo("voxflow.topic");
        assertThat(config.dlxExchange().getName()).isEqualTo("voxflow.dlx");
        assertThat(config.retryExchange().getName()).isEqualTo("voxflow.retry");
        assertThat(config.paymentExchange().getName()).isEqualTo("voxflow.payment");
    }

    @Test
    void verifiesQueueDeclarations() {
        assertThat(config.campaignQueue().getName()).isEqualTo("campaign.queue");
        assertThat(config.callQueue().getName()).isEqualTo("call.queue");
        assertThat(config.visualIvrQueue().getName()).isEqualTo("visualivr.queue");
        assertThat(config.paymentQueue().getName()).isEqualTo("payment.queue");
        assertThat(config.paymentRetryQueue().getName()).isEqualTo("payment.retry.queue");
        assertThat(config.notificationQueue().getName()).isEqualTo("notification.queue");
        assertThat(config.workflowQueue().getName()).isEqualTo("workflow.queue");
    }

    @Test
    void verifiesMessageConverter() {
        assertThat(config.messageConverter()).isInstanceOf(Jackson2JsonMessageConverter.class);
    }
}
