package com.voxflow.workflow.execution;

import com.voxflow.workflow.dto.SendNotificationStep;
import com.voxflow.workflow.dto.Step;
import org.springframework.stereotype.Component;

@Component
public class SendNotificationExecutor implements StepExecutor<SendNotificationStep> {

    @Override
    public String execute(SendNotificationStep step, ExecutionContext context) {
        context.setVariable("notification_channel", step.getChannel());
        context.setVariable("notification_template", step.getTemplate());
        context.setVariable("notification_variables", step.getVariables());
        context.setVariable("last_notification", "sent");
        return step.getNext();
    }

    @Override
    public boolean canExecute(Step step) {
        return step instanceof SendNotificationStep;
    }

    @Override
    public Class<SendNotificationStep> getStepType() {
        return SendNotificationStep.class;
    }
}
