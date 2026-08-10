package com.voxflow.fraud.controller;

import com.voxflow.fraud.dto.ApiResponse;
import com.voxflow.fraud.dto.VisualIvrDecisionRequest;
import com.voxflow.fraud.dto.VisualIvrDecisionResponse;
import com.voxflow.fraud.dto.VisualIvrSummary;
import com.voxflow.fraud.service.FraudService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/public/visual-ivr")
public class PublicVisualIvrController {

    private final FraudService fraudService;

    public PublicVisualIvrController(FraudService fraudService) {
        this.fraudService = fraudService;
    }

    @GetMapping("/{token}")
    public ApiResponse<VisualIvrSummary> resolve(@PathVariable("token") String token) {
        return ApiResponse.ok("Verification link resolved", fraudService.resolveVisualIvr(token));
    }

    @PostMapping("/{token}/decision")
    public ApiResponse<VisualIvrDecisionResponse> decide(@PathVariable("token") String token,
                                                         @Valid @RequestBody VisualIvrDecisionRequest request) {
        return ApiResponse.ok("Decision recorded", fraudService.decideVisualIvr(token, request.decision()));
    }
}
