package com.zak.careercoach.external;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.ArrayList;
import java.util.List;

@Service
@Slf4j
public class AdzunaClient {

    private final RestClient http;
    private final ObjectMapper mapper = new ObjectMapper();
    private final String appId;
    private final String appKey;
    private final String country;

    public AdzunaClient(
            @Value("${app.adzuna.app-id:}") String appId,
            @Value("${app.adzuna.app-key:}") String appKey,
            @Value("${app.adzuna.country:it}") String country) {
        this.appId = appId;
        this.appKey = appKey;
        this.country = country;
        this.http = RestClient.builder().baseUrl("https://api.adzuna.com").build();
    }

    public boolean isConfigured() {
        return appId != null && !appId.isBlank() && appKey != null && !appKey.isBlank();
    }

    public List<ExternalJob> search(String what, String where, int resultsPerPage) {
        if (!isConfigured()) return List.of();
        String uri = UriComponentsBuilder.fromPath("/v1/api/jobs/{country}/search/1")
            .queryParam("app_id", appId)
            .queryParam("app_key", appKey)
            .queryParam("results_per_page", Math.min(50, Math.max(1, resultsPerPage)))
            .queryParam("what", what != null ? what : "")
            .queryParam("where", where != null ? where : "")
            .build().toUriString();

        try {
            String raw = http.get().uri(uri, country).retrieve().body(String.class);
            return parse(raw);
        } catch (Exception e) {
            log.warn("Adzuna fallita: {}", e.getMessage());
            return List.of();
        }
    }

    private List<ExternalJob> parse(String json) {
        List<ExternalJob> out = new ArrayList<>();
        try {
            JsonNode root = mapper.readTree(json);
            for (JsonNode n : root.path("results")) {
                ExternalJob j = new ExternalJob();
                j.externalId = n.path("id").asText();
                j.title = n.path("title").asText();
                j.description = n.path("description").asText();
                j.salaryMin = n.path("salary_min").isNumber() ? n.path("salary_min").asInt() : null;
                j.salaryMax = n.path("salary_max").isNumber() ? n.path("salary_max").asInt() : null;
                j.location = n.path("location").path("display_name").asText(null);
                j.companyName = n.path("company").path("display_name").asText("Sconosciuto");
                j.contractType = mapContract(n.path("contract_time").asText(""), n.path("contract_type").asText(""));
                j.remote = false;
                out.add(j);
            }
        } catch (Exception e) {
            log.warn("Parse Adzuna fallito: {}", e.getMessage());
        }
        return out;
    }

    private String mapContract(String time, String type) {
        if ("part_time".equalsIgnoreCase(time)) return "PART_TIME";
        if ("contract".equalsIgnoreCase(type)) return "CONTRACT";
        if ("freelance".equalsIgnoreCase(type)) return "FREELANCE";
        return "FULL_TIME";
    }
}
