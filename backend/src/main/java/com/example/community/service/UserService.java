package com.example.community.service;

import com.example.community.domain.User;
import com.example.community.dto.response.FarmerItemResponse;
import com.example.community.dto.response.LoginResponse;
import com.example.community.dto.response.UserProfileResponse;
import com.example.community.exception.CommunityException;
import com.example.community.exception.ErrorCode;
import com.example.community.repository.PostRepository;
import com.example.community.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PostRepository postRepository;
    private final PasswordEncoder passwordEncoder;

    private static final Map<String, ItemInfo> ITEM_CATALOG = Map.ofEntries(
            Map.entry("STRAW_HAT", new ItemInfo("밀짚모자", 20)),
            Map.entry("RED_BOOTS", new ItemInfo("빨간 장화", 25)),
            Map.entry("GREEN_APRON", new ItemInfo("토마토 앞치마", 25)),
            Map.entry("TOMATO_BAG", new ItemInfo("토마토 가방", 30)),
            Map.entry("WATERING_CAN", new ItemInfo("토마토 펫", 30)),
            Map.entry("SMALL_SHOVEL", new ItemInfo("작은 삽", 18)),
            Map.entry("TOMATO_HAIRPIN", new ItemInfo("토마토 머리핀", 18)),
            Map.entry("FARMER_GLOVES", new ItemInfo("새싹 머리핀", 15))
    );

    public UserService(
            UserRepository userRepository,
            PostRepository postRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.userRepository = userRepository;
        this.postRepository = postRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public User signup(String email, String password, String nickname, String profileImage) {
        String normalizedEmail = email.trim();
        String normalizedNickname = nickname.trim();

        userRepository.findByEmail(normalizedEmail).ifPresent(user -> {
            throw new CommunityException(ErrorCode.EMAIL_ALREADY_EXISTS);
        });

        User user = new User(
                normalizedEmail,
                passwordEncoder.encode(password),
                normalizedNickname,
                profileImage
        );

        return userRepository.save(user);
    }

    @Transactional(readOnly = true)
    public User login(String email, String password) {
        User user = userRepository.findByEmail(email.trim())
                .orElseThrow(() -> new CommunityException(ErrorCode.INVALID_LOGIN));

        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new CommunityException(ErrorCode.INVALID_LOGIN);
        }

        return user;
    }

    @Transactional(readOnly = true)
    public UserProfileResponse getMyInfo(Long userId) {
        return toProfileResponse(findUser(userId));
    }

    @Transactional
    public UserProfileResponse updateUser(Long userId, String nickname, String profileImage) {
        User user = findUser(userId);

        user.update(nickname.trim(), profileImage);
        return toProfileResponse(userRepository.save(user));
    }

    @Transactional
    public UserProfileResponse updatePassword(Long userId, String currentPassword, String password) {
        User user = findUser(userId);

        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new CommunityException(ErrorCode.CURRENT_PASSWORD_MISMATCH);
        }

        user.updatePassword(passwordEncoder.encode(password));
        return toProfileResponse(userRepository.save(user));
    }

    @Transactional
    public UserProfileResponse purchaseItem(Long userId, String itemCode) {
        User user = findUser(userId);
        ItemInfo itemInfo = getItemInfo(itemCode);

        if (user.hasPurchasedItem(itemCode)) {
            throw new CommunityException(ErrorCode.ITEM_ALREADY_PURCHASED);
        }

        if (user.getSunlight() < itemInfo.price()) {
            throw new CommunityException(ErrorCode.INSUFFICIENT_SUNLIGHT);
        }

        user.purchaseItem(itemCode, itemInfo.price());
        return toProfileResponse(userRepository.save(user));
    }

    @Transactional
    public UserProfileResponse equipItem(Long userId, String itemCode) {
        User user = findUser(userId);
        getItemInfo(itemCode);

        if (!user.hasPurchasedItem(itemCode)) {
            throw new CommunityException(ErrorCode.ITEM_NOT_PURCHASED);
        }

        user.equipItem(itemCode);
        return toProfileResponse(userRepository.save(user));
    }

    @Transactional
    public UserProfileResponse unequipItem(Long userId, String itemCode) {
        User user = findUser(userId);
        getItemInfo(itemCode);

        if (!user.hasEquippedItem(itemCode)) {
            throw new CommunityException(ErrorCode.ITEM_NOT_EQUIPPED);
        }

        user.unequipItem(itemCode);
        return toProfileResponse(userRepository.save(user));
    }

    @Transactional(readOnly = true)
    public String logout(Long userId) {
        findUser(userId);
        return "로그아웃 되었습니다.";
    }

    @Transactional(readOnly = true)
    public String getGrowthStage(User user) {
        int sunlight = user.getSunlight();

        if (sunlight < 20) {
            return "씨앗";
        }
        if (sunlight < 40) {
            return "새싹";
        }
        if (sunlight < 70) {
            return "초록 토마토";
        }
        if (sunlight < 100) {
            return "노란 토마토";
        }
        if (sunlight < 140) {
            return "잘 익은 토마토";
        }
        return "토마토 농부";
    }

    @Transactional(readOnly = true)
    public UserProfileResponse toProfileResponse(User user) {
        List<FarmerItemResponse> itemShop = new ArrayList<>();
        long myPostCount = postRepository.findByUserId(user.getId()).size();

        for (Map.Entry<String, ItemInfo> entry : ITEM_CATALOG.entrySet()) {
            String code = entry.getKey();
            ItemInfo info = entry.getValue();

            itemShop.add(new FarmerItemResponse(
                    code,
                    info.name(),
                    info.price(),
                    user.hasPurchasedItem(code),
                    user.hasEquippedItem(code)
            ));
        }

        return new UserProfileResponse(
                user.getId(),
                user.getEmail(),
                user.getNickname(),
                user.getProfileImage(),
                user.getSunlight(),
                getGrowthStage(user),
                new ArrayList<>(user.getPurchasedItemSet()),
                new ArrayList<>(user.getEquippedItemSet()),
                itemShop,
                myPostCount
        );
    }

    @Transactional(readOnly = true)
    public LoginResponse toLoginResponse(User user, String token) {
        return new LoginResponse(
                user.getId(),
                user.getEmail(),
                user.getNickname(),
                user.getProfileImage(),
                user.getSunlight(),
                getGrowthStage(user),
                new ArrayList<>(user.getPurchasedItemSet()),
                new ArrayList<>(user.getEquippedItemSet()),
                postRepository.findByUserId(user.getId()).size(),
                token
        );
    }

    @Transactional(readOnly = true)
    public long getMyPostCount(Long userId) {
        return postRepository.findByUserId(userId).size();
    }

    private User findUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new CommunityException(ErrorCode.USER_NOT_FOUND));
    }

    private ItemInfo getItemInfo(String itemCode) {
        ItemInfo itemInfo = ITEM_CATALOG.get(itemCode);

        if (itemInfo == null) {
            throw new CommunityException(ErrorCode.ITEM_NOT_FOUND);
        }

        return itemInfo;
    }

    private record ItemInfo(String name, int price) {
    }
}
