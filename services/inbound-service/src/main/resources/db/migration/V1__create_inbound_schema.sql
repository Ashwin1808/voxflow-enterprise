CREATE TABLE inbound_sessions (
    id UUID PRIMARY KEY,
    caller_phone VARCHAR(50) NOT NULL,
    current_menu VARCHAR(50) NOT NULL,
    prompt_text VARCHAR(255) NOT NULL,
    agent_transfer BOOLEAN NOT NULL DEFAULT FALSE,
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
