package com.zak.careercoach.security;

import com.zak.careercoach.entity.User;
import com.zak.careercoach.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository users;

    @Override
    public UserDetails loadUserByUsername(String email) {
        User u = users.findByEmail(email)
            .orElseThrow(() -> new UsernameNotFoundException("Utente non trovato: " + email));

        return new org.springframework.security.core.userdetails.User(
            u.getEmail(),
            u.getPasswordHash(),
            u.isActive(),
            true, true, true,
            List.of(new SimpleGrantedAuthority("ROLE_" + u.getRole().name()))
        );
    }
}
