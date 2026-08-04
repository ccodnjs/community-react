package com.example.community.controller;

import com.example.community.dto.request.CommentCreateRequest;
import com.example.community.dto.request.CommentUpdateRequest;
import com.example.community.dto.response.CommentResponse;
import com.example.community.service.CommentService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class CommentController {

    private final CommentService commentService;

    public CommentController(CommentService commentService) {
        this.commentService = commentService;
    }

    @PostMapping("/posts/{postId}/comments")
    public ResponseEntity<CommentResponse> createComment(
            @PathVariable Long postId,
            @AuthenticationPrincipal Long userId,
            @Valid @RequestBody CommentCreateRequest request
    ) {
        CommentResponse comment = commentService.createComment(
                postId,
                userId,
                request.getContent(),
                request.getParentCommentId()
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(comment);
    }

    @GetMapping("/posts/{postId}/comments")
    public ResponseEntity<List<CommentResponse>> getComments(@PathVariable Long postId) {
        List<CommentResponse> comments = commentService.getCommentsByPostId(postId);
        return ResponseEntity.ok(comments);
    }

    @PatchMapping("/comments/{commentId}")
    public ResponseEntity<CommentResponse> updateComment(
            @PathVariable Long commentId,
            @AuthenticationPrincipal Long userId,
            @Valid @RequestBody CommentUpdateRequest request
    ) {
        CommentResponse comment = commentService.updateComment(
                commentId,
                userId,
                request.getContent()
        );

        return ResponseEntity.ok(comment);
    }

    @DeleteMapping("/comments/{commentId}")
    public ResponseEntity<String> deleteComment(
            @PathVariable Long commentId,
            @AuthenticationPrincipal Long userId
    ) {
        String message = commentService.deleteComment(commentId, userId);

        return ResponseEntity.ok(message);
    }
}
