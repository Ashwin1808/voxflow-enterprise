package com.voxflow.insurance.repository;

import com.voxflow.insurance.domain.InsuranceCampaign;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface InsuranceCampaignRepository extends JpaRepository<InsuranceCampaign, UUID> {
}
