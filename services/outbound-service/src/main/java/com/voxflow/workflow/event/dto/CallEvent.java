package com.voxflow.workflow.event.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

public record CallEvent(
        UUID sessionId,
        String callerPhone,
        String currentMenu,
        String status,
        String digitReceived,
        OffsetDateTime timestamp
) {}