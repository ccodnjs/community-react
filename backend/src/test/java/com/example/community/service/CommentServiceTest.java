package com.example.community.service;

import com.example.community.domain.Comment;
import com.example.community.domain.Post;
import com.example.community.domain.User;
import com.example.community.exception.CommunityException;
import com.example.community.repository.CommentRepository;
import com.example.community.repository.PostRepository;
import com.example.community.repository.UserRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.BDDMockito.then;

@ExtendWith(MockitoExtension.class)
class CommentServiceTest {

    @Mock
    private CommentRepository commentRepository;

    @Mock
    private PostRepository postRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private RewardService rewardService;

    @InjectMocks
    private CommentService commentService;

    @Test
    @DisplayName("작성자가 아니면 댓글을 수정할 수 없다")
    void updateCommentThrowsWhenUserIsNotAuthor() {
        Comment comment = new Comment(1L, 1L, "원본 댓글");
        given(commentRepository.findById(10L)).willReturn(Optional.of(comment));

        assertThatThrownBy(() -> commentService.updateComment(10L, 2L, "수정 댓글"))
                .isInstanceOf(CommunityException.class)
                .hasMessageContaining("해당 작업을 수행할 권한이 없습니다.");
    }

    @Test
    @DisplayName("작성자가 아니면 댓글을 삭제할 수 없다")
    void deleteCommentThrowsWhenUserIsNotAuthor() {
        Comment comment = new Comment(1L, 1L, "원본 댓글");
        given(commentRepository.findById(10L)).willReturn(Optional.of(comment));

        assertThatThrownBy(() -> commentService.deleteComment(10L, 2L))
                .isInstanceOf(CommunityException.class)
                .hasMessageContaining("해당 작업을 수행할 권한이 없습니다.");
    }

    @Test
    @DisplayName("다른 사람 게시글에 댓글을 달면 작성자와 게시글 주인 모두 보상을 받는다")
    void createCommentGrantsRewardsForDifferentUsers() {
        Post post = new Post(1L, "제목", "내용", null);
        Comment savedComment = new Comment(1L, 2L, "댓글");
        User commenter = new User("commenter@test.com", "encoded", "commenter", null);

        given(postRepository.findById(1L)).willReturn(Optional.of(post));
        given(userRepository.findById(2L)).willReturn(Optional.of(commenter));
        given(commentRepository.save(any(Comment.class))).willReturn(savedComment);

        commentService.createComment(1L, 2L, "댓글");

        then(rewardService).should().grant(2L, RewardType.COMMENT_CREATED);
        then(rewardService).should().grant(1L, RewardType.COMMENT_RECEIVED);
    }

    @Test
    @DisplayName("답글을 작성하면 부모 댓글 번호가 저장된다")
    void createReplyStoresParentCommentId() {
        Post post = new Post(1L, "제목", "내용", null);
        Comment parentComment = new Comment(1L, 1L, "원댓글");
        Comment savedReply = new Comment(1L, 2L, "답글", 10L);
        User replier = new User("reply@test.com", "encoded", "replier", null);

        given(postRepository.findById(1L)).willReturn(Optional.of(post));
        given(userRepository.findById(2L)).willReturn(Optional.of(replier));
        given(commentRepository.findById(10L)).willReturn(Optional.of(parentComment));
        given(commentRepository.save(any(Comment.class))).willReturn(savedReply);

        commentService.createComment(1L, 2L, "답글", 10L);

        ArgumentCaptor<Comment> commentCaptor = ArgumentCaptor.forClass(Comment.class);
        then(commentRepository).should().save(commentCaptor.capture());
        assertThat(commentCaptor.getValue().getParentCommentId()).isEqualTo(10L);
    }
}
