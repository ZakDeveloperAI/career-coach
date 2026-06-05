package com.zak.careercoach.entity;

import com.zak.careercoach.entity.enums.Tone;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "cover_letters")
@DiscriminatorValue("COVER_LETTER")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CoverLetter extends Document {

    @Column(nullable = false, columnDefinition = "TEXT")
    private String body;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private Tone tone;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "target_job_id")
    private Job targetJob;

    @Column(name = "generated_by_ai", nullable = false)
    private boolean generatedByAi = false;
}
