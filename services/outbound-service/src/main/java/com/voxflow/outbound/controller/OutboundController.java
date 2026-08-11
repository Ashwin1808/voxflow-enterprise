package com.voxflow.outbound.controller;

import com.voxflow.outbound.dto.ApiResponse;
import com.voxflow.outbound.dto.OutboundCallRequest;
import com.voxflow.outbound.dto.OutboundCallResponse;
import com.voxflow.outbound.service.OutboundDialService;
import com.voxflow.outbound.service.TwiMlService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/outbound")
public class OutboundController {

    private final OutboundDialService dialService;
    private final TwiMlService twiMlService;

    public OutboundController(OutboundDialService dialService, TwiMlService twiMlService) {
        this.dialService = dialService;
        this.twiMlService = twiMlService;
    }

    @PostMapping("/calls")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<OutboundCallResponse> requestCall(@Valid @RequestBody OutboundCallRequest request) {
        return ApiResponse.ok("Outbound call requested", dialService.dial(request));
    }

    @GetMapping("/calls")
    @PreAuthorize("hasAnyRole('ADMIN', 'AGENT')")
    public ApiResponse<List<OutboundCallResponse>> listCalls() {
        return ApiResponse.ok("Outbound calls listed", dialService.listCalls());
    }

    @PostMapping("/calls/{id}/visual-ivr")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<OutboundCallResponse> sendVisualIvr(@PathVariable("id") UUID id) {
        return ApiResponse.ok("Visual IVR link requested", dialService.sendVisualIvr(id));
    }

    @GetMapping("/calls/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<OutboundCallResponse> getCall(@PathVariable("id") UUID id) {
        return ApiResponse.ok("Outbound call resolved", dialService.getCall(id));
    }

    @GetMapping("/config")
    @PreAuthorize("hasAnyRole('ADMIN', 'AGENT')")
    public ApiResponse<OutboundDialService.ProviderConfig> getConfig() {
        return ApiResponse.ok("Outbound dialer configuration", dialService.getConfig());
    }

    // ---- Public endpoints called by the telephony provider (no JWT) ----

    @GetMapping(value = "/provider/twiml/voice", produces = MediaType.APPLICATION_XML_VALUE)
    public ResponseEntity<String> voiceTwiMl(@RequestParam("sessionId") UUID sessionId) {
        return ResponseEntity.ok(twiMlService.voiceTwiMl(sessionId));
    }

    @PostMapping("/provider/callbacks/status")
    public ResponseEntity<String> statusCallback(@RequestParam("CallSid") String callSid,
                                                 @RequestParam("CallStatus") String callStatus) {
        dialService.onProviderStatus(callSid, callStatus);
        return ResponseEntity.ok("<Response/>");
    }

    @PostMapping(value = "/provider/callbacks/gather", produces = MediaType.APPLICATION_XML_VALUE)
    public ResponseEntity<String> gatherCallback(@RequestParam("sessionId") UUID sessionId,
                                                 @RequestParam(value = "Digits", required = false) String digits) {
        if (digits != null && !digits.isBlank()) {
            dialService.onDtmf(sessionId, digits);
        }
        String thanks = """
                <?xml version="1.0" encoding="UTF-8"?>
                <Response><Say>Thank you. Your response has been recorded.</Say></Response>
                """;
        return ResponseEntity.ok(thanks);
    }
}