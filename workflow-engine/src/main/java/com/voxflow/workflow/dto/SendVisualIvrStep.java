package com.voxflow.workflow.dto;

public class SendVisualIvrStep extends Step {
    private String template;
    private int tokenTtlMinutes;

    public SendVisualIvrStep() {
        super();
    }

    public SendVisualIvrStep(String id, String next, String template, int tokenTtlMinutes) {
        super(id, next);
        this.template = template;
        this.tokenTtlMinutes = tokenTtlMinutes;
    }

    public String getTemplate() {
        return template;
    }

    public void setTemplate(String template) {
        this.template = template;
    }

    public int getTokenTtlMinutes() {
        return tokenTtlMinutes;
    }

    public void setTokenTtlMinutes(int tokenTtlMinutes) {
        this.tokenTtlMinutes = tokenTtlMinutes;
    }
}
