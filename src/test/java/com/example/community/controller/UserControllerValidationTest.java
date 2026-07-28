package com.example.community.controller;

import com.example.community.config.SecurityConfig;
import com.example.community.exception.CommunityException;
import com.example.community.exception.ErrorCode;
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
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.nullable;
import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(UserController.class)
@Import(SecurityConfig.class)
class UserControllerValidationTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private UserService userService;

    @MockBean
    private PostService postService;

    @MockBean
    private JwtUtil jwtUtil;

    @Test
    @DisplayName("회원가입 요청값이 비어 있으면 검증 에러 형식으로 응답한다")
    void signupReturnsValidationErrorResponse() throws Exception {
        mockMvc.perform(post("/users/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "email": "",
                                  "password": "short",
                                  "nickname": ""
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("VALIDATION_ERROR"))
                .andExpect(jsonPath("$.fieldErrors.email").exists())
                .andExpect(jsonPath("$.fieldErrors.password").exists())
                .andExpect(jsonPath("$.fieldErrors.nickname").exists());
    }

    @Test
    @DisplayName("비즈니스 예외는 표준화된 에러 응답 형식으로 내려간다")
    void signupReturnsStandardizedBusinessErrorResponse() throws Exception {
        given(userService.signup(anyString(), anyString(), anyString(), nullable(String.class)))
                .willThrow(new CommunityException(ErrorCode.EMAIL_ALREADY_EXISTS));

        mockMvc.perform(post("/users/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "email": "test@test.com",
                                  "password": "Password123!",
                                  "nickname": "테스터",
                                  "profileImage": null
                                }
                                """))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("EMAIL_ALREADY_EXISTS"))
                .andExpect(jsonPath("$.message").value("이미 사용 중인 이메일입니다."))
                .andExpect(jsonPath("$.status").value(409));
    }
}
