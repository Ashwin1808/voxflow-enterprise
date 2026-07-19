package com.voxflow.workflow.event.dto;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

public record PaymentEvent(
        UUID transactionId,
        UUID contactId,
        BigDecimal amount,
        String currency,
        String status,
        String providerReference,
        String failureReason,
        OffsetDateTime timestamp
) {}
