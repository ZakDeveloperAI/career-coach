package com.zak.careercoach.service;

import com.zak.careercoach.dto.JobDto;
import com.zak.careercoach.entity.*;
import com.zak.careercoach.entity.enums.ContractType;
import com.zak.careercoach.entity.enums.JobStatus;
import com.zak.careercoach.entity.enums.Role;
import com.zak.careercoach.exception.AppException;
import com.zak.careercoach.repository.CategoryRepository;
import com.zak.careercoach.repository.CompanyRepository;
import com.zak.careercoach.repository.JobRepository;
import com.zak.careercoach.repository.SkillRepository;
import com.zak.careercoach.security.CurrentUser;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class JobService {

    private final JobRepository jobs;
    private final CompanyRepository companies;
    private final CategoryRepository categories;
    private final SkillRepository skills;
    private final CurrentUser currentUser;

    public Page<JobDto.Response> search(String q, String location, Boolean remote,
                                        Integer minSalary, List<ContractType> contractTypes,
                                        Long categoryId, List<String> requiredSkills,
                                        Pageable pageable) {

        Specification<Job> spec = JobSpecifications.statusEquals(JobStatus.OPEN);
        spec = and(spec, JobSpecifications.titleLike(q));
        spec = and(spec, JobSpecifications.locationLike(location));
        spec = and(spec, JobSpecifications.isRemote(remote));
        spec = and(spec, JobSpecifications.minSalaryAtLeast(minSalary));
        spec = and(spec, JobSpecifications.contractTypeIn(contractTypes));
        spec = and(spec, JobSpecifications.categoryEquals(categoryId));
        spec = and(spec, JobSpecifications.hasAnySkill(requiredSkills));
        return jobs.findAll(spec, pageable).map(JobDto.Response::from);
    }

    private static Specification<Job> and(Specification<Job> base, Specification<Job> other) {
        return other == null ? base : base.and(other);
    }

    public JobDto.Response byId(Long id) {
        return JobDto.Response.from(load(id));
    }

    @Transactional
    public JobDto.Response create(JobDto.CreateRequest req) {
        User me = currentUser.get();
        if (me.getRole() != Role.RECRUITER && me.getRole() != Role.ADMIN) {
            throw AppException.forbidden("Solo recruiter o admin");
        }
        Company company = companies.findById(req.companyId())
            .orElseThrow(() -> AppException.notFound("Azienda"));
        if (me.getRole() != Role.ADMIN && !company.getOwner().getId().equals(me.getId())) {
            throw AppException.forbidden("Non sei il proprietario dell'azienda");
        }

        Job j = new Job();
        j.setTitle(req.title());
        j.setDescription(req.description());
        j.setSalaryMin(req.salaryMin());
        j.setSalaryMax(req.salaryMax());
        j.setCurrency(req.currency() != null ? req.currency() : "EUR");
        j.setContractType(req.contractType());
        j.setRemote(req.remote());
        j.setLocation(req.location());
        j.setCompany(company);
        if (req.categoryId() != null) {
            j.setCategory(categories.findById(req.categoryId())
                .orElseThrow(() -> AppException.notFound("Categoria")));
        }
        j.setSkills(resolveSkills(req.skills()));
        return JobDto.Response.from(jobs.save(j));
    }

    @Transactional
    public JobDto.Response update(Long id, JobDto.UpdateRequest req) {
        Job j = loadOwned(id);
        if (req.title() != null) j.setTitle(req.title());
        if (req.description() != null) j.setDescription(req.description());
        if (req.salaryMin() != null) j.setSalaryMin(req.salaryMin());
        if (req.salaryMax() != null) j.setSalaryMax(req.salaryMax());
        if (req.contractType() != null) j.setContractType(req.contractType());
        if (req.remote() != null) j.setRemote(req.remote());
        if (req.location() != null) j.setLocation(req.location());
        if (req.status() != null) j.setStatus(req.status());
        if (req.categoryId() != null) {
            j.setCategory(categories.findById(req.categoryId())
                .orElseThrow(() -> AppException.notFound("Categoria")));
        }
        if (req.skills() != null) j.setSkills(resolveSkills(req.skills()));
        return JobDto.Response.from(j);
    }

    @Transactional
    public void delete(Long id) {
        Job j = loadOwned(id);
        jobs.delete(j);
    }

    private Set<Skill> resolveSkills(List<String> names) {
        if (names == null || names.isEmpty()) return new HashSet<>();
        Set<Skill> out = new HashSet<>(skills.findByNameIn(names));
        // crea le skill nuove al volo
        for (String name : names) {
            if (out.stream().noneMatch(s -> s.getName().equalsIgnoreCase(name))) {
                Skill s = new Skill();
                s.setName(name);
                out.add(skills.save(s));
            }
        }
        return out;
    }

    private Job load(Long id) {
        return jobs.findById(id).orElseThrow(() -> AppException.notFound("Offerta"));
    }

    private Job loadOwned(Long id) {
        Job j = load(id);
        User me = currentUser.get();
        if (me.getRole() != Role.ADMIN && !j.getCompany().getOwner().getId().equals(me.getId())) {
            throw AppException.forbidden("Non sei il proprietario di questa offerta");
        }
        return j;
    }
}
