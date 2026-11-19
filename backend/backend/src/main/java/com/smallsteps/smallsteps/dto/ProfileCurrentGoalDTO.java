package com.smallsteps.smallsteps.dto;

import java.util.ArrayList;
import java.util.List;

public class ProfileCurrentGoalDTO {
    public int id;
    public String title;
    public List<ProfileTimelineNodeDTO> nodes = new ArrayList<>();

    public ProfileCurrentGoalDTO() {}

    public ProfileCurrentGoalDTO(int id, String title) {
        this.id = id;
        this.title = title;
    }
}
