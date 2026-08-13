package com.voxflow.fraud.repository;

import com.voxflow.fraud.domain.VisualIvrActivity;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface VisualIvrActivityRepository extends JpaRepository<VisualIvrActivity, UUID> {

    List<VisualIvrActivity> findByTokenIdOrderByCreatedAtAsc(UUID tokenId);
}
