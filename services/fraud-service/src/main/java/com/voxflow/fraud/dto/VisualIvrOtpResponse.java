package com.voxflow.fraud.dto;

import java.time.OffsetDateTime;

public record VisualIvrOtpResponse(
        String maskedPhone,
        OffsetDateTime expiresAt,
        boolean verified
) {
}
