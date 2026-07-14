package com.voxflow.fraud.dto;

import jakarta.validation.constraints.NotNull;

public record FraudDecisionRequest(@NotNull FraudDecision decision) {
}
