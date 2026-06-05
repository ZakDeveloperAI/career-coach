package com.zak.careercoach.repository;

import com.zak.careercoach.entity.Company;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CompanyRepository extends JpaRepository<Company, Long> {

    Optional<Company> findByName(String name);

    List<Company> findByOwnerId(Long ownerId);
}
