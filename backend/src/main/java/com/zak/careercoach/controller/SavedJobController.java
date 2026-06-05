package com.zak.careercoach.controller;

import com.zak.careercoach.dto.JobDto;
import com.zak.careercoach.entity.Job;
import com.zak.careercoach.entity.SavedJob;
import com.zak.careercoach.entity.SavedJobId;
import com.zak.careercoach.entity.User;
import com.zak.careercoach.exception.AppException;
import com.zak.careercoach.repository.JobRepository;
import com.zak.careercoach.repository.SavedJobRepository;
import com.zak.careercoach.security.CurrentUser;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/saved-jobs")
@PreAuthorize("hasRole('CANDIDATE')")
@RequiredArgsConstructor
public class SavedJobController {

    private final SavedJobRepository savedJobs;
    private final JobRepository jobs;
    private final CurrentUser currentUser;

    @GetMapping
    public List<JobDto.Response> mine() {
        User me = currentUser.get();
        return savedJobs.findByCandidateId(me.getId()).stream()
            .map(sj -> JobDto.Response.from(sj.getJob())).toList();
    }

    @PostMapping("/{jobId}")
    @Transactional
    public ResponseEntity<Void> save(@PathVariable Long jobId) {
        User me = currentUser.get();
        if (savedJobs.existsByCandidateIdAndJobId(me.getId(), jobId)) {
            return ResponseEntity.noContent().build();
        }
        Job j = jobs.findById(jobId).orElseThrow(() -> AppException.notFound("Offerta"));
        SavedJob sj = new SavedJob();
        sj.setCandidate(me);
        sj.setJob(j);
        sj.setId(new SavedJobId(me.getId(), j.getId()));
        savedJobs.save(sj);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{jobId}")
    @Transactional
    public ResponseEntity<Void> remove(@PathVariable Long jobId) {
        User me = currentUser.get();
        savedJobs.deleteByCandidateIdAndJobId(me.getId(), jobId);
        return ResponseEntity.noContent().build();
    }
}
