package com.voxflow.inbound.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

public record InboundSessionResponse(
        UUID id,
        String callerPhone,
        String currentMenu,
        String route,
        boolean agentTransferRequested,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt
) {
}
