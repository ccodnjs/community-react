import { Link } from "react-router-dom";
import { formatCount, formatDate, getImageCandidate, getProfileImageCandidate, getUserLabel } from "../lib/ui";

export default function PostCard({ post }) {
  const title = post.title || "제목 없음";
  const likes = post.likeCount ?? post.likes ?? 0;
  const comments = post.commentCount ?? post.comments ?? 0;
  const views = post.viewCount ?? post.views ?? 0;
  const authorName = post.authorNickname ?? post.nickname ?? post.writerNickname ?? "작성자";
  const authorProfileImage = getProfileImageCandidate(post.authorProfileImage ?? post.profileImage);
  const postImage = getImageCandidate(post.image);

  return (
    <Link to={`/posts/${post.id}`} className="post-card">
      <div className="post-card-top">
        <h2 className="post-title">{title}</h2>

        {postImage ? (
          <div className="post-image-preview">
            <img src={postImage} alt="게시글 이미지" className="post-thumbnail" />
          </div>
        ) : null}

        <div className="post-info-row">
          <div className="post-counts">
            <span>좋아요 {formatCount(likes)}</span>
            <span>조회수 {formatCount(views)}</span>
            <span>댓글 {formatCount(comments)}</span>
          </div>

          <span className="post-date">{formatDate(post.createdAt, true)}</span>

          <div className="post-author">
            {authorProfileImage ? (
              <img src={authorProfileImage} alt={`${authorName} 프로필`} />
            ) : (
              <span className="post-author-fallback">{getUserLabel(authorName)}</span>
            )}
            <span className="author-name">{authorName}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
