package com.voxflow.workflow.execution;

import com.voxflow.workflow.dto.Step;

public interface StepExecutor<T extends Step> {
    String execute(T step, ExecutionContext context);
    
    boolean canExecute(Step step);
    
    Class<T> getStepType();
}
