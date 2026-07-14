package com.voxflow.workflow.execution;

import com.voxflow.workflow.dto.CollectInputStep;
import com.voxflow.workflow.dto.Step;
import org.springframework.stereotype.Component;

@Component
public class CollectInputExecutor implements StepExecutor<CollectInputStep> {

    @Override
    public String execute(CollectInputStep step, ExecutionContext context) {
        String input = (String) context.getVariable("input");
        if (input == null) {
            context.setVariable("awaiting_input", true);
            context.setVariable("timeout_ms", step.getTimeoutMs());
            return null; // Wait for input
        }
        
        if (step.getNextMap() != null && step.getNextMap().containsKey(input)) {
            return step.getNextMap().get(input);
        }
        
        return step.getNext();
    }

    @Override
    public boolean canExecute(Step step) {
        return step instanceof CollectInputStep;
    }

    @Override
    public Class<CollectInputStep> getStepType() {
        return CollectInputStep.class;
    }
}
