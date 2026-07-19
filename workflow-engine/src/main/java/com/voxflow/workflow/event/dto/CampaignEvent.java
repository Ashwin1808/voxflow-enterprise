package com.voxflow.workflow.event.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

public record CampaignEvent(
        UUID campaignId,
        String name,
        String workflowName,
        String status,
        int totalContacts,
        OffsetDateTime timestamp
) {}
