package com.voxflow.auth.dto;

import java.util.List;

public record RoleMatrixResponse(List<RoleAccessResponse> roles) {
}

