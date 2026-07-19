package com.voxflow.workflow.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.voxflow.workflow.dto.Step;
import com.voxflow.workflow.dto.WorkflowDefinition;
import com.voxflow.workflow.execution.ExecutionContext;
import com.voxflow.workflow.execution.StepExecutor;
import com.voxflow.workflow.repository.WorkflowStateRepository;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.springframework.stereotype.Service;

@Service
public class WorkflowExecutor {
    
    private final ObjectMapper objectMapper;
    private final Map<String, WorkflowDefinition> workflowDefinitions = new HashMap<>();
    private final WorkflowStateRepository stateRepository;
    private final List<StepExecutor<?>> stepExecutors;
    private final com.voxflow.workflow.event.EventPublisher eventPublisher;

    public WorkflowExecutor(ObjectMapper objectMapper, WorkflowStateRepository stateRepository, List<StepExecutor<?>> stepExecutors, com.voxflow.workflow.event.EventPublisher eventPublisher) {
        this.objectMapper = objectMapper;
        this.stateRepository = stateRepository;
        this.stepExecutors = stepExecutors;
        this.eventPublisher = eventPublisher;
    }

    public void registerWorkflow(String workflowId, WorkflowDefinition definition) {
        workflowDefinitions.put(workflowId, definition);
        try {
            String json = objectMapper.writeValueAsString(definition);
            stateRepository.saveWorkflowDefinition(workflowId, json);
        } catch (Exception e) {
            throw new RuntimeException("Failed to serialize workflow definition: " + e.getMessage(), e);
        }
    }

    public void registerWorkflow(String workflowId, String jsonDefinition) {
        try {
            WorkflowDefinition definition = objectMapper.readValue(jsonDefinition, WorkflowDefinition.class);
            workflowDefinitions.put(workflowId, definition);
            stateRepository.saveWorkflowDefinition(workflowId, jsonDefinition);
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse workflow definition: " + e.getMessage(), e);
        }
    }

    public ExecutionContext startWorkflow(String workflowId, Map<String, Object> initialVariables) {
        WorkflowDefinition definition = workflowDefinitions.get(workflowId);
        if (definition == null) {
            throw new IllegalArgumentException("Workflow not found: " + workflowId);
        }

        String sessionId = UUID.randomUUID().toString();
        ExecutionContext context = new ExecutionContext(sessionId, workflowId, new HashMap<>(initialVariables));
        
        if (!definition.getSteps().isEmpty()) {
            Step firstStep = definition.getSteps().get(0);
            context.setCurrentStepId(firstStep.getId());
        }

        stateRepository.saveSession(context);
        return context;
    }

    public ExecutionContext executeStep(String sessionId, Map<String, Object> input) {
        ExecutionContext context = stateRepository.getSession(sessionId);
        if (context == null) {
            throw new IllegalArgumentException("Session not found: " + sessionId);
        }

        if (input != null) {
            context.getVariables().putAll(input);
        }

        WorkflowDefinition definition = workflowDefinitions.get(context.getWorkflowId());
        Step currentStep = findStepById(definition, context.getCurrentStepId());

        if (currentStep == null) {
            context.setStatus("COMPLETED");
            stateRepository.saveSession(context);
            return context;
        }

        StepExecutor executor = findExecutor(currentStep);
        if (executor == null) {
            throw new IllegalStateException("No executor found for step type: " + currentStep.getClass().getSimpleName());
        }

        @SuppressWarnings("unchecked")
        String nextStepId = executor.execute(currentStep, context);

        if (nextStepId == null) {
            context.setStatus("COMPLETED");
            stateRepository.deleteSession(sessionId);
        } else if ("end".equals(nextStepId)) {
            context.setStatus("COMPLETED");
            stateRepository.deleteSession(sessionId);
        } else {
            context.setCurrentStepId(nextStepId);
            stateRepository.saveSession(context);
        }

        try {
            eventPublisher.publish("call.status", new com.voxflow.workflow.event.dto.CallEvent(
                    java.util.UUID.fromString(sessionId), 
                    (String) context.getVariables().get("customerPhone"),
                    currentStep.getId(),
                    "EXECUTED",
                    null,
                    java.time.OffsetDateTime.now()
            ));
        } catch (Exception e) {}

        return context;
    }

    public ExecutionContext getSession(String sessionId) {
        return stateRepository.getSession(sessionId);
    }

    public List<WorkflowDefinition> getAllWorkflows() {
        return List.copyOf(workflowDefinitions.values());
    }

    public WorkflowDefinition getWorkflow(String workflowId) {
        return workflowDefinitions.get(workflowId);
    }

    private Step findStepById(WorkflowDefinition definition, String stepId) {
        return definition.getSteps().stream()
                .filter(step -> step.getId().equals(stepId))
                .findFirst()
                .orElse(null);
    }

    @SuppressWarnings("unchecked")
    private StepExecutor<?> findExecutor(Step step) {
        return stepExecutors.stream()
                .filter(executor -> executor.canExecute(step))
                .findFirst()
                .orElse(null);
    }
}
