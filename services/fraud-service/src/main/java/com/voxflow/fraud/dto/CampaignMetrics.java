package com.voxflow.fraud.dto;

public record CampaignMetrics(
        long totalContacts,
        long completed,
        long failed,
        double retryRate
) {
}
