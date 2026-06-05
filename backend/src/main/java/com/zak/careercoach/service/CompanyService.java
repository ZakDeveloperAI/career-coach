package com.zak.careercoach.service;

import com.zak.careercoach.dto.CompanyDto;
import com.zak.careercoach.entity.Company;
import com.zak.careercoach.entity.User;
import com.zak.careercoach.entity.enums.Role;
import com.zak.careercoach.exception.AppException;
import com.zak.careercoach.repository.CompanyRepository;
import com.zak.careercoach.security.CurrentUser;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CompanyService {

    private final CompanyRepository companies;
    private final CurrentUser currentUser;

    public List<CompanyDto.Response> all() {
        return companies.findAll().stream().map(CompanyDto.Response::from).toList();
    }

    public CompanyDto.Response byId(Long id) {
        return CompanyDto.Response.from(load(id));
    }

    public List<CompanyDto.Response> mine() {
        User me = currentUser.get();
        return companies.findByOwnerId(me.getId()).stream().map(CompanyDto.Response::from).toList();
    }

    @Transactional
    public CompanyDto.Response create(CompanyDto.CreateRequest req) {
        User me = currentUser.get();
        if (me.getRole() != Role.RECRUITER && me.getRole() != Role.ADMIN) {
            throw AppException.forbidden("Solo recruiter o admin possono creare aziende");
        }
        Company c = new Company();
        c.setName(req.name());
        c.setDescription(req.description());
        c.setWebsite(req.website());
        c.setLogoUrl(req.logoUrl());
        c.setLocation(req.location());
        c.setOwner(me);
        return CompanyDto.Response.from(companies.save(c));
    }

    @Transactional
    public CompanyDto.Response update(Long id, CompanyDto.UpdateRequest req) {
        Company c = loadOwned(id);
        if (req.description() != null) c.setDescription(req.description());
        if (req.website() != null) c.setWebsite(req.website());
        if (req.logoUrl() != null) c.setLogoUrl(req.logoUrl());
        if (req.location() != null) c.setLocation(req.location());
        return CompanyDto.Response.from(c);
    }

    @Transactional
    public void delete(Long id) {
        Company c = loadOwned(id);
        companies.delete(c);
    }

    private Company load(Long id) {
        return companies.findById(id).orElseThrow(() -> AppException.notFound("Azienda"));
    }

    private Company loadOwned(Long id) {
        Company c = load(id);
        User me = currentUser.get();
        if (me.getRole() != Role.ADMIN && !c.getOwner().getId().equals(me.getId())) {
            throw AppException.forbidden("Non sei il proprietario di questa azienda");
        }
        return c;
    }
}
