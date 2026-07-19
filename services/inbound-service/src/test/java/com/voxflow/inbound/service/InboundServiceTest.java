package com.voxflow.inbound.service;

import static org.assertj.core.api.Assertions.assertThat;

import com.voxflow.inbound.dto.DtmfRequest;
import com.voxflow.inbound.dto.InboundCallRequest;
import com.voxflow.inbound.repository.InboundSessionRepository;
import com.voxflow.workflow.event.EventPublisher;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class InboundServiceTest {

    private final InboundSessionRepository sessionRepository = org.mockito.Mockito.mock(InboundSessionRepository.class);
    private final EventPublisher eventPublisher = org.mockito.Mockito.mock(EventPublisher.class);
    private final InboundService inboundService = new InboundService(sessionRepository, eventPublisher);

    private final Map<UUID, com.voxflow.inbound.domain.InboundSession> sessionDb = new HashMap<>();

    @BeforeEach
    void setUp() {
        sessionDb.clear();

        org.mockito.Mockito.when(sessionRepository.save(org.mockito.Mockito.any(com.voxflow.inbound.domain.InboundSession.class)))
                .thenAnswer(invocation -> {
                    com.voxflow.inbound.domain.InboundSession s = invocation.getArgument(0);
                    sessionDb.put(s.getId(), s);
                    return s;
                });
        org.mockito.Mockito.when(sessionRepository.findById(org.mockito.Mockito.any(UUID.class)))
                .thenAnswer(invocation -> Optional.ofNullable(sessionDb.get(invocation.getArgument(0))));
    }

    @Test
    void createsInboundSessionAndRoutesDtmf() {
        var session = inboundService.createSession(new InboundCallRequest("+919999999999"));

        assertThat(session.callerPhone()).isEqualTo("+919999999999");
        assertThat(session.currentMenu()).isEqualTo("MAIN_MENU");
        assertThat(session.agentTransferRequested()).isFalse();

        var paymentSession = inboundService.handleDtmf(session.id(), new DtmfRequest("1"));
        assertThat(paymentSession.currentMenu()).isEqualTo("PAYMENT");
        assertThat(paymentSession.agentTransferRequested()).isFalse();

        var agentSession = inboundService.handleDtmf(session.id(), new DtmfRequest("3"));
        assertThat(agentSession.currentMenu()).isEqualTo("AGENT_TRANSFER");
        assertThat(agentSession.agentTransferRequested()).isTrue();
    }
}
