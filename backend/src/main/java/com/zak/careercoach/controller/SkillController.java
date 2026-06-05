package com.zak.careercoach.controller;

import com.zak.careercoach.entity.Skill;
import com.zak.careercoach.repository.SkillRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/skills")
@RequiredArgsConstructor
public class SkillController {

    private final SkillRepository skills;

    @GetMapping
    public List<Skill> all() {
        return skills.findAll();
    }
}
