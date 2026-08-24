package com.smallsteps.smallsteps.entity;

import java.time.LocalDate;
import java.util.List;

import com.smallsteps.smallsteps.model.ObjectiveDTO;

public class Achievement {
    private int id;
    private String title;
    private boolean visible;
    private LocalDate dtStart;
    private LocalDate dtEnd;

    private User author;

    private List<ObjectiveDTO> objectives;

    public Achievement() {}
    
    public Achievement(int id, String title, boolean visible, LocalDate dtStart, LocalDate dtEnd, User author,
            List<ObjectiveDTO> objectives) {
        this.id = id;
        this.title = title;
        this.visible = visible;
        this.dtStart = dtStart;
        this.dtEnd = dtEnd;
        this.author = author;
        this.objectives = objectives;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public boolean isVisible() {
        return visible;
    }

    public void setVisible(boolean visible) {
        this.visible = visible;
    }

    public LocalDate getDtStart() {
        return dtStart;
    }

    public void setDtStart(LocalDate dtStart) {
        this.dtStart = dtStart;
    }

    public LocalDate getDtEnd() {
        return dtEnd;
    }

    public void setDtEnd(LocalDate dtEnd) {
        this.dtEnd = dtEnd;
    }

    public User getAuthor() {
        return author;
    }

    public void setAuthor(User author) {
        this.author = author;
    }

    public List<ObjectiveDTO> getObjectives() {
        return objectives;
    }

    public void setObjectives(List<ObjectiveDTO> objectives) {
        this.objectives = objectives;
    }    

}
