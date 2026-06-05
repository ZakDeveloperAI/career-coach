package com.zak.careercoach.repository;

import com.zak.careercoach.entity.CoverLetter;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CoverLetterRepository extends JpaRepository<CoverLetter, Long> {

    List<CoverLetter> findByOwnerId(Long ownerId);

    List<CoverLetter> findByTargetJobId(Long jobId);
}
