package com.zak.careercoach.dto;

import com.zak.careercoach.entity.Application;
import com.zak.careercoach.entity.enums.ApplicationStatus;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

public class ApplicationDto {

    public record Response(
        Long id, Long candidateId, String candidateName,
        Long jobId, String jobTitle, String companyName,
        Long resumeId, Long coverLetterId,
        ApplicationStatus status, LocalDateTime appliedAt, String recruiterNotes
    ) {
        public static Response from(Application a) {
            return new Response(
                a.getId(),
                a.getCandidate().getId(),
                a.getCandidate().getName() + " " + a.getCandidate().getSurname(),
                a.getJob().getId(), a.getJob().getTitle(),
                a.getJob().getCompany().getName(),
                a.getResume() != null ? a.getResume().getId() : null,
                a.getCoverLetter() != null ? a.getCoverLetter().getId() : null,
                a.getStatus(), a.getAppliedAt(), a.getRecruiterNotes());
        }
    }

    public record CreateRequest(
        @NotNull Long jobId,
        @NotNull Long resumeId,
        Long coverLetterId
    ) {}

    public record StatusUpdate(
        @NotNull ApplicationStatus status,
        @Size(max = 1000) String recruiterNotes
    ) {}
}
