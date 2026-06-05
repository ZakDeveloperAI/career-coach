package com.zak.careercoach.service;

import com.zak.careercoach.entity.*;
import com.zak.careercoach.entity.enums.ContractType;
import com.zak.careercoach.entity.enums.JobStatus;
import com.zak.careercoach.entity.enums.Role;
import com.zak.careercoach.exception.AppException;
import com.zak.careercoach.external.AdzunaClient;
import com.zak.careercoach.external.ExternalJob;
import com.zak.careercoach.external.RemoteOkClient;
import com.zak.careercoach.repository.CompanyRepository;
import com.zak.careercoach.repository.JobRepository;
import com.zak.careercoach.repository.SkillRepository;
import com.zak.careercoach.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Slf4j
public class JobImportService {

    private final AdzunaClient adzuna;
    private final RemoteOkClient remoteOk;
    private final JobRepository jobs;
    private final CompanyRepository companies;
    private final SkillRepository skills;
    private final UserRepository users;

    @Transactional
    public int importFromAdzuna(String what, String where, int howMany) {
        List<ExternalJob> raw = adzuna.search(what, where, howMany);
        return persist(raw, "ADZUNA");
    }

    @Transactional
    public int importFromRemoteOk(String tag) {
        List<ExternalJob> raw = remoteOk.fetch(tag);
        return persist(raw, "REMOTEOK");
    }

    private int persist(List<ExternalJob> raw, String source) {
        User admin = users.findByRole(Role.ADMIN).stream().findFirst()
            .orElseThrow(() -> AppException.badRequest("Nessun admin disponibile per l'import"));
        int saved = 0;
        for (ExternalJob ej : raw) {
            if (ej.externalId == null) continue;
            if (jobs.findByExternalSourceAndExternalId(source, ej.externalId).isPresent()) continue;

            Company company = companies.findByName(ej.companyName)
                .orElseGet(() -> {
                    Company c = new Company();
                    c.setName(ej.companyName);
                    c.setOwner(admin);
                    c.setDescription("Importato da " + source);
                    return companies.save(c);
                });

            Job j = new Job();
            j.setTitle(ej.title);
            j.setDescription(ej.description);
            j.setSalaryMin(ej.salaryMin);
            j.setSalaryMax(ej.salaryMax);
            j.setCurrency("EUR");
            try {
                j.setContractType(ContractType.valueOf(ej.contractType));
            } catch (Exception ignored) {
                j.setContractType(ContractType.FULL_TIME);
            }
            j.setRemote(ej.remote);
            j.setLocation(ej.location);
            j.setCompany(company);
            j.setStatus(JobStatus.OPEN);
            j.setExternalSource(source);
            j.setExternalId(ej.externalId);
            j.setSkills(resolveSkills(ej.skills));
            jobs.save(j);
            saved++;
        }
        log.info("Import {}: {} nuove offerte", source, saved);
        return saved;
    }

    private Set<Skill> resolveSkills(List<String> names) {
        if (names == null || names.isEmpty()) return new HashSet<>();
        Set<Skill> out = new HashSet<>();
        for (String name : names) {
            String trimmed = name.trim();
            if (trimmed.isEmpty()) continue;
            Skill s = skills.findByName(trimmed).orElseGet(() -> {
                Skill n = new Skill();
                n.setName(trimmed);
                return skills.save(n);
            });
            out.add(s);
        }
        return out;
    }
}
