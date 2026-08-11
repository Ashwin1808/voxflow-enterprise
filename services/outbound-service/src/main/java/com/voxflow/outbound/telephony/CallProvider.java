package com.voxflow.outbound.telephony;

import java.util.UUID;

public interface CallProvider {

    String name();

    /** Place an outbound call for the given fraud session. */
    ProviderCall place(UUID sessionId, String phone, String workflowName);

    /** Map a provider-native status into the session state machine. */
    String toVoxflowStatus(String providerStatus);

    record ProviderCall(String providerCallId, String status) {}
}