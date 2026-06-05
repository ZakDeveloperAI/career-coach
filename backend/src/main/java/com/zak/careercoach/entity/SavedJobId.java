package com.zak.careercoach.entity;

import jakarta.persistence.Embeddable;
import lombok.*;

import java.io.Serializable;

@Embeddable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
public class SavedJobId implements Serializable {

    private Long candidateId;
    private Long jobId;
}
