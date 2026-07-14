package com.voxflow.workflow.execution;

import com.voxflow.workflow.dto.SendVisualIvrStep;
import com.voxflow.workflow.dto.Step;
import java.util.UUID;
import org.springframework.stereotype.Component;

@Component
public class SendVisualIvrExecutor implements StepExecutor<SendVisualIvrStep> {

    @Override
    public String execute(SendVisualIvrStep step, ExecutionContext context) {
        String token = UUID.randomUUID().toString();
        String visualIvrUrl = "/visual-ivr/" + step.getTemplate() + "/" + token;
        context.setVariable("visual_ivr_url", visualIvrUrl);
        context.setVariable("visual_ivr_token", token);
        context.setVariable("visual_ivr_ttl", step.getTokenTtlMinutes());
        return step.getNext();
    }

    @Override
    public boolean canExecute(Step step) {
        return step instanceof SendVisualIvrStep;
    }

    @Override
    public Class<SendVisualIvrStep> getStepType() {
        return SendVisualIvrStep.class;
    }
}
