package com.voxflow.workflow.execution;

import com.voxflow.workflow.dto.Step;
import com.voxflow.workflow.dto.UpdateStatusStep;
import org.springframework.stereotype.Component;

@Component
public class UpdateStatusExecutor implements StepExecutor<UpdateStatusStep> {

    @Override
    public String execute(UpdateStatusStep step, ExecutionContext context) {
        String entityKey = step.getEntity() + "_" + step.getField();
        context.setVariable(entityKey, step.getValue());
        context.setVariable("last_status_update", step.getValue());
        return step.getNext();
    }

    @Override
    public boolean canExecute(Step step) {
        return step instanceof UpdateStatusStep;
    }

    @Override
    public Class<UpdateStatusStep> getStepType() {
        return UpdateStatusStep.class;
    }
}
