package com.zak.careercoach.controller;

import com.zak.careercoach.repository.ApplicationRepository;
import com.zak.careercoach.repository.JobRepository;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/stats")
@RequiredArgsConstructor
public class StatsController {

    private final EntityManager em;
    private final JobRepository jobs;
    private final ApplicationRepository applications;

    @GetMapping("/jobs-by-category")
    @SuppressWarnings("unchecked")
    public List<Map<String, Object>> jobsByCategory() {
        return em.createQuery("""
                SELECT new map(
                    c.name as category,
                    COUNT(j) as jobCount
                )
                FROM Job j LEFT JOIN j.category c
                WHERE j.status = com.zak.careercoach.entity.enums.JobStatus.OPEN
                GROUP BY c.name
                ORDER BY COUNT(j) DESC
            """).getResultList();
    }

    @GetMapping("/jobs-by-contract")
    @SuppressWarnings("unchecked")
    public List<Map<String, Object>> jobsByContract() {
        return em.createQuery("""
                SELECT new map(
                    j.contractType as contractType,
                    COUNT(j) as jobCount
                )
                FROM Job j
                WHERE j.status = com.zak.careercoach.entity.enums.JobStatus.OPEN
                GROUP BY j.contractType
            """).getResultList();
    }

    @GetMapping("/avg-salary-by-category")
    @SuppressWarnings("unchecked")
    public List<Map<String, Object>> avgSalaryByCategory() {
        return em.createQuery("""
                SELECT new map(
                    c.name as category,
                    AVG(COALESCE(j.salaryMax, j.salaryMin)) as avgSalary
                )
                FROM Job j JOIN j.category c
                WHERE j.status = com.zak.careercoach.entity.enums.JobStatus.OPEN
                  AND (j.salaryMin IS NOT NULL OR j.salaryMax IS NOT NULL)
                GROUP BY c.name
                ORDER BY AVG(COALESCE(j.salaryMax, j.salaryMin)) DESC
            """).getResultList();
    }

    @GetMapping("/top-companies")
    @SuppressWarnings("unchecked")
    public List<Map<String, Object>> topCompanies() {
        return em.createQuery("""
                SELECT new map(
                    co.name as company,
                    COUNT(DISTINCT j) as jobCount,
                    COUNT(DISTINCT a) as applicationCount
                )
                FROM Job j
                  JOIN j.company co
                  LEFT JOIN Application a ON a.job = j
                GROUP BY co.name
                ORDER BY COUNT(DISTINCT a) DESC, COUNT(DISTINCT j) DESC
            """).setMaxResults(10).getResultList();
    }

    @GetMapping("/totals")
    public Map<String, Long> totals() {
        return Map.of(
            "jobs", jobs.count(),
            "applications", applications.count()
        );
    }
}
