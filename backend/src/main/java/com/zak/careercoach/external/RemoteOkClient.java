package com.zak.careercoach.external;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.ArrayList;
import java.util.List;

@Service
@Slf4j
public class RemoteOkClient {

    private final RestClient http;
    private final ObjectMapper mapper = new ObjectMapper();
    private final boolean enabled;

    public RemoteOkClient(@Value("${app.remoteok.enabled:true}") boolean enabled) {
        this.enabled = enabled;
        this.http = RestClient.builder()
            .baseUrl("https://remoteok.com")
            .defaultHeader("User-Agent", "career-coach-app/1.0")
            .build();
    }

    public List<ExternalJob> fetch(String tagFilter) {
        if (!enabled) return List.of();
        try {
            String raw = http.get().uri("/api").retrieve().body(String.class);
            return parse(raw, tagFilter);
        } catch (Exception e) {
            log.warn("RemoteOK fallita: {}", e.getMessage());
            return List.of();
        }
    }

    private List<ExternalJob> parse(String json, String tagFilter) {
        List<ExternalJob> out = new ArrayList<>();
        try {
            JsonNode root = mapper.readTree(json);
            if (!root.isArray()) return out;
            String tag = tagFilter == null ? null : tagFilter.toLowerCase();
            for (int i = 1; i < root.size(); i++) { // [0] = metadata
                JsonNode n = root.get(i);
                if (!n.has("position")) continue;
                if (tag != null && !hasTag(n.path("tags"), tag)) continue;

                ExternalJob j = new ExternalJob();
                j.externalId = n.path("id").asText();
                j.title = n.path("position").asText();
                j.description = stripHtml(n.path("description").asText(""));
                j.salaryMin = n.path("salary_min").isNumber() ? n.path("salary_min").asInt() : null;
                j.salaryMax = n.path("salary_max").isNumber() ? n.path("salary_max").asInt() : null;
                j.location = n.path("location").asText("Remote");
                j.companyName = n.path("company").asText("Unknown");
                j.contractType = "FULL_TIME";
                j.remote = true;
                if (n.path("tags").isArray()) {
                    n.path("tags").forEach(t -> j.skills.add(t.asText()));
                }
                out.add(j);
                if (out.size() >= 30) break; // limit
            }
        } catch (Exception e) {
            log.warn("Parse RemoteOK fallito: {}", e.getMessage());
        }
        return out;
    }

    private boolean hasTag(JsonNode tags, String wanted) {
        if (!tags.isArray()) return false;
        for (JsonNode t : tags) {
            if (t.asText("").toLowerCase().contains(wanted)) return true;
        }
        return false;
    }

    private String stripHtml(String html) {
        if (html == null) return "";
        String text = html.replaceAll("<[^>]+>", " ").replaceAll("\\s+", " ").strip();
        return text.length() > 4000 ? text.substring(0, 4000) : text;
    }
}
