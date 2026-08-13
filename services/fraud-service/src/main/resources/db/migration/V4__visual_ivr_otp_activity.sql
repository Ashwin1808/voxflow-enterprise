ALTER TABLE visual_ivr_tokens
    ADD COLUMN otp_code VARCHAR(6),
    ADD COLUMN otp_expires_at TIMESTAMP WITH TIME ZONE,
    ADD COLUMN otp_verified BOOLEAN NOT NULL DEFAULT FALSE;

CREATE TABLE visual_ivr_activity (
    id UUID PRIMARY KEY,
    token_id UUID NOT NULL REFERENCES visual_ivr_tokens(id),
    event VARCHAR(64) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE INDEX idx_visual_ivr_activity_token ON visual_ivr_activity(token_id, created_at);
