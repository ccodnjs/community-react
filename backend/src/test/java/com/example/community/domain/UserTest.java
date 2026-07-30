package com.example.community.domain;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class UserTest {

    @Test
    @DisplayName("User 객체를 생성할 수 있다")
    void createUser() {
        // given
        String email = "test@test.com";
        String password = "password123!";
        String nickname = "테스트유저";
        String profileImage = "default-profile.png";

        // when
        User user = new User(email, password, nickname, profileImage);

        // then
        assertThat(user.getEmail()).isEqualTo(email);
        assertThat(user.getPassword()).isEqualTo(password);
        assertThat(user.getNickname()).isEqualTo(nickname);
        assertThat(user.getProfileImage()).isEqualTo(profileImage);
    }

    @Test
    @DisplayName("회원 닉네임과 프로필 이미지를 수정할 수 있다")
    void updateUser() {
        // given
        User user = new User(
                "test@test.com",
                "password123!",
                "기존닉네임",
                "old-profile.png"
        );

        // when
        user.update("수정닉네임", "new-profile.png");

        // then
        assertThat(user.getNickname()).isEqualTo("수정닉네임");
        assertThat(user.getProfileImage()).isEqualTo("new-profile.png");

        assertThat(user.getEmail()).isEqualTo("test@test.com");
        assertThat(user.getPassword()).isEqualTo("password123!");
    }

    @Test
    @DisplayName("회원 비밀번호를 수정할 수 있다")
    void updatePassword() {
        // given
        User user = new User(
                "test@test.com",
                "oldPassword123!",
                "테스트유저",
                "default-profile.png"
        );

        // when
        user.updatePassword("newPassword123!");

        // then
        assertThat(user.getPassword()).isEqualTo("newPassword123!");

        assertThat(user.getEmail()).isEqualTo("test@test.com");
        assertThat(user.getNickname()).isEqualTo("테스트유저");
        assertThat(user.getProfileImage()).isEqualTo("default-profile.png");
    }
}