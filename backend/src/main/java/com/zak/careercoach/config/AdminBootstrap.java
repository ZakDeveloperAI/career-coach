package com.zak.careercoach.config;

import com.zak.careercoach.entity.User;
import com.zak.careercoach.entity.enums.Role;
import com.zak.careercoach.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class AdminBootstrap implements CommandLineRunner {

    private final UserRepository users;
    private final PasswordEncoder encoder;

    @Value("${app.admin.email:admin@career.coach}")
    private String adminEmail;

    @Value("${app.admin.password:admin123}")
    private String adminPassword;

    @Override
    public void run(String... args) {
        if (users.findByRole(Role.ADMIN).isEmpty()) {
            User admin = new User();
            admin.setEmail(adminEmail);
            admin.setPasswordHash(encoder.encode(adminPassword));
            admin.setName("Admin");
            admin.setSurname("System");
            admin.setRole(Role.ADMIN);
            admin.setActive(true);
            users.save(admin);
            log.info("Admin di default creato: {} (cambia password in produzione)", adminEmail);
        }
    }
}
