# 게시글 목록 API Payload 최적화

## 1. 작업 목적

게시글 목록 API는 여러 게시글을 한 번에 내려준다. 기존 구조에서는 게시글 목록 응답에도 원본 이미지 base64 문자열이 포함될 수 있었다.

이미지 base64는 문자열 길이가 매우 길기 때문에 게시글이 많아질수록 다음 문제가 생긴다.

- `/posts` 응답 크기 증가
- 검색 결과 로딩 지연
- 브라우저 JSON 파싱 비용 증가
- 목록 화면 렌더링 지연
- Docker/Nginx 환경에서 API 응답 처리 부담 증가

따라서 고, 상목록에서는 원본 이미지를 제외하세 페이지에서만 원본 이미지를 내려주도록 구조를 분리했다.

## 2. 수정 파일

```text
backend/src/main/java/com/example/community/service/PostService.java
```

## 3. 변경 전 구조

기존에는 게시글 목록 조회와 상세 조회가 모두 같은 `toResponse` 변환 메서드를 사용했다.

```java
return posts.stream()
        .map(this::toResponse)
        .toList();
```

이 방식은 목록 화면에서도 `post.getImage()`가 응답에 포함될 수 있어, 이미지가 많은 게시글 목록에서는 API payload가 급격히 커진다.

## 4. 변경 후 구조

목록 조회는 `toListResponse`를 사용하도록 변경했다.

```java
return posts.stream()
        .map(this::toListResponse)
        .toList();
```

내 게시글 목록도 같은 방식으로 변경했다.

```java
public List<PostResponse> getPostsByUserId(Long userId) {
    return postRepository.findByUserIdOrderByIdDesc(userId).stream()
            .map(this::toListResponse)
            .toList();
}
```

## 5. 핵심 코드

`toResponse`에 이미지 포함 여부를 선택할 수 있는 파라미터를 추가했다.

```java
private PostResponse toResponse(Post post) {
    return toResponse(post, true);
}

private PostResponse toListResponse(Post post) {
    // 목록 화면에서는 원본 base64 이미지를 제외해 응답 payload를 가볍게 유지한다.
    return toResponse(post, false);
}

private PostResponse toResponse(Post post, boolean includeImage) {
    User author = userRepository.findById(post.getUserId()).orElse(null);
    long likeCount = postLikeRepository.countByPostId(post.getId());
    long commentCount = commentRepository.countByPostId(post.getId());

    return new PostResponse(
            post.getId(),
            post.getUserId(),
            post.getTitle(),
            post.getContent(),
            includeImage ? post.getImage() : null,
            post.getCreatedAt(),
            post.getViewCount(),
            likeCount,
            commentCount,
            author == null ? "작성자" : author.getNickname(),
            author == null ? null : author.getProfileImage()
    );
}
```

## 6. 적용 범위

이미지를 제외한 가벼운 응답:

```text
GET /posts
GET /posts?keyword=검색어
GET /users/{userId}/posts
```

원본 이미지를 포함하는 상세 응답:

```text
GET /posts/{postId}
```

## 7. 기대 효과

- 게시글 목록 API 응답 크기 감소
- 검색 기능 반응성 개선
- 목록 화면 JSON 파싱 비용 감소
- 프론트엔드 초기 렌더링 부담 감소
- 추후 S3 이미지 URL 또는 썸네일 구조로 전환하기 쉬운 기반 확보

## 8. 한계와 다음 개선 방향

이번 작업은 목록 응답에서 원본 이미지를 제외하는 방식이다. 따라서 목록 화면에서 이미지를 계속 보여주려면 별도의 썸네일 필드가 필요하다.

다음 단계에서는 이미지 저장 구조를 S3로 전환하고, DB에는 원본 이미지 파일이 아니라 이미지 URL 또는 썸네일 URL만 저장하는 방식으로 개선할 수 있다.

포트폴리오 문장으로는 다음처럼 설명할 수 있다.

```text
게시글 목록 API에서 원본 base64 이미지를 제외하고 상세 조회에서만 원본 이미지를 제공하도록 응답 구조를 분리하여, 목록 조회 및 검색 화면의 payload 크기와 렌더링 부담을 줄였습니다.
```

