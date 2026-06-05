package com.zak.careercoach.dto;

import com.zak.careercoach.entity.Company;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

public class CompanyDto {

    public record Response(
        Long id, String name, String description, String website,
        String logoUrl, String location, Long ownerId, LocalDateTime createdAt
    ) {
        public static Response from(Company c) {
            return new Response(c.getId(), c.getName(), c.getDescription(), c.getWebsite(),
                c.getLogoUrl(), c.getLocation(), c.getOwner().getId(), c.getCreatedAt());
        }
    }

    public record CreateRequest(
        @NotBlank @Size(max = 150) String name,
        @Size(max = 2000) String description,
        @Size(max = 255) String website,
        @Size(max = 500) String logoUrl,
        @Size(max = 200) String location
    ) {}

    public record UpdateRequest(
        @Size(max = 2000) String description,
        @Size(max = 255) String website,
        @Size(max = 500) String logoUrl,
        @Size(max = 200) String location
    ) {}
}
