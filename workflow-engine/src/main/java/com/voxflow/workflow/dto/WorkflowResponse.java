package com.voxflow.workflow.dto;

import java.util.Map;

public class WorkflowResponse {
    private String workflowId;
    private String name;
    private String version;
    private String description;
    private String status;

    public WorkflowResponse() {}

    public WorkflowResponse(String workflowId, String name, String version, String description, String status) {
        this.workflowId = workflowId;
        this.name = name;
        this.version = version;
        this.description = description;
        this.status = status;
    }

    public String getWorkflowId() {
        return workflowId;
    }

    public void setWorkflowId(String workflowId) {
        this.workflowId = workflowId;
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

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
