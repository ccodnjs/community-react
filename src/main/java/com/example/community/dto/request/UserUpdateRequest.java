package com.example.community.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class UserUpdateRequest {
    @NotBlank(message = "닉네임을 입력해주세요.")
    @Size(max = 10, message = "닉네임은 최대 10자까지 작성 가능합니다.")
    @Pattern(regexp = "^\\S+$", message = "닉네임에는 공백을 포함할 수 없습니다.")
    private String nickname;
    private String profileImage;

    public String getNickname(){
        return nickname;
    }
    public String getProfileImage() {
        return profileImage;
    }
}
