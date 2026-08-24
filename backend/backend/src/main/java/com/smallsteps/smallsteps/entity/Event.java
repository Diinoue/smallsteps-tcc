package com.smallsteps.smallsteps.entity;

import java.time.LocalDate;

public class Event {
    private String title;
    private String description;

    private String address;

    // dt = dia, time = hora, exemplo: dt 12/12/2012 - 15/12/2012, time 12:30 - 19:00
    private LocalDate dtStart;
    private LocalDate dtEnd;
    private int timeStart;
    private int timeEnd;

    private Community community;
    private User author;
    
    public Event() {}

    public Event(String title, String description, String address, LocalDate dtStart, LocalDate dtEnd, int timeStart,
            int timeEnd, Community community, User author) {
        this.title = title;
        this.description = description;
        this.address = address;
        this.dtStart = dtStart;
        this.dtEnd = dtEnd;
        this.timeStart = timeStart;
        this.timeEnd = timeEnd;
        this.community = community;
        this.author = author;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
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

    public int getTimeStart() {
        return timeStart;
    }

    public void setTimeStart(int timeStart) {
        this.timeStart = timeStart;
    }

    public int getTimeEnd() {
        return timeEnd;
    }

    public void setTimeEnd(int timeEnd) {
        this.timeEnd = timeEnd;
    }

    public Community getCommunity() {
        return community;
    }

    public void setCommunity(Community community) {
        this.community = community;
    }

    public User getAuthor() {
        return author;
    }

    public void setAuthor(User author) {
        this.author = author;
    }

}
