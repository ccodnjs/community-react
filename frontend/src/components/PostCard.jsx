import { memo } from "react";
import { Link } from "react-router-dom";
import { getPostCardViewModel } from "../lib/posts";
import { getUserLabel } from "../lib/ui";

function PostCard({ post }) {
  const {
    title,
    likeLabel,
    commentLabel,
    viewLabel,
    authorName,
    authorProfileImage,
    postImage,
    formattedDate,
  } = getPostCardViewModel(post);

  return (
    <Link to={`/posts/${post.id}`} className="post-card">
      <div className="post-card-top">
        <h2 className="post-title">{title}</h2>

        {postImage ? (
          <div className="post-image-preview">
            <img src={postImage} alt="게시글 이미지" className="post-thumbnail" loading="lazy" decoding="async" />
          </div>
        ) : null}

        <div className="post-info-row">
          <div className="post-counts">
            <span>좋아요 {likeLabel}</span>
            <span>조회수 {viewLabel}</span>
            <span>댓글 {commentLabel}</span>
          </div>

          <span className="post-date">{formattedDate}</span>

          <div className="post-author">
            {authorProfileImage ? (
              <img src={authorProfileImage} alt={`${authorName} 프로필`} loading="lazy" decoding="async" />
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

export default memo(PostCard);
