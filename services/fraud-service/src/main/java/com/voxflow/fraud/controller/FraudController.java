package com.voxflow.fraud.controller;

import com.voxflow.fraud.dto.ApiResponse;
import com.voxflow.fraud.dto.CampaignMetrics;
import com.voxflow.fraud.dto.FraudDecisionRequest;
import com.voxflow.fraud.dto.FraudCampaignRequest;
import com.voxflow.fraud.dto.FraudCampaignResponse;
import com.voxflow.fraud.dto.FraudContactRequest;
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

    @PostMapping("/campaigns")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<FraudCampaignResponse> createCampaign(@Valid @RequestBody FraudCampaignRequest request) {
        return ApiResponse.ok("Fraud campaign created", fraudService.createCampaign(request));
    }

    @PostMapping("/campaigns/{id}/contacts")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<FraudCampaignResponse> addContact(@PathVariable("id") UUID id,
                                                         @Valid @RequestBody FraudContactRequest request) {
        return ApiResponse.ok("Fraud campaign contact added", fraudService.addContact(id, request));
    }

    @PostMapping("/campaigns/{id}/start")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<FraudCampaignResponse> startCampaign(@PathVariable("id") UUID id) {
        return ApiResponse.ok("Fraud campaign started", fraudService.startCampaign(id));
    }

    @PostMapping("/campaigns/{id}/pause")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<FraudCampaignResponse> pauseCampaign(@PathVariable("id") UUID id) {
        return ApiResponse.ok("Fraud campaign paused", fraudService.pauseCampaign(id));
    }

    @PostMapping("/campaigns/{id}/resume")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<FraudCampaignResponse> resumeCampaign(@PathVariable("id") UUID id) {
        return ApiResponse.ok("Fraud campaign resumed", fraudService.resumeCampaign(id));
    }

    @GetMapping("/campaigns/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'AGENT')")
    public ApiResponse<FraudCampaignResponse> getCampaign(@PathVariable("id") UUID id) {
        return ApiResponse.ok("Fraud campaign resolved", fraudService.getCampaign(id));
    }

    @GetMapping("/campaigns")
    @PreAuthorize("hasAnyRole('ADMIN', 'AGENT')")
    public ApiResponse<java.util.List<FraudCampaignResponse>> listCampaigns() {
        return ApiResponse.ok("Fraud campaigns listed", fraudService.listCampaigns());
    }

    @GetMapping("/campaigns/{id}/metrics")
    @PreAuthorize("hasAnyRole('ADMIN', 'AGENT')")
    public ApiResponse<CampaignMetrics> getCampaignMetrics(@PathVariable("id") UUID id) {
        return ApiResponse.ok("Fraud campaign metrics", fraudService.getCampaignMetrics(id));
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
