package com.voxflow.workflow.dto;

public class InitiatePaymentStep extends Step {
    private String amountField;
    private String currency;
    private String description;

    public InitiatePaymentStep() {
        super();
    }

    public InitiatePaymentStep(String id, String next, String amountField, String currency, String description) {
        super(id, next);
        this.amountField = amountField;
        this.currency = currency;
        this.description = description;
    }

    public String getAmountField() {
        return amountField;
    }

    public void setAmountField(String amountField) {
        this.amountField = amountField;
    }

    public String getCurrency() {
        return currency;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}
