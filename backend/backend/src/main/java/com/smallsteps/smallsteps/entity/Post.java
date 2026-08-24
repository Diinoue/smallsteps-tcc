package com.smallsteps.smallsteps.entity;

import java.time.LocalDate;

public class Post {
    private String description;
    private int id;
    private LocalDate dtStart;
    private String community;
    private String photo;
    private int numComment;

    //fk do usuario
    private User author;

    public Post() {}

    public Post(String description, int id, LocalDate dtStart, String community, String photo, int numComment,
            User author) {
        this.description = description;
        this.id = id;
        this.dtStart = dtStart;
        this.community = community;
        this.photo = photo;
        this.numComment = numComment;
        this.author = author;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public LocalDate getDtStart() {
        return dtStart;
    }

    public void setDtStart(LocalDate dtStart) {
        this.dtStart = dtStart;
    }

    public String getCommunity() {
        return community;
    }

    public void setCommunity(String community) {
        this.community = community;
    }

    public String getPhoto() {
        return photo;
    }

    public void setPhoto(String photo) {
        this.photo = photo;
    }

    public int getNumComment() {
        return numComment;
    }

    public void setNumComment(int numComment) {
        this.numComment = numComment;
    }

    public User getAuthor() {
        return author;
    }

    public void setAuthor(User author) {
        this.author = author;
    }

}
