package com.voxflow.fraud.repository;

import com.voxflow.fraud.domain.VisualIvrToken;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface VisualIvrTokenRepository extends JpaRepository<VisualIvrToken, UUID> {

    Optional<VisualIvrToken> findByToken(String token);

    @Modifying
    @Query("UPDATE VisualIvrToken t SET t.status = com.voxflow.fraud.domain.VisualIvrToken$TokenStatus.EXPIRED, t.updatedAt = CURRENT_TIMESTAMP WHERE t.sessionId = :sessionId AND t.status = com.voxflow.fraud.domain.VisualIvrToken$TokenStatus.ACTIVE")
    int expireActiveTokensForSession(@Param("sessionId") UUID sessionId);
}
