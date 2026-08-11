package com.voxflow.fraud.service;

import com.voxflow.fraud.domain.FraudCampaign;
import com.voxflow.fraud.domain.FraudSession;
import com.voxflow.fraud.dto.CampaignStatus;
import com.voxflow.fraud.dto.FraudStatus;
import com.voxflow.fraud.repository.FraudCampaignRepository;
import java.time.OffsetDateTime;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class CampaignAutoStarter {

    private static final Logger log = LoggerFactory.getLogger(CampaignAutoStarter.class);

    private final FraudCampaignRepository campaignRepository;
    private final FraudService fraudService;

    public CampaignAutoStarter(FraudCampaignRepository campaignRepository, FraudService fraudService) {
        this.campaignRepository = campaignRepository;
        this.fraudService = fraudService;
    }

    @Scheduled(fixedDelay = 15_000)
    public void processScheduledAndCompletedCampaigns() {
        OffsetDateTime now = OffsetDateTime.now();

        for (FraudCampaign campaign : campaignRepository.findAll()) {
            if (campaign.getStatus() == CampaignStatus.READY
                    && campaign.getScheduledStartAt() != null
                    && !campaign.getScheduledStartAt().isAfter(now)
                    && campaign.getTotalContacts() > 0) {
                try {
                    fraudService.startCampaign(campaign.getId());
                    log.info("Scheduled campaign auto-started: {}", campaign.getId());
                } catch (Exception e) {
                    log.warn("Auto-start failed for campaign {}: {}", campaign.getId(), e.getMessage());
                }
            } else if (campaign.getStatus() == CampaignStatus.RUNNING && isFullyTerminal(campaign)) {
                try {
                    fraudService.completeCampaign(campaign.getId());
                    log.info("Campaign completed automatically: {}", campaign.getId());
                } catch (Exception e) {
                    log.warn("Auto-complete failed for campaign {}: {}", campaign.getId(), e.getMessage());
                }
            }
        }
    }

    private boolean isFullyTerminal(FraudCampaign campaign) {
        List<FraudSession> contacts = campaign.getContacts();
        if (contacts.isEmpty()) {
            return false;
        }
        return contacts.stream().allMatch(c -> switch (c.getStatus()) {
            case APPROVED, BLOCKED, VISUAL_IVR_SENT, NO_ANSWER -> true;
            default -> false;
        });
    }
}