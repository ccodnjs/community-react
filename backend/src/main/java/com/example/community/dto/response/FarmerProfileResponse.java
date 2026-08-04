package com.example.community.dto.response;

import java.util.List;

public class FarmerProfileResponse {

    private final Long id;
    private final String nickname;
    private final String profileImage;
    private final int sunlight;
    private final String growthStage;
    private final List<String> equippedItems;
    private final long myPostCount;

    public FarmerProfileResponse(
            Long id,
            String nickname,
            String profileImage,
            int sunlight,
            String growthStage,
            List<String> equippedItems,
            long myPostCount
    ) {
        this.id = id;
        this.nickname = nickname;
        this.profileImage = profileImage;
        this.sunlight = sunlight;
        this.growthStage = growthStage;
        this.equippedItems = equippedItems;
        this.myPostCount = myPostCount;
    }

    public Long getId() {
        return id;
    }

    public String getNickname() {
        return nickname;
    }

    public String getProfileImage() {
        return profileImage;
    }

    public int getSunlight() {
        return sunlight;
    }

    public String getGrowthStage() {
        return growthStage;
    }

    public List<String> getEquippedItems() {
        return equippedItems;
    }

    public long getMyPostCount() {
        return myPostCount;
    }
}
