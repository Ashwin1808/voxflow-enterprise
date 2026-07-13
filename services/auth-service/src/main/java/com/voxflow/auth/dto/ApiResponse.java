package com.voxflow.auth.dto;

import java.time.OffsetDateTime;

public record ApiResponse<T>(
        String status,
        String message,
        T data,
        OffsetDateTime timestamp
) {

    public static <T> ApiResponse<T> ok(String message, T data) {
        return new ApiResponse<>("SUCCESS", message, data, OffsetDateTime.now());
    }

    public static <T> ApiResponse<T> error(String message, T data) {
        return new ApiResponse<>("ERROR", message, data, OffsetDateTime.now());
    }
}

