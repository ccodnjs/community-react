import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import PostCard from "../components/PostCard";
import { useAuth } from "../contexts/AuthContext";
import useLegacyPage from "../hooks/useLegacyPage";
import { fetchPosts } from "../lib/api";
import { getProfileImageCandidate, getUserLabel } from "../lib/ui";

const INTRO_MESSAGES = [
  ["치킨 먹은 거 아닙니다.", "토마토 비료 줬습니다."],
  ["오늘도 다이어트 실패.", "내일의 내가 책임지겠지."],
  ["운동은 안 했지만", "배달은 빨랐습니다."],
  ["칼로리는 기록 안 하면", "없는 거 아닌가요?"],
  ["오늘 먹은 건", "다 토마토 성장에 투자했습니다."],
  ["침대가 절 먼저 안 놔줬어요."],
  ["일어나려고 했는데", "이불이 불법 감금 중입니다."],
  ["오늘도 생산적인 하루였습니다."],
  ["알람이 울렸습니다.", "무시했습니다."],
  ["내일의 저를 믿습니다.", "오늘의 저는 쉽니다."],
  ["오늘도 배는 불렀는데", "입은 심심했습니다."],
  ["배달앱이 먼저", "저를 찾아왔습니다."],
  ["야식은 죄가 없습니다.", "시간이 문제죠."],
  ["토마토도 가끔은", "치킨이 먹고 싶습니다."],
  ["입은 그만 먹자는데", "손이 말을 안 듣네요."],
  ["오늘도 아무것도 안 했는데", "피곤했습니다."],
  ["할 일은 많은데", "의욕이 퇴근했습니다."],
  ["계획은 세웠습니다.", "실행은 내일 합니다."],
  ["오늘도 살아남았으니", "성공입니다."],
  ["월요일이 또 왔네요.", "신고합니다."],
  ["릴스 하나만 보려고 했습니다.", "해가 졌습니다."],
  ["이번 달은 아껴 쓰겠습니다.", "할인은 안 사면 손해잖아요?"],
  ["통장은 울고 있는데", "장바구니는 웃고 있습니다."],
  ["돈은 사라졌지만", "택배는 옵니다."],
  ["익은 건 토마토인데", "타는 건 내 통장."],
  ["오늘도 물 대신", "커피를 먹었습니다."],
  ["토마토도 현생이 힘듭니다."],
  ["오늘은 광합성 대신", "침대 합성했습니다."],
  ["토마토도 출근하기 싫어요."],
  ["물은 안 줘도", "스트레스는 잘 줍니다."],
  ["오늘도 무럭무럭...", "살이 자라는 중."],
  ["토마토는 빨개졌고", "저는 지쳐갔습니다."],
  ["햇빛보다", "휴대폰 불빛을 더 많이 봤습니다."],
  ["토마토인데", "케첩이 되고 싶진 않습니다."],
];

export default function PostsPage({ onlyMine = false }) {
  useLegacyPage("/legacy/posts.css?v=20260805-clean-search-panel", `토마토 키우기 - ${onlyMine ? "내 토마토 밭" : "게시글 목록"}`);

  const navigate = useNavigate();
  const { token, user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [introMessageIndex, setIntroMessageIndex] = useState(0);

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

  useEffect(() => {
    if (onlyMine) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setIntroMessageIndex((currentIndex) => (currentIndex + 1) % INTRO_MESSAGES.length);
    }, 4200);

    return () => window.clearInterval(timer);
  }, [onlyMine]);

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
                <span className="intro-message-rotator" aria-live="polite">
                  <span className="intro-message" key={introMessageIndex}>
                    {INTRO_MESSAGES[introMessageIndex].map((line) => (
                      <span className="intro-message-line" key={line}>
                        {line}
                      </span>
                    ))}
                  </span>
                </span>
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

          <button className="farmers-scarecrow-button" type="button" onClick={() => navigate("/farmers")} aria-label="토마토 밭 구경하기">
            <span className="scarecrow-bubble">토마토 밭 구경</span>
            <span className="scarecrow-figure" aria-hidden="true">
              <span className="scarecrow-hat" />
              <span className="scarecrow-head" />
              <span className="scarecrow-arm" />
              <span className="scarecrow-body" />
              <span className="scarecrow-stick" />
            </span>
          </button>
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
