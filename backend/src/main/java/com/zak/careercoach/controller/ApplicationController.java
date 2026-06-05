package com.zak.careercoach.controller;

import com.zak.careercoach.dto.ApplicationDto;
import com.zak.careercoach.service.ApplicationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/applications")
@RequiredArgsConstructor
public class ApplicationController {

    private final ApplicationService service;

    @GetMapping("/mine")
    @PreAuthorize("hasRole('CANDIDATE')")
    public Page<ApplicationDto.Response> mine(@PageableDefault(size = 20, sort = "appliedAt") Pageable p) {
        return service.mine(p);
    }

    @GetMapping("/companies/{companyId}")
    @PreAuthorize("hasAnyRole('RECRUITER','ADMIN')")
    public Page<ApplicationDto.Response> forCompany(@PathVariable Long companyId,
                                                    @PageableDefault(size = 20) Pageable p) {
        return service.forCompany(companyId, p);
    }

    @GetMapping("/jobs/{jobId}")
    @PreAuthorize("hasAnyRole('RECRUITER','ADMIN')")
    public Page<ApplicationDto.Response> forJob(@PathVariable Long jobId,
                                                @PageableDefault(size = 20) Pageable p) {
        return service.forJob(jobId, p);
    }

    @PostMapping
    @PreAuthorize("hasRole('CANDIDATE')")
    public ApplicationDto.Response apply(@Valid @RequestBody ApplicationDto.CreateRequest req) {
        return service.apply(req);
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('RECRUITER','ADMIN')")
    public ApplicationDto.Response updateStatus(@PathVariable Long id, @Valid @RequestBody ApplicationDto.StatusUpdate req) {
        return service.updateStatus(id, req);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('CANDIDATE')")
    public ResponseEntity<Void> withdraw(@PathVariable Long id) {
        service.withdraw(id);
        return ResponseEntity.noContent().build();
    }
}
