package com.zak.careercoach.repository;

import com.zak.careercoach.entity.Job;
import com.zak.careercoach.entity.enums.JobStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;
import java.util.Optional;

public interface JobRepository extends JpaRepository<Job, Long>, JpaSpecificationExecutor<Job> {

    Page<Job> findByStatus(JobStatus status, Pageable pageable);

    List<Job> findByCompanyId(Long companyId);

    Optional<Job> findByExternalSourceAndExternalId(String source, String externalId);
}
