package com.example.community.repository;

import com.example.community.domain.User;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
class UserRepositoryTest {

    @Autowired
    private UserRepository userRepository;

    @Test
    @DisplayName("회원 저장 시 id가 생성된다")
    void saveGeneratesId() {
        User user = new User(
                "test@test.com",
                "password123!",
                "테스트유저",
                "default-profile.png"
        );

        User savedUser = userRepository.save(user);

        assertThat(savedUser.getId()).isNotNull();
    }

    @Test
    @DisplayName("회원 저장 후 이메일로 회원을 조회할 수 있다")
    void findByEmailSuccess() {
        User user = new User(
                "test@test.com",
                "password123!",
                "테스트유저",
                "default-profile.png"
        );

        userRepository.save(user);
        Optional<User> result = userRepository.findByEmail("test@test.com");

        assertThat(result).isPresent();
        assertThat(result.get().getEmail()).isEqualTo("test@test.com");
        assertThat(result.get().getNickname()).isEqualTo("테스트유저");
        assertThat(result.get().getProfileImage()).isEqualTo("default-profile.png");
    }

    @Test
    @DisplayName("존재하지 않는 이메일로 조회하면 빈 Optional을 반환한다")
    void findByEmailFail() {
        Optional<User> result = userRepository.findByEmail("none@test.com");

        assertThat(result).isEmpty();
    }
}
