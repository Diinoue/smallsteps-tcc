package com.smallsteps.smallsteps.dto;

public class ProfileTimelineNodeDTO {
    public int id;
    public String label;
    public boolean completed;

    public ProfileTimelineNodeDTO() {}

    public ProfileTimelineNodeDTO(int id, String label, boolean completed) {
        this.id = id;
        this.label = label;
        this.completed = completed;
    }
}
