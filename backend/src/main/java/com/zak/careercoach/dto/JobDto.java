package com.zak.careercoach.dto;

import com.zak.careercoach.entity.Job;
import com.zak.careercoach.entity.enums.ContractType;
import com.zak.careercoach.entity.enums.JobStatus;
import jakarta.validation.constraints.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

public class JobDto {

    public record Response(
        Long id,
        String title,
        String description,
        Integer salaryMin,
        Integer salaryMax,
        String currency,
        ContractType contractType,
        boolean remote,
        String location,
        Long companyId,
        String companyName,
        Long categoryId,
        String categoryName,
        LocalDateTime postedAt,
        JobStatus status,
        Set<String> skills,
        String externalSource
    ) {
        public static Response from(Job j) {
            return new Response(
                j.getId(), j.getTitle(), j.getDescription(),
                j.getSalaryMin(), j.getSalaryMax(), j.getCurrency(),
                j.getContractType(), j.isRemote(), j.getLocation(),
                j.getCompany().getId(), j.getCompany().getName(),
                j.getCategory() != null ? j.getCategory().getId() : null,
                j.getCategory() != null ? j.getCategory().getName() : null,
                j.getPostedAt(), j.getStatus(),
                j.getSkills().stream().map(s -> s.getName()).collect(Collectors.toSet()),
                j.getExternalSource()
            );
        }
    }

    public record CreateRequest(
        @NotBlank @Size(max = 200) String title,
        @NotBlank @Size(max = 5000) String description,
        @PositiveOrZero Integer salaryMin,
        @PositiveOrZero Integer salaryMax,
        @Size(min = 3, max = 3) String currency,
        @NotNull ContractType contractType,
        boolean remote,
        @Size(max = 200) String location,
        @NotNull Long companyId,
        Long categoryId,
        List<String> skills
    ) {}

    public record UpdateRequest(
        @Size(max = 200) String title,
        @Size(max = 5000) String description,
        Integer salaryMin,
        Integer salaryMax,
        ContractType contractType,
        Boolean remote,
        @Size(max = 200) String location,
        Long categoryId,
        JobStatus status,
        List<String> skills
    ) {}
}
