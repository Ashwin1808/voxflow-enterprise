package com.voxflow.workflow.event.dto;

import java.time.OffsetDateTime;
import java.util.Map;

public record WorkflowCompletedEvent(
        String sessionId,
        String workflowId,
        String finalStatus,
        Map<String, Object> variables,
        OffsetDateTime timestamp
) {}
