package com.voxflow.fraud.domain;

import com.voxflow.fraud.dto.FraudStatus;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "fraud_sessions")
public class FraudSession {

    @Id
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "campaign_id")
    private FraudCampaign campaign;

    @Column(name = "customer_phone", nullable = false)
    private String customerPhone;

    @Column(name = "card_last_four", nullable = false)
    private String cardLastFour;

    @Column(nullable = false)
    private String merchant;

    @Column(nullable = false)
    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private FraudStatus status;

    @Column(name = "card_status", nullable = false)
    private String cardStatus;

    @Column(name = "visual_ivr_url")
    private String visualIvrUrl;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    @Version
    private Integer version;

    public FraudSession() {}

    public FraudSession(UUID id, FraudCampaign campaign, String customerPhone, String cardLastFour, String merchant, BigDecimal amount, FraudStatus status, String cardStatus, String visualIvrUrl, OffsetDateTime createdAt, OffsetDateTime updatedAt) {
        this.id = id;
        this.campaign = campaign;
        this.customerPhone = customerPhone;
        this.cardLastFour = cardLastFour;
        this.merchant = merchant;
        this.amount = amount;
        this.status = status;
        this.cardStatus = cardStatus;
        this.visualIvrUrl = visualIvrUrl;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public FraudCampaign getCampaign() {
        return campaign;
    }

    public void setCampaign(FraudCampaign campaign) {
        this.campaign = campaign;
    }

    public String getCustomerPhone() {
        return customerPhone;
    }

    public void setCustomerPhone(String customerPhone) {
        this.customerPhone = customerPhone;
    }

    public String getCardLastFour() {
        return cardLastFour;
    }

    public void setCardLastFour(String cardLastFour) {
        this.cardLastFour = cardLastFour;
    }

    public String getMerchant() {
        return merchant;
    }

    public void setMerchant(String merchant) {
        this.merchant = merchant;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public FraudStatus getStatus() {
        return status;
    }

    public void setStatus(FraudStatus status) {
        this.status = status;
    }

    public String getCardStatus() {
        return cardStatus;
    }

    public void setCardStatus(String cardStatus) {
        this.cardStatus = cardStatus;
    }

    public String getVisualIvrUrl() {
        return visualIvrUrl;
    }

    public void setVisualIvrUrl(String visualIvrUrl) {
        this.visualIvrUrl = visualIvrUrl;
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
