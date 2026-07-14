package com.voxflow.fraud.dto;

import jakarta.validation.constraints.NotBlank;

public record FraudCampaignRequest(@NotBlank String name, @NotBlank String workflowName) {
}
