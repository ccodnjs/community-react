package com.example.community.service;

import com.example.community.domain.User;
import com.example.community.exception.CommunityException;
import com.example.community.repository.PostRepository;
import com.example.community.repository.UserRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PostRepository postRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private UserService userService;

    @Test
    @DisplayName("회원가입 시 비밀번호는 암호화되어 저장된다")
    void signupEncodesPassword() {
        given(userRepository.findByEmail("test@test.com")).willReturn(Optional.empty());
        given(passwordEncoder.encode("Password123!")).willReturn("encoded-password");
        given(userRepository.save(any(User.class))).willAnswer(invocation -> invocation.getArgument(0));

        User result = userService.signup(
                "test@test.com",
                "Password123!",
                "테스트유저",
                "profile-image"
        );

        ArgumentCaptor<User> captor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(captor.capture());

        assertThat(captor.getValue().getPassword()).isEqualTo("encoded-password");
        assertThat(result.getPassword()).isEqualTo("encoded-password");
    }

    @Test
    @DisplayName("회원가입 시 중복 이메일이면 예외가 발생한다")
    void signupThrowsWhenEmailAlreadyExists() {
        given(userRepository.findByEmail("test@test.com"))
                .willReturn(Optional.of(new User("test@test.com", "pw", "nick", "img")));

        assertThatThrownBy(() -> userService.signup(
                "test@test.com",
                "Password123!",
                "테스트유저",
                "profile-image"
        ))
                .isInstanceOf(CommunityException.class)
                .hasMessage("이미 사용 중인 이메일입니다.");
    }

    @Test
    @DisplayName("로그인 시 존재하지 않는 이메일이면 예외가 발생한다")
    void loginThrowsWhenUserDoesNotExist() {
        given(userRepository.findByEmail("missing@test.com")).willReturn(Optional.empty());

        assertThatThrownBy(() -> userService.login("missing@test.com", "Password123!"))
                .isInstanceOf(CommunityException.class)
                .hasMessage("이메일 또는 비밀번호가 올바르지 않습니다.");
    }

    @Test
    @DisplayName("로그인 시 비밀번호가 다르면 예외가 발생한다")
    void loginThrowsWhenPasswordDoesNotMatch() {
        User user = new User("test@test.com", "encoded-password", "테스트유저", "img");
        given(userRepository.findByEmail("test@test.com")).willReturn(Optional.of(user));
        given(passwordEncoder.matches("WrongPassword123!", "encoded-password")).willReturn(false);

        assertThatThrownBy(() -> userService.login("test@test.com", "WrongPassword123!"))
                .isInstanceOf(CommunityException.class)
                .hasMessage("이메일 또는 비밀번호가 올바르지 않습니다.");
    }

    @Test
    @DisplayName("비밀번호 수정 시 현재 비밀번호가 틀리면 403 예외가 발생한다")
    void updatePasswordThrowsWhenCurrentPasswordIsWrong() {
        User user = new User("test@test.com", "encoded-password", "테스트유저", "img");
        given(userRepository.findById(1L)).willReturn(Optional.of(user));
        given(passwordEncoder.matches("WrongPassword123!", "encoded-password")).willReturn(false);

        assertThatThrownBy(() -> userService.updatePassword(1L, "WrongPassword123!", "NewPassword123!"))
                .isInstanceOf(CommunityException.class)
                .hasMessageContaining("현재 비밀번호가 일치하지 않습니다.");
    }

    @Test
    @DisplayName("비밀번호 수정 시 새 비밀번호는 암호화되어 저장된다")
    void updatePasswordEncodesNewPassword() {
        User user = new User("test@test.com", "encoded-password", "테스트유저", "img");
        given(userRepository.findById(1L)).willReturn(Optional.of(user));
        given(passwordEncoder.matches("CurrentPassword123!", "encoded-password")).willReturn(true);
        given(passwordEncoder.encode("NewPassword123!")).willReturn("new-encoded-password");
        given(postRepository.findByUserId(1L)).willReturn(List.of());
        given(userRepository.save(any(User.class))).willAnswer(invocation -> invocation.getArgument(0));

        userService.updatePassword(1L, "CurrentPassword123!", "NewPassword123!");

        verify(passwordEncoder).matches("CurrentPassword123!", "encoded-password");
        verify(passwordEncoder).encode("NewPassword123!");
        verify(userRepository).save(eq(user));
        assertThat(user.getPassword()).isEqualTo("new-encoded-password");
    }
}
