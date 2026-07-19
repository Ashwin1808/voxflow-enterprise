package com.voxflow.insurance.repository;

import com.voxflow.insurance.domain.InsurancePolicy;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface InsurancePolicyRepository extends JpaRepository<InsurancePolicy, UUID> {
}
