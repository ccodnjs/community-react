package com.example.community.dto.response;

public class CommentResponse {

    private final Long id;
    private final Long postId;
    private final Long userId;
    private final String content;
    private final String createdAt;
    private final String authorNickname;
    private final String authorProfileImage;

    public CommentResponse(
            Long id,
            Long postId,
            Long userId,
            String content,
            String createdAt,
            String authorNickname,
            String authorProfileImage
    ) {
        this.id = id;
        this.postId = postId;
        this.userId = userId;
        this.content = content;
        this.createdAt = createdAt;
        this.authorNickname = authorNickname;
        this.authorProfileImage = authorProfileImage;
    }

    public Long getId() {
        return id;
    }

    public Long getPostId() {
        return postId;
    }

    public Long getUserId() {
        return userId;
    }

    public String getContent() {
        return content;
    }

    public String getCreatedAt() {
        return createdAt;
    }

    public String getAuthorNickname() {
        return authorNickname;
    }

    public String getAuthorProfileImage() {
        return authorProfileImage;
    }
}
