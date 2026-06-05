package com.zak.careercoach.dto;

import com.zak.careercoach.entity.AiReview;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

public class AiReviewDto {

    public record Response(
        Long id, Long candidateId, Long jobId, String jobTitle, Long resumeId,
        Integer score, String strengths, String gaps, String suggestions,
        String modelUsed, LocalDateTime createdAt
    ) {
        public static Response from(AiReview r) {
            return new Response(r.getId(), r.getCandidate().getId(),
                r.getJob().getId(), r.getJob().getTitle(), r.getResume().getId(),
                r.getScore(), r.getStrengths(), r.getGaps(), r.getSuggestions(),
                r.getModelUsed(), r.getCreatedAt());
        }
    }

    public record CreateRequest(
        @NotNull Long jobId,
        @NotNull Long resumeId
    ) {}
}
