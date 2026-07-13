package com.voxflow.auth.controller;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.hasItem;
import static org.hamcrest.Matchers.is;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.web.servlet.MockMvc;
import com.voxflow.auth.config.SecurityConfig;
import com.voxflow.auth.exception.GlobalExceptionHandler;
import com.voxflow.auth.service.AuthIdentityService;

@WebMvcTest(AuthController.class)
@Import({SecurityConfig.class, AuthIdentityService.class, GlobalExceptionHandler.class})
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void currentUserReturnsJwtIdentityAndRoles() throws Exception {
        mockMvc.perform(get("/api/v1/auth/me")
                        .with(jwt().jwt(jwt -> jwt
                                        .subject("usr-123")
                                        .claim("preferred_username", "admin.user")
                                        .claim("email", "admin@voxflow.local")
                                        .claim("given_name", "Admin")
                                        .claim("family_name", "User")
                                        .claim("realm_access", Map.of("roles", List.of("ADMIN", "DEVELOPER")))
                                        .issuedAt(Instant.parse("2026-07-01T10:00:00Z"))
                                        .expiresAt(Instant.parse("2026-07-01T10:15:00Z")))
                                .authorities(new SimpleGrantedAuthority("ROLE_ADMIN"), new SimpleGrantedAuthority("ROLE_DEVELOPER"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("SUCCESS")))
                .andExpect(jsonPath("$.data.subject", is("usr-123")))
                .andExpect(jsonPath("$.data.username", is("admin.user")))
                .andExpect(jsonPath("$.data.roles", hasItem("ADMIN")));
    }

    @Test
    void roleMatrixRequiresDeveloperOrAdminRole() throws Exception {
        mockMvc.perform(get("/api/v1/auth/roles")
                        .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_DEVELOPER"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.roles[0].role", is("ADMIN")))
                .andExpect(jsonPath("$.data.roles[0].canAccess[0]", containsString("All endpoints")));
    }

    @Test
    void roleMatrixRejectsCustomerRole() throws Exception {
        mockMvc.perform(get("/api/v1/auth/roles")
                        .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_CUSTOMER"))))
                .andExpect(status().isForbidden());
    }

    @Test
    void adminHealthRequiresAdminRole() throws Exception {
        mockMvc.perform(get("/api/v1/auth/admin/health")
                        .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_ADMIN"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", is("auth-service-admin-ok")));
    }
}

