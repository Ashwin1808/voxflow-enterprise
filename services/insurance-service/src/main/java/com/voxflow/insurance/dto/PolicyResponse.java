package com.voxflow.insurance.dto;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

public record PolicyResponse(
        UUID id,
        String customerPhone,
        String policyNumber,
        BigDecimal premiumDue,
        PolicyStatus status,
        String paymentUrl,
        String claimsUrl,
        OffsetDateTime updatedAt
) {
}
