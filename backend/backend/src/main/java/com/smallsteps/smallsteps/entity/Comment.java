package com.smallsteps.smallsteps.entity;

import java.time.LocalDate;

public class Comment {
    private String description;
    private LocalDate dtStart;
    private User author;
    private int id;

    //comentarios podem ser feitos tanto em eventos quanto em posts
    //ver como da p fazer isso
    //fk
    // private Post post;
    // private Event event;

    public Comment(String description, LocalDate dtStart, User author, int id) {
        this.description = description;
        this.dtStart = dtStart;
        this.author = author;
        this.id = id;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public LocalDate getDtStart() {
        return dtStart;
    }

    public void setDtStart(LocalDate dtStart) {
        this.dtStart = dtStart;
    }

    public User getAuthor() {
        return author;
    }

    public void setAuthor(User author) {
        this.author = author;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

}
