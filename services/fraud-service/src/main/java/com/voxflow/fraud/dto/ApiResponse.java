package com.voxflow.fraud.dto;

import java.time.OffsetDateTime;

public record ApiResponse<T>(String status, String message, T data, OffsetDateTime timestamp) {

    public static <T> ApiResponse<T> ok(String message, T data) {
        return new ApiResponse<>("SUCCESS", message, data, OffsetDateTime.now());
    }
}
