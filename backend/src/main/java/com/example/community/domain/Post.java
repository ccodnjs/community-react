package com.example.community.domain;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.Table;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Entity
@Table(name = "posts")
public class Post {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;
    private String title;
    private String content;

    @Lob
    private String image;

    private String createdAt;
    private Integer viewCount;

    protected Post() {
    }

    public Post(Long userId, String title, String content, String image) {
        this.userId = userId;
        this.title = title;
        this.content = content;
        this.image = image;
        this.viewCount = 0;

        this.createdAt = LocalDateTime.now()
                .format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm"));
    }

    public void update(String title, String content) {
        this.title = title;
        this.content = content;
    }

    public void update(String title, String content, String image) {
        this.title = title;
        this.content = content;
        this.image = image;
    }

    public void increaseViewCount() {
        this.viewCount = getViewCount() + 1;
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
        return viewCount == null ? 0 : viewCount;
    }
}
