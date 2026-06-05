package com.zak.careercoach.dto;

import com.zak.careercoach.entity.Resume;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

public class ResumeDto {

    public record Response(
        Long id, Long ownerId, String title, String summary,
        String skillsText, String experienceText, String educationText,
        LocalDateTime createdAt, LocalDateTime updatedAt
    ) {
        public static Response from(Resume r) {
            return new Response(r.getId(), r.getOwner().getId(), r.getTitle(),
                r.getSummary(), r.getSkillsText(), r.getExperienceText(),
                r.getEducationText(), r.getCreatedAt(), r.getUpdatedAt());
        }
    }

    public record CreateRequest(
        @NotBlank @Size(max = 200) String title,
        @Size(max = 5000) String summary,
        @Size(max = 5000) String skillsText,
        @Size(max = 10000) String experienceText,
        @Size(max = 5000) String educationText
    ) {}

    public record UpdateRequest(
        @Size(max = 200) String title,
        @Size(max = 5000) String summary,
        @Size(max = 5000) String skillsText,
        @Size(max = 10000) String experienceText,
        @Size(max = 5000) String educationText
    ) {}
}
