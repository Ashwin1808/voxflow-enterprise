package com.voxflow.workflow.dto;

import java.util.Map;

public class SendNotificationStep extends Step {
    private String channel;
    private String template;
    private Map<String, String> variables;

    public SendNotificationStep() {
        super();
    }

    public SendNotificationStep(String id, String next, String channel, String template, Map<String, String> variables) {
        super(id, next);
        this.channel = channel;
        this.template = template;
        this.variables = variables;
    }

    public String getChannel() {
        return channel;
    }

    public void setChannel(String channel) {
        this.channel = channel;
    }

    public String getTemplate() {
        return template;
    }

    public void setTemplate(String template) {
        this.template = template;
    }

    public Map<String, String> getVariables() {
        return variables;
    }

    public void setVariables(Map<String, String> variables) {
        this.variables = variables;
    }
}
