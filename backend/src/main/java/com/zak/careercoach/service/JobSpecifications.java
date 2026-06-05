package com.zak.careercoach.service;

import com.zak.careercoach.entity.Job;
import com.zak.careercoach.entity.Skill;
import com.zak.careercoach.entity.enums.ContractType;
import com.zak.careercoach.entity.enums.JobStatus;
import jakarta.persistence.criteria.Join;
import org.springframework.data.jpa.domain.Specification;

import java.util.List;

public class JobSpecifications {

    private JobSpecifications() {}

    public static Specification<Job> titleLike(String q) {
        if (q == null || q.isBlank()) return null;
        return (root, cq, cb) -> cb.like(cb.lower(root.get("title")), "%" + q.toLowerCase() + "%");
    }

    public static Specification<Job> locationLike(String location) {
        if (location == null || location.isBlank()) return null;
        return (root, cq, cb) -> cb.like(cb.lower(root.get("location")), "%" + location.toLowerCase() + "%");
    }

    public static Specification<Job> isRemote(Boolean remote) {
        if (remote == null) return null;
        return (root, cq, cb) -> cb.equal(root.get("remote"), remote);
    }

    public static Specification<Job> minSalaryAtLeast(Integer min) {
        if (min == null) return null;
        return (root, cq, cb) -> cb.greaterThanOrEqualTo(root.get("salaryMax"), min);
    }

    public static Specification<Job> contractTypeIn(List<ContractType> types) {
        if (types == null || types.isEmpty()) return null;
        return (root, cq, cb) -> root.get("contractType").in(types);
    }

    public static Specification<Job> categoryEquals(Long categoryId) {
        if (categoryId == null) return null;
        return (root, cq, cb) -> cb.equal(root.get("category").get("id"), categoryId);
    }

    public static Specification<Job> companyEquals(Long companyId) {
        if (companyId == null) return null;
        return (root, cq, cb) -> cb.equal(root.get("company").get("id"), companyId);
    }

    public static Specification<Job> statusEquals(JobStatus status) {
        if (status == null) return null;
        return (root, cq, cb) -> cb.equal(root.get("status"), status);
    }

    public static Specification<Job> hasAnySkill(List<String> skillNames) {
        if (skillNames == null || skillNames.isEmpty()) return null;
        return (root, cq, cb) -> {
            cq.distinct(true);
            Join<Job, Skill> join = root.join("skills");
            return cb.lower(join.get("name")).in(skillNames.stream().map(String::toLowerCase).toList());
        };
    }
}
