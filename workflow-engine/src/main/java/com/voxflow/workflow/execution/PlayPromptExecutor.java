package com.voxflow.workflow.execution;

import com.voxflow.workflow.dto.PlayPromptStep;
import com.voxflow.workflow.dto.Step;
import org.springframework.stereotype.Component;

@Component
public class PlayPromptExecutor implements StepExecutor<PlayPromptStep> {

    @Override
    public String execute(PlayPromptStep step, ExecutionContext context) {
        context.setVariable("last_prompt", step.getText());
        context.setVariable("prompt_language", step.getLanguage());
        return step.getNext();
    }

    @Override
    public boolean canExecute(Step step) {
        return step instanceof PlayPromptStep;
    }

    @Override
    public Class<PlayPromptStep> getStepType() {
        return PlayPromptStep.class;
    }
}
