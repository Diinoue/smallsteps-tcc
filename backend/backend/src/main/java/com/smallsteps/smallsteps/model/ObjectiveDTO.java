package com.smallsteps.smallsteps.model;

import java.time.LocalDate;

public class ObjectiveDTO {
    public boolean completed;
    public String description;
    public int pos;
    public int id;
    public LocalDate dtEnd;
    public LocalDate dtStart;
    
    //fk achievement
    public String origin;
}
