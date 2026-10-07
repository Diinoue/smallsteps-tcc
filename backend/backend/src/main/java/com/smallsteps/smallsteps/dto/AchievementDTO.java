package com.smallsteps.smallsteps.dto;

import java.time.LocalDate;
import java.util.List;

public class AchievementDTO {
    public int id;
    public String title;
    public boolean visible;
    public LocalDate dtStart;
    public LocalDate dtEnd;

    public String author;

    public List<ObjectiveDTO> objectives;    
}
