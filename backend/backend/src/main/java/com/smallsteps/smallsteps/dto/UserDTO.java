package com.smallsteps.smallsteps.dto;

import java.time.LocalDate;
import java.util.List;

public class UserDTO {
    public int id;
    public String name;
    public String password;
    public String email;
    public String description;
    public int streak;
    public boolean status;
    public LocalDate dtStart;
    public List<String> tags;
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
    public List<String> getTags() {
        return tags;
    }
    public void setTags(List<String> tags) {
        this.tags = tags;
    }
}
