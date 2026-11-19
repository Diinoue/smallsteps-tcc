package com.smallsteps.smallsteps.dto;

import java.util.List;

public class UpdateProfileDTORequest {
    public String name;
    public String avatarUrl;
    public String description;
    public List<String> tags;
    public Integer streakFrequencyCount;
    public String streakFrequencyPeriod;
    public Boolean publicStreak;
    public Boolean publicCurrentGoals;
    public List<Integer> visibleAchievementIds;

    public UpdateProfileDTORequest() {}

    public String getName() {
        return name;
    }
    public void setName(String name) {
        this.name = name;
    }
    public String getAvatarUrl() {
        return avatarUrl;
    }
    public void setAvatarUrl(String avatarUrl) {
        this.avatarUrl = avatarUrl;
    }
    public String getDescription() {
        return description;
    }
    public void setDescription(String description) {
        this.description = description;
    }
    public List<String> getTags() {
        return tags;
    }
    public void setTags(List<String> tags) {
        this.tags = tags;
    }
    public Integer getStreakFrequencyCount() {
        return streakFrequencyCount;
    }
    public void setStreakFrequencyCount(Integer streakFrequencyCount) {
        this.streakFrequencyCount = streakFrequencyCount;
    }
    public String getStreakFrequencyPeriod() {
        return streakFrequencyPeriod;
    }
    public void setStreakFrequencyPeriod(String streakFrequencyPeriod) {
        this.streakFrequencyPeriod = streakFrequencyPeriod;
    }
    public Boolean getPublicStreak() {
        return publicStreak;
    }
    public void setPublicStreak(Boolean publicStreak) {
        this.publicStreak = publicStreak;
    }
    public Boolean getPublicCurrentGoals() {
        return publicCurrentGoals;
    }
    public void setPublicCurrentGoals(Boolean publicCurrentGoals) {
        this.publicCurrentGoals = publicCurrentGoals;
    }
    public List<Integer> getVisibleAchievementIds() {
        return visibleAchievementIds;
    }
    public void setVisibleAchievementIds(List<Integer> visibleAchievementIds) {
        this.visibleAchievementIds = visibleAchievementIds;
    }
}
