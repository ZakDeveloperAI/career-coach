package com.zak.careercoach.controller;

import com.zak.careercoach.dto.UpdateUserRequest;
import com.zak.careercoach.dto.UserDto;
import com.zak.careercoach.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService service;

    @GetMapping("/me")
    public UserDto me() {
        return service.me();
    }

    @PatchMapping("/me")
    public UserDto updateMe(@Valid @RequestBody UpdateUserRequest req) {
        return service.updateMe(req);
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<UserDto> all() {
        return service.all();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public UserDto byId(@PathVariable Long id) {
        return service.byId(id);
    }

    @PostMapping("/{id}/toggle-active")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> toggle(@PathVariable Long id) {
        service.toggleActive(id);
        return ResponseEntity.noContent().build();
    }
}
