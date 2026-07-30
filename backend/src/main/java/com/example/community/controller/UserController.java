package com.example.community.controller;

import com.example.community.domain.User;
import com.example.community.dto.request.LoginRequest;
import com.example.community.dto.request.PasswordUpdateRequest;
import com.example.community.dto.request.SignupRequest;
import com.example.community.dto.request.UserUpdateRequest;
import com.example.community.dto.response.LoginResponse;
import com.example.community.dto.response.PostResponse;
import com.example.community.dto.response.UserProfileResponse;
import com.example.community.jwt.JwtUtil;
import com.example.community.service.PostService;
import com.example.community.service.UserService;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/users")
public class UserController {

    private final UserService userService;
    private final PostService postService;
    private final JwtUtil jwtUtil;

    public UserController(UserService userService, PostService postService, JwtUtil jwtUtil) {
        this.userService = userService;
        this.postService = postService;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/signup")
    public ResponseEntity<UserProfileResponse> signup(@Valid @RequestBody SignupRequest request) {
        User user = userService.signup(
                request.getEmail(),
                request.getPassword(),
                request.getNickname(),
                request.getProfileImage()
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(userService.toProfileResponse(user));
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        User user = userService.login(
                request.getEmail(),
                request.getPassword()
        );

        String token = jwtUtil.createToken(user.getId(), user.getEmail());
        return ResponseEntity.ok(userService.toLoginResponse(user, token));
    }

    @PostMapping("/logout")
    public ResponseEntity<String> logout(@AuthenticationPrincipal Long userId) {
        // JWT는 서버가 상태를 안 들고 있으므로, 로그아웃은 프론트에서 토큰을 지우는 것으로 처리
        String message = userService.logout(userId);
        return ResponseEntity.ok(message);
    }

    @GetMapping("/me")
    public ResponseEntity<UserProfileResponse> getMyInfo(@AuthenticationPrincipal Long userId) {
        UserProfileResponse user = userService.getMyInfo(userId);
        return ResponseEntity.ok(user);
    }

    @PatchMapping("/me")
    public ResponseEntity<UserProfileResponse> updateUser(
            @AuthenticationPrincipal Long userId,
            @Valid @RequestBody UserUpdateRequest request
    ) {
        UserProfileResponse user = userService.updateUser(
                userId,
                request.getNickname(),
                request.getProfileImage()
        );
        return ResponseEntity.ok(user);
    }

    @PatchMapping("/me/password")
    public ResponseEntity<UserProfileResponse> updatePassword(
            @AuthenticationPrincipal Long userId,
            @Valid @RequestBody PasswordUpdateRequest request
    ) {
        UserProfileResponse user = userService.updatePassword(
                userId,
                request.getCurrentPassword(),
                request.getPassword()
        );
        return ResponseEntity.ok(user);
    }

    @GetMapping("/me/posts")
    public ResponseEntity<List<PostResponse>> getMyPosts(@AuthenticationPrincipal Long userId) {
        return ResponseEntity.ok(postService.getPostsByUserId(userId));
    }

    @PostMapping("/me/items/{itemCode}/purchase")
    public ResponseEntity<UserProfileResponse> purchaseItem(
            @AuthenticationPrincipal Long userId,
            @PathVariable String itemCode
    ) {
        return ResponseEntity.ok(userService.purchaseItem(userId, itemCode));
    }

    @PostMapping("/me/items/{itemCode}/equip")
    public ResponseEntity<UserProfileResponse> equipItem(
            @AuthenticationPrincipal Long userId,
            @PathVariable String itemCode
    ) {
        return ResponseEntity.ok(userService.equipItem(userId, itemCode));
    }

    @PostMapping("/me/items/{itemCode}/unequip")
    public ResponseEntity<UserProfileResponse> unequipItem(
            @AuthenticationPrincipal Long userId,
            @PathVariable String itemCode
    ) {
        return ResponseEntity.ok(userService.unequipItem(userId, itemCode));
    }
}
