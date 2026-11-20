package com.smallsteps.smallsteps.dto;

public class ProfileAchievementDTO {
    public int id;
    public String title;
    public String journeyDuration;
    public int subGoalsCount;
    public String mediaType; // "image" ou "video"

    public ProfileAchievementDTO() {}

    public ProfileAchievementDTO(int id, String title, String journeyDuration, int subGoalsCount, String mediaType) {
        this.id = id;
        this.title = title;
        this.journeyDuration = journeyDuration;
        this.subGoalsCount = subGoalsCount;
        this.mediaType = mediaType;
    }
}
