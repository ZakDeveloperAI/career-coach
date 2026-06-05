package com.zak.careercoach.controller;

import com.zak.careercoach.service.JobImportService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminController {

    private final JobImportService imports;

    @PostMapping("/imports/adzuna")
    public Map<String, Object> importAdzuna(
            @RequestParam(required = false) String what,
            @RequestParam(required = false) String where,
            @RequestParam(defaultValue = "20") int howMany) {
        int n = imports.importFromAdzuna(what, where, howMany);
        return Map.of("source", "ADZUNA", "imported", n);
    }

    @PostMapping("/imports/remoteok")
    public Map<String, Object> importRemoteOk(@RequestParam(required = false) String tag) {
        int n = imports.importFromRemoteOk(tag);
        return Map.of("source", "REMOTEOK", "imported", n);
    }
}
