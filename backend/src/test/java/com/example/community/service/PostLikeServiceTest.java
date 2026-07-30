package com.example.community.service;

import com.example.community.domain.Post;
import com.example.community.domain.PostLike;
import com.example.community.domain.User;
import com.example.community.repository.PostLikeRepository;
import com.example.community.repository.PostRepository;
import com.example.community.repository.UserRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.BDDMockito.then;

@ExtendWith(MockitoExtension.class)
class PostLikeServiceTest {

    @Mock
    private PostLikeRepository postLikeRepository;

    @Mock
    private PostRepository postRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private RewardService rewardService;

    @InjectMocks
    private PostLikeService postLikeService;

    @Test
    @DisplayName("다른 사람 게시글에 첫 좋아요를 누르면 작성자에게 보상이 지급된다")
    void likePostGrantsRewardToAuthor() {
        Post post = new Post(1L, "제목", "내용", null);
        User liker = new User("liker@test.com", "encoded", "liker", null);
        PostLike savedLike = new PostLike(1L, 2L);

        given(postRepository.findById(1L)).willReturn(Optional.of(post));
        given(userRepository.findById(2L)).willReturn(Optional.of(liker));
        given(postLikeRepository.findByPostIdAndUserId(1L, 2L)).willReturn(Optional.empty());
        given(postLikeRepository.save(any(PostLike.class))).willReturn(savedLike);

        postLikeService.likePost(1L, 2L);

        then(rewardService).should().grant(1L, RewardType.POST_LIKED);
    }

    @Test
    @DisplayName("이미 좋아요가 있으면 보상을 중복 지급하지 않는다")
    void likePostDoesNotGrantRewardTwice() {
        Post post = new Post(1L, "제목", "내용", null);
        User liker = new User("liker@test.com", "encoded", "liker", null);
        PostLike existingLike = new PostLike(1L, 2L);

        given(postRepository.findById(1L)).willReturn(Optional.of(post));
        given(userRepository.findById(2L)).willReturn(Optional.of(liker));
        given(postLikeRepository.findByPostIdAndUserId(1L, 2L)).willReturn(Optional.of(existingLike));

        postLikeService.likePost(1L, 2L);

        then(rewardService).shouldHaveNoInteractions();
    }
}
