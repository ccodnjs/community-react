package com.example.community.dto.request;

import jakarta.validation.constraints.NotBlank;

public class CommentCreateRequest {

    @NotBlank(message = "댓글 내용을 입력해주세요.")
    private String content;

    public String getContent() {
        return content;
    }
}
