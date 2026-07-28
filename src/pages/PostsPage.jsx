import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import PostCard from "../components/PostCard";
import { useAuth } from "../contexts/AuthContext";
import useLegacyPage from "../hooks/useLegacyPage";
import { fetchPosts } from "../lib/api";
import { getProfileImageCandidate, getUserLabel } from "../lib/ui";

export default function PostsPage({ onlyMine = false }) {
  useLegacyPage("/legacy/posts.css", `토마토 키우기 - ${onlyMine ? "내 토마토 밭" : "게시글 목록"}`);

  const navigate = useNavigate();
  const { token, user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadPosts() {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const result = await fetchPosts(token);
        setPosts(Array.isArray(result) ? result : []);
      } catch (error) {
        setErrorMessage(error.message || "게시글 목록을 불러오지 못했습니다.");
      } finally {
        setIsLoading(false);
      }
    }

    loadPosts();
  }, [token]);

  const filteredPosts = useMemo(() => {
    if (!onlyMine) {
      return posts;
    }

    const currentUserId = user?.id ?? user?.userId;

    return posts.filter((post) => {
      const postUserId = post.userId ?? post.authorId ?? post.writerId;
      return String(postUserId ?? "") === String(currentUserId ?? "");
    });
  }, [onlyMine, posts, user]);

  const profileImage = getProfileImageCandidate(user?.profileImage);

  return (
    <div className="page">
      <header className="header">
        <div className="header-inner">
          <div className="header-left" />

          <h1 className="header-title">토마토 키우기</h1>

          <button className="profile-button" id="profileButton" type="button" onClick={() => navigate("/profile")}>
            {profileImage ? (
              <img alt="프로필 이미지" className="profile-image" id="headerProfileImage" src={profileImage} />
            ) : (
              <span className="profile-image profile-fallback">{getUserLabel(user?.nickname || user?.email || "T")}</span>
            )}
          </button>
        </div>
      </header>

      <main className="posts-main">
        <section className="intro-section">
          <div className="intro-card">
            <p className="intro-label">tomato diary</p>

            <h2 className="intro-title" id="introTitle">
              {onlyMine ? (
                <>
                  내가 심은 토마토,
                  <br />
                  한눈에 모아보기
                </>
              ) : (
                <>
                  안녕하세요,
                  <br />
                  기록해서 토마토를 키워보세요!
                </>
              )}
            </h2>

            <p className="intro-description" id="introDescription">
              {onlyMine ? (
                <>
                  내가 남긴 기록만 모아서
                  <br />
                  토마토 밭처럼 확인해보세요.
                </>
              ) : (
                <>
                  오늘의 감정, 생각, 아무 말까지
                  <br />
                  작은 토마토처럼 하나씩 남겨보세요.
                </>
              )}
            </p>

            <div className="intro-button-row">
              <button className="write-button" id="writePostButton" type="button" onClick={() => navigate("/write")}>
                토마토 심기
              </button>

              <button className="garden-button" id="myGardenButton" type="button" onClick={() => navigate(onlyMine ? "/posts" : "/my-posts")}>
                {onlyMine ? "전체 토마토 보기" : "내 토마토 밭 보기"}
              </button>
            </div>
          </div>
        </section>

        <section className="post-list-section">
          <div className="garden-label" id="gardenLabel">
            {onlyMine ? "🍅 내 토마토 밭" : "🍅 토마토 목록"}
          </div>

          {isLoading ? <p className="empty-message">게시글을 불러오는 중이에요.</p> : null}
          {!isLoading && errorMessage ? <p className="empty-message">{errorMessage}</p> : null}
          {!isLoading && !errorMessage && filteredPosts.length === 0 ? (
            <p className="empty-message" id="emptyMessage">
              {onlyMine ? "아직 내가 심은 토마토가 없어요." : "아직 심어진 토마토가 없어요. 첫 번째 토마토를 남겨보세요!"}
            </p>
          ) : null}

          <div className="post-list" id="postList">
            {filteredPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
