package com.voxflow.workflow.dto;

public class EndStep extends Step {
    private String finalStatus;

    public EndStep() {
        super();
    }

    public EndStep(String id, String finalStatus) {
        super(id, null);
        this.finalStatus = finalStatus;
    }

    public String getFinalStatus() {
        return finalStatus;
    }

    public void setFinalStatus(String finalStatus) {
        this.finalStatus = finalStatus;
    }
}
