package com.example.community.dto.response;

public class FarmerItemResponse {

    private final String code;
    private final String name;
    private final int price;
    private final boolean purchased;
    private final boolean equipped;

    public FarmerItemResponse(String code, String name, int price, boolean purchased, boolean equipped) {
        this.code = code;
        this.name = name;
        this.price = price;
        this.purchased = purchased;
        this.equipped = equipped;
    }

    public String getCode() {
        return code;
    }

    public String getName() {
        return name;
    }

    public int getPrice() {
        return price;
    }

    public boolean isPurchased() {
        return purchased;
    }

    public boolean isEquipped() {
        return equipped;
    }
}
