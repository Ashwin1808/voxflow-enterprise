package com.voxflow.workflow.repository;

import com.voxflow.workflow.execution.ExecutionContext;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.stereotype.Repository;

@Repository
public class WorkflowStateRepository {
    
    private final Map<String, ExecutionContext> sessions = new ConcurrentHashMap<>();
    private final Map<String, String> workflowDefinitions = new ConcurrentHashMap<>();

    public void saveSession(ExecutionContext context) {
        sessions.put(context.getSessionId(), context);
    }

    public ExecutionContext getSession(String sessionId) {
        return sessions.get(sessionId);
    }

    public void deleteSession(String sessionId) {
        sessions.remove(sessionId);
    }

    public Map<String, ExecutionContext> getAllSessions() {
        return new ConcurrentHashMap<>(sessions);
    }

    public void saveWorkflowDefinition(String workflowId, String jsonDefinition) {
        workflowDefinitions.put(workflowId, jsonDefinition);
    }

    public String getWorkflowDefinition(String workflowId) {
        return workflowDefinitions.get(workflowId);
    }

    public Map<String, String> getAllWorkflowDefinitions() {
        return new ConcurrentHashMap<>(workflowDefinitions);
    }

    public void deleteWorkflowDefinition(String workflowId) {
        workflowDefinitions.remove(workflowId);
    }
}
