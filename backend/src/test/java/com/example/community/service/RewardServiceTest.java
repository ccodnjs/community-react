package com.example.community.service;

import com.example.community.domain.User;
import com.example.community.exception.CommunityException;
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
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class RewardServiceTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private RewardService rewardService;

    @Test
    @DisplayName("보상 서비스는 정책에 맞는 햇빛을 지급한다")
    void grantAddsSunlightByRewardType() {
        User user = new User("test@test.com", "encoded", "tester", null);
        given(userRepository.findById(1L)).willReturn(Optional.of(user));
        given(userRepository.save(any(User.class))).willAnswer(invocation -> invocation.getArgument(0));

        rewardService.grant(1L, RewardType.POST_CREATED);

        ArgumentCaptor<User> captor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(captor.capture());
        assertThat(captor.getValue().getSunlight()).isEqualTo(10);
    }

    @Test
    @DisplayName("보상 대상 사용자가 없으면 예외가 발생한다")
    void grantThrowsWhenUserDoesNotExist() {
        given(userRepository.findById(99L)).willReturn(Optional.empty());

        assertThatThrownBy(() -> rewardService.grant(99L, RewardType.POST_CREATED))
                .isInstanceOf(CommunityException.class)
                .hasMessageContaining("회원을 찾을 수 없습니다.");
    }
}
