package com.voxflow.auth.dto;

import java.time.OffsetDateTime;
import java.util.Map;

public record ErrorResponse(
        String status,
        String message,
        Map<String, String> errors,
        OffsetDateTime timestamp
) {
}

