package com.voxflow.auth.dto;

import java.time.Instant;
import java.util.Set;

public record CurrentUserResponse(
        String subject,
        String username,
        String email,
        String fullName,
        Set<String> roles,
        String issuer,
        String audience,
        Instant issuedAt,
        Instant expiresAt
) {
}

