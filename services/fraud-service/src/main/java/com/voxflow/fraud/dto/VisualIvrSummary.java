package com.voxflow.fraud.dto;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

public record VisualIvrSummary(
        String merchant,
        BigDecimal amount,
        String cardLastFour,
        String maskedPhone,
        OffsetDateTime transactionTime,
        String sessionStatus
) {
}
