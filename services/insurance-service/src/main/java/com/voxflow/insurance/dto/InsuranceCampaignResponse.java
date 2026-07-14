package com.voxflow.insurance.dto;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public record InsuranceCampaignResponse(
        UUID id,
        String name,
        String workflowName,
        CampaignStatus status,
        int totalPolicies,
        List<PolicyResponse> policies,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt
) {
}
