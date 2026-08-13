package com.voxflow.fraud.service;

import com.voxflow.fraud.domain.VisualIvrToken;
import com.voxflow.fraud.repository.VisualIvrTokenRepository;
import java.security.SecureRandom;
import java.time.OffsetDateTime;
import java.util.Base64;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class VisualIvrTokenService {

    public static final long TOKEN_TTL_HOURS = 24;

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    private final VisualIvrTokenRepository tokenRepository;

    public VisualIvrTokenService(VisualIvrTokenRepository tokenRepository) {
        this.tokenRepository = tokenRepository;
    }

    @Transactional
    public VisualIvrToken createForSession(UUID sessionId) {
        OffsetDateTime now = OffsetDateTime.now();
        tokenRepository.expireActiveTokensForSession(sessionId);

        VisualIvrToken token = new VisualIvrToken(
                UUID.randomUUID(),
                sessionId,
                generateToken(),
                VisualIvrToken.TokenStatus.ACTIVE,
                now.plusHours(TOKEN_TTL_HOURS),
                now,
                null);
        return tokenRepository.save(token);
    }

    @Transactional(readOnly = true)
    public VisualIvrToken resolve(String rawToken) {
        VisualIvrToken token = tokenRepository.findByToken(rawToken)
                .orElseThrow(() -> new IllegalArgumentException("Verification link is invalid"));

        if (token.isExpired(OffsetDateTime.now())) {
            throw new IllegalStateException("Verification link has expired");
        }
        if (token.getStatus() != VisualIvrToken.TokenStatus.ACTIVE) {
            throw new IllegalStateException("Verification link has already been used");
        }
        return token;
    }

    @Transactional
    public VisualIvrToken redeem(String rawToken) {
        VisualIvrToken token = tokenRepository.findByToken(rawToken)
                .orElseThrow(() -> new IllegalArgumentException("Verification link is invalid"));

        OffsetDateTime now = OffsetDateTime.now();

        if (token.isExpired(now)) {
            token.setStatus(VisualIvrToken.TokenStatus.EXPIRED);
            token.setUpdatedAt(now);
            tokenRepository.save(token);
            throw new IllegalStateException("Verification link has expired");
        }
        if (token.getStatus() != VisualIvrToken.TokenStatus.ACTIVE) {
            throw new IllegalStateException("Verification link has already been used");
        }

        token.setStatus(VisualIvrToken.TokenStatus.USED);
        token.setUsedAt(now);
        token.setUpdatedAt(now);
        return tokenRepository.save(token);
    }

    @Transactional
    public VisualIvrToken save(VisualIvrToken token) {
        return tokenRepository.save(token);
    }

    /** Finds a token tolerating the USED status (e.g. receipt download after a decision). */
    @Transactional(readOnly = true)
    public VisualIvrToken findByToken(String rawToken) {
        VisualIvrToken token = tokenRepository.findByToken(rawToken)
                .orElseThrow(() -> new IllegalArgumentException("Verification link is invalid"));
        if (token.isExpired(OffsetDateTime.now())) {
            throw new IllegalStateException("Verification link has expired");
        }
        return token;
    }

    @Transactional(readOnly = true)
    public java.util.Optional<VisualIvrToken> findTokenBySession(UUID sessionId) {
        return tokenRepository.findFirstBySessionIdOrderByCreatedAtDesc(sessionId);
    }

    private String generateToken() {
        byte[] bytes = new byte[24];
        SECURE_RANDOM.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }
}
