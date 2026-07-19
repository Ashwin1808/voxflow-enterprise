package com.voxflow.workflow.repository;

import com.voxflow.workflow.domain.WorkflowDefinitionEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface WorkflowDefinitionEntityRepository extends JpaRepository<WorkflowDefinitionEntity, String> {
}
