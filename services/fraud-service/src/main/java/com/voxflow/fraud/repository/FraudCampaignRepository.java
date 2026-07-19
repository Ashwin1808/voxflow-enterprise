package com.voxflow.fraud.repository;

import com.voxflow.fraud.domain.FraudCampaign;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FraudCampaignRepository extends JpaRepository<FraudCampaign, UUID> {
}
