package com.voxflow.workflow.event.dto;

import java.time.OffsetDateTime;

public record NotificationEvent(
        String channel,
        String destination,
        String templateName,
        String status,
        OffsetDateTime timestamp
) {}
