package com.voxflow.fraud.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "visual_ivr_activity")
public class VisualIvrActivity {

    @Id
    private UUID id;

    @Column(name = "token_id", nullable = false)
    private UUID tokenId;

    @Column(nullable = false)
    private String event;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    public VisualIvrActivity() {}

    public VisualIvrActivity(UUID id, UUID tokenId, String event, OffsetDateTime createdAt) {
        this.id = id;
        this.tokenId = tokenId;
        this.event = event;
        this.createdAt = createdAt;
    }

    public UUID getId() {
        return id;
    }

    public UUID getTokenId() {
        return tokenId;
    }

    public String getEvent() {
        return event;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }
}
