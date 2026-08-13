package com.voxflow.fraud.dto;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public record FraudSessionResponse(
        UUID id,
        String customerPhone,
        String cardLastFour,
        String merchant,
        BigDecimal amount,
        FraudStatus status,
        String cardStatus,
        String visualIvrUrl,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt,
        String visualOtp,
        List<VisualIvrActivityResponse> visualIvrActivity
) {
}
