package com.example.community.service;

import com.example.community.domain.User;
import com.example.community.dto.response.UserProfileResponse;
import com.example.community.exception.CommunityException;
import com.example.community.repository.PostRepository;
import com.example.community.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserServiceRewardTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PostRepository postRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    private UserService userService;

    @BeforeEach
    void setUp() {
        userService = new UserService(userRepository, postRepository, passwordEncoder);
    }

    @Test
    void growthStageChangesBySunlight() {
        User user = new User("test@email.com", "encoded", "tester", null);
        user.addSunlight(75);

        assertThat(userService.getGrowthStage(user)).isEqualTo("노란 토마토");
    }

    @Test
    void purchaseItemSpendsSunlight() {
        User user = new User("test@email.com", "encoded", "tester", null);
        user.addSunlight(52);

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(postRepository.findByUserId(1L)).thenReturn(List.of());
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        UserProfileResponse response = userService.purchaseItem(1L, "FARMER_GLOVES");

        assertThat(response.getSunlight()).isEqualTo(2);
        assertThat(response.getPurchasedItems()).contains("FARMER_GLOVES");
    }

    @Test
    void equipRequiresPurchasedItem() {
        User user = new User("test@email.com", "encoded", "tester", null);

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));

        assertThatThrownBy(() -> userService.equipItem(1L, "STRAW_HAT"))
                .isInstanceOf(CommunityException.class)
                .hasMessageContaining("구매한 아이템만 장착할 수 있습니다.");
    }

    @Test
    void updatePasswordRequiresCurrentPasswordMatch() {
        User user = new User("test@email.com", "encoded", "tester", null);

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrong", "encoded")).thenReturn(false);

        assertThatThrownBy(() -> userService.updatePassword(1L, "wrong", "nextPassword"))
                .isInstanceOf(CommunityException.class);
    }
}
