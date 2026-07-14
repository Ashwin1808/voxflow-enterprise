package com.voxflow.inbound.controller;

import com.voxflow.inbound.dto.ApiResponse;
import com.voxflow.inbound.dto.DtmfRequest;
import com.voxflow.inbound.dto.InboundCallRequest;
import com.voxflow.inbound.dto.InboundSessionResponse;
import com.voxflow.inbound.service.InboundService;
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
@RequestMapping("/api/v1/inbound")
public class InboundController {

    private final InboundService inboundService;

    public InboundController(InboundService inboundService) {
        this.inboundService = inboundService;
    }

    @PostMapping("/sessions")
    @PreAuthorize("hasAnyRole('ADMIN', 'AGENT')")
    public ApiResponse<InboundSessionResponse> createSession(@Valid @RequestBody InboundCallRequest request) {
        return ApiResponse.ok("Inbound session created", inboundService.createSession(request));
    }

    @PostMapping("/sessions/{id}/dtmf")
    @PreAuthorize("hasAnyRole('ADMIN', 'AGENT')")
    public ApiResponse<InboundSessionResponse> handleDtmf(@PathVariable("id") UUID id,
                                                          @Valid @RequestBody DtmfRequest request) {
        return ApiResponse.ok("DTMF processed", inboundService.handleDtmf(id, request));
    }

    @GetMapping("/sessions/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'AGENT')")
    public ApiResponse<InboundSessionResponse> getSession(@PathVariable("id") UUID id) {
        return ApiResponse.ok("Inbound session resolved", inboundService.getSession(id));
    }
}
