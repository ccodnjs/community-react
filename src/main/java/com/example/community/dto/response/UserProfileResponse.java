package com.example.community.dto.response;

import java.util.List;

public class UserProfileResponse {

    private final Long id;
    private final String email;
    private final String nickname;
    private final String profileImage;
    private final int sunlight;
    private final String growthStage;
    private final List<String> purchasedItems;
    private final List<String> equippedItems;
    private final List<FarmerItemResponse> itemShop;
    private final long myPostCount;

    public UserProfileResponse(
            Long id,
            String email,
            String nickname,
            String profileImage,
            int sunlight,
            String growthStage,
            List<String> purchasedItems,
            List<String> equippedItems,
            List<FarmerItemResponse> itemShop,
            long myPostCount
    ) {
        this.id = id;
        this.email = email;
        this.nickname = nickname;
        this.profileImage = profileImage;
        this.sunlight = sunlight;
        this.growthStage = growthStage;
        this.purchasedItems = purchasedItems;
        this.equippedItems = equippedItems;
        this.itemShop = itemShop;
        this.myPostCount = myPostCount;
    }

    public Long getId() {
        return id;
    }

    public String getEmail() {
        return email;
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

    public List<String> getPurchasedItems() {
        return purchasedItems;
    }

    public List<String> getEquippedItems() {
        return equippedItems;
    }

    public List<FarmerItemResponse> getItemShop() {
        return itemShop;
    }

    public long getMyPostCount() {
        return myPostCount;
    }
}
