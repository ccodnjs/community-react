package com.example.community.service;

import com.example.community.domain.Post;
import com.example.community.exception.CommunityException;
import com.example.community.exception.ErrorCode;
import com.example.community.repository.CommentRepository;
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

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.BDDMockito.then;

@ExtendWith(MockitoExtension.class)
class PostServiceTest {

    @Mock
    private PostRepository postRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private CommentRepository commentRepository;

    @Mock
    private PostLikeRepository postLikeRepository;

    @Mock
    private RewardService rewardService;

    @InjectMocks
    private PostService postService;

    @Test
    @DisplayName("작성자가 아니면 게시글을 수정할 수 없다")
    void updatePostThrowsWhenUserIsNotAuthor() {
        Post post = new Post(1L, "제목", "내용", null);
        given(postRepository.findById(10L)).willReturn(Optional.of(post));

        assertThatThrownBy(() -> postService.updatePost(10L, 2L, "수정 제목", "수정 내용", null))
                .isInstanceOf(CommunityException.class)
                .hasMessageContaining("해당 작업을 수행할 권한이 없습니다.");
    }

    @Test
    @DisplayName("작성자가 아니면 게시글을 삭제할 수 없다")
    void deletePostThrowsWhenUserIsNotAuthor() {
        Post post = new Post(1L, "제목", "내용", null);
        given(postRepository.findById(10L)).willReturn(Optional.of(post));

        assertThatThrownBy(() -> postService.deletePost(10L, 2L))
                .isInstanceOf(CommunityException.class)
                .hasMessageContaining("해당 작업을 수행할 권한이 없습니다.");
    }

    @Test
    @DisplayName("게시글 작성 시 작성 보상이 지급된다")
    void createPostGrantsReward() {
        Post savedPost = new Post(1L, "제목", "내용", null);
        given(postRepository.save(any(Post.class))).willReturn(savedPost);
        given(userRepository.findById(1L)).willReturn(Optional.empty());

        postService.createPost(1L, "제목", "내용", null);

        then(rewardService).should().grant(1L, RewardType.POST_CREATED);
    }
}
