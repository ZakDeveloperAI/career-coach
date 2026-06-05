package com.zak.careercoach.controller;

import com.zak.careercoach.dto.ResumeDto;
import com.zak.careercoach.service.ResumeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/resumes")
@PreAuthorize("hasAnyRole('CANDIDATE','ADMIN')")
@RequiredArgsConstructor
public class ResumeController {

    private final ResumeService service;

    @GetMapping
    public List<ResumeDto.Response> mine() {
        return service.mine();
    }

    @GetMapping("/{id}")
    public ResumeDto.Response byId(@PathVariable Long id) {
        return service.byId(id);
    }

    @PostMapping
    public ResumeDto.Response create(@Valid @RequestBody ResumeDto.CreateRequest req) {
        return service.create(req);
    }

    @PatchMapping("/{id}")
    public ResumeDto.Response update(@PathVariable Long id, @Valid @RequestBody ResumeDto.UpdateRequest req) {
        return service.update(id, req);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
