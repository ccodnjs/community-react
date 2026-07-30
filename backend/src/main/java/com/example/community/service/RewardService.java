package com.example.community.service;

import com.example.community.domain.User;
import com.example.community.exception.CommunityException;
import com.example.community.exception.ErrorCode;
import com.example.community.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class RewardService {

    private final UserRepository userRepository;

    public RewardService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Transactional
    public void grant(Long userId, RewardType rewardType) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CommunityException(ErrorCode.USER_NOT_FOUND));

        user.addSunlight(rewardType.getAmount());
        userRepository.save(user);
    }
}
