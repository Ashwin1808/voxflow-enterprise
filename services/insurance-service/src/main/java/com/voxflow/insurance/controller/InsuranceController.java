package com.voxflow.insurance.controller;

import com.voxflow.insurance.dto.ApiResponse;
import com.voxflow.insurance.dto.CampaignMetrics;
import com.voxflow.insurance.dto.InsuranceCampaignRequest;
import com.voxflow.insurance.dto.InsuranceCampaignResponse;
import com.voxflow.insurance.dto.PolicyContactRequest;
import com.voxflow.insurance.dto.PolicyResponse;
import com.voxflow.insurance.service.InsuranceService;
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
@RequestMapping("/api/v1/insurance")
public class InsuranceController {
    private final InsuranceService insuranceService;

    public InsuranceController(InsuranceService insuranceService) {
        this.insuranceService = insuranceService;
    }

    @PostMapping("/campaigns")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<InsuranceCampaignResponse> createCampaign(@Valid @RequestBody InsuranceCampaignRequest request) {
        return ApiResponse.ok("Insurance campaign created", insuranceService.createCampaign(request));
    }

    @PostMapping("/campaigns/{id}/policies")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<InsuranceCampaignResponse> addPolicy(@PathVariable("id") UUID id, @Valid @RequestBody PolicyContactRequest request) {
        return ApiResponse.ok("Policy added", insuranceService.addPolicy(id, request));
    }

    @PostMapping("/campaigns/{id}/start")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<InsuranceCampaignResponse> startCampaign(@PathVariable("id") UUID id) {
        return ApiResponse.ok("Insurance campaign started", insuranceService.startCampaign(id));
    }

    @PostMapping("/campaigns/{id}/pause")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<InsuranceCampaignResponse> pauseCampaign(@PathVariable("id") UUID id) {
        return ApiResponse.ok("Insurance campaign paused", insuranceService.pauseCampaign(id));
    }

    @PostMapping("/campaigns/{id}/resume")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<InsuranceCampaignResponse> resumeCampaign(@PathVariable("id") UUID id) {
        return ApiResponse.ok("Insurance campaign resumed", insuranceService.resumeCampaign(id));
    }

    @PostMapping("/policies/{id}/payment")
    @PreAuthorize("hasAnyRole('ADMIN', 'AGENT')")
    public ApiResponse<PolicyResponse> initiatePayment(@PathVariable("id") UUID id) {
        return ApiResponse.ok("Payment simulator initiated", insuranceService.initiatePayment(id));
    }

    @PostMapping("/policies/{id}/claims-link")
    @PreAuthorize("hasAnyRole('ADMIN', 'AGENT')")
    public ApiResponse<PolicyResponse> sendClaimsLink(@PathVariable("id") UUID id) {
        return ApiResponse.ok("Claims Visual IVR link created", insuranceService.sendClaimsLink(id));
    }

    @GetMapping("/campaigns/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'AGENT')")
    public ApiResponse<InsuranceCampaignResponse> getCampaign(@PathVariable("id") UUID id) {
        return ApiResponse.ok("Insurance campaign resolved", insuranceService.getCampaign(id));
    }

    @GetMapping("/campaigns")
    @PreAuthorize("hasAnyRole('ADMIN', 'AGENT')")
    public ApiResponse<List<InsuranceCampaignResponse>> listCampaigns() {
        return ApiResponse.ok("Insurance campaigns listed", insuranceService.listCampaigns());
    }

    @GetMapping("/campaigns/{id}/metrics")
    @PreAuthorize("hasAnyRole('ADMIN', 'AGENT')")
    public ApiResponse<CampaignMetrics> getCampaignMetrics(@PathVariable("id") UUID id) {
        return ApiResponse.ok("Insurance campaign metrics", insuranceService.getCampaignMetrics(id));
    }
}
