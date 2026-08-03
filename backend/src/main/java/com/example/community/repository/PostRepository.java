package com.example.community.repository;

import com.example.community.domain.Post;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PostRepository extends JpaRepository<Post, Long> {

    List<Post> findByUserIdOrderByIdDesc(Long userId);

    List<Post> findAllByOrderByIdDesc();

    List<Post> findByTitleContainingIgnoreCaseOrContentContainingIgnoreCaseOrderByIdDesc(
            String titleKeyword,
            String contentKeyword
    );
}
