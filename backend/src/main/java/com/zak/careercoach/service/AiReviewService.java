package com.zak.careercoach.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.zak.careercoach.dto.AiReviewDto;
import com.zak.careercoach.entity.AiReview;
import com.zak.careercoach.entity.Job;
import com.zak.careercoach.entity.Resume;
import com.zak.careercoach.entity.User;
import com.zak.careercoach.exception.AppException;
import com.zak.careercoach.external.GeminiClient;
import com.zak.careercoach.repository.AiReviewRepository;
import com.zak.careercoach.repository.JobRepository;
import com.zak.careercoach.repository.ResumeRepository;
import com.zak.careercoach.security.CurrentUser;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AiReviewService {

    private static final ObjectMapper MAPPER = new ObjectMapper();

    private final AiReviewRepository reviews;
    private final JobRepository jobs;
    private final ResumeRepository resumes;
    private final GeminiClient gemini;
    private final CurrentUser currentUser;

    public List<AiReviewDto.Response> mine() {
        return reviews.findByCandidateId(currentUser.get().getId()).stream()
            .map(AiReviewDto.Response::from).toList();
    }

    @Transactional
    public AiReviewDto.Response request(AiReviewDto.CreateRequest req) {
        User me = currentUser.get();
        Resume r = resumes.findById(req.resumeId())
            .orElseThrow(() -> AppException.notFound("CV"));
        if (!r.getOwner().getId().equals(me.getId())) {
            throw AppException.forbidden("Il CV non e' tuo");
        }
        Job j = jobs.findById(req.jobId())
            .orElseThrow(() -> AppException.notFound("Offerta"));

        String system = """
            Sei un coach di carriera esperto. Analizza il CV rispetto all'offerta di lavoro.
            Rispondi SOLO con JSON valido, senza testo extra ne' markdown:
            {
              "score": <0-100>,
              "strengths": "punti di forza del candidato per questa offerta",
              "gaps": "competenze mancanti o gap da colmare",
              "suggestions": "3-5 azioni concrete da suggerire"
            }
            """;

        String user = """
            === OFFERTA ===
            %s
            Descrizione: %s

            === CV ===
            Sommario: %s
            Skills: %s
            Esperienza: %s
            Formazione: %s
            """.formatted(
                j.getTitle(), j.getDescription(),
                safe(r.getSummary()), safe(r.getSkillsText()),
                safe(r.getExperienceText()), safe(r.getEducationText()));

        String raw = gemini.complete(system, user);
        JsonNode node = parse(raw);

        AiReview ar = new AiReview();
        ar.setCandidate(me);
        ar.setJob(j);
        ar.setResume(r);
        ar.setScore(clampScore(node.path("score").asInt(0)));
        ar.setStrengths(asString(node.path("strengths")));
        ar.setGaps(asString(node.path("gaps")));
        ar.setSuggestions(asString(node.path("suggestions")));
        ar.setModelUsed(gemini.model());
        return AiReviewDto.Response.from(reviews.save(ar));
    }

    private int clampScore(int s) {
        return Math.max(0, Math.min(100, s));
    }

    // Gemini puo' rispondere con stringa singola O array di righe. Gestiamo entrambi.
    private String asString(JsonNode n) {
        if (n == null || n.isMissingNode() || n.isNull()) return "";
        if (n.isArray()) {
            StringBuilder sb = new StringBuilder();
            for (JsonNode item : n) {
                if (sb.length() > 0) sb.append("\n");
                sb.append("- ").append(item.asText());
            }
            return sb.toString();
        }
        return n.asText("");
    }

    private JsonNode parse(String raw) {
        try {
            String cleaned = stripFences(raw);
            return MAPPER.readTree(cleaned);
        } catch (Exception e) {
            throw new AppException(
                org.springframework.http.HttpStatus.BAD_GATEWAY,
                "L'AI ha restituito una risposta non leggibile");
        }
    }

    private String stripFences(String s) {
        String t = s.strip();
        if (t.startsWith("```")) {
            int nl = t.indexOf('\n');
            if (nl >= 0) t = t.substring(nl + 1);
            if (t.endsWith("```")) t = t.substring(0, t.length() - 3);
        }
        return t.strip();
    }

    private String safe(String s) {
        return s == null ? "(non specificato)" : s;
    }
}
