package com.smallsteps.smallsteps.entity;

public class Community_User {
    private User user;
    private Community community;
    private int score;
    private String role;

    public Community_User() {}

    public Community_User(User user, Community community, int score, String role) {
        this.user = user;
        this.community = community;
        this.score = score;
        this.role = role;
    }

    public User getUser() {
        return user;
    }
    public void setUser(User user) {
        this.user = user;
    }
    public Community getCommunity() {
        return community;
    }
    public void setCommunity(Community community) {
        this.community = community;
    }
    public int getScore() {
        return score;
    }
    public void setScore(int score) {
        this.score = score;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }
    
}
