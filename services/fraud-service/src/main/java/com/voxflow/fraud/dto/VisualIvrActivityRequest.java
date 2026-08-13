package com.voxflow.fraud.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record VisualIvrActivityRequest(
        @NotBlank
        @Size(max = 64)
        String event
) {
}
