package com.zak.careercoach.dto;

import com.zak.careercoach.entity.User;
import com.zak.careercoach.entity.enums.Role;

import java.time.LocalDateTime;

public record UserDto(
    Long id,
    String email,
    String name,
    String surname,
    String profileImageUrl,
    Role role,
    LocalDateTime registrationDate,
    boolean active
) {
    public static UserDto from(User u) {
        return new UserDto(
            u.getId(), u.getEmail(), u.getName(), u.getSurname(),
            u.getProfileImageUrl(), u.getRole(), u.getRegistrationDate(), u.isActive());
    }
}
