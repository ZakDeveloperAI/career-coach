package com.zak.careercoach.service;

import com.zak.careercoach.dto.auth.AuthResponse;
import com.zak.careercoach.dto.auth.LoginRequest;
import com.zak.careercoach.dto.auth.RegisterRequest;
import com.zak.careercoach.entity.User;
import com.zak.careercoach.entity.enums.Role;
import com.zak.careercoach.exception.AppException;
import com.zak.careercoach.repository.UserRepository;
import com.zak.careercoach.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository users;
    private final PasswordEncoder encoder;
    private final JwtService jwt;
    private final AuthenticationManager authManager;

    @Transactional
    public AuthResponse register(RegisterRequest req) {
        if (req.role() == Role.ADMIN) {
            throw AppException.forbidden("Non puoi registrarti come ADMIN");
        }
        if (users.existsByEmail(req.email())) {
            throw AppException.conflict("Email gia' registrata");
        }

        User u = new User();
        u.setEmail(req.email());
        u.setPasswordHash(encoder.encode(req.password()));
        u.setName(req.name());
        u.setSurname(req.surname());
        u.setRole(req.role());
        u.setActive(true);
        users.save(u);

        return toAuthResponse(u);
    }

    public AuthResponse login(LoginRequest req) {
        authManager.authenticate(new UsernamePasswordAuthenticationToken(req.email(), req.password()));
        User u = users.findByEmail(req.email())
            .orElseThrow(() -> AppException.unauthorized("Utente non trovato"));
        return toAuthResponse(u);
    }

    private AuthResponse toAuthResponse(User u) {
        return new AuthResponse(
            jwt.generate(u),
            u.getId(),
            u.getEmail(),
            u.getName(),
            u.getSurname(),
            u.getRole());
    }
}
