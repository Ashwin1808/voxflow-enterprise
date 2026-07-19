CREATE TABLE campaigns (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    workflow_name VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL,
    total_contacts INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
    version INT DEFAULT 0
);

CREATE TABLE fraud_sessions (
    id UUID PRIMARY KEY,
    campaign_id UUID REFERENCES campaigns(id),
    customer_phone VARCHAR(50) NOT NULL,
    card_last_four VARCHAR(10) NOT NULL,
    merchant VARCHAR(255) NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    status VARCHAR(50) NOT NULL,
    card_status VARCHAR(50) NOT NULL,
    visual_ivr_url VARCHAR(255),
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

-- Seed workflow definitions
INSERT INTO workflow_definitions (id, name, version, definition_json, created_at, updated_at, version_lock)
VALUES (
    'fraud_verification:2.0',
    'fraud_verification',
    '2.0',
    '{ "name": "fraud_verification", "version": "2.0", "steps": [ { "id":"s1", "type":"PLAY_PROMPT", "text":"We detected a Rs {amount} transaction at {merchant}. Press 1 to approve, 2 to block." }, { "id":"s2", "type":"COLLECT_INPUT", "timeout_ms":10000, "next":{"1":"s3", "2":"s4", "timeout":"s5"} }, { "id":"s3", "type":"UPDATE_STATUS","entity":"transaction","field":"status","value":"APPROVED","next":"s6" }, { "id":"s4", "type":"UPDATE_STATUS","entity":"transaction","field":"status","value":"BLOCKED","next":"s6" }, { "id":"s5", "type":"SEND_VISUAL_IVR","template":"fraud_link","next":"end" }, { "id":"s6", "type":"SEND_NOTIFICATION","channel":"SMS","template":"fraud_resolved","next":"end" }, { "id":"end", "type":"END", "final_status":"COMPLETED" } ] }',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    0
) ON CONFLICT (id) DO NOTHING;
