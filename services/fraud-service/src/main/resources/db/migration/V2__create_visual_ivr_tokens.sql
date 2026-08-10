CREATE TABLE visual_ivr_tokens (
    id UUID PRIMARY KEY,
    session_id UUID NOT NULL REFERENCES fraud_sessions(id),
    token VARCHAR(64) NOT NULL UNIQUE,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used_at TIMESTAMP WITH TIME ZONE,
    version INT DEFAULT 0
);

CREATE INDEX idx_visual_ivr_tokens_session ON visual_ivr_tokens(session_id);
CREATE INDEX idx_visual_ivr_tokens_status_expiry ON visual_ivr_tokens(status, expires_at);
