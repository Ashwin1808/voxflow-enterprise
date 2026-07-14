package com.voxflow.inbound.dto;

import jakarta.validation.constraints.Pattern;

public record DtmfRequest(@Pattern(regexp = "[1-3]") String digit) {
}
