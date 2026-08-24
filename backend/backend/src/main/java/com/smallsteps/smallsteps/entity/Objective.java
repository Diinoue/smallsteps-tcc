package com.smallsteps.smallsteps.entity;

import java.time.LocalDate;

public class Objective {
    private boolean completed;
    private String description;
    private int pos;
    private int id;
    private LocalDate dtEnd;
    private LocalDate dtStart;
    
    //fk achievement
    private Achievement origin;

    public Objective() {}
    
    public Objective(boolean completed, String description, int pos, int id, LocalDate dtEnd, LocalDate dtStart,
            Achievement origin) {
        this.completed = completed;
        this.description = description;
        this.pos = pos;
        this.id = id;
        this.dtEnd = dtEnd;
        this.dtStart = dtStart;
        this.origin = origin;
    }

    public boolean isCompleted() {
        return completed;
    }

    public void setCompleted(boolean completed) {
        this.completed = completed;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public int getPos() {
        return pos;
    }

    public void setPos(int pos) {
        this.pos = pos;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public LocalDate getDtEnd() {
        return dtEnd;
    }

    public void setDtEnd(LocalDate dtEnd) {
        this.dtEnd = dtEnd;
    }

    public LocalDate getDtStart() {
        return dtStart;
    }

    public void setDtStart(LocalDate dtStart) {
        this.dtStart = dtStart;
    }

    public Achievement getOrigin() {
        return origin;
    }

    public void setOrigin(Achievement origin) {
        this.origin = origin;
    }

}
