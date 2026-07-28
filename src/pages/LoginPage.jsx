import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import useLegacyPage from "../hooks/useLegacyPage";

const INITIAL_FORM = {
  email: "",
  password: "",
};

export default function LoginPage() {
  useLegacyPage("/legacy/login.css", "토마토 키우기 - 로그인");

  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState(INITIAL_FORM);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  const isActive = Boolean(form.email.trim() && form.password.trim() && !isSubmitting);

  async function handleSubmit(event) {
    event.preventDefault();
    setErrorMessage("");

    if (!form.email.trim() || !form.password.trim()) {
      setErrorMessage("이메일과 비밀번호를 모두 입력해주세요.");
      return;
    }

    setIsSubmitting(true);

    try {
      await login({
        email: form.email.trim(),
        password: form.password.trim(),
      });

      navigate("/posts", { replace: true });
    } catch (error) {
      setErrorMessage(error.message || "로그인에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="login-page">
      <section className="seed-packet">
        <div className="packet-hole" />

        <div className="packet-header">
          <p className="packet-small-text">HOME GROWN TOMATO</p>
          <h1 className="packet-title">토마토 키우기</h1>
          <p className="packet-subtitle">tomato diary seeds</p>
        </div>

        <div className="tomato-illustration" aria-hidden="true">
          <div className="tomato-leaf" />
          <div className="tomato-body">
            <span className="seed seed-one" />
            <span className="seed seed-two" />
            <span className="seed seed-three" />
            <span className="seed seed-four" />
          </div>
        </div>

        <section className="login-section">
          <h2 className="login-title">로그인</h2>

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="input-group">
              <label htmlFor="emailInput">이메일</label>
              <input
                type="text"
                id="emailInput"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="이메일을 입력하세요"
              />
              <p className="helper-text" />
            </div>

            <div className="input-group">
              <label htmlFor="passwordInput">비밀번호</label>
              <input
                type="password"
                id="passwordInput"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="비밀번호를 입력하세요"
              />
              <p className="helper-text" />
            </div>

            <p className="helper-text login-helper">{errorMessage}</p>

            <button type="submit" id="loginButton" className="login-button" disabled={!isActive}>
              {isSubmitting ? "로그인 중..." : "로그인"}
            </button>

            <button type="button" id="signupMoveButton" className="signup-button" onClick={() => navigate("/signup")}>
              씨앗 봉투 만들기
            </button>
          </form>
        </section>

        <div className="packet-footer">
          <span>🍅 grow your little thoughts</span>
        </div>
      </section>
    </main>
  );
}
