package com.voxflow.workflow.execution;

import java.util.Map;
import java.util.UUID;

public class ExecutionContext {
    private final String sessionId;
    private final String workflowId;
    private final Map<String, Object> variables;
    private String currentStepId;
    private String status;

    public ExecutionContext(String sessionId, String workflowId, Map<String, Object> variables) {
        this.sessionId = sessionId;
        this.workflowId = workflowId;
        this.variables = variables;
        this.status = "RUNNING";
    }

    public String getSessionId() {
        return sessionId;
    }

    public String getWorkflowId() {
        return workflowId;
    }

    public Map<String, Object> getVariables() {
        return variables;
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

    public Object getVariable(String key) {
        return variables.get(key);
    }

    public void setVariable(String key, Object value) {
        variables.put(key, value);
    }
}
