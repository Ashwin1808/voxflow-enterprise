package com.voxflow.outbound.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

public record OutboundCallResponse(
        UUID id,
        String phone,
        String workflowName,
        String provider,
        String status,
        int attempts,
        String visualIvrUrl,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt
) {
}
