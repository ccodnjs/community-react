package com.example.community.service;

import com.example.community.domain.PostLike;
import com.example.community.domain.Post;
import com.example.community.exception.CommunityException;
import com.example.community.exception.ErrorCode;
import com.example.community.repository.PostLikeRepository;
import com.example.community.repository.PostRepository;
import com.example.community.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PostLikeService {

    private final PostLikeRepository postLikeRepository;
    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final RewardService rewardService;

    public PostLikeService(
            PostLikeRepository postLikeRepository,
            PostRepository postRepository,
            UserRepository userRepository,
            RewardService rewardService
    ) {
        this.postLikeRepository = postLikeRepository;
        this.postRepository = postRepository;
        this.userRepository = userRepository;
        this.rewardService = rewardService;
    }

    @Transactional
    public PostLike likePost(Long postId, Long userId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new CommunityException(ErrorCode.POST_NOT_FOUND));

        userRepository.findById(userId)
                .orElseThrow(() -> new CommunityException(ErrorCode.USER_NOT_FOUND));

        return postLikeRepository.findByPostIdAndUserId(postId, userId)
                .orElseGet(() -> {
                    PostLike postLike = new PostLike(postId, userId);
                    PostLike savedPostLike = postLikeRepository.save(postLike);

                    if (!post.getUserId().equals(userId)) {
                        rewardService.grant(post.getUserId(), RewardType.POST_LIKED);
                    }

                    return savedPostLike;
                });
    }

    @Transactional
    public String cancelLike(Long postId, Long userId) {
        PostLike postLike = postLikeRepository.findByPostIdAndUserId(postId, userId)
                .orElse(null);

        // 좋아요가 없어도 에러 내지 않음
        if (postLike == null) {
            return "좋아요를 누르지 않은 상태입니다.";
        }

        postLikeRepository.delete(postLike);

        return "좋아요가 취소되었습니다.";
    }

    @Transactional(readOnly = true)
    public boolean isLikedByUser(Long postId, Long userId) {
        if (userId == null) {
            return false;
        }

        return postLikeRepository.existsByPostIdAndUserId(postId, userId);
    }
}
