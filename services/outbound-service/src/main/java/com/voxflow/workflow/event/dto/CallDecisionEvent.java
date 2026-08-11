package com.voxflow.workflow.event.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

public record CallDecisionEvent(
        UUID sessionId,
        String decision,
        String workflowId,
        OffsetDateTime timestamp
) {}