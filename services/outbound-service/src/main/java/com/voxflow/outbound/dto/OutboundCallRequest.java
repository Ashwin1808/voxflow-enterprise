package com.voxflow.outbound.dto;

import jakarta.validation.constraints.NotBlank;

public record OutboundCallRequest(@NotBlank String phone, @NotBlank String workflowName) {
}
