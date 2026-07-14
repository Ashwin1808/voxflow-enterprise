package com.voxflow.workflow.execution;

import com.voxflow.workflow.dto.EndStep;
import com.voxflow.workflow.dto.Step;
import org.springframework.stereotype.Component;

@Component
public class EndExecutor implements StepExecutor<EndStep> {

    @Override
    public String execute(EndStep step, ExecutionContext context) {
        context.setStatus(step.getFinalStatus());
        context.setVariable("final_status", step.getFinalStatus());
        return null; // Workflow ends
    }

    @Override
    public boolean canExecute(Step step) {
        return step instanceof EndStep;
    }

    @Override
    public Class<EndStep> getStepType() {
        return EndStep.class;
    }
}
