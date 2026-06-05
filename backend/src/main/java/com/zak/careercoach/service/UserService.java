package com.zak.careercoach.service;

import com.zak.careercoach.dto.UpdateUserRequest;
import com.zak.careercoach.dto.UserDto;
import com.zak.careercoach.entity.User;
import com.zak.careercoach.exception.AppException;
import com.zak.careercoach.repository.UserRepository;
import com.zak.careercoach.security.CurrentUser;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository users;
    private final CurrentUser currentUser;

    public UserDto me() {
        return UserDto.from(currentUser.get());
    }

    @Transactional
    public UserDto updateMe(UpdateUserRequest req) {
        User u = currentUser.get();
        if (req.name() != null) u.setName(req.name());
        if (req.surname() != null) u.setSurname(req.surname());
        if (req.profileImageUrl() != null) u.setProfileImageUrl(req.profileImageUrl());
        return UserDto.from(u);
    }

    public List<UserDto> all() {
        return users.findAll().stream().map(UserDto::from).toList();
    }

    public UserDto byId(Long id) {
        User u = users.findById(id).orElseThrow(() -> AppException.notFound("Utente"));
        return UserDto.from(u);
    }

    @Transactional
    public void toggleActive(Long id) {
        User u = users.findById(id).orElseThrow(() -> AppException.notFound("Utente"));
        u.setActive(!u.isActive());
    }
}
