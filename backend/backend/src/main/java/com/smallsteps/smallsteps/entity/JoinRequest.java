package com.smallsteps.smallsteps.entity;

import java.time.LocalDate;

public class JoinRequest {
    private User user;
    private Community community;
    private LocalDate dtStart;
    
    public JoinRequest() {}

    public JoinRequest(User user, Community community, LocalDate dtStart) {
        this.user = user;
        this.community = community;
        this.dtStart = dtStart;
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

    public LocalDate getDtStart() {
        return dtStart;
    }

    public void setDtStart(LocalDate dtStart) {
        this.dtStart = dtStart;
    }

}
