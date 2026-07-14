package com.voxflow.fraud.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record FraudContactRequest(
        @NotBlank String customerPhone,
        @NotBlank String cardLastFour,
        @NotBlank String merchant,
        @NotNull @DecimalMin("1.00") BigDecimal amount
) {
}
