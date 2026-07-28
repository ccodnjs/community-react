package com.example.community.dto.response;

public class PostResponse {

    private final Long id;
    private final Long userId;
    private final String title;
    private final String content;
    private final String image;
    private final String createdAt;
    private final int viewCount;
    private final long likeCount;
    private final long commentCount;
    private final String authorNickname;
    private final String authorProfileImage;

    public PostResponse(
            Long id,
            Long userId,
            String title,
            String content,
            String image,
            String createdAt,
            int viewCount,
            long likeCount,
            long commentCount,
            String authorNickname,
            String authorProfileImage
    ) {
        this.id = id;
        this.userId = userId;
        this.title = title;
        this.content = content;
        this.image = image;
        this.createdAt = createdAt;
        this.viewCount = viewCount;
        this.likeCount = likeCount;
        this.commentCount = commentCount;
        this.authorNickname = authorNickname;
        this.authorProfileImage = authorProfileImage;
    }

    public Long getId() {
        return id;
    }

    public Long getUserId() {
        return userId;
    }

    public String getTitle() {
        return title;
    }

    public String getContent() {
        return content;
    }

    public String getImage() {
        return image;
    }

    public String getCreatedAt() {
        return createdAt;
    }

    public int getViewCount() {
        return viewCount;
    }

    public long getLikeCount() {
        return likeCount;
    }

    public long getCommentCount() {
        return commentCount;
    }

    public String getAuthorNickname() {
        return authorNickname;
    }

    public String getAuthorProfileImage() {
        return authorProfileImage;
    }
}
