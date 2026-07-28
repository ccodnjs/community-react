package com.example.community.service;

import com.example.community.domain.Comment;
import com.example.community.domain.Post;
import com.example.community.domain.User;
import com.example.community.dto.response.CommentResponse;
import com.example.community.exception.CommunityException;
import com.example.community.exception.ErrorCode;
import com.example.community.repository.CommentRepository;
import com.example.community.repository.PostRepository;
import com.example.community.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CommentService {

    private final CommentRepository commentRepository;
    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final RewardService rewardService;

    public CommentService(
            CommentRepository commentRepository,
            PostRepository postRepository,
            UserRepository userRepository,
            RewardService rewardService
    ) {
        this.commentRepository = commentRepository;
        this.postRepository = postRepository;
        this.userRepository = userRepository;
        this.rewardService = rewardService;
    }

    @Transactional
    public CommentResponse createComment(Long postId, Long userId, String content) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new CommunityException(ErrorCode.POST_NOT_FOUND));

        userRepository.findById(userId)
                .orElseThrow(() -> new CommunityException(ErrorCode.USER_NOT_FOUND));

        Comment comment = new Comment(postId, userId, content.trim());
        Comment savedComment = commentRepository.save(comment);

        if (!post.getUserId().equals(userId)) {
            rewardService.grant(userId, RewardType.COMMENT_CREATED);
            rewardService.grant(post.getUserId(), RewardType.COMMENT_RECEIVED);
        }

        return toResponse(savedComment);
    }

    @Transactional(readOnly = true)
    public List<CommentResponse> getCommentsByPostId(Long postId) {
        return commentRepository.findByPostId(postId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public CommentResponse updateComment(Long commentId, Long userId, String content) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new CommunityException(ErrorCode.COMMENT_NOT_FOUND));

        if (!comment.getUserId().equals(userId)) {
            throw new CommunityException(ErrorCode.FORBIDDEN_ACTION);
        }

        comment.update(content.trim());

        return toResponse(comment);
    }

    @Transactional
    public String deleteComment(Long commentId, Long userId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new CommunityException(ErrorCode.COMMENT_NOT_FOUND));

        if (!comment.getUserId().equals(userId)) {
            throw new CommunityException(ErrorCode.FORBIDDEN_ACTION);
        }

        commentRepository.delete(comment);

        return "댓글이 삭제되었습니다.";
    }

    private CommentResponse toResponse(Comment comment) {
        User author = userRepository.findById(comment.getUserId()).orElse(null);

        return new CommentResponse(
                comment.getId(),
                comment.getPostId(),
                comment.getUserId(),
                comment.getContent(),
                comment.getCreatedAt(),
                author == null ? "작성자" : author.getNickname(),
                author == null ? null : author.getProfileImage()
        );
    }
}
