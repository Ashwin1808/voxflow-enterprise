package com.voxflow.insurance.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record PolicyContactRequest(
        @NotBlank String customerPhone,
        @NotBlank String policyNumber,
        @NotNull @DecimalMin("1.00") BigDecimal premiumDue
) {
}
