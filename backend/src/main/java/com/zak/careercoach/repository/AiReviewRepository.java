package com.zak.careercoach.repository;

import com.zak.careercoach.entity.AiReview;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AiReviewRepository extends JpaRepository<AiReview, Long> {

    List<AiReview> findByCandidateId(Long candidateId);

    Optional<AiReview> findTopByCandidateIdAndJobIdAndResumeIdOrderByCreatedAtDesc(
        Long candidateId, Long jobId, Long resumeId);
}
