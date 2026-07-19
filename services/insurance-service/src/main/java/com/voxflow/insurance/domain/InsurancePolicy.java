package com.voxflow.insurance.domain;

import com.voxflow.insurance.dto.PolicyStatus;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "policies")
public class InsurancePolicy {

    @Id
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "campaign_id")
    private InsuranceCampaign campaign;

    @Column(name = "customer_phone", nullable = false)
    private String customerPhone;

    @Column(name = "policy_number", nullable = false)
    private String policyNumber;

    @Column(name = "premium_due", nullable = false)
    private BigDecimal premiumDue;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PolicyStatus status;

    @Column(name = "payment_url")
    private String paymentUrl;

    @Column(name = "claims_url")
    private String claimsUrl;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    @Version
    private Integer version;

    public InsurancePolicy() {}

    public InsurancePolicy(UUID id, InsuranceCampaign campaign, String customerPhone, String policyNumber, BigDecimal premiumDue, PolicyStatus status, String paymentUrl, String claimsUrl, OffsetDateTime createdAt, OffsetDateTime updatedAt) {
        this.id = id;
        this.campaign = campaign;
        this.customerPhone = customerPhone;
        this.policyNumber = policyNumber;
        this.premiumDue = premiumDue;
        this.status = status;
        this.paymentUrl = paymentUrl;
        this.claimsUrl = claimsUrl;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public InsuranceCampaign getCampaign() {
        return campaign;
    }

    public void setCampaign(InsuranceCampaign campaign) {
        this.campaign = campaign;
    }

    public String getCustomerPhone() {
        return customerPhone;
    }

    public void setCustomerPhone(String customerPhone) {
        this.customerPhone = customerPhone;
    }

    public String getPolicyNumber() {
        return policyNumber;
    }

    public void setPolicyNumber(String policyNumber) {
        this.policyNumber = policyNumber;
    }

    public BigDecimal getPremiumDue() {
        return premiumDue;
    }

    public void setPremiumDue(BigDecimal premiumDue) {
        this.premiumDue = premiumDue;
    }

    public PolicyStatus getStatus() {
        return status;
    }

    public void setStatus(PolicyStatus status) {
        this.status = status;
    }

    public String getPaymentUrl() {
        return paymentUrl;
    }

    public void setPaymentUrl(String paymentUrl) {
        this.paymentUrl = paymentUrl;
    }

    public String getClaimsUrl() {
        return claimsUrl;
    }

    public void setClaimsUrl(String claimsUrl) {
        this.claimsUrl = claimsUrl;
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
