package com.voxflow.workflow.execution;

import com.voxflow.workflow.dto.InitiatePaymentStep;
import com.voxflow.workflow.dto.Step;
import java.util.UUID;
import org.springframework.stereotype.Component;

@Component
public class InitiatePaymentExecutor implements StepExecutor<InitiatePaymentStep> {

    @Override
    public String execute(InitiatePaymentStep step, ExecutionContext context) {
        Object amountObj = context.getVariable(step.getAmountField());
        String amount = amountObj != null ? amountObj.toString() : "0";
        
        String transactionId = UUID.randomUUID().toString();
        String paymentUrl = "/payment/" + transactionId;
        
        context.setVariable("transaction_id", transactionId);
        context.setVariable("payment_amount", amount);
        context.setVariable("payment_currency", step.getCurrency());
        context.setVariable("payment_url", paymentUrl);
        context.setVariable("payment_description", step.getDescription());
        context.setVariable("payment_status", "INITIATED");
        
        return step.getNext();
    }

    @Override
    public boolean canExecute(Step step) {
        return step instanceof InitiatePaymentStep;
    }

    @Override
    public Class<InitiatePaymentStep> getStepType() {
        return InitiatePaymentStep.class;
    }
}
