package com.zak.careercoach.dto;

import jakarta.validation.constraints.Size;

public record UpdateUserRequest(

    @Size(max = 100)
    String name,

    @Size(max = 100)
    String surname,

    @Size(max = 500)
    String profileImageUrl
) {}
