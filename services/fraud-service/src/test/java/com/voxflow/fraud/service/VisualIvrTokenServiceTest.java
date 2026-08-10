package com.voxflow.fraud.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.voxflow.fraud.domain.VisualIvrToken;
import com.voxflow.fraud.repository.VisualIvrTokenRepository;
import java.time.OffsetDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

class VisualIvrTokenServiceTest {

    private final VisualIvrTokenRepository tokenRepository = org.mockito.Mockito.mock(VisualIvrTokenRepository.class);
    private final VisualIvrTokenService tokenService = new VisualIvrTokenService(tokenRepository);

    private final Map<String, VisualIvrToken> tokenDb = new HashMap<>();

    @BeforeEach
    void setUp() {
        tokenDb.clear();

        org.mockito.Mockito.when(tokenRepository.save(org.mockito.Mockito.any(VisualIvrToken.class)))
                .thenAnswer(invocation -> {
                    VisualIvrToken token = invocation.getArgument(0);
                    tokenDb.put(token.getToken(), token);
                    return token;
                });
        org.mockito.Mockito.when(tokenRepository.findByToken(org.mockito.Mockito.anyString()))
                .thenAnswer(invocation -> Optional.ofNullable(tokenDb.get(invocation.getArgument(0))));
    }

    @Test
    void createsActiveTokenWithTwentyFourHourTtl() {
        UUID sessionId = UUID.randomUUID();

        VisualIvrToken created = tokenService.createForSession(sessionId);

        assertThat(created.getStatus()).isEqualTo(VisualIvrToken.TokenStatus.ACTIVE);
        assertThat(created.getSessionId()).isEqualTo(sessionId);
        assertThat(created.getToken()).isNotBlank();
        assertThat(created.getExpiresAt()).isAfter(created.getCreatedAt().plusHours(23));
        assertThat(created.getExpiresAt()).isBeforeOrEqualTo(created.getCreatedAt().plusHours(24).plusSeconds(1));
    }

    @Test
    void redeemsActiveTokenOnce() {
        UUID sessionId = UUID.randomUUID();
        VisualIvrToken created = tokenService.createForSession(sessionId);

        VisualIvrToken redeemed = tokenService.redeem(created.getToken());

        assertThat(redeemed.getStatus()).isEqualTo(VisualIvrToken.TokenStatus.USED);
        assertThat(redeemed.getUsedAt()).isNotNull();
        assertThat(redeemed.getExpiresAt()).isNotNull();
    }

    @Test
    void rejectsReuseOfRedeemedToken() {
        UUID sessionId = UUID.randomUUID();
        VisualIvrToken created = tokenService.createForSession(sessionId);
        tokenService.redeem(created.getToken());

        assertThatThrownBy(() -> tokenService.redeem(created.getToken()))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("already been used");
    }

    @Test
    void rejectsExpiredToken() {
        OffsetDateTime now = OffsetDateTime.now();
        VisualIvrToken expired = new VisualIvrToken(
                UUID.randomUUID(), UUID.randomUUID(), "expired-token",
                VisualIvrToken.TokenStatus.ACTIVE,
                now.minusMinutes(1), now.minusHours(25), null);
        tokenDb.put(expired.getToken(), expired);

        assertThatThrownBy(() -> tokenService.redeem("expired-token"))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("expired");
        assertThat(tokenDb.get("expired-token").getStatus()).isEqualTo(VisualIvrToken.TokenStatus.EXPIRED);
    }

    @Test
    void rejectsUnknownToken() {
        assertThatThrownBy(() -> tokenService.redeem("nope"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("invalid");
    }

    @Test
    void creatingNewTokenExpiresPreviousOnesForSession() {
        UUID sessionId = UUID.randomUUID();
        tokenService.createForSession(sessionId);
        tokenService.createForSession(sessionId);

        ArgumentCaptor<UUID> captor = ArgumentCaptor.forClass(UUID.class);
        org.mockito.Mockito.verify(tokenRepository, org.mockito.Mockito.times(2)).expireActiveTokensForSession(captor.capture());
        assertThat(captor.getAllValues()).allMatch(uuid -> uuid.equals(sessionId));
    }

    @Test
    void generatesUniqueTokensPerSession() {
        String first = tokenService.createForSession(UUID.randomUUID()).getToken();
        String second = tokenService.createForSession(UUID.randomUUID()).getToken();

        assertThat(first).isNotEqualTo(second);
    }
}
