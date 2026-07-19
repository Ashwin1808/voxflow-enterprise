package com.voxflow.inbound.domain;

import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "inbound_sessions")
public class InboundSession {

    @Id
    private UUID id;

    @Column(name = "caller_phone", nullable = false)
    private String callerPhone;

    @Column(name = "current_menu", nullable = false)
    private String currentMenu;

    @Column(name = "prompt_text", nullable = false)
    private String promptText;

    @Column(name = "agent_transfer", nullable = false)
    private boolean agentTransfer;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    @Version
    private Integer version;

    public InboundSession() {}

    public InboundSession(UUID id, String callerPhone, String currentMenu, String promptText, boolean agentTransfer, OffsetDateTime createdAt, OffsetDateTime updatedAt) {
        this.id = id;
        this.callerPhone = callerPhone;
        this.currentMenu = currentMenu;
        this.promptText = promptText;
        this.agentTransfer = agentTransfer;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getCallerPhone() {
        return callerPhone;
    }

    public void setCallerPhone(String callerPhone) {
        this.callerPhone = callerPhone;
    }

    public String getCurrentMenu() {
        return currentMenu;
    }

    public void setCurrentMenu(String currentMenu) {
        this.currentMenu = currentMenu;
    }

    public String getPromptText() {
        return promptText;
    }

    public void setPromptText(String promptText) {
        this.promptText = promptText;
    }

    public boolean isAgentTransfer() {
        return agentTransfer;
    }

    public void setAgentTransfer(boolean agentTransfer) {
        this.agentTransfer = agentTransfer;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(OffsetDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public OffsetDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(OffsetDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public Integer getVersion() {
        return version;
    }

    public void setVersion(Integer version) {
        this.version = version;
    }
}
