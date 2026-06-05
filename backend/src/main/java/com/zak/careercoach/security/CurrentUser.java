package com.zak.careercoach.security;

import com.zak.careercoach.entity.User;
import com.zak.careercoach.exception.AppException;
import com.zak.careercoach.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class CurrentUser {

    private final UserRepository users;

    public User get() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            throw AppException.unauthorized("Non autenticato");
        }
        String email = auth.getName();
        return users.findByEmail(email)
            .orElseThrow(() -> AppException.unauthorized("Utente non trovato"));
    }
}
