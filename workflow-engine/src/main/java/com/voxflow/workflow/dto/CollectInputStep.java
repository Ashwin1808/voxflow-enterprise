package com.voxflow.workflow.dto;

import java.util.Map;

public class CollectInputStep extends Step {
    private long timeoutMs;
    private String[] validKeys;
    private Map<String, String> nextMap;

    public CollectInputStep() {
        super();
    }

    public CollectInputStep(String id, String next, long timeoutMs, String[] validKeys, Map<String, String> nextMap) {
        super(id, next);
        this.timeoutMs = timeoutMs;
        this.validKeys = validKeys;
        this.nextMap = nextMap;
    }

    public long getTimeoutMs() {
        return timeoutMs;
    }

    public void setTimeoutMs(long timeoutMs) {
        this.timeoutMs = timeoutMs;
    }

    public String[] getValidKeys() {
        return validKeys;
    }

    public void setValidKeys(String[] validKeys) {
        this.validKeys = validKeys;
    }

    public Map<String, String> getNextMap() {
        return nextMap;
    }

    public void setNextMap(Map<String, String> nextMap) {
        this.nextMap = nextMap;
    }
}
