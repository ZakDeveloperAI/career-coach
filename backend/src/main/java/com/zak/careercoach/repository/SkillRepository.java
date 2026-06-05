package com.zak.careercoach.repository;

import com.zak.careercoach.entity.Skill;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SkillRepository extends JpaRepository<Skill, Long> {

    Optional<Skill> findByName(String name);

    List<Skill> findByNameIn(List<String> names);
}
