package com.voxflow.fraud.dto;

import jakarta.validation.constraints.NotNull;

public record VisualIvrDecisionRequest(@NotNull VisualIvrPublicDecision decision) {
}
