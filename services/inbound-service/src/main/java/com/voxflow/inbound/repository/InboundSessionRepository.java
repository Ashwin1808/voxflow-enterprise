package com.voxflow.inbound.repository;

import com.voxflow.inbound.domain.InboundSession;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface InboundSessionRepository extends JpaRepository<InboundSession, UUID> {
}
