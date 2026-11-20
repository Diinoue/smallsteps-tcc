package com.smallsteps.smallsteps.dto;

import java.util.ArrayList;
import java.util.List;

public class ProfileDTOResponse {
    public int id;
    public String name;
    public String handle;
    public String avatarUrl;
    public String description;
    public List<String> tags = new ArrayList<>();
    public int streakCount;
    public int streakFrequencyCount;
    public String streakFrequencyPeriod; // "day", "week", "month"
    public boolean publicStreak;
    public boolean publicCurrentGoals;
    public List<Integer> visibleAchievementIds = new ArrayList<>();
    public List<ProfileAchievementDTO> achievements = new ArrayList<>();
    public List<ProfileAchievementDTO> allCompletedAchievements = new ArrayList<>();
    public List<ProfileCurrentGoalDTO> currentGoals = new ArrayList<>();

    public ProfileDTOResponse() {}

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
    public String getHandle() {
        return handle;
    }
    public void setHandle(String handle) {
        this.handle = handle;
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
    public int getStreakCount() {
        return streakCount;
    }
    public void setStreakCount(int streakCount) {
        this.streakCount = streakCount;
    }
    public int getStreakFrequencyCount() {
        return streakFrequencyCount;
    }
    public void setStreakFrequencyCount(int streakFrequencyCount) {
        this.streakFrequencyCount = streakFrequencyCount;
    }
    public String getStreakFrequencyPeriod() {
        return streakFrequencyPeriod;
    }
    public void setStreakFrequencyPeriod(String streakFrequencyPeriod) {
        this.streakFrequencyPeriod = streakFrequencyPeriod;
    }
    public boolean isPublicStreak() {
        return publicStreak;
    }
    public void setPublicStreak(boolean publicStreak) {
        this.publicStreak = publicStreak;
    }
    public boolean isPublicCurrentGoals() {
        return publicCurrentGoals;
    }
    public void setPublicCurrentGoals(boolean publicCurrentGoals) {
        this.publicCurrentGoals = publicCurrentGoals;
    }
    public List<Integer> getVisibleAchievementIds() {
        return visibleAchievementIds;
    }
    public void setVisibleAchievementIds(List<Integer> visibleAchievementIds) {
        this.visibleAchievementIds = visibleAchievementIds;
    }
    public List<ProfileAchievementDTO> getAchievements() {
        return achievements;
    }
    public void setAchievements(List<ProfileAchievementDTO> achievements) {
        this.achievements = achievements;
    }
    public List<ProfileAchievementDTO> getAllCompletedAchievements() {
        return allCompletedAchievements;
    }
    public void setAllCompletedAchievements(List<ProfileAchievementDTO> allCompletedAchievements) {
        this.allCompletedAchievements = allCompletedAchievements;
    }
    public List<ProfileCurrentGoalDTO> getCurrentGoals() {
        return currentGoals;
    }
    public void setCurrentGoals(List<ProfileCurrentGoalDTO> currentGoals) {
        this.currentGoals = currentGoals;
    }
}
