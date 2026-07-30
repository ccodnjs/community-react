package com.example.community.service;

public enum RewardType {
    POST_CREATED(10, "게시글 작성"),
    COMMENT_CREATED(5, "댓글 작성"),
    COMMENT_RECEIVED(3, "내 게시글 댓글 보상"),
    POST_LIKED(2, "좋아요 받음");

    private final int amount;
    private final String description;

    RewardType(int amount, String description) {
        this.amount = amount;
        this.description = description;
    }

    public int getAmount() {
        return amount;
    }

    public String getDescription() {
        return description;
    }
}
