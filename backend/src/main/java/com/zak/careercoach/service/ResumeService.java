package com.zak.careercoach.service;

import com.zak.careercoach.dto.ResumeDto;
import com.zak.careercoach.entity.Resume;
import com.zak.careercoach.entity.User;
import com.zak.careercoach.exception.AppException;
import com.zak.careercoach.repository.ResumeRepository;
import com.zak.careercoach.security.CurrentUser;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ResumeService {

    private final ResumeRepository resumes;
    private final CurrentUser currentUser;

    public List<ResumeDto.Response> mine() {
        return resumes.findByOwnerId(currentUser.get().getId()).stream()
            .map(ResumeDto.Response::from).toList();
    }

    public ResumeDto.Response byId(Long id) {
        return ResumeDto.Response.from(loadOwned(id));
    }

    @Transactional
    public ResumeDto.Response create(ResumeDto.CreateRequest req) {
        User me = currentUser.get();
        Resume r = new Resume();
        r.setOwner(me);
        r.setTitle(req.title());
        r.setSummary(req.summary());
        r.setSkillsText(req.skillsText());
        r.setExperienceText(req.experienceText());
        r.setEducationText(req.educationText());
        return ResumeDto.Response.from(resumes.save(r));
    }

    @Transactional
    public ResumeDto.Response update(Long id, ResumeDto.UpdateRequest req) {
        Resume r = loadOwned(id);
        if (req.title() != null) r.setTitle(req.title());
        if (req.summary() != null) r.setSummary(req.summary());
        if (req.skillsText() != null) r.setSkillsText(req.skillsText());
        if (req.experienceText() != null) r.setExperienceText(req.experienceText());
        if (req.educationText() != null) r.setEducationText(req.educationText());
        return ResumeDto.Response.from(r);
    }

    @Transactional
    public void delete(Long id) {
        resumes.delete(loadOwned(id));
    }

    Resume loadOwned(Long id) {
        Resume r = resumes.findById(id).orElseThrow(() -> AppException.notFound("CV"));
        if (!r.getOwner().getId().equals(currentUser.get().getId())) {
            throw AppException.forbidden("Non sei il proprietario di questo CV");
        }
        return r;
    }
}
