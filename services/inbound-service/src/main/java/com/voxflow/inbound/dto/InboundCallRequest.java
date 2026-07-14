package com.voxflow.inbound.dto;

import jakarta.validation.constraints.NotBlank;

public record InboundCallRequest(@NotBlank String callerPhone) {
}
