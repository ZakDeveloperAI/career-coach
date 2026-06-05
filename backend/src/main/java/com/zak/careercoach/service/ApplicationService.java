package com.zak.careercoach.service;

import com.zak.careercoach.dto.ApplicationDto;
import com.zak.careercoach.entity.*;
import com.zak.careercoach.entity.enums.Role;
import com.zak.careercoach.exception.AppException;
import com.zak.careercoach.repository.*;
import com.zak.careercoach.security.CurrentUser;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ApplicationService {

    private final ApplicationRepository applications;
    private final JobRepository jobs;
    private final ResumeRepository resumes;
    private final CoverLetterRepository coverLetters;
    private final CompanyRepository companies;
    private final CurrentUser currentUser;

    public Page<ApplicationDto.Response> mine(Pageable pageable) {
        User me = currentUser.get();
        return applications.findByCandidateId(me.getId(), pageable).map(ApplicationDto.Response::from);
    }

    public Page<ApplicationDto.Response> forCompany(Long companyId, Pageable pageable) {
        User me = currentUser.get();
        Company c = companies.findById(companyId)
            .orElseThrow(() -> AppException.notFound("Azienda"));
        if (me.getRole() != Role.ADMIN && !c.getOwner().getId().equals(me.getId())) {
            throw AppException.forbidden("Non sei il proprietario di questa azienda");
        }
        return applications.findByCompanyId(companyId, pageable).map(ApplicationDto.Response::from);
    }

    public Page<ApplicationDto.Response> forJob(Long jobId, Pageable pageable) {
        User me = currentUser.get();
        Job j = jobs.findById(jobId).orElseThrow(() -> AppException.notFound("Offerta"));
        if (me.getRole() != Role.ADMIN && !j.getCompany().getOwner().getId().equals(me.getId())) {
            throw AppException.forbidden("Non sei il proprietario di questa offerta");
        }
        return applications.findByJobId(jobId, pageable).map(ApplicationDto.Response::from);
    }

    @Transactional
    public ApplicationDto.Response apply(ApplicationDto.CreateRequest req) {
        User me = currentUser.get();
        if (me.getRole() != Role.CANDIDATE) {
            throw AppException.forbidden("Solo i candidati possono candidarsi");
        }
        if (applications.findByCandidateIdAndJobId(me.getId(), req.jobId()).isPresent()) {
            throw AppException.conflict("Ti sei gia' candidato a questa offerta");
        }
        Job job = jobs.findById(req.jobId()).orElseThrow(() -> AppException.notFound("Offerta"));
        Resume resume = resumes.findById(req.resumeId()).orElseThrow(() -> AppException.notFound("CV"));
        if (!resume.getOwner().getId().equals(me.getId())) {
            throw AppException.forbidden("Il CV non e' tuo");
        }
        Application a = new Application();
        a.setCandidate(me);
        a.setJob(job);
        a.setResume(resume);
        if (req.coverLetterId() != null) {
            CoverLetter cl = coverLetters.findById(req.coverLetterId())
                .orElseThrow(() -> AppException.notFound("Cover letter"));
            if (!cl.getOwner().getId().equals(me.getId())) {
                throw AppException.forbidden("La cover letter non e' tua");
            }
            a.setCoverLetter(cl);
        }
        return ApplicationDto.Response.from(applications.save(a));
    }

    @Transactional
    public ApplicationDto.Response updateStatus(Long id, ApplicationDto.StatusUpdate req) {
        User me = currentUser.get();
        Application a = applications.findById(id)
            .orElseThrow(() -> AppException.notFound("Candidatura"));
        if (me.getRole() != Role.ADMIN && !a.getJob().getCompany().getOwner().getId().equals(me.getId())) {
            throw AppException.forbidden("Non sei il proprietario di questa offerta");
        }
        a.setStatus(req.status());
        if (req.recruiterNotes() != null) a.setRecruiterNotes(req.recruiterNotes());
        return ApplicationDto.Response.from(a);
    }

    @Transactional
    public void withdraw(Long id) {
        User me = currentUser.get();
        Application a = applications.findById(id)
            .orElseThrow(() -> AppException.notFound("Candidatura"));
        if (!a.getCandidate().getId().equals(me.getId())) {
            throw AppException.forbidden("La candidatura non e' tua");
        }
        applications.delete(a);
    }
}
