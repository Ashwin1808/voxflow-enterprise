package com.voxflow.workflow.dto;

public class UpdateStatusStep extends Step {
    private String entity;
    private String field;
    private String value;

    public UpdateStatusStep() {
        super();
    }

    public UpdateStatusStep(String id, String next, String entity, String field, String value) {
        super(id, next);
        this.entity = entity;
        this.field = field;
        this.value = value;
    }

    public String getEntity() {
        return entity;
    }

    public void setEntity(String entity) {
        this.entity = entity;
    }

    public String getField() {
        return field;
    }

    public void setField(String field) {
        this.field = field;
    }

    public String getValue() {
        return value;
    }

    public void setValue(String value) {
        this.value = value;
    }
}
