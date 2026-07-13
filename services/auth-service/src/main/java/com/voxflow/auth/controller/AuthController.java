package com.voxflow.auth.controller;

import com.voxflow.auth.dto.ApiResponse;
import com.voxflow.auth.dto.CurrentUserResponse;
import com.voxflow.auth.dto.RoleMatrixResponse;
import com.voxflow.auth.service.AuthIdentityService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
@Tag(name = "Authentication", description = "Keycloak-backed identity and RBAC endpoints.")
public class AuthController {

    private final AuthIdentityService authIdentityService;

    public AuthController(AuthIdentityService authIdentityService) {
        this.authIdentityService = authIdentityService;
    }

    @GetMapping("/me")
    @Operation(summary = "Return the current authenticated user from the Keycloak JWT.")
    public ApiResponse<CurrentUserResponse> currentUser(JwtAuthenticationToken authentication) {
        Jwt jwt = authentication.getToken();
        return ApiResponse.ok("Authenticated user resolved", authIdentityService.currentUser(jwt, authentication));
    }

    @GetMapping("/roles")
    @PreAuthorize("hasAnyRole('ADMIN', 'DEVELOPER')")
    @Operation(summary = "Return the VoxFlow RBAC matrix.")
    public ApiResponse<RoleMatrixResponse> roleMatrix() {
        return ApiResponse.ok("RBAC matrix resolved", authIdentityService.roleMatrix());
    }

    @GetMapping("/admin/health")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Protected admin-only authentication service check.")
    public ApiResponse<String> adminHealth() {
        return ApiResponse.ok("Admin authorization verified", "auth-service-admin-ok");
    }
}

