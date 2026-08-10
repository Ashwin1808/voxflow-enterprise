package com.voxflow.fraud.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Version;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "visual_ivr_tokens")
public class VisualIvrToken {

    public enum TokenStatus {
        ACTIVE, USED, EXPIRED
    }

    @Id
    private UUID id;

    @Column(name = "session_id", nullable = false)
    private UUID sessionId;

    @Column(nullable = false, unique = true)
    private String token;

    @Column(nullable = false)
    private TokenStatus status;

    @Column(name = "expires_at", nullable = false)
    private OffsetDateTime expiresAt;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    @Column(name = "used_at")
    private OffsetDateTime usedAt;

    @Version
    private Integer version;

    public VisualIvrToken() {}

    public VisualIvrToken(UUID id, UUID sessionId, String token, TokenStatus status, OffsetDateTime expiresAt, OffsetDateTime createdAt, OffsetDateTime usedAt) {
        this.id = id;
        this.sessionId = sessionId;
        this.token = token;
        this.status = status;
        this.expiresAt = expiresAt;
        this.createdAt = createdAt;
        this.updatedAt = createdAt;
        this.usedAt = usedAt;
    }

    public UUID getId() {
        return id;
    }

    public UUID getSessionId() {
        return sessionId;
    }

    public String getToken() {
        return token;
    }

    public TokenStatus getStatus() {
        return status;
    }

    public void setStatus(TokenStatus status) {
        this.status = status;
    }

    public OffsetDateTime getExpiresAt() {
        return expiresAt;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }

    public void setUpdatedAt(OffsetDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public OffsetDateTime getUsedAt() {
        return usedAt;
    }

    public void setUsedAt(OffsetDateTime usedAt) {
        this.usedAt = usedAt;
    }

    public boolean isExpired(OffsetDateTime now) {
        return now.isAfter(expiresAt);
    }
}
