package com.voxflow.fraud.dto;

import java.time.OffsetDateTime;

public record VisualIvrActivityResponse(
        String event,
        OffsetDateTime createdAt
) {
}
