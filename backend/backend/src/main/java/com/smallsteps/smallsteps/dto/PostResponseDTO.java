package com.smallsteps.smallsteps.dto;

import java.time.format.DateTimeFormatter;
import com.smallsteps.smallsteps.entity.Post;

public class PostResponseDTO {
    private int id;
    private int communityId;
    private String content;
    private String createdAt;
    private String mediaType;
    private String mediaUrl;
    private int commentsCount;
    private PostAuthorDTO author;

    public static class PostAuthorDTO {
        private int id;
        private String name;
        private String avatarUrl;
        private int streakDays;

        public PostAuthorDTO() {}

        public PostAuthorDTO(int id, String name, String avatarUrl, int streakDays) {
            this.id = id;
            this.name = name;
            this.avatarUrl = avatarUrl;
            this.streakDays = streakDays;
        }

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

        public String getAvatarUrl() {
            return avatarUrl;
        }

        public void setAvatarUrl(String avatarUrl) {
            this.avatarUrl = avatarUrl;
        }

        public int getStreakDays() {
            return streakDays;
        }

        public void setStreakDays(int streakDays) {
            this.streakDays = streakDays;
        }
    }

    public PostResponseDTO() {}

    public PostResponseDTO(Post post, int streakDays, int commentsCount) {
        this.id = post.getId();
        this.communityId = post.getIdComunidade();
        this.content = post.getDescricao();

        if (post.getDtCriacao() != null) {
            this.createdAt = post.getDtCriacao().format(DateTimeFormatter.ofPattern("dd/MM/yyyy"));
        }

        this.mediaType = post.getTipoMidia() != null ? post.getTipoMidia().toLowerCase() : "text";
        this.mediaUrl = post.getUrlMidia();
        this.commentsCount = commentsCount;

        if (post.getUsuario() != null) {
            this.author = new PostAuthorDTO(
                post.getUsuario().getId(),
                post.getUsuario().getNome(),
                post.getUsuario().getFoto(),
                streakDays
            );
        }
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public int getCommunityId() {
        return communityId;
    }

    public void setCommunityId(int communityId) {
        this.communityId = communityId;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(String createdAt) {
        this.createdAt = createdAt;
    }

    public String getMediaType() {
        return mediaType;
    }

    public void setMediaType(String mediaType) {
        this.mediaType = mediaType;
    }

    public String getMediaUrl() {
        return mediaUrl;
    }

    public void setMediaUrl(String mediaUrl) {
        this.mediaUrl = mediaUrl;
    }

    public int getCommentsCount() {
        return commentsCount;
    }

    public void setCommentsCount(int commentsCount) {
        this.commentsCount = commentsCount;
    }

    public PostAuthorDTO getAuthor() {
        return author;
    }

    public void setAuthor(PostAuthorDTO author) {
        this.author = author;
    }
}
