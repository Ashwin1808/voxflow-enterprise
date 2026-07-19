package com.voxflow.workflow.repository;

import com.voxflow.workflow.domain.WorkflowExecutionEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface WorkflowExecutionEntityRepository extends JpaRepository<WorkflowExecutionEntity, String> {
}
