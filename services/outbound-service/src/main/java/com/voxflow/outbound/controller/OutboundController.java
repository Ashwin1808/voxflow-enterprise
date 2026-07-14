package com.voxflow.outbound.controller;

import com.voxflow.outbound.dto.ApiResponse;
import com.voxflow.outbound.dto.OutboundCallRequest;
import com.voxflow.outbound.dto.OutboundCallResponse;
import com.voxflow.outbound.service.OutboundService;
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
@RequestMapping("/api/v1/outbound")
public class OutboundController {

    private final OutboundService outboundService;

    public OutboundController(OutboundService outboundService) {
        this.outboundService = outboundService;
    }

    @PostMapping("/calls")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<OutboundCallResponse> requestCall(@Valid @RequestBody OutboundCallRequest request) {
        return ApiResponse.ok("Outbound simulator call requested", outboundService.requestCall(request));
    }

    @PostMapping("/calls/{id}/visual-ivr")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<OutboundCallResponse> sendVisualIvr(@PathVariable("id") UUID id) {
        return ApiResponse.ok("Visual IVR link requested", outboundService.sendVisualIvr(id));
    }

    @GetMapping("/calls/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<OutboundCallResponse> getCall(@PathVariable("id") UUID id) {
        return ApiResponse.ok("Outbound call resolved", outboundService.getCall(id));
    }
}
