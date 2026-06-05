package com.zak.careercoach.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "resumes")
@DiscriminatorValue("RESUME")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Resume extends Document {

    @Column(columnDefinition = "TEXT")
    private String summary;

    @Column(name = "skills_text", columnDefinition = "TEXT")
    private String skillsText;

    @Column(name = "experience_text", columnDefinition = "TEXT")
    private String experienceText;

    @Column(name = "education_text", columnDefinition = "TEXT")
    private String educationText;
}
