package com.voxflow.fraud.controller;

import com.voxflow.fraud.dto.ApiResponse;
import com.voxflow.fraud.dto.VisualIvrDecisionRequest;
import com.voxflow.fraud.dto.VisualIvrDecisionResponse;
import com.voxflow.fraud.dto.VisualIvrActivityRequest;
import com.voxflow.fraud.dto.VisualIvrOtpResponse;
import com.voxflow.fraud.dto.VisualIvrOtpValidateRequest;
import com.voxflow.fraud.dto.VisualIvrSummary;
import com.voxflow.fraud.service.FraudService;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
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

    @PostMapping("/{token}/otp/request")
    public ApiResponse<VisualIvrOtpResponse> requestOtp(@PathVariable("token") String token) {
        return ApiResponse.ok("Verification OTP generated", fraudService.requestVisualIvrOtp(token));
    }

    @PostMapping("/{token}/otp/validate")
    public ApiResponse<VisualIvrOtpResponse> validateOtp(@PathVariable("token") String token,
                                                         @Valid @RequestBody VisualIvrOtpValidateRequest request) {
        return ApiResponse.ok("OTP validated", fraudService.validateVisualIvrOtp(token, request.code()));
    }

    @PostMapping("/{token}/activity")
    public ApiResponse<Void> activity(@PathVariable("token") String token,
                                      @Valid @RequestBody VisualIvrActivityRequest request) {
        fraudService.recordVisualIvrActivity(token, request.event());
        return ApiResponse.ok("Activity recorded", null);
    }

    @GetMapping(value = "/{token}/receipt", produces = "application/pdf")
    public ResponseEntity<byte[]> receipt(@PathVariable("token") String token) {
        byte[] pdf = fraudService.downloadVisualIvrReceipt(token);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=visual-ivr-receipt.pdf")
                .body(pdf);
    }
}
