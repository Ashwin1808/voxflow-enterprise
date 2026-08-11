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

/** Minimal Exotel REST client — HTTP + Basic auth only, no SDK. */
@Component
@ConditionalOnProperty(name = "voxflow.call.provider", havingValue = "exotel")
public class ExotelApiClient {

    private static final Logger log = LoggerFactory.getLogger(ExotelApiClient.class);
    private static final String API_BASE = "https://api.exotel.com/v1/Accounts";

    private final HttpClient http = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();

    private final String accountSid;
    private final String apiKey;
    private final String apiToken;

    public ExotelApiClient(
            @Value("${voxflow.call.exotel.account-sid:}") String accountSid,
            @Value("${voxflow.call.exotel.api-key:}") String apiKey,
            @Value("${voxflow.call.exotel.api-token:}") String apiToken) {
        this.accountSid = accountSid;
        this.apiKey = apiKey;
        this.apiToken = apiToken;
    }

    public String createCall(String from, String to, Map<String, String> params) {
        Map<String, String> form = new LinkedHashMap<>();
        form.put("From", from);
        form.put("To", to);
        form.putAll(params);

        try {
            HttpResponse<String> response = http.send(
                    HttpRequest.newBuilder()
                            .uri(URI.create(API_BASE + "/" + accountSid + "/Calls"))
                            .header("Authorization", basicAuth())
                            .header("Content-Type", "application/x-www-form-urlencoded")
                            .POST(HttpRequest.BodyPublishers.ofString(encode(form)))
                            .build(),
                    HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8));

            if (response.statusCode() != 200) {
                log.warn("Exotel create call failed ({}): {}", response.statusCode(), response.body());
                throw new IllegalStateException("Exotel call creation failed with status " + response.statusCode());
            }
            String sid = extract(response.body(), "\"Sid\"");
            if (sid == null) {
                throw new IllegalStateException("Exotel call creation failed (no Sid): " + response.body());
            }
            return sid;
        } catch (IOException | InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new IllegalStateException("Exotel call creation failed: " + e.getMessage(), e);
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
            return extract(response.body(), "\"Status\"");
        } catch (IOException | InterruptedException e) {
            Thread.currentThread().interrupt();
            return null;
        }
    }

    private String basicAuth() {
        return "Basic " + Base64.getEncoder().encodeToString((apiKey + ":" + apiToken).getBytes(StandardCharsets.UTF_8));
    }

    private String extract(String json, String key) {
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
