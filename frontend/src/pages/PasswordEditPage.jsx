import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import useLegacyPage from "../hooks/useLegacyPage";
import { updateMyPassword } from "../lib/api";
import { getProfileImageCandidate, getUserLabel } from "../lib/ui";

const INITIAL_FORM = {
  currentPassword: "",
  password: "",
  passwordCheck: "",
};

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,20}$/;

export default function PasswordEditPage() {
  useLegacyPage("/legacy/password-edit.css", "토마토 키우기 - 비밀번호 수정");

  const navigate = useNavigate();
  const { token, user, logout } = useAuth();
  const [form, setForm] = useState(INITIAL_FORM);
  const [helpers, setHelpers] = useState({
    currentPassword: "",
    password: "",
    passwordCheck: "",
    success: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  const isActive =
    Boolean(form.currentPassword.trim() && form.password.trim() && form.passwordCheck.trim()) &&
    !isSubmitting;
  const profileImage = getProfileImageCandidate(user?.profileImage);

  async function handleSubmit(event) {
    event.preventDefault();
    const nextHelpers = {
      currentPassword: "",
      password: "",
      passwordCheck: "",
      success: "",
    };

    if (!form.currentPassword.trim()) {
      nextHelpers.currentPassword = "현재 비밀번호를 입력해주세요.";
    }

    if (!PASSWORD_REGEX.test(form.password)) {
      nextHelpers.password = "새 비밀번호는 8~20자이며 대소문자, 숫자, 특수문자를 포함해야 합니다.";
    }

    if (form.password !== form.passwordCheck) {
      nextHelpers.passwordCheck = "새 비밀번호 확인이 일치하지 않습니다.";
    }

    if (nextHelpers.currentPassword || nextHelpers.password || nextHelpers.passwordCheck) {
      setHelpers(nextHelpers);
      return;
    }

    setIsSubmitting(true);

    try {
      await updateMyPassword(token, {
        currentPassword: form.currentPassword.trim(),
        password: form.password.trim(),
      });

      setHelpers({
        currentPassword: "",
        password: "",
        passwordCheck: "",
        success: "수정완료",
      });
      setForm(INITIAL_FORM);
      window.setTimeout(() => {
        navigate("/posts", { replace: true });
      }, 900);
    } catch (error) {
      setHelpers({
        currentPassword: error.message || "비밀번호 수정에 실패했습니다.",
        password: "",
        passwordCheck: "",
        success: "",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <div className="page">
      <div className="farm-deco deco-seed seed-left" aria-hidden="true" />
      <div className="farm-deco deco-seed seed-right" aria-hidden="true" />
      <div className="farm-deco deco-tomato tomato-left" aria-hidden="true" />
      <div className="farm-deco deco-tomato tomato-right" aria-hidden="true" />
      <div className="farm-deco deco-leaf leaf-left" aria-hidden="true" />
      <div className="farm-deco deco-leaf leaf-right" aria-hidden="true" />
      <div className="farm-deco deco-stake stake-left" aria-hidden="true" />
      <div className="farm-deco deco-stake stake-right" aria-hidden="true" />

      <header className="header">
        <div className="header-inner">
          <button className="back-button" id="backButton" type="button" onClick={() => navigate("/profile")}>
            &lt;
          </button>

          <h1 className="header-title">토마토 키우기</h1>

          <div className="profile-menu-wrapper">
            <button className="profile-button" id="profileMenuButton" type="button" onClick={() => setIsMenuOpen((current) => !current)}>
              {profileImage ? (
                <img alt="프로필 이미지" className="profile-image" src={profileImage} decoding="async" />
              ) : (
                <span className="profile-image profile-fallback">{getUserLabel(user?.nickname || user?.email || "T")}</span>
              )}
            </button>

            <div className={`profile-dropdown${isMenuOpen ? " show" : ""}`} id="profileDropdown">
              <button type="button" id="profileEditMoveButton" onClick={() => navigate("/profile")}>
                회원정보수정
              </button>
              <button type="button" id="passwordEditMoveButton">
                비밀번호수정
              </button>
              <button type="button" id="logoutButton" onClick={handleLogout}>
                로그아웃
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="main">
        <section className="password-card">
          <div className="card-tape" aria-hidden="true" />

          <div className="card-label">
            <span>🔐 secret seed box</span>
          </div>

          <div className="seed-lock" aria-hidden="true">
            <div className="lock-shackle" />

            <div className="lock-body">
              <span className="lock-seed seed-one" />
              <span className="lock-seed seed-two" />
              <span className="lock-seed seed-three" />
            </div>
          </div>

          <h2 className="page-title">비밀번호 수정</h2>

          <p className="page-subtitle">
            토마토 농부의 비밀 씨앗 보관함을
            <br />
            새 비밀번호로 잠가주세요.
          </p>

          <form className="password-form" id="passwordEditForm" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="currentPasswordInput" className="form-label">현재 비밀번호</label>

              <input
                type="password"
                id="currentPasswordInput"
                className="password-input"
                name="currentPassword"
                value={form.currentPassword}
                onChange={handleChange}
                placeholder="현재 비밀번호를 입력하세요"
              />

              <p className="helper-text" id="currentPasswordHelper">{helpers.currentPassword}</p>
            </div>

            <div className="form-group">
              <label htmlFor="passwordInput" className="form-label">새 비밀번호</label>

              <input
                type="password"
                id="passwordInput"
                className="password-input"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="새 비밀번호를 입력하세요"
              />

              <p className="helper-text" id="passwordHelper">{helpers.password}</p>
            </div>

            <div className="form-group">
              <label htmlFor="passwordCheckInput" className="form-label">새 비밀번호 확인</label>

              <input
                type="password"
                id="passwordCheckInput"
                className="password-input"
                name="passwordCheck"
                value={form.passwordCheck}
                onChange={handleChange}
                placeholder="새 비밀번호를 한 번 더 입력하세요"
              />

              <p className="helper-text" id="passwordCheckHelper">{helpers.passwordCheck}</p>
            </div>

            <button type="submit" className="submit-button" id="passwordSubmitButton" disabled={!isActive}>
              {isSubmitting ? "수정 중..." : "비밀 씨앗 잠그기"}
            </button>
          </form>
        </section>
      </main>

      <div className={`toast${helpers.success ? " show" : ""}`} id="toastMessage">
        {helpers.success || "수정완료"}
      </div>
    </div>
  );
}
