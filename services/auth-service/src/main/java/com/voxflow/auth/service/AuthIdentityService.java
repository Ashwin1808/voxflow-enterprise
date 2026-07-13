package com.voxflow.auth.service;

import com.voxflow.auth.dto.CurrentUserResponse;
import com.voxflow.auth.dto.RoleAccessResponse;
import com.voxflow.auth.dto.RoleMatrixResponse;
import java.util.Comparator;
import java.util.List;
import java.util.Set;
import java.util.TreeSet;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;

@Service
public class AuthIdentityService {

    public CurrentUserResponse currentUser(Jwt jwt, Authentication authentication) {
        Set<String> roles = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .map(authority -> authority.replaceFirst("^ROLE_", ""))
                .collect(java.util.stream.Collectors.toCollection(TreeSet::new));

        String fullName = java.util.stream.Stream.of(jwt.getClaimAsString("given_name"), jwt.getClaimAsString("family_name"))
                .filter(value -> value != null && !value.isBlank())
                .reduce((left, right) -> left + " " + right)
                .orElse(jwt.getClaimAsString("name"));

        return new CurrentUserResponse(
                jwt.getSubject(),
                jwt.getClaimAsString("preferred_username"),
                jwt.getClaimAsString("email"),
                fullName,
                roles,
                jwt.getIssuer() == null ? null : jwt.getIssuer().toString(),
                jwt.getAudience() == null ? null : String.join(",", jwt.getAudience()),
                jwt.getIssuedAt(),
                jwt.getExpiresAt());
    }

    public RoleMatrixResponse roleMatrix() {
        List<RoleAccessResponse> roles = List.of(
                        new RoleAccessResponse("ADMIN",
                                List.of("All endpoints", "Campaign management", "User management", "Reports", "Metrics"),
                                List.of()),
                        new RoleAccessResponse("AGENT",
                                List.of("Inbound call handling", "Customer context", "Payment status", "Campaign metrics"),
                                List.of("Campaign creation", "User management")),
                        new RoleAccessResponse("CUSTOMER",
                                List.of("Visual IVR portal", "Payment page", "Own transaction history"),
                                List.of("Admin endpoints", "Campaign management", "Payment operations")),
                        new RoleAccessResponse("DEVELOPER",
                                List.of("API documentation", "Health endpoints", "Metrics"),
                                List.of("Campaign management", "Payment operations")))
                .stream()
                .sorted(Comparator.comparing(RoleAccessResponse::role))
                .toList();
        return new RoleMatrixResponse(roles);
    }
}
