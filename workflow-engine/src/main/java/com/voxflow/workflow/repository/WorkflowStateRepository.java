package com.voxflow.workflow.repository;

import com.voxflow.workflow.domain.WorkflowDefinitionEntity;
import com.voxflow.workflow.domain.WorkflowExecutionEntity;
import com.voxflow.workflow.execution.ExecutionContext;
import java.time.OffsetDateTime;
import java.util.Map;
import java.util.stream.Collectors;
import org.springframework.stereotype.Repository;

@Repository
public class WorkflowStateRepository {
    
    private final WorkflowDefinitionEntityRepository definitionRepository;
    private final WorkflowExecutionEntityRepository executionRepository;

    public WorkflowStateRepository(WorkflowDefinitionEntityRepository definitionRepository, WorkflowExecutionEntityRepository executionRepository) {
        this.definitionRepository = definitionRepository;
        this.executionRepository = executionRepository;
    }

    public void saveSession(ExecutionContext context) {
        WorkflowExecutionEntity entity = executionRepository.findById(context.getSessionId())
                .orElse(new WorkflowExecutionEntity());
        entity.setSessionId(context.getSessionId());
        entity.setWorkflowId(context.getWorkflowId());
        entity.setCurrentStepId(context.getCurrentStepId());
        entity.setStatus(context.getStatus());
        entity.setVariables(context.getVariables());
        if (entity.getCreatedAt() == null) {
            entity.setCreatedAt(OffsetDateTime.now());
        }
        entity.setUpdatedAt(OffsetDateTime.now());
        executionRepository.save(entity);
    }

    public ExecutionContext getSession(String sessionId) {
        return executionRepository.findById(sessionId)
                .map(entity -> {
                    ExecutionContext context = new ExecutionContext(entity.getSessionId(), entity.getWorkflowId(), entity.getVariables());
                    context.setCurrentStepId(entity.getCurrentStepId());
                    context.setStatus(entity.getStatus());
                    return context;
                })
                .orElse(null);
    }

    public void deleteSession(String sessionId) {
        executionRepository.deleteById(sessionId);
    }

    public Map<String, ExecutionContext> getAllSessions() {
        return executionRepository.findAll().stream()
                .map(entity -> {
                    ExecutionContext context = new ExecutionContext(entity.getSessionId(), entity.getWorkflowId(), entity.getVariables());
                    context.setCurrentStepId(entity.getCurrentStepId());
                    context.setStatus(entity.getStatus());
                    return context;
                })
                .collect(Collectors.toMap(ExecutionContext::getSessionId, context -> context));
    }

    public void saveWorkflowDefinition(String workflowId, String jsonDefinition) {
        WorkflowDefinitionEntity entity = definitionRepository.findById(workflowId)
                .orElse(new WorkflowDefinitionEntity());
        entity.setId(workflowId);
        String[] parts = workflowId.split(":");
        entity.setName(parts[0]);
        entity.setVersion(parts.length > 1 ? parts[1] : "1.0");
        entity.setDefinitionJson(jsonDefinition);
        if (entity.getCreatedAt() == null) {
            entity.setCreatedAt(OffsetDateTime.now());
        }
        entity.setUpdatedAt(OffsetDateTime.now());
        definitionRepository.save(entity);
    }

    public String getWorkflowDefinition(String workflowId) {
        return definitionRepository.findById(workflowId)
                .map(WorkflowDefinitionEntity::getDefinitionJson)
                .orElse(null);
    }

    public Map<String, String> getAllWorkflowDefinitions() {
        return definitionRepository.findAll().stream()
                .collect(Collectors.toMap(WorkflowDefinitionEntity::getId, WorkflowDefinitionEntity::getDefinitionJson));
    }

    public void deleteWorkflowDefinition(String workflowId) {
        definitionRepository.deleteById(workflowId);
    }
}
