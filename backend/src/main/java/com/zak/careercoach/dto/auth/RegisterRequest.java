package com.zak.careercoach.dto.auth;

import com.zak.careercoach.entity.enums.Role;
import jakarta.validation.constraints.*;

public record RegisterRequest(

    @NotBlank @Email
    String email,

    @NotBlank @Size(min = 8, max = 100)
    String password,

    @NotBlank @Size(max = 100)
    String name,

    @NotBlank @Size(max = 100)
    String surname,

    @NotNull
    Role role
) {}
