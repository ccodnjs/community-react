package com.example.community.controller;

import com.example.community.domain.PostLike;
import com.example.community.service.PostLikeService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/posts/{postId}/likes")
public class PostLikeController {

    private final PostLikeService postLikeService;

    public PostLikeController(PostLikeService postLikeService) {
        this.postLikeService = postLikeService;
    }

    @PostMapping
    public ResponseEntity<PostLike> likePost(
            @PathVariable Long postId,
            @AuthenticationPrincipal Long userId
    ) {
        PostLike postLike = postLikeService.likePost(
                postId,
                userId
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(postLike);
    }

    @DeleteMapping
    public ResponseEntity<String> unlikePost(
            @PathVariable Long postId,
            @AuthenticationPrincipal Long userId
    ) {
        String message = postLikeService.cancelLike(
                postId,
                userId
        );

        return ResponseEntity.ok(message);
    }

    @GetMapping("/me")
    public ResponseEntity<Map<String, Boolean>> getMyLikeStatus(
            @PathVariable Long postId,
            @AuthenticationPrincipal Long userId
    ) {
        return ResponseEntity.ok(Map.of(
                "liked",
                postLikeService.isLikedByUser(postId, userId)
        ));
    }
}
