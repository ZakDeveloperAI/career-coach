package com.zak.careercoach.controller;

import com.zak.careercoach.dto.JobDto;
import com.zak.careercoach.entity.enums.ContractType;
import com.zak.careercoach.service.JobService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/jobs")
@RequiredArgsConstructor
public class JobController {

    private final JobService service;

    /**
     * GET /jobs?q=&location=&remote=&minSalary=&contractTypes=FULL_TIME,CONTRACT
     *          &categoryId=&skills=java,react&page=0&size=20&sort=postedAt,desc
     */
    @GetMapping
    public Page<JobDto.Response> search(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) Boolean remote,
            @RequestParam(required = false) Integer minSalary,
            @RequestParam(required = false) List<ContractType> contractTypes,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) List<String> skills,
            @PageableDefault(size = 20, sort = "postedAt") Pageable pageable) {

        return service.search(q, location, remote, minSalary, contractTypes,
                              categoryId, skills, pageable);
    }

    @GetMapping("/{id}")
    public JobDto.Response byId(@PathVariable Long id) {
        return service.byId(id);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('RECRUITER','ADMIN')")
    public JobDto.Response create(@Valid @RequestBody JobDto.CreateRequest req) {
        return service.create(req);
    }

    @PatchMapping("/{id}")
    @PreAuthorize("hasAnyRole('RECRUITER','ADMIN')")
    public JobDto.Response update(@PathVariable Long id, @Valid @RequestBody JobDto.UpdateRequest req) {
        return service.update(id, req);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('RECRUITER','ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
