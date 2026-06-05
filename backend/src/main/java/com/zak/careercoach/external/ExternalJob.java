package com.zak.careercoach.external;

import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
public class ExternalJob {

    public String externalId;
    public String title;
    public String description;
    public Integer salaryMin;
    public Integer salaryMax;
    public String location;
    public String companyName;
    public String contractType;
    public boolean remote;
    public List<String> skills = new ArrayList<>();
}
