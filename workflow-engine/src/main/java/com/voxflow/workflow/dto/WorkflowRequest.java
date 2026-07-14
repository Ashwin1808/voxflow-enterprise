package com.voxflow.workflow.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.Map;

public class WorkflowRequest {
    @NotBlank
    private String name;
    
    @NotBlank
    private String version;
    
    private String description;
    
    @NotNull
    private String workflowJson;
    
    private Map<String, Object> initialVariables;

    public WorkflowRequest() {}

    public WorkflowRequest(String name, String version, String description, String workflowJson, Map<String, Object> initialVariables) {
        this.name = name;
        this.version = version;
        this.description = description;
        this.workflowJson = workflowJson;
        this.initialVariables = initialVariables;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getVersion() {
        return version;
    }

    public void setVersion(String version) {
        this.version = version;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getWorkflowJson() {
        return workflowJson;
    }

    public void setWorkflowJson(String workflowJson) {
        this.workflowJson = workflowJson;
    }

    public Map<String, Object> getInitialVariables() {
        return initialVariables;
    }

    public void setInitialVariables(Map<String, Object> initialVariables) {
        this.initialVariables = initialVariables;
    }
}
