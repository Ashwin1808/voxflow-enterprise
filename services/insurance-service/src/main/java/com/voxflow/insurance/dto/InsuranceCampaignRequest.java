package com.voxflow.insurance.dto;

import jakarta.validation.constraints.NotBlank;

public record InsuranceCampaignRequest(@NotBlank String name, @NotBlank String workflowName) {
}
