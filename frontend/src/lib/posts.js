import { formatCount, formatDate, getImageCandidate, getProfileImageCandidate } from "./ui.js";

export function normalizeSearchKeyword(value) {
  return String(value ?? "").trim();
}

export function getPostOwnerId(post) {
  return post?.userId ?? post?.authorId ?? post?.writerId ?? null;
}

export function filterPostsByOwner(posts, user) {
  const currentUserId = user?.id ?? user?.userId;

  if (currentUserId === undefined || currentUserId === null) {
    return [];
  }

  return (Array.isArray(posts) ? posts : []).filter((post) => {
    const postUserId = getPostOwnerId(post);
    return String(postUserId ?? "") === String(currentUserId);
  });
}

export function getPostCardViewModel(post = {}) {
  const likes = post.likeCount ?? post.likes ?? 0;
  const comments = post.commentCount ?? post.comments ?? 0;
  const views = post.viewCount ?? post.views ?? 0;
  const authorName = post.authorNickname ?? post.nickname ?? post.writerNickname ?? "작성자";

  return {
    id: post.id,
    title: post.title || "제목 없음",
    likeLabel: formatCount(likes),
    commentLabel: formatCount(comments),
    viewLabel: formatCount(views),
    authorName,
    authorProfileImage: getProfileImageCandidate(post.authorProfileImage ?? post.profileImage),
    postImage: getImageCandidate(post.image),
    formattedDate: formatDate(post.createdAt, true),
  };
}
