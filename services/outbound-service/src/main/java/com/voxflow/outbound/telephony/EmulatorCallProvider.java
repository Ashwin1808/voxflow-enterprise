package com.voxflow.outbound.telephony;

import com.voxflow.outbound.event.CallEventPublisher;
import com.voxflow.workflow.event.dto.CallEvent;
import java.time.OffsetDateTime;
import java.util.UUID;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.Semaphore;
import java.util.concurrent.ThreadLocalRandom;
import java.util.concurrent.TimeUnit;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

/** Free, local bulk dialer — simulates a progressive dialer with realistic outcomes. */
@Component
@ConditionalOnProperty(name = "voxflow.call.provider", havingValue = "emulator", matchIfMissing = true)
public class EmulatorCallProvider implements CallProvider {

    private static final Logger log = LoggerFactory.getLogger(EmulatorCallProvider.class);

    private static final int MAX_CONCURRENT_LINES = 7;

    private final Semaphore lines = new Semaphore(MAX_CONCURRENT_LINES);
    private final ScheduledExecutorService scheduler =
            java.util.concurrent.Executors.newScheduledThreadPool(3);
    private final CallEventPublisher publisher;
    private final io.micrometer.core.instrument.MeterRegistry meterRegistry;
    private final io.micrometer.core.instrument.Counter callsPlaced;
    private final io.micrometer.core.instrument.Counter callsAnswered;
    private final io.micrometer.core.instrument.Gauge linesInUse;

    private final double answerRate;
    private final int minRingSeconds;
    private final int maxRingSeconds;

    public EmulatorCallProvider(
            CallEventPublisher publisher,
            io.micrometer.core.instrument.MeterRegistry meterRegistry,
            @Value("${voxflow.call.emulator.answer-rate:0.75}") double answerRate,
            @Value("${voxflow.call.emulator.min-ring-seconds:2}") int minRingSeconds,
            @Value("${voxflow.call.emulator.max-ring-seconds:8}") int maxRingSeconds) {
        this.publisher = publisher;
        this.meterRegistry = meterRegistry;
        this.answerRate = answerRate;
        this.minRingSeconds = minRingSeconds;
        this.maxRingSeconds = maxRingSeconds;
        this.callsPlaced = meterRegistry.counter("outbound.calls.total", "provider", "EMULATOR");
        this.callsAnswered = meterRegistry.counter("outbound.calls.answered", "provider", "EMULATOR");
        this.linesInUse = io.micrometer.core.instrument.Gauge.builder(
                        "outbound.lines.in_use", lines, Semaphore::availablePermits)
                .description("Dialer lines currently free")
                .register(meterRegistry);
    }

    @Override
    public String name() {
        return "EMULATOR";
    }

    @Override
    public ProviderCall place(UUID sessionId, String phone, String workflowName) {
        if (!lines.tryAcquire()) {
            log.info("All {} dialer lines busy, deferring session {}", MAX_CONCURRENT_LINES, sessionId);
            publisher.publish("call.status", new CallEvent(
                    sessionId, phone, workflowName, "QUEUED", null, OffsetDateTime.now()));
            return new ProviderCall("deferred-" + sessionId, "QUEUED");
        }

        OffsetDateTime now = OffsetDateTime.now();
        publisher.publish("call.status", new CallEvent(
                sessionId, phone, workflowName, "DIALING", null, now));
        log.info("[emulator] dialing {} for session {}", phone, sessionId);

        long ringSeconds = ThreadLocalRandom.current().nextLong(minRingSeconds, maxRingSeconds + 1);
        long outcomeSeconds = ThreadLocalRandom.current().nextLong(2, 6);

        scheduler.schedule(() -> {
            publisher.publish("call.status", new CallEvent(
                    sessionId, phone, workflowName, "RINGING", null, OffsetDateTime.now()));
        }, ringSeconds, TimeUnit.SECONDS);

        scheduler.schedule(() -> {
            boolean answered = ThreadLocalRandom.current().nextDouble() < answerRate;
            String outcome = answered ? "ANSWERED" : "NO_ANSWER";
            publisher.publish("call.status", new CallEvent(
                    sessionId, phone, workflowName, outcome, null, OffsetDateTime.now()));
            lines.release();
            callsPlaced.increment();
            if (answered) {
                callsAnswered.increment();
            }
            log.info("[emulator] session {} -> {}", sessionId, outcome);
        }, ringSeconds + outcomeSeconds, TimeUnit.SECONDS);

        return new ProviderCall("emulator-" + sessionId, "DIALING");
    }

    @Override
    public String toVoxflowStatus(String providerStatus) {
        return providerStatus;
    }
}