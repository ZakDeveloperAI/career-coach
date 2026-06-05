package com.zak.careercoach.controller;

import com.zak.careercoach.entity.Category;
import com.zak.careercoach.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryRepository categories;

    @GetMapping
    public List<Category> all() {
        return categories.findAll();
    }
}
