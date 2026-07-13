package com.voxflow.auth.dto;

import java.util.List;

public record RoleAccessResponse(
        String role,
        List<String> canAccess,
        List<String> cannotAccess
) {
}

