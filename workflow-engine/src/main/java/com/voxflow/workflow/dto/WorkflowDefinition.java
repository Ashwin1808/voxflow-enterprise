package com.voxflow.workflow.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

public class WorkflowDefinition {
    private String name;
    private String version;
    private String description;
    @JsonProperty("steps")
    private List<Step> steps;

    public WorkflowDefinition() {}

    public WorkflowDefinition(String name, String version, String description, List<Step> steps) {
        this.name = name;
        this.version = version;
        this.description = description;
        this.steps = steps;
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

    public List<Step> getSteps() {
        return steps;
    }

    public void setSteps(List<Step> steps) {
        this.steps = steps;
    }
}
