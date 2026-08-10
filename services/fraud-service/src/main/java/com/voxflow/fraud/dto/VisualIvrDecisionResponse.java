package com.voxflow.fraud.dto;

public record VisualIvrDecisionResponse(
        String outcome,
        String message,
        FraudStatus sessionStatus,
        String cardStatus
) {
}
