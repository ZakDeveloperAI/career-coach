package com.zak.careercoach.repository;

import com.zak.careercoach.entity.Application;
import com.zak.careercoach.entity.enums.ApplicationStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface ApplicationRepository extends JpaRepository<Application, Long> {

    Page<Application> findByCandidateId(Long candidateId, Pageable pageable);

    Page<Application> findByJobId(Long jobId, Pageable pageable);

    List<Application> findByCandidateIdAndStatus(Long candidateId, ApplicationStatus status);

    Optional<Application> findByCandidateIdAndJobId(Long candidateId, Long jobId);

    // tutte le candidature alle offerte di una specifica company (per recruiter)
    @Query("""
        SELECT a FROM Application a
        WHERE a.job.company.id = :companyId
    """)
    Page<Application> findByCompanyId(Long companyId, Pageable pageable);
}
