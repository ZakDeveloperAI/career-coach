package com.zak.careercoach.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "saved_jobs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "id")
public class SavedJob {

    @EmbeddedId
    private SavedJobId id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @MapsId("candidateId")
    @JoinColumn(name = "candidate_id")
    private User candidate;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @MapsId("jobId")
    @JoinColumn(name = "job_id")
    private Job job;

    @Column(name = "saved_at", nullable = false, updatable = false)
    private LocalDateTime savedAt;

    @PrePersist
    void onCreate() {
        if (savedAt == null) savedAt = LocalDateTime.now();
        if (id == null && candidate != null && job != null) {
            id = new SavedJobId(candidate.getId(), job.getId());
        }
    }
}
