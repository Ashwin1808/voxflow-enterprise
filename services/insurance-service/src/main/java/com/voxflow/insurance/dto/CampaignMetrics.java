package com.voxflow.insurance.dto;

public record CampaignMetrics(
        long totalPolicies,
        long paymentInitiated,
        long claimsLinkSent,
        double completionRate
) {
}
