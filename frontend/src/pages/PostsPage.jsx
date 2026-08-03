import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import PostCard from "../components/PostCard";
import { useAuth } from "../contexts/AuthContext";
import useLegacyPage from "../hooks/useLegacyPage";
import { fetchPosts } from "../lib/api";
import { getProfileImageCandidate, getUserLabel } from "../lib/ui";

export default function PostsPage({ onlyMine = false }) {
  useLegacyPage("/legacy/posts.css?v=20260803-signpost", `토마토 키우기 - ${onlyMine ? "내 토마토 밭" : "게시글 목록"}`);

  const navigate = useNavigate();
  const { token, user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");

  useEffect(() => {
    async function loadPosts() {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const result = await fetchPosts(token, searchKeyword);
        setPosts(Array.isArray(result) ? result : []);
      } catch (error) {
        setErrorMessage(error.message || "게시글 목록을 불러오지 못했습니다.");
      } finally {
        setIsLoading(false);
      }
    }

    loadPosts();
  }, [searchKeyword, token]);

  function handleSearchSubmit(event) {
    event.preventDefault();

    const nextKeyword = searchInput.trim();
    setSearchInput(nextKeyword);
    setSearchKeyword(nextKeyword);
  }

  function handleSearchReset() {
    setSearchInput("");
    setSearchKeyword("");
  }

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

          <form className="post-search-form" onSubmit={handleSearchSubmit}>
            <label className="post-search-label" htmlFor="postSearchInput">
              토마토 찾기
            </label>

            <div className="post-search-row">
              <input
                className="post-search-input"
                id="postSearchInput"
                type="search"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="제목이나 내용으로 검색해보세요"
              />

              <button className="post-search-button" type="submit">
                검색
              </button>

              {searchKeyword ? (
                <button className="post-search-reset" type="button" onClick={handleSearchReset}>
                  전체 보기
                </button>
              ) : null}
            </div>
          </form>

          {!isLoading && !errorMessage && searchKeyword ? (
            <p className="search-result-message">
              “{searchKeyword}” 검색 결과 {filteredPosts.length}개
            </p>
          ) : null}

          {isLoading ? <p className="empty-message">게시글을 불러오는 중이에요.</p> : null}
          {!isLoading && errorMessage ? <p className="empty-message">{errorMessage}</p> : null}
          {!isLoading && !errorMessage && filteredPosts.length === 0 ? (
            <p className="empty-message" id="emptyMessage">
              {searchKeyword
                ? "검색 결과가 없어요. 다른 단어로 다시 찾아보세요!"
                : onlyMine
                  ? "아직 내가 심은 토마토가 없어요."
                  : "아직 심어진 토마토가 없어요. 첫 번째 토마토를 남겨보세요!"}
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
