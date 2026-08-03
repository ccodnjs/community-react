package com.example.community.controller;

import com.example.community.dto.request.PostCreateRequest;
import com.example.community.dto.request.PostUpdateRequest;
import com.example.community.dto.response.PostResponse;
import com.example.community.service.PostService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/posts")
public class PostController {

    private final PostService postService;

    public PostController(PostService postService) {
        this.postService = postService;
    }

    @PostMapping
    public ResponseEntity<PostResponse> createPost(
            @AuthenticationPrincipal Long userId,
            @Valid @RequestBody PostCreateRequest request
    ) {
        PostResponse post = postService.createPost(
                userId,
                request.getTitle(),
                request.getContent(),
                request.getImage()
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(post);
    }

    @GetMapping
    public ResponseEntity<List<PostResponse>> getPosts(
            @RequestParam(required = false) String keyword
    ) {
        List<PostResponse> posts = postService.getPosts(keyword);

        return ResponseEntity.ok(posts);
    }

    @GetMapping("/{postId}")
    public ResponseEntity<PostResponse> getPost(
            @PathVariable Long postId,
            @RequestParam(defaultValue = "true") boolean increaseView
    ) {
        PostResponse post = postService.getPost(postId, increaseView);

        return ResponseEntity.ok(post);
    }

    @PostMapping("/{postId}/view")
    public ResponseEntity<PostResponse> increaseView(@PathVariable Long postId) {
        PostResponse post = postService.getPost(postId, true);

        return ResponseEntity.ok(post);
    }

    @PatchMapping("/{postId}")
    public ResponseEntity<PostResponse> updatePost(
            @PathVariable Long postId,
            @AuthenticationPrincipal Long userId,
            @Valid @RequestBody PostUpdateRequest request
    ) {
        PostResponse post = postService.updatePost(
                postId,
                userId,
                request.getTitle(),
                request.getContent(),
                request.getImage()
        );

        return ResponseEntity.ok(post);
    }

    @DeleteMapping("/{postId}")
    public ResponseEntity<String> deletePost(
            @PathVariable Long postId,
            @AuthenticationPrincipal Long userId
    ) {
        String message = postService.deletePost(postId, userId);

        return ResponseEntity.ok(message);
    }
}
