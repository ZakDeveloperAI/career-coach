package com.zak.careercoach.controller;

import com.zak.careercoach.dto.AiReviewDto;
import com.zak.careercoach.service.AiReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/ai-reviews")
@PreAuthorize("hasAnyRole('CANDIDATE','ADMIN')")
@RequiredArgsConstructor
public class AiReviewController {

    private final AiReviewService service;

    @GetMapping("/mine")
    public List<AiReviewDto.Response> mine() {
        return service.mine();
    }

    @PostMapping
    public AiReviewDto.Response request(@Valid @RequestBody AiReviewDto.CreateRequest req) {
        return service.request(req);
    }
}
