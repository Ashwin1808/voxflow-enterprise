package com.voxflow.fraud.controller;

import com.voxflow.fraud.dto.ApiResponse;
import com.voxflow.workflow.dto.WorkflowRequest;
import com.voxflow.workflow.execution.ExecutionContext;
import com.voxflow.workflow.service.WorkflowExecutor;
import jakarta.validation.Valid;
import java.util.Map;
import java.util.UUID;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/fraud/workflows")
public class WorkflowController {

    private final WorkflowExecutor workflowExecutor;

    public WorkflowController(WorkflowExecutor workflowExecutor) {
        this.workflowExecutor = workflowExecutor;
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<String> registerWorkflow(@Valid @RequestBody WorkflowRequest request) {
        String workflowId = request.getName() + ":" + request.getVersion();
        workflowExecutor.registerWorkflow(workflowId, request.getWorkflowJson());
        return ApiResponse.ok("Workflow registered", workflowId);
    }

    @PostMapping("/{workflowId}/start")
    @PreAuthorize("hasAnyRole('ADMIN', 'AGENT')")
    public ApiResponse<ExecutionContext> startWorkflow(@PathVariable("workflowId") String workflowId,
                                                        @RequestBody Map<String, Object> initialVariables) {
        ExecutionContext context = workflowExecutor.startWorkflow(workflowId, initialVariables);
        return ApiResponse.ok("Workflow started", context);
    }

    @PostMapping("/sessions/{sessionId}/execute")
    @PreAuthorize("hasAnyRole('ADMIN', 'AGENT')")
    public ApiResponse<ExecutionContext> executeStep(@PathVariable("sessionId") String sessionId,
                                                      @RequestBody Map<String, Object> input) {
        ExecutionContext context = workflowExecutor.executeStep(sessionId, input);
        return ApiResponse.ok("Step executed", context);
    }

    @GetMapping("/sessions/{sessionId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'AGENT')")
    public ApiResponse<ExecutionContext> getSession(@PathVariable("sessionId") String sessionId) {
        ExecutionContext context = workflowExecutor.getSession(sessionId);
        return ApiResponse.ok("Session retrieved", context);
    }
}
