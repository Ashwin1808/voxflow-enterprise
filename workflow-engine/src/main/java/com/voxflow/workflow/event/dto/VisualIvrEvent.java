package com.voxflow.workflow.event.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

public record VisualIvrEvent(
        UUID sessionId,
        String customerPhone,
        String templateName,
        String url,
        OffsetDateTime timestamp
) {}
