package com.voxflow.workflow.domain;

import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.Map;

@Entity
@Table(name = "workflow_executions")
public class WorkflowExecutionEntity {

    @Id
    @Column(name = "session_id")
    private String sessionId;

    @Column(name = "workflow_id", nullable = false)
    private String workflowId;

    @Column(name = "current_step_id")
    private String currentStepId;

    @Column(nullable = false)
    private String status;

    @Column(columnDefinition = "TEXT")
    @Convert(converter = JacksonAttributeConverter.class)
    private Map<String, Object> variables;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    @Version
    private Integer versionLock;

    public WorkflowExecutionEntity() {}

    public WorkflowExecutionEntity(String sessionId, String workflowId, String currentStepId, String status, Map<String, Object> variables, OffsetDateTime createdAt, OffsetDateTime updatedAt) {
        this.sessionId = sessionId;
        this.workflowId = workflowId;
        this.currentStepId = currentStepId;
        this.status = status;
        this.variables = variables;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public String getSessionId() {
        return sessionId;
    }

    public void setSessionId(String sessionId) {
        this.sessionId = sessionId;
    }

    public String getWorkflowId() {
        return workflowId;
    }

    public void setWorkflowId(String workflowId) {
        this.workflowId = workflowId;
    }

    public String getCurrentStepId() {
        return currentStepId;
    }

    public void setCurrentStepId(String currentStepId) {
        this.currentStepId = currentStepId;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Map<String, Object> getVariables() {
        return variables;
    }

    public void setVariables(Map<String, Object> variables) {
        this.variables = variables;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(OffsetDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public OffsetDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(OffsetDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public Integer getVersionLock() {
        return versionLock;
    }

    public void setVersionLock(Integer versionLock) {
        this.versionLock = versionLock;
    }
}
