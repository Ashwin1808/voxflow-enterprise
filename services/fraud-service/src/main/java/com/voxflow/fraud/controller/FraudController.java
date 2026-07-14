package com.voxflow.fraud.controller;

import com.voxflow.fraud.dto.ApiResponse;
import com.voxflow.fraud.dto.FraudDecisionRequest;
import com.voxflow.fraud.dto.FraudSessionRequest;
import com.voxflow.fraud.dto.FraudSessionResponse;
import com.voxflow.fraud.service.FraudService;
import jakarta.validation.Valid;
import java.util.UUID;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/fraud")
public class FraudController {

    private final FraudService fraudService;

    public FraudController(FraudService fraudService) {
        this.fraudService = fraudService;
    }

    @PostMapping("/sessions")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<FraudSessionResponse> createSession(@Valid @RequestBody FraudSessionRequest request) {
        return ApiResponse.ok("Fraud verification session created", fraudService.createSession(request));
    }

    @PostMapping("/sessions/{id}/decision")
    @PreAuthorize("hasAnyRole('ADMIN', 'AGENT')")
    public ApiResponse<FraudSessionResponse> decide(@PathVariable("id") UUID id,
                                                    @Valid @RequestBody FraudDecisionRequest request) {
        return ApiResponse.ok("Fraud decision recorded", fraudService.decide(id, request));
    }

    @GetMapping("/sessions/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'AGENT')")
    public ApiResponse<FraudSessionResponse> getSession(@PathVariable("id") UUID id) {
        return ApiResponse.ok("Fraud verification session resolved", fraudService.getSession(id));
    }
}
