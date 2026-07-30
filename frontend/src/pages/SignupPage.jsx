import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import useLegacyPage from "../hooks/useLegacyPage";
import { convertImageToOptimizedDataUrl } from "../lib/ui";

const INITIAL_FORM = {
  email: "",
  password: "",
  passwordCheck: "",
  nickname: "",
  profileImage: "",
};

const EMPTY_HELPERS = {
  profile: "",
  email: "",
  password: "",
  passwordCheck: "",
  nickname: "",
  general: "",
};

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,20}$/;

export default function SignupPage() {
  useLegacyPage("/legacy/signup.css", "토마토 키우기 - 회원가입");

  const navigate = useNavigate();
  const { signup } = useAuth();
  const [form, setForm] = useState(INITIAL_FORM);
  const [helpers, setHelpers] = useState(EMPTY_HELPERS);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleProfileChange(event) {
    const nextFile = event.target.files?.[0] ?? null;

    if (!nextFile) {
      setForm((current) => ({
        ...current,
        profileImage: "",
      }));
      return;
    }

    try {
      const imageDataUrl = await convertImageToOptimizedDataUrl(nextFile, 480, 0.82);
      setForm((current) => ({
        ...current,
        profileImage: imageDataUrl,
      }));
      setHelpers((current) => ({
        ...current,
        profile: "",
      }));
    } catch (error) {
      setHelpers((current) => ({
        ...current,
        profile: "프로필 이미지를 다시 선택해주세요.",
      }));
    }
  }

  function clearProfileImage() {
    setForm((current) => ({
      ...current,
      profileImage: "",
    }));
  }

  const isActive =
    Boolean(
      form.email.trim() &&
        form.password.trim() &&
        form.passwordCheck.trim() &&
        form.nickname.trim()
    ) && !isSubmitting;

  async function handleSubmit(event) {
    event.preventDefault();
    const nextHelpers = { ...EMPTY_HELPERS };

    if (!form.email.includes("@") || !form.email.includes(".")) {
      nextHelpers.email = "올바른 이메일 형식을 입력해주세요.";
    }

    if (!PASSWORD_REGEX.test(form.password)) {
      nextHelpers.password = "비밀번호는 8~20자이며 대소문자, 숫자, 특수문자를 포함해야 합니다.";
    }

    if (form.password !== form.passwordCheck) {
      nextHelpers.passwordCheck = "비밀번호 확인이 일치하지 않습니다.";
    }

    if (!form.nickname.trim() || form.nickname.includes(" ") || form.nickname.trim().length > 10) {
      nextHelpers.nickname = "닉네임은 공백 없이 10자 이하로 입력해주세요.";
    }

    setHelpers(nextHelpers);

    if (Object.values(nextHelpers).some(Boolean)) {
      return;
    }

    setIsSubmitting(true);

    try {
      await signup({
        email: form.email.trim(),
        password: form.password.trim(),
        nickname: form.nickname.trim(),
        profileImage: form.profileImage,
      });

      navigate("/login", { replace: true });
    } catch (error) {
      setHelpers((current) => ({
        ...current,
        general: error.message || "회원가입에 실패했습니다.",
      }));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="signup-page">
      <section className="seed-packet">
        <div className="packet-hole" />

        <div className="packet-header">
          <p className="packet-small-text">START YOUR TOMATO DIARY</p>
          <h1 className="packet-title">씨앗 봉투 만들기</h1>
          <p className="packet-subtitle">grow your own tomato notes</p>
        </div>

        <section className="signup-content">
          <h2 className="page-title">회원가입</h2>

          <form onSubmit={handleSubmit}>
            <section className="profile-section">
              <p className="profile-title">프로필 사진</p>

              <div
                id="profilePreview"
                className={`profile-preview${form.profileImage ? " has-image" : ""}`}
              >
                {form.profileImage ? (
                  <img src={form.profileImage} alt="프로필 미리보기" className="signup-preview-image" />
                ) : (
                  <span className="profile-plus">+</span>
                )}
              </div>

              <div className="profile-button-area">
                <label htmlFor="profileInput" id="profileUploadBtn" className="profile-button">
                  사진 등록
                </label>
                <input type="file" id="profileInput" accept="image/*" hidden onChange={handleProfileChange} />

                <button type="button" id="profileDeleteBtn" className="profile-button delete" onClick={clearProfileImage}>
                  삭제
                </button>
              </div>

              <p id="profileHelper" className="helper-text">{helpers.profile}</p>
            </section>

            <section className="form-group">
              <label htmlFor="emailInput">이메일</label>
              <input
                type="text"
                id="emailInput"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="이메일을 입력해주세요."
              />
              <p id="emailHelper" className="helper-text">{helpers.email}</p>
            </section>

            <section className="form-group">
              <label htmlFor="passwordInput">비밀번호</label>
              <input
                type="password"
                id="passwordInput"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="비밀번호를 입력해주세요."
              />
              <p id="passwordHelper" className="helper-text">{helpers.password}</p>
            </section>

            <section className="form-group">
              <label htmlFor="passwordCheckInput">비밀번호 확인</label>
              <input
                type="password"
                id="passwordCheckInput"
                name="passwordCheck"
                value={form.passwordCheck}
                onChange={handleChange}
                placeholder="비밀번호를 한 번 더 입력해주세요."
              />
              <p id="passwordCheckHelper" className="helper-text">{helpers.passwordCheck}</p>
            </section>

            <section className="form-group">
              <label htmlFor="nicknameInput">닉네임</label>
              <input
                type="text"
                id="nicknameInput"
                name="nickname"
                value={form.nickname}
                onChange={handleChange}
                placeholder="닉네임을 입력해주세요."
              />
              <p id="nicknameHelper" className="helper-text">{helpers.nickname || helpers.general}</p>
            </section>

            <button type="submit" id="signupButton" className="signup-button" disabled={!isActive}>
              {isSubmitting ? "가입 중..." : "씨앗 심기"}
            </button>

            <p className="login-link">
              이미 씨앗 봉투가 있으신가요? <Link to="/login">로그인</Link>
            </p>
          </form>
        </section>
      </section>
    </main>
  );
}
