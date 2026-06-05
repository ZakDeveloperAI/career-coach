package com.zak.careercoach.repository;

import com.zak.careercoach.entity.SavedJob;
import com.zak.careercoach.entity.SavedJobId;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SavedJobRepository extends JpaRepository<SavedJob, SavedJobId> {

    List<SavedJob> findByCandidateId(Long candidateId);

    boolean existsByCandidateIdAndJobId(Long candidateId, Long jobId);

    void deleteByCandidateIdAndJobId(Long candidateId, Long jobId);
}
