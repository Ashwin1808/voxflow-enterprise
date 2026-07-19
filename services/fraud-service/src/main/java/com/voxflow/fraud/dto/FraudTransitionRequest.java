package com.voxflow.fraud.dto;

import jakarta.validation.constraints.NotNull;

public record FraudTransitionRequest(
    @NotNull(message = "Target status is required") FraudStatus status
) {}
