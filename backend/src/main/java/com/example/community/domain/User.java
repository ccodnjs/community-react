package com.example.community.domain;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.Table;

import java.util.Arrays;
import java.util.LinkedHashSet;
import java.util.Set;
import java.util.stream.Collectors;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String email;
    private String password;
    private String nickname;

    @Lob
    private String profileImage;
    private Integer sunlight;
    private String purchasedItems;
    private String equippedItems;

    protected User() {
    }

    public User(String email, String password, String nickname, String profileImage) {
        this.email = email;
        this.password = password;
        this.nickname = nickname;
        this.profileImage = profileImage;
        this.sunlight = 0;
        this.purchasedItems = "";
        this.equippedItems = "";
    }

    public void update(String nickname, String profileImage) {
        this.nickname = nickname;
        this.profileImage = profileImage;
    }

    public void updatePassword(String password) {
        this.password = password;
    }

    public void addSunlight(int amount) {
        if (amount <= 0) {
            return;
        }

        this.sunlight = getSunlight() + amount;
    }

    public void purchaseItem(String itemCode, int price) {
        if (hasPurchasedItem(itemCode)) {
            throw new IllegalArgumentException("이미 구매한 아이템입니다.");
        }

        if (getSunlight() < price) {
            throw new IllegalArgumentException("햇빛이 부족합니다.");
        }

        this.sunlight = getSunlight() - price;

        Set<String> items = getPurchasedItemSet();
        items.add(itemCode);
        this.purchasedItems = joinItems(items);
    }

    public void equipItem(String itemCode) {
        if (!hasPurchasedItem(itemCode)) {
            throw new IllegalArgumentException("구매한 아이템만 장착할 수 있습니다.");
        }

        Set<String> items = new LinkedHashSet<>();
        items.add(itemCode);
        this.equippedItems = joinItems(items);
    }

    public void unequipItem(String itemCode) {
        if (!hasEquippedItem(itemCode)) {
            throw new IllegalArgumentException("현재 장착 중인 아이템이 아닙니다.");
        }

        this.equippedItems = "";
    }

    public boolean hasPurchasedItem(String itemCode) {
        return getPurchasedItemSet().contains(itemCode);
    }

    public boolean hasEquippedItem(String itemCode) {
        return getEquippedItemSet().contains(itemCode);
    }

    public Set<String> getPurchasedItemSet() {
        return parseItems(purchasedItems);
    }

    public Set<String> getEquippedItemSet() {
        return parseItems(equippedItems);
    }

    public Long getId() {
        return id;
    }

    public String getEmail() {
        return email;
    }

    public String getPassword() {
        return password;
    }

    public String getNickname() {
        return nickname;
    }

    public String getProfileImage() {
        return profileImage;
    }

    public Integer getSunlight() {
        return sunlight == null ? 0 : sunlight;
    }

    public String getPurchasedItems() {
        return purchasedItems;
    }

    public String getEquippedItems() {
        return equippedItems;
    }

    private Set<String> parseItems(String value) {
        if (value == null || value.isBlank()) {
            return new LinkedHashSet<>();
        }

        return Arrays.stream(value.split(","))
                .map(String::trim)
                .filter(item -> !item.isBlank())
                .collect(Collectors.toCollection(LinkedHashSet::new));
    }

    private String joinItems(Set<String> items) {
        return items.stream()
                .filter(item -> item != null && !item.isBlank())
                .collect(Collectors.joining(","));
    }
}
