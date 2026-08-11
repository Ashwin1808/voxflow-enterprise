package com.voxflow.outbound.telephony;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.Base64;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

/** Minimal Twilio REST client — no SDK dependency, HTTP + Basic auth only. */
@Component
@ConditionalOnProperty(name = "voxflow.call.provider", havingValue = "twilio")
public class TwilioApiClient {

    private static final Logger log = LoggerFactory.getLogger(TwilioApiClient.class);
    private static final String API_BASE = "https://api.twilio.com/2010-04-01/Accounts";

    private final HttpClient http = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();

    private final String accountSid;
    private final String authToken;

    public TwilioApiClient(
            @Value("${voxflow.call.twilio.account-sid:}") String accountSid,
            @Value("${voxflow.call.twilio.auth-token:}") String authToken) {
        this.accountSid = accountSid;
        this.authToken = authToken;
    }

    public String createCall(String from, String to, Map<String, String> params) {
        Map<String, String> form = new LinkedHashMap<>();
        form.put("From", from);
        form.put("To", to);
        form.putAll(params);

        try {
            HttpResponse<String> response = http.send(
                    HttpRequest.newBuilder()
                            .uri(URI.create(API_BASE + "/" + accountSid + "/Calls.json"))
                            .header("Authorization", basicAuth())
                            .header("Content-Type", "application/x-www-form-urlencoded")
                            .POST(HttpRequest.BodyPublishers.ofString(encode(form)))
                            .build(),
                    HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8));

            if (response.statusCode() != 201) {
                log.warn("Twilio create call failed ({}): {}", response.statusCode(), response.body());
                throw new IllegalStateException("Twilio call creation failed with status " + response.statusCode());
            }
            return extract(response.body(), "sid");
        } catch (IOException | InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new IllegalStateException("Twilio call creation failed: " + e.getMessage(), e);
        }
    }

    public String fetchStatus(String callSid) {
        try {
            HttpResponse<String> response = http.send(
                    HttpRequest.newBuilder()
                            .uri(URI.create(API_BASE + "/" + accountSid + "/Calls/" + callSid + ".json"))
                            .header("Authorization", basicAuth())
                            .GET()
                            .build(),
                    HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8));
            if (response.statusCode() != 200) {
                return null;
            }
            return extract(response.body(), "status");
        } catch (IOException | InterruptedException e) {
            Thread.currentThread().interrupt();
            return null;
        }
    }

    private String basicAuth() {
        return "Basic " + Base64.getEncoder().encodeToString((accountSid + ":" + authToken).getBytes(StandardCharsets.UTF_8));
    }

    private String extract(String json, String field) {
        String key = "\"" + field + "\"";
        int idx = json.indexOf(key);
        if (idx < 0) {
            return null;
        }
        int start = json.indexOf('"', idx + key.length()) + 1;
        int end = json.indexOf('"', start);
        return end > start ? json.substring(start, end) : null;
    }

    private String encode(Map<String, String> params) {
        return params.entrySet().stream()
                .map(e -> encode(e.getKey()) + "=" + encode(e.getValue()))
                .collect(Collectors.joining("&"));
    }

    private String encode(String value) {
        return java.net.URLEncoder.encode(value, StandardCharsets.UTF_8);
    }
}