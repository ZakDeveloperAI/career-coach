package com.zak.careercoach.service;

import com.zak.careercoach.dto.CoverLetterDto;
import com.zak.careercoach.entity.CoverLetter;
import com.zak.careercoach.entity.Job;
import com.zak.careercoach.entity.Resume;
import com.zak.careercoach.entity.User;
import com.zak.careercoach.entity.enums.Tone;
import com.zak.careercoach.exception.AppException;
import com.zak.careercoach.external.GeminiClient;
import com.zak.careercoach.repository.CoverLetterRepository;
import com.zak.careercoach.repository.JobRepository;
import com.zak.careercoach.repository.ResumeRepository;
import com.zak.careercoach.security.CurrentUser;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CoverLetterService {

    private final CoverLetterRepository coverLetters;
    private final ResumeRepository resumes;
    private final JobRepository jobs;
    private final GeminiClient gemini;
    private final CurrentUser currentUser;

    public List<CoverLetterDto.Response> mine() {
        return coverLetters.findByOwnerId(currentUser.get().getId()).stream()
            .map(CoverLetterDto.Response::from).toList();
    }

    public CoverLetterDto.Response byId(Long id) {
        return CoverLetterDto.Response.from(loadOwned(id));
    }

    @Transactional
    public CoverLetterDto.Response create(CoverLetterDto.CreateRequest req) {
        User me = currentUser.get();
        CoverLetter cl = new CoverLetter();
        cl.setOwner(me);
        cl.setTitle(req.title());
        cl.setBody(req.body());
        cl.setTone(req.tone());
        if (req.targetJobId() != null) {
            cl.setTargetJob(jobs.findById(req.targetJobId())
                .orElseThrow(() -> AppException.notFound("Offerta")));
        }
        return CoverLetterDto.Response.from(coverLetters.save(cl));
    }

    @Transactional
    public CoverLetterDto.Response update(Long id, CoverLetterDto.UpdateRequest req) {
        CoverLetter cl = loadOwned(id);
        if (req.title() != null) cl.setTitle(req.title());
        if (req.body() != null) cl.setBody(req.body());
        if (req.tone() != null) cl.setTone(req.tone());
        if (req.targetJobId() != null) {
            cl.setTargetJob(jobs.findById(req.targetJobId())
                .orElseThrow(() -> AppException.notFound("Offerta")));
        }
        return CoverLetterDto.Response.from(cl);
    }

    @Transactional
    public void delete(Long id) {
        coverLetters.delete(loadOwned(id));
    }

    @Transactional
    public CoverLetterDto.Response generate(CoverLetterDto.GenerateRequest req) {
        User me = currentUser.get();
        Resume r = resumes.findById(req.resumeId())
            .orElseThrow(() -> AppException.notFound("CV"));
        if (!r.getOwner().getId().equals(me.getId())) {
            throw AppException.forbidden("Il CV non e' tuo");
        }
        Job j = jobs.findById(req.jobId())
            .orElseThrow(() -> AppException.notFound("Offerta"));
        Tone tone = req.tone() != null ? req.tone() : Tone.FRIENDLY;

        String system = "Sei un coach di carriera. Scrivi una cover letter " +
            "personalizzata, in italiano, basandoti sul CV del candidato e sull'offerta. " +
            "Tono: " + tone.name().toLowerCase() + ". Massimo 250 parole. " +
            "Restituisci solo il testo della lettera, senza intestazioni o firme.";

        String user = """
            === OFFERTA ===
            Titolo: %s
            Azienda: %s
            Descrizione: %s

            === CV ===
            Sommario: %s
            Skills: %s
            Esperienza: %s
            Formazione: %s
            """.formatted(
                j.getTitle(), j.getCompany().getName(), j.getDescription(),
                safe(r.getSummary()), safe(r.getSkillsText()),
                safe(r.getExperienceText()), safe(r.getEducationText()));

        String generated = gemini.complete(system, user);

        CoverLetter cl = new CoverLetter();
        cl.setOwner(me);
        cl.setTitle("Cover letter per " + j.getTitle() + " - " + j.getCompany().getName());
        cl.setBody(generated);
        cl.setTone(tone);
        cl.setTargetJob(j);
        cl.setGeneratedByAi(true);
        return CoverLetterDto.Response.from(coverLetters.save(cl));
    }

    private CoverLetter loadOwned(Long id) {
        CoverLetter cl = coverLetters.findById(id)
            .orElseThrow(() -> AppException.notFound("Cover letter"));
        if (!cl.getOwner().getId().equals(currentUser.get().getId())) {
            throw AppException.forbidden("Non sei il proprietario di questa cover letter");
        }
        return cl;
    }

    private String safe(String s) {
        return s == null ? "(non specificato)" : s;
    }
}
