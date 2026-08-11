package com.voxflow.fraud.dto;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public record FraudCampaignResponse(
        UUID id,
        String name,
        String workflowName,
        CampaignStatus status,
        int totalContacts,
        List<FraudSessionResponse> contacts,
        OffsetDateTime scheduledStartAt,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt
) {
}