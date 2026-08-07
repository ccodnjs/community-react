import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getProfileImageCandidate, getUserLabel } from "../lib/ui";

function ProfileAvatar({ user, imageClassName = "profile-image" }) {
  const profileImage = getProfileImageCandidate(user?.profileImage);
  const nickname = user?.nickname || user?.email || "토마토 농부";

  if (profileImage) {
    return <img src={profileImage} alt={`${nickname} 프로필`} className={imageClassName} decoding="async" />;
  }

  return <span className={`${imageClassName} profile-fallback`}>{getUserLabel(nickname)}</span>;
}

export default function LegacyHeader({
  title = "토마토 키우기",
  user,
  variant = "default",
  showBack = false,
  onBack,
}) {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  function handleBack() {
    if (onBack) {
      onBack();
      return;
    }

    navigate(-1);
  }

  if (variant === "simple") {
    return (
      <header className="header">
        <h1 className="header-title">{title}</h1>
      </header>
    );
  }

  const shouldShowMenu = variant === "menu";

  return (
    <header className="header">
      <div className="header-inner">
        {showBack ? (
          <button className="back-button" type="button" onClick={handleBack}>
            &lt;
          </button>
        ) : (
          <div className="header-left" aria-hidden="true" />
        )}

        <h1 className="header-title">{title}</h1>

        {shouldShowMenu ? (
          <div className="profile-menu-wrapper">
            <button
              className="profile-button"
              id="profileMenuButton"
              type="button"
              onClick={() => setIsMenuOpen((current) => !current)}
            >
              <ProfileAvatar user={user} imageClassName="header-profile-image" />
            </button>

            <div className={`profile-dropdown${isMenuOpen ? " show" : ""}`} id="profileDropdown">
              <button
                type="button"
                id="profileEditMoveButton"
                onClick={() => {
                  setIsMenuOpen(false);
                  navigate("/profile");
                }}
              >
                회원정보수정
              </button>
              <button
                type="button"
                id="passwordEditMoveButton"
                onClick={() => {
                  setIsMenuOpen(false);
                  navigate("/profile/password");
                }}
              >
                비밀번호수정
              </button>
              <button
                type="button"
                id="logoutButton"
                onClick={() => {
                  setIsMenuOpen(false);
                  navigate("/profile");
                }}
              >
                로그아웃
              </button>
            </div>
          </div>
        ) : (
          <button className="profile-button" type="button" onClick={() => navigate("/profile")}>
            <ProfileAvatar user={user} imageClassName="profile-image" />
          </button>
        )}
      </div>
    </header>
  );
}
