package com.zak.careercoach.dto;

import com.zak.careercoach.entity.CoverLetter;
import com.zak.careercoach.entity.enums.Tone;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

public class CoverLetterDto {

    public record Response(
        Long id, Long ownerId, String title, String body, Tone tone,
        Long targetJobId, boolean generatedByAi,
        LocalDateTime createdAt, LocalDateTime updatedAt
    ) {
        public static Response from(CoverLetter c) {
            return new Response(c.getId(), c.getOwner().getId(), c.getTitle(),
                c.getBody(), c.getTone(),
                c.getTargetJob() != null ? c.getTargetJob().getId() : null,
                c.isGeneratedByAi(), c.getCreatedAt(), c.getUpdatedAt());
        }
    }

    public record CreateRequest(
        @NotBlank @Size(max = 200) String title,
        @NotBlank @Size(max = 5000) String body,
        Tone tone,
        Long targetJobId
    ) {}

    public record UpdateRequest(
        @Size(max = 200) String title,
        @Size(max = 5000) String body,
        Tone tone,
        Long targetJobId
    ) {}

    public record GenerateRequest(
        @jakarta.validation.constraints.NotNull Long jobId,
        @jakarta.validation.constraints.NotNull Long resumeId,
        Tone tone
    ) {}
}
