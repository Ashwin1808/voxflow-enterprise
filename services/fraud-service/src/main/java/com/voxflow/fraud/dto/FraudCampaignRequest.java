package com.voxflow.fraud.dto;

import jakarta.validation.constraints.NotBlank;
import java.time.OffsetDateTime;

public record FraudCampaignRequest(@NotBlank String name, @NotBlank String workflowName, OffsetDateTime scheduledStartAt) {}