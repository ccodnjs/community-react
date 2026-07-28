package com.example.community.service;

import com.example.community.domain.Post;
import com.example.community.domain.User;
import com.example.community.dto.response.PostResponse;
import com.example.community.exception.CommunityException;
import com.example.community.exception.ErrorCode;
import com.example.community.repository.CommentRepository;
import com.example.community.repository.PostLikeRepository;
import com.example.community.repository.PostRepository;
import com.example.community.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;

@Service
public class PostService {

    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final CommentRepository commentRepository;
    private final PostLikeRepository postLikeRepository;
    private final RewardService rewardService;

    public PostService(
            PostRepository postRepository,
            UserRepository userRepository,
            CommentRepository commentRepository,
            PostLikeRepository postLikeRepository,
            RewardService rewardService
    ) {
        this.postRepository = postRepository;
        this.userRepository = userRepository;
        this.commentRepository = commentRepository;
        this.postLikeRepository = postLikeRepository;
        this.rewardService = rewardService;
    }

    @Transactional
    public PostResponse createPost(Long userId, String title, String content, String image) {
        Post post = new Post(userId, title.trim(), content.trim(), image);
        Post savedPost = postRepository.save(post);

        rewardService.grant(userId, RewardType.POST_CREATED);
        return toResponse(savedPost);
    }

    @Transactional(readOnly = true)
    public List<PostResponse> getPosts() {
        return postRepository.findAll().stream()
                .sorted(Comparator.comparing(Post::getId).reversed())
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public PostResponse getPost(Long postId) {
        return getPost(postId, true);
    }

    @Transactional
    public PostResponse getPost(Long postId, boolean increaseView) {
        return postRepository.findById(postId)
                .map(post -> {
                    if (increaseView) {
                        post.increaseViewCount();
                        return toResponse(postRepository.save(post));
                    }

                    return toResponse(post);
                })
                .orElseThrow(() -> new CommunityException(ErrorCode.POST_NOT_FOUND));
    }

    @Transactional(readOnly = true)
    public List<PostResponse> getPostsByUserId(Long userId) {
        return postRepository.findByUserId(userId).stream()
                .sorted(Comparator.comparing(Post::getId).reversed())
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public PostResponse updatePost(Long postId, Long userId, String title, String content, String image) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new CommunityException(ErrorCode.POST_NOT_FOUND));

        if (!post.getUserId().equals(userId)) {
            throw new CommunityException(ErrorCode.FORBIDDEN_ACTION);
        }

        String nextImage = image != null ? image : post.getImage();

        post.update(title.trim(), content.trim(), nextImage);
        return toResponse(postRepository.save(post));
    }

    @Transactional
    public String deletePost(Long postId, Long userId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new CommunityException(ErrorCode.POST_NOT_FOUND));

        if (!post.getUserId().equals(userId)) {
            throw new CommunityException(ErrorCode.FORBIDDEN_ACTION);
        }

        postRepository.delete(post);

        return "게시글이 삭제되었습니다.";
    }

    @Transactional(readOnly = true)
    public Post findPostEntity(Long postId) {
        return postRepository.findById(postId)
                .orElseThrow(() -> new CommunityException(ErrorCode.POST_NOT_FOUND));
    }

    private PostResponse toResponse(Post post) {
        User author = userRepository.findById(post.getUserId()).orElse(null);
        long likeCount = postLikeRepository.countByPostId(post.getId());
        long commentCount = commentRepository.countByPostId(post.getId());

        return new PostResponse(
                post.getId(),
                post.getUserId(),
                post.getTitle(),
                post.getContent(),
                post.getImage(),
                post.getCreatedAt(),
                post.getViewCount(),
                likeCount,
                commentCount,
                author == null ? "작성자" : author.getNickname(),
                author == null ? null : author.getProfileImage()
        );
    }
}
