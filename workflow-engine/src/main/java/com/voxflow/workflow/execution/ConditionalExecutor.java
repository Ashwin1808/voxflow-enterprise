package com.voxflow.workflow.execution;

import com.voxflow.workflow.dto.ConditionalStep;
import com.voxflow.workflow.dto.Step;
import java.util.Map;
import org.springframework.stereotype.Component;

@Component
public class ConditionalExecutor implements StepExecutor<ConditionalStep> {

    @Override
    public String execute(ConditionalStep step, ExecutionContext context) {
        Object fieldValue = context.getVariable(step.getField());
        String valueStr = fieldValue != null ? fieldValue.toString() : null;
        
        if (step.getConditions() != null && valueStr != null) {
            for (Map.Entry<String, String> condition : step.getConditions().entrySet()) {
                if (condition.getValue().equals(valueStr)) {
                    if (step.getNextMap() != null && step.getNextMap().containsKey(condition.getKey())) {
                        return step.getNextMap().get(condition.getKey());
                    }
                }
            }
        }
        
        return step.getNext();
    }

    @Override
    public boolean canExecute(Step step) {
        return step instanceof ConditionalStep;
    }

    @Override
    public Class<ConditionalStep> getStepType() {
        return ConditionalStep.class;
    }
}
