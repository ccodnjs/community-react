import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import useLegacyPage from "../hooks/useLegacyPage";
import { fetchFarmers } from "../lib/api";
import { getEquippedItemLabels, sortFarmersForCurrentUser } from "../lib/farmers";
import { getProfileImageCandidate, getUserLabel } from "../lib/ui";

function FarmerAvatar({ farmer }) {
  const profileImage = getProfileImageCandidate(farmer?.profileImage);
  const nickname = farmer?.nickname || "토마토 농부";

  if (profileImage) {
    return (
      <img
        className="farmer-avatar-image"
        src={profileImage}
        alt={`${nickname} 프로필`}
        loading="lazy"
        decoding="async"
      />
    );
  }

  return <span className="farmer-avatar-image farmer-avatar-fallback">{getUserLabel(nickname)}</span>;
}

function EquippedItems({ items }) {
  const labels = getEquippedItemLabels(items);

  if (labels.length === 0) {
    return <span className="farmer-empty-item">장착 아이템 없음</span>;
  }

  return labels.map((label) => (
    <span className="farmer-item-chip" key={label}>
      {label}
    </span>
  ));
}

export default function FarmersPage() {
  useLegacyPage("/legacy/farmers.css?v=20260805-avatar", "토마토 키우기 - 토마토 밭 구경하기");

  const navigate = useNavigate();
  const { token, user } = useAuth();
  const [farmers, setFarmers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadFarmers() {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const result = await fetchFarmers(token);
        setFarmers(Array.isArray(result) ? result : []);
      } catch (error) {
        setErrorMessage(error.message || "토마토 밭 목록을 불러오지 못했습니다.");
      } finally {
        setIsLoading(false);
      }
    }

    loadFarmers();
  }, [token]);

  const currentUserId = user?.id ?? user?.userId;
  const sortedFarmers = sortFarmersForCurrentUser(farmers, user);

  const headerProfileImage = getProfileImageCandidate(user?.profileImage);

  return (
    <div className="page farmers-page">
      <header className="header">
        <div className="header-inner">
          <button className="back-button" type="button" onClick={() => navigate("/posts")}>
            &lt;
          </button>

          <h1 className="header-title">토마토 키우기</h1>

          <button className="profile-button" type="button" onClick={() => navigate("/profile")}>
            {headerProfileImage ? (
              <img alt="프로필 이미지" className="profile-image" src={headerProfileImage} decoding="async" />
            ) : (
              <span className="profile-image profile-fallback">{getUserLabel(user?.nickname || user?.email || "T")}</span>
            )}
          </button>
        </div>
      </header>

      <main className="farmers-main">
        <section className="farmers-hero">
          <p className="farmers-label">tomato neighbors</p>
          <h2 className="farmers-title">토마토 밭 구경하기</h2>
          <p className="farmers-description">
            다른 농부들의 프로필과 토마토 성장 상태를 둘러보는 공간이에요.
          </p>

          <div className="farmers-action-row">
            <button className="farmers-primary-button" type="button" onClick={() => navigate("/posts")}>
              토마토 목록으로
            </button>
            <button className="farmers-secondary-button" type="button" onClick={() => navigate("/write")}>
              토마토 심기
            </button>
          </div>
        </section>

        <section className="farmers-board">
          <div className="farmers-board-title">🍅 가입한 토마토 농부들</div>

          {isLoading ? <p className="farmers-message">농부 목록을 불러오는 중이에요.</p> : null}
          {!isLoading && errorMessage ? <p className="farmers-message">{errorMessage}</p> : null}
          {!isLoading && !errorMessage && sortedFarmers.length === 0 ? (
            <p className="farmers-message">아직 구경할 토마토 밭이 없어요.</p>
          ) : null}

          <div className="farmer-grid">
            {sortedFarmers.map((farmer) => {
              const isMine = String(farmer.id ?? "") === String(currentUserId ?? "");

              return (
                <article className={`farmer-card${isMine ? " mine" : ""}`} key={farmer.id}>
                  {isMine ? <span className="mine-ribbon">내 밭</span> : null}

                  <div className="farmer-avatar">
                    <FarmerAvatar farmer={farmer} />
                  </div>

                  <div className="farmer-info">
                    <h3 className="farmer-name">{farmer.nickname || "토마토 농부"}</h3>
                    <span className="farmer-stage">{farmer.growthStage || "씨앗"}</span>
                  </div>

                  <div className="farmer-stats">
                    <span>햇빛 {Number(farmer.sunlight || 0)}</span>
                    <span>토마토 {Number(farmer.myPostCount || 0)}</span>
                  </div>

                  <div className="farmer-items" aria-label="장착 아이템">
                    <EquippedItems items={farmer.equippedItems} />
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}
