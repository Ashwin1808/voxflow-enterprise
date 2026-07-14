package com.voxflow.workflow.dto;

import java.util.Map;

public class ConditionalStep extends Step {
    private String field;
    private Map<String, String> conditions;
    private Map<String, String> nextMap;

    public ConditionalStep() {
        super();
    }

    public ConditionalStep(String id, String next, String field, Map<String, String> conditions, Map<String, String> nextMap) {
        super(id, next);
        this.field = field;
        this.conditions = conditions;
        this.nextMap = nextMap;
    }

    public String getField() {
        return field;
    }

    public void setField(String field) {
        this.field = field;
    }

    public Map<String, String> getConditions() {
        return conditions;
    }

    public void setConditions(Map<String, String> conditions) {
        this.conditions = conditions;
    }

    public Map<String, String> getNextMap() {
        return nextMap;
    }

    public void setNextMap(Map<String, String> nextMap) {
        this.nextMap = nextMap;
    }
}
