package com.example.community.controller;

import com.example.community.config.SecurityConfig;
import com.example.community.dto.response.UserProfileResponse;
import com.example.community.jwt.JwtUtil;
import com.example.community.service.PostService;
import com.example.community.service.UserService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Collections;
import java.util.List;

import static org.mockito.BDDMockito.given;
import static org.mockito.BDDMockito.then;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(UserController.class)
@Import(SecurityConfig.class)
class UserControllerSecurityTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private UserService userService;

    @MockBean
    private PostService postService;

    @MockBean
    private JwtUtil jwtUtil;

    @Test
    @DisplayName("비밀번호 수정은 인증된 현재 사용자로만 처리된다")
    void updatePasswordUsesAuthenticatedUser() throws Exception {
        String requestBody = """
                {
                  "currentPassword": "CurrentPassword123!",
                  "password": "NewPassword123!"
                }
                """;

        given(userService.updatePassword(1L, "CurrentPassword123!", "NewPassword123!"))
                .willReturn(new UserProfileResponse(
                        1L,
                        "test@test.com",
                        "nick",
                        null,
                        0,
                        "씨앗",
                        List.of(),
                        List.of(),
                        List.of(),
                        0L
                ));

        mockMvc.perform(patch("/users/me/password")
                        .with(authentication(
                                new UsernamePasswordAuthenticationToken(1L, null, Collections.emptyList())
                        ))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isOk());

        then(userService).should().updatePassword(1L, "CurrentPassword123!", "NewPassword123!");
    }

    @Test
    @DisplayName("비밀번호 수정은 인증이 없으면 접근할 수 없다")
    void updatePasswordRequiresAuthentication() throws Exception {
        mockMvc.perform(patch("/users/me/password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "currentPassword": "CurrentPassword123!",
                                  "password": "NewPassword123!"
                                }
                                """))
                .andExpect(status().isForbidden());
    }
}
