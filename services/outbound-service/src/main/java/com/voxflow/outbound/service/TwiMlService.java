package com.voxflow.outbound.service;

import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class TwiMlService {

    private final String publicBaseUrl;

    public TwiMlService(@Value("${voxflow.call.public-base-url:}") String publicBaseUrl) {
        this.publicBaseUrl = publicBaseUrl;
    }

    /** Full IVR experience — used when the TwiML URL is publicly reachable (PUBLIC_BASE_URL set). */
    public String voiceTwiMl(UUID sessionId) {
        String base = publicBaseUrl;
        return """
                <?xml version="1.0" encoding="UTF-8"?>
                <Response>
                  <Say voice="woman">This is a fraud alert from your issuing bank. A transaction was attempted with your card. If you made this transaction, press 1. If you did not make this transaction, press 2.</Say>
                  <Gather numDigits="1" timeout="5" action="%s/api/v1/outbound/provider/callbacks/gather?sessionId=%s" method="POST">
                    <Say>Press 1 to approve. Press 2 to decline.</Say>
                  </Gather>
                  <Say>We did not receive a response. Our fraud desk will contact you shortly.</Say>
                </Response>
                """.formatted(base, sessionId);
    }
}