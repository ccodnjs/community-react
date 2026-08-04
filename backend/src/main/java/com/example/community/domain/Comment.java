package com.example.community.domain;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Entity
@Table(name = "comments")
public class Comment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long postId;
    private Long userId;
    private Long parentCommentId;
    private String content;
    private String createdAt;

    protected Comment() {
    }

    public Comment(Long postId, Long userId, String content) {
        this(postId, userId, content, null);
    }

    public Comment(Long postId, Long userId, String content, Long parentCommentId) {
        this.postId = postId;
        this.userId = userId;
        this.parentCommentId = parentCommentId;
        this.content = content;
        this.createdAt = LocalDateTime.now()
                .format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm"));
    }

    public void update(String content) {
        this.content = content;
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

    public Long getParentCommentId() {
        return parentCommentId;
    }

    public String getContent() {
        return content;
    }

    public String getCreatedAt() {
        return createdAt;
    }
}
