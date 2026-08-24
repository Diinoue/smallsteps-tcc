package com.smallsteps.smallsteps.entity;

import java.time.LocalDate;
import java.util.List;

public class User {
    private int id;
    private String name;
    private String password;
    private String email;
    private String description;
    private int streak;
    private boolean status;
    private LocalDate dtStart;

    //rever como faz essa relacao manytomany do tags
    //private List<String> tags;

    public User() {
    }

    public User(int id, String name, String password, String email, String description, int streak, boolean status,
            LocalDate dtStart, List<String> tags) {
        this.id = id;
        this.name = name;
        this.password = password;
        this.email = email;
        this.description = description;
        this.streak = streak;
        this.status = status;
        this.dtStart = dtStart;
        //this.tags = tags;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public int getStreak() {
        return streak;
    }

    public void setStreak(int streak) {
        this.streak = streak;
    }

    public boolean isStatus() {
        return status;
    }

    public void setStatus(boolean status) {
        this.status = status;
    }

    public LocalDate getDtStart() {
        return dtStart;
    }

    public void setDtStart(LocalDate dtStart) {
        this.dtStart = dtStart;
    }

    // public List<String> getTags() {
    //     return tags;
    // }

    // public void setTags(List<String> tags) {
    //     this.tags = tags;
    // }

}
