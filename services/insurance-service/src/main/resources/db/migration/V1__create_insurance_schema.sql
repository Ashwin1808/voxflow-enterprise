CREATE TABLE campaigns (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    workflow_name VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL,
    total_policies INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
    version INT DEFAULT 0
);

CREATE TABLE policies (
    id UUID PRIMARY KEY,
    campaign_id UUID REFERENCES campaigns(id),
    customer_phone VARCHAR(50) NOT NULL,
    policy_number VARCHAR(50) NOT NULL,
    premium_due DECIMAL(12,2) NOT NULL,
    status VARCHAR(50) NOT NULL,
    payment_url VARCHAR(255),
    claims_url VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
    version INT DEFAULT 0
);

CREATE TABLE workflow_definitions (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    version VARCHAR(50) NOT NULL,
    definition_json TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
    version_lock INT DEFAULT 0
);

CREATE TABLE workflow_executions (
    session_id VARCHAR(255) PRIMARY KEY,
    workflow_id VARCHAR(255) NOT NULL,
    current_step_id VARCHAR(255),
    status VARCHAR(50) NOT NULL,
    variables TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
    version_lock INT DEFAULT 0
);

-- Seed default workflow definitions
INSERT INTO workflow_definitions (id, name, version, definition_json, created_at, updated_at, version_lock)
VALUES (
    'policy_payment:1.0',
    'policy_payment',
    '1.0',
    '{ "name": "policy_payment", "version": "1.0", "steps": [ { "id":"s1", "type":"PLAY_PROMPT", "text":"Your policy {policyNumber} renewal is due. The premium is Rs {premiumDue}. Press 1 to pay now, 2 to talk to an agent." }, { "id":"s2", "type":"COLLECT_INPUT", "timeout_ms":10000, "next":{"1":"s3", "2":"s4", "timeout":"s5"} }, { "id":"s3", "type":"INITIATE_PAYMENT", "amount_field":"premiumDue", "currency":"INR", "description":"Premium payment for policy {policyNumber}", "next":"end" }, { "id":"s4", "type":"TRANSFER_AGENT", "queue_id":"insurance_renewals", "priority":1, "timeout":30, "next":"end" }, { "id":"s5", "type":"SEND_NOTIFICATION", "channel":"SMS", "template":"payment_link", "variables":{"url":"/visual-ivr/insurance/payment/{policyId}"}, "next":"end" }, { "id":"end", "type":"END", "final_status":"COMPLETED" } ] }',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    0
) ON CONFLICT (id) DO NOTHING;
