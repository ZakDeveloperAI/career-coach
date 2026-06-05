package com.zak.careercoach.dto.auth;

import com.zak.careercoach.entity.enums.Role;

public record AuthResponse(
    String token,
    Long userId,
    String email,
    String name,
    String surname,
    Role role
) {}
