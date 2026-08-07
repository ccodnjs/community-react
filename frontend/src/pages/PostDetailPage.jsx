import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import useLegacyPage from "../hooks/useLegacyPage";
import {
  createComment,
  deleteComment,
  deletePost,
  fetchComments,
  fetchPostDetail,
  fetchPostLikeStatus,
  likePost,
  unlikePost,
  updateComment,
} from "../lib/api";
import { formatDate, getImageCandidate, getProfileImageCandidate, getUserLabel } from "../lib/ui";

const VIEW_GUARD_MS = 3000;

function consumeInitialIncreaseView(postId) {
  try {
    const key = `post-detail-last-view:${postId}`;
    const now = Date.now();
    const previous = Number(sessionStorage.getItem(key) || 0);

    if (now - previous < VIEW_GUARD_MS) {
      return false;
    }

    sessionStorage.setItem(key, String(now));
    return true;
  } catch (error) {
    return true;
  }
}

function getCommentId(comment) {
  return comment.id ?? comment.commentId;
}

function getCommentParentId(comment) {
  return comment.parentCommentId ?? comment.parentId ?? null;
}

export default function PostDetailPage() {
  useLegacyPage("/legacy/post-detail.css?v=20260805-full-image", "토마토 키우기 - 게시글 상세");

  const navigate = useNavigate();
  const { postId } = useParams();
  const { token, user, refreshProfile } = useAuth();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [isLiked, setIsLiked] = useState(false);
  const [commentDraft, setCommentDraft] = useState("");
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingContent, setEditingContent] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [actionError, setActionError] = useState("");
  const [isLikeSubmitting, setIsLikeSubmitting] = useState(false);
  const [isCommentSubmitting, setIsCommentSubmitting] = useState(false);
  const [isReplySubmitting, setIsReplySubmitting] = useState(false);
  const [replyTargetId, setReplyTargetId] = useState(null);
  const [replyDraft, setReplyDraft] = useState("");
  const [busyCommentId, setBusyCommentId] = useState(null);

  const currentUserId = user?.id ?? user?.userId ?? null;
  const isOwner = useMemo(
    () => String(post?.userId ?? "") === String(currentUserId ?? ""),
    [currentUserId, post?.userId]
  );

  useEffect(() => {
    let isCancelled = false;

    async function loadPage() {
      setIsLoading(true);
      setPageError("");

      try {
        const shouldIncreaseView = consumeInitialIncreaseView(postId);
        const [postResult, commentsResult, likeResult] = await Promise.allSettled([
          fetchPostDetail(postId, shouldIncreaseView),
          fetchComments(postId),
          token ? fetchPostLikeStatus(token, postId) : Promise.resolve({ liked: false }),
        ]);

        if (postResult.status !== "fulfilled") {
          throw postResult.reason;
        }

        if (isCancelled) {
          return;
        }

        setPost(postResult.value);
        setComments(
          commentsResult.status === "fulfilled" && Array.isArray(commentsResult.value)
            ? commentsResult.value
            : []
        );
        setIsLiked(likeResult.status === "fulfilled" ? Boolean(likeResult.value?.liked) : false);
      } catch (error) {
        if (!isCancelled) {
          setPageError(error.message || "게시글을 불러오지 못했습니다.");
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }

    loadPage();
    return () => {
      isCancelled = true;
    };
  }, [postId, token]);

  async function refreshAllState() {
    const [nextPost, nextComments, nextLikeState] = await Promise.all([
      fetchPostDetail(postId, false),
      fetchComments(postId),
      token ? fetchPostLikeStatus(token, postId) : Promise.resolve({ liked: false }),
    ]);

    setPost(nextPost);
    setComments(Array.isArray(nextComments) ? nextComments : []);
    setIsLiked(Boolean(nextLikeState?.liked));
  }

  async function handleLikeToggle() {
    setActionError("");
    setIsLikeSubmitting(true);

    try {
      if (isLiked) {
        await unlikePost(token, postId);
      } else {
        await likePost(token, postId);
      }

      await refreshAllState();
    } catch (error) {
      setActionError(error.message || "좋아요 처리에 실패했습니다.");
    } finally {
      setIsLikeSubmitting(false);
    }
  }

  async function handleCreateComment() {
    setActionError("");

    if (!commentDraft.trim()) {
      setActionError("댓글 내용을 입력해주세요.");
      return;
    }

    setIsCommentSubmitting(true);

    try {
      await createComment(token, postId, {
        content: commentDraft.trim(),
      });
      setCommentDraft("");
      await refreshProfile();
      await refreshAllState();
    } catch (error) {
      setActionError(error.message || "댓글 등록에 실패했습니다.");
    } finally {
      setIsCommentSubmitting(false);
    }
  }

  async function handleCreateReply(parentCommentId) {
    setActionError("");

    if (!replyDraft.trim()) {
      setActionError("답글 내용을 입력해주세요.");
      return;
    }

    setIsReplySubmitting(true);
    setBusyCommentId(parentCommentId);

    try {
      await createComment(token, postId, {
        content: replyDraft.trim(),
        parentCommentId,
      });
      setReplyDraft("");
      setReplyTargetId(null);
      await refreshProfile();
      await refreshAllState();
    } catch (error) {
      setActionError(error.message || "답글 등록에 실패했습니다.");
    } finally {
      setIsReplySubmitting(false);
      setBusyCommentId(null);
    }
  }

  async function handleUpdateComment(commentId) {
    setActionError("");

    if (!editingContent.trim()) {
      setActionError("댓글 내용을 입력해주세요.");
      return;
    }

    setBusyCommentId(commentId);

    try {
      await updateComment(token, commentId, { content: editingContent.trim() });
      setEditingCommentId(null);
      setEditingContent("");
      await refreshAllState();
    } catch (error) {
      setActionError(error.message || "댓글 수정에 실패했습니다.");
    } finally {
      setBusyCommentId(null);
    }
  }

  async function handleDeleteComment(commentId) {
    if (!window.confirm("댓글을 삭제하시겠습니까?")) {
      return;
    }

    setActionError("");
    setBusyCommentId(commentId);

    try {
      await deleteComment(token, commentId, postId);
      await refreshAllState();
    } catch (error) {
      setActionError(error.message || "댓글 삭제에 실패했습니다.");
    } finally {
      setBusyCommentId(null);
    }
  }

  async function handleDeletePost() {
    if (!window.confirm("게시글을 삭제하시겠습니까?")) {
      return;
    }

    try {
      await deletePost(token, postId);
      navigate("/posts", { replace: true });
    } catch (error) {
      setActionError(error.message || "게시글 삭제에 실패했습니다.");
    }
  }

  if (isLoading) {
    return <div className="page-loader">게시글을 불러오는 중이에요...</div>;
  }

  if (pageError || !post) {
    return <div className="page-loader">{pageError || "게시글 정보를 확인할 수 없습니다."}</div>;
  }

  const postImage = getImageCandidate(post.image);
  const authorName = post.authorNickname || "작성자";
  const authorProfileImage = getProfileImageCandidate(post.authorProfileImage);
  const headerProfileImage = getProfileImageCandidate(user?.profileImage);
  const repliesByParentId = comments.reduce((replyMap, comment) => {
    const parentCommentId = getCommentParentId(comment);

    if (parentCommentId !== null) {
      const mapKey = String(parentCommentId);
      replyMap.set(mapKey, [...(replyMap.get(mapKey) || []), comment]);
    }

    return replyMap;
  }, new Map());
  const rootComments = comments.filter((comment) => getCommentParentId(comment) === null);

  function renderCommentItem(comment, { isReply = false } = {}) {
    const commentId = getCommentId(comment);
    const commentUserId = comment.userId ?? comment.authorId ?? comment.writerId;
    const isMyComment = String(commentUserId ?? "") === String(currentUserId ?? "");
    const commentAuthorName = comment.authorNickname || comment.nickname || "작성자";
    const commentProfileImage = getProfileImageCandidate(comment.authorProfileImage || comment.profileImage);
    const isEditing = editingCommentId === commentId;

    return (
      <div className={`comment-item${isReply ? " reply-item" : ""}`} key={commentId}>
        <div className="comment-top-row">
          <div className="comment-author-box">
            {commentProfileImage ? (
              <img
                src={commentProfileImage}
                alt="댓글 작성자 프로필"
                className="comment-author-profile"
                loading="lazy"
                decoding="async"
              />
            ) : (
              <span className="comment-author-profile author-profile--fallback">{getUserLabel(commentAuthorName)}</span>
            )}
            <strong className="comment-author-name">{commentAuthorName}</strong>
            <span className="comment-date">{formatDate(comment.createdAt, false)}</span>
          </div>

          {!isReply || isMyComment ? (
            <div className="comment-button-box">
              {!isReply && !isEditing ? (
                <button
                  className="outline-button comment-reply-button"
                  type="button"
                  onClick={() => {
                    setActionError("");
                    setEditingCommentId(null);
                    setEditingContent("");
                    setReplyDraft("");
                    setReplyTargetId(replyTargetId === commentId ? null : commentId);
                  }}
                >
                  {replyTargetId === commentId ? "닫기" : "답글"}
                </button>
              ) : null}

              {isMyComment ? (
                isEditing ? (
                  <>
                    <button className="outline-button comment-edit-button" type="button" onClick={() => handleUpdateComment(commentId)} disabled={busyCommentId === commentId}>
                      저장
                    </button>
                    <button className="outline-button comment-delete-button" type="button" onClick={() => { setEditingCommentId(null); setEditingContent(""); }}>
                      취소
                    </button>
                  </>
                ) : (
                  <>
                    <button className="outline-button comment-edit-button" type="button" onClick={() => { setReplyTargetId(null); setReplyDraft(""); setEditingCommentId(commentId); setEditingContent(comment.content || ""); }}>
                      수정
                    </button>
                    <button className="outline-button comment-delete-button" type="button" onClick={() => handleDeleteComment(commentId)} disabled={busyCommentId === commentId}>
                      삭제
                    </button>
                  </>
                )
              ) : null}
            </div>
          ) : null}
        </div>

        {isEditing ? (
          <textarea className="comment-input comment-edit-input" value={editingContent} onChange={(event) => setEditingContent(event.target.value)} />
        ) : (
          <p className="comment-content">{comment.content || ""}</p>
        )}
      </div>
    );
  }

  return (
    <div className="page">
      <div className="garden-vine vine-left" aria-hidden="true">
        <span className="vine-tomato tomato-one" />
        <span className="vine-tomato tomato-two" />
        <span className="vine-leaf leaf-one" />
        <span className="vine-leaf leaf-two" />
      </div>

      <div className="garden-vine vine-right" aria-hidden="true">
        <span className="vine-tomato tomato-one" />
        <span className="vine-tomato tomato-two" />
        <span className="vine-leaf leaf-one" />
        <span className="vine-leaf leaf-two" />
      </div>

      <div className="garden-stake stake-left" aria-hidden="true" />
      <div className="garden-stake stake-right" aria-hidden="true" />

      <header className="header">
        <div className="header-inner">
          <button className="back-button" id="backButton" type="button" onClick={() => navigate("/posts")}>
            &lt;
          </button>

          <h1 className="header-title">토마토 키우기</h1>

          <button className="profile-button" id="profileButton" type="button" onClick={() => navigate("/profile")}>
            {headerProfileImage ? (
              <img alt="프로필 이미지" className="profile-image" src={headerProfileImage} decoding="async" />
            ) : (
              <span className="profile-image profile-fallback">{getUserLabel(user?.nickname || user?.email || "T")}</span>
            )}
          </button>
        </div>
      </header>

      <main className="main">
        <section className="harvest-card">
          <div className="harvest-label">
            <span>🍅 grown tomato record</span>
          </div>

          <article className="post-card">
            <div className="tomato-badge" aria-hidden="true">
              <div className="tomato-leaf" />
              <div className="tomato-body">
                <span />
                <span />
                <span />
              </div>
            </div>

            <section className="post-header">
              <h2 className="post-title" id="postTitle">{post.title || "제목 없음"}</h2>

              <div className="post-meta-row">
                <div className="post-author-box">
                  {authorProfileImage ? (
                    <img
                      alt="작성자 프로필"
                      className="author-profile"
                      id="authorProfile"
                      src={authorProfileImage}
                      decoding="async"
                    />
                  ) : (
                    <span className="author-profile author-profile--fallback" id="authorProfile">{getUserLabel(authorName)}</span>
                  )}

                  <strong className="author-name" id="authorName">{authorName}</strong>

                  <span className="post-date" id="postDate">{formatDate(post.createdAt, false)}</span>
                </div>

                {isOwner ? (
                  <div className="post-button-box" id="postButtonBox">
                    <button className="outline-button" id="postEditButton" type="button" onClick={() => navigate(`/posts/${postId}/edit`)}>
                      수정
                    </button>
                    <button className="outline-button" id="postDeleteButton" type="button" onClick={handleDeletePost}>
                      삭제
                    </button>
                  </div>
                ) : null}
              </div>
            </section>

            <section className="post-body">
              {postImage ? (
                <img
                  className="post-image"
                  id="postImage"
                  src={postImage}
                  alt={`${post.title || "게시글"} 이미지`}
                  decoding="async"
                />
              ) : null}

              <p className="post-content" id="postContent">{post.content || ""}</p>

              <div className="count-box">
                <button className={`count-card${isLiked ? " liked" : ""}`} id="likeButton" type="button" onClick={handleLikeToggle} disabled={isLikeSubmitting}>
                  <strong id="likeCount">{post.likeCount ?? 0}</strong>
                  <span>좋아요수</span>
                </button>

                <div className="count-card">
                  <strong id="viewCount">{post.viewCount ?? 0}</strong>
                  <span>조회수</span>
                </div>

                <div className="count-card">
                  <strong id="commentCount">{post.commentCount ?? comments.length}</strong>
                  <span>댓글</span>
                </div>
              </div>
            </section>
          </article>

          <section className="comment-write-box">
            <div className="water-label">💧 water comment</div>

            <textarea
              id="commentInput"
              className="comment-input"
              placeholder="토마토가 잘 자라도록 댓글을 남겨주세요!"
              value={commentDraft}
              onChange={(event) => setCommentDraft(event.target.value)}
            />

            <div className="comment-button-row">
              <button
                id="commentSubmitButton"
                className={`comment-submit-button${commentDraft.trim() ? " active" : ""}`}
                type="button"
                disabled={!commentDraft.trim() || isCommentSubmitting}
                onClick={handleCreateComment}
              >
                {isCommentSubmitting ? "등록 중..." : "물 주기"}
              </button>
            </div>
          </section>

          {actionError ? <p className="helper-text detail-helper-text">{actionError}</p> : null}

          <section className="comment-list" id="commentList">
            {rootComments.length ? (
              rootComments.map((comment) => {
                const commentId = getCommentId(comment);
                const replies = repliesByParentId.get(String(commentId)) || [];
                const commentAuthorName = comment.authorNickname || comment.nickname || "작성자";

                return (
                  <div className="comment-thread" key={commentId}>
                    {renderCommentItem(comment)}

                    {replyTargetId === commentId ? (
                      <div className="reply-write-box">
                        <textarea
                          className="comment-input reply-input"
                          placeholder={`${commentAuthorName}님에게 답글을 남겨주세요.`}
                          value={replyDraft}
                          onChange={(event) => setReplyDraft(event.target.value)}
                        />

                        <div className="reply-button-row">
                          <button className="outline-button" type="button" onClick={() => { setReplyTargetId(null); setReplyDraft(""); }}>
                            취소
                          </button>
                          <button
                            className={`comment-submit-button${replyDraft.trim() ? " active" : ""}`}
                            type="button"
                            disabled={!replyDraft.trim() || isReplySubmitting}
                            onClick={() => handleCreateReply(commentId)}
                          >
                            {isReplySubmitting && busyCommentId === commentId ? "등록 중..." : "답글 물 주기"}
                          </button>
                        </div>
                      </div>
                    ) : null}

                    {replies.length ? (
                      <div className="reply-list">
                        {replies.map((reply) => renderCommentItem(reply, { isReply: true }))}
                      </div>
                    ) : null}
                  </div>
                );
              })
            ) : (
              <p className="comment-empty">아직 댓글이 없어요. 첫 물을 줘보세요!</p>
            )}
          </section>
        </section>
      </main>
    </div>
  );
}
