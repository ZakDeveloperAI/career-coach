package com.zak.careercoach.external;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.zak.careercoach.exception.AppException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Map;

@Service
@Slf4j
public class GeminiClient {

    private final RestClient http;
    private final ObjectMapper mapper = new ObjectMapper();
    private final String apiKey;
    private final String model;

    public GeminiClient(
            @Value("${app.gemini.api-key:}") String apiKey,
            @Value("${app.gemini.model:gemini-2.5-flash}") String model) {
        this.apiKey = apiKey;
        this.model = model;
        this.http = RestClient.builder()
            .baseUrl("https://generativelanguage.googleapis.com/v1beta")
            .build();
    }

    public String complete(String systemPrompt, String userPrompt) {
        if (apiKey == null || apiKey.isBlank()) {
            throw AppException.badRequest("GEMINI_API_KEY non configurata");
        }
        Map<String, Object> body = Map.of(
            "system_instruction", Map.of("parts", List.of(Map.of("text", systemPrompt))),
            "contents", List.of(Map.of("role", "user",
                "parts", List.of(Map.of("text", userPrompt)))),
            "generationConfig", Map.of("temperature", 0.4)
        );
        try {
            String raw = http.post()
                .uri("/models/{model}:generateContent", model)
                .header("x-goog-api-key", apiKey)
                .header(HttpHeaders.CONTENT_TYPE, "application/json")
                .body(body)
                .retrieve()
                .body(String.class);
            return extractText(raw);
        } catch (AppException e) {
            throw e;
        } catch (Exception e) {
            log.warn("Chiamata Gemini fallita: {}", e.getMessage());
            String msg = e.getMessage() == null ? "" : e.getMessage();
            if (msg.contains("429")) {
                throw new AppException(
                    org.springframework.http.HttpStatus.TOO_MANY_REQUESTS,
                    "Troppe richieste all'AI in poco tempo. Aspetta qualche secondo e riprova.");
            }
            throw new AppException(
                org.springframework.http.HttpStatus.SERVICE_UNAVAILABLE,
                "Il servizio AI non e' al momento disponibile, riprova piu' tardi");
        }
    }

    private String extractText(String json) {
        try {
            JsonNode root = mapper.readTree(json);
            JsonNode parts = root.path("candidates").path(0).path("content").path("parts");
            StringBuilder sb = new StringBuilder();
            for (JsonNode p : parts) {
                sb.append(p.path("text").asText(""));
            }
            return sb.toString().strip();
        } catch (Exception e) {
            throw new AppException(
                org.springframework.http.HttpStatus.BAD_GATEWAY,
                "Risposta AI non leggibile");
        }
    }

    public String model() {
        return model;
    }
}
