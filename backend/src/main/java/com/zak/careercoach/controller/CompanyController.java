package com.zak.careercoach.controller;

import com.zak.careercoach.dto.CompanyDto;
import com.zak.careercoach.service.CompanyService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/companies")
@RequiredArgsConstructor
public class CompanyController {

    private final CompanyService service;

    @GetMapping
    public List<CompanyDto.Response> all() {
        return service.all();
    }

    @GetMapping("/{id}")
    public CompanyDto.Response byId(@PathVariable Long id) {
        return service.byId(id);
    }

    @GetMapping("/mine")
    @PreAuthorize("hasAnyRole('RECRUITER','ADMIN')")
    public List<CompanyDto.Response> mine() {
        return service.mine();
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('RECRUITER','ADMIN')")
    public CompanyDto.Response create(@Valid @RequestBody CompanyDto.CreateRequest req) {
        return service.create(req);
    }

    @PatchMapping("/{id}")
    @PreAuthorize("hasAnyRole('RECRUITER','ADMIN')")
    public CompanyDto.Response update(@PathVariable Long id, @Valid @RequestBody CompanyDto.UpdateRequest req) {
        return service.update(id, req);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('RECRUITER','ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
