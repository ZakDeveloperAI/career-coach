package com.zak.careercoach.controller;

import com.zak.careercoach.dto.CoverLetterDto;
import com.zak.careercoach.service.CoverLetterService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/cover-letters")
@PreAuthorize("hasAnyRole('CANDIDATE','ADMIN')")
@RequiredArgsConstructor
public class CoverLetterController {

    private final CoverLetterService service;

    @GetMapping
    public List<CoverLetterDto.Response> mine() {
        return service.mine();
    }

    @GetMapping("/{id}")
    public CoverLetterDto.Response byId(@PathVariable Long id) {
        return service.byId(id);
    }

    @PostMapping
    public CoverLetterDto.Response create(@Valid @RequestBody CoverLetterDto.CreateRequest req) {
        return service.create(req);
    }

    @PatchMapping("/{id}")
    public CoverLetterDto.Response update(@PathVariable Long id, @Valid @RequestBody CoverLetterDto.UpdateRequest req) {
        return service.update(id, req);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/generate")
    public CoverLetterDto.Response generate(@Valid @RequestBody CoverLetterDto.GenerateRequest req) {
        return service.generate(req);
    }
}
