import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import useLegacyPage from "../hooks/useLegacyPage";
import { createPost } from "../lib/api";
import { convertImageToOptimizedDataUrl, getProfileImageCandidate, getUserLabel } from "../lib/ui";

const INITIAL_FORM = {
  title: "",
  content: "",
  image: "",
};

export default function PostWritePage() {
  useLegacyPage("/legacy/post-write.css", "토마토 키우기 - 게시글 작성");

  const navigate = useNavigate();
  const { token, user, refreshProfile } = useAuth();
  const [form, setForm] = useState(INITIAL_FORM);
  const [selectedFileName, setSelectedFileName] = useState("토마토 사진을 선택해주세요.");
  const [titleError, setTitleError] = useState("");
  const [contentError, setContentError] = useState("");
  const [imageError, setImageError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleImageChange(event) {
    const file = event.target.files?.[0] ?? null;

    if (!file) {
      setForm((current) => ({
        ...current,
        image: "",
      }));
      setSelectedFileName("토마토 사진을 선택해주세요.");
      return;
    }

    try {
      const imageDataUrl = await convertImageToOptimizedDataUrl(file);
      setForm((current) => ({
        ...current,
        image: imageDataUrl,
      }));
      setSelectedFileName(file.name);
      setImageError("");
    } catch (error) {
      setImageError("이미지를 다시 선택해주세요.");
    }
  }

  const isActive = Boolean(form.title.trim() && form.content.trim() && !isSubmitting);
  const profileImage = getProfileImageCandidate(user?.profileImage);

  async function handleSubmit(event) {
    event.preventDefault();
    setTitleError("");
    setContentError("");
    setImageError("");

    if (!form.title.trim()) {
      setTitleError("제목을 입력해주세요.");
      return;
    }

    if (form.title.trim().length > 26) {
      setTitleError("제목은 최대 26자까지 작성 가능합니다.");
      return;
    }

    if (!form.content.trim()) {
      setContentError("내용을 입력해주세요.");
      return;
    }

    setIsSubmitting(true);

    try {
      const createdPost = await createPost(token, {
        title: form.title.trim(),
        content: form.content.trim(),
        image: form.image,
      });

      await refreshProfile();

      navigate(`/posts/${createdPost.id}`, { replace: true });
    } catch (error) {
      setContentError(error.message || "게시글 작성에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="page">
      <div className="garden-deco deco-seed-pack" aria-hidden="true">
        <span>SEEDS</span>
        <strong>🍅</strong>
      </div>
      <div className="garden-deco deco-mini-note" aria-hidden="true">
        <span>today</span>
        <p>
          물 주기
          <br />
          햇빛 보기
        </p>
      </div>
      <div className="garden-deco deco-shovel" aria-hidden="true" />
      <div className="garden-deco deco-rake" aria-hidden="true" />
      <div className="garden-deco deco-vine vine-left" aria-hidden="true" />
      <div className="garden-deco deco-vine vine-right" aria-hidden="true" />

      <header className="header">
        <div className="header-inner">
          <button className="back-button" id="backButton" type="button" onClick={() => navigate("/posts")}>
            &lt;
          </button>

          <h1 className="header-title">토마토 키우기</h1>

          <button className="profile-button" id="profileButton" type="button" onClick={() => navigate("/profile")}>
            {profileImage ? (
              <img alt="프로필 이미지" className="profile-image" src={profileImage} decoding="async" />
            ) : (
              <span className="profile-image profile-fallback">{getUserLabel(user?.nickname || user?.email || "T")}</span>
            )}
          </button>
        </div>
      </header>

      <main className="write-main">
        <section className="write-packet">
          <div className="packet-hole" />

          <div className="packet-header">
            <p className="packet-small-text">TOMATO GROWING RECORD</p>
            <h2 className="page-title">오늘의 토마토 심기</h2>
            <p className="packet-subtitle">write your tiny tomato diary</p>
          </div>

          <div className="tomato-badge" aria-hidden="true">
            <div className="tomato-leaf" />
            <div className="tomato-body">
              <span />
              <span />
              <span />
            </div>
          </div>

          <form className="write-form" id="writePostForm" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="titleInput" className="form-label">제목*</label>

              <input
                type="text"
                id="titleInput"
                className="title-input"
                name="title"
                value={form.title}
                onChange={handleChange}
                maxLength={26}
                placeholder="오늘 심을 토마토 이름을 적어주세요. (최대 26글자)"
              />

              <p className="helper-text" id="titleHelper">{titleError}</p>
            </div>

            <div className="form-group content-group">
              <label htmlFor="contentInput" className="form-label">내용*</label>

              <textarea
                id="contentInput"
                className="content-input"
                name="content"
                value={form.content}
                onChange={handleChange}
                placeholder="오늘의 생각, 기분, 아무 말까지 토마토처럼 적어주세요."
              />

              <p className="helper-text" id="contentHelper">{contentError}</p>
            </div>

            <div className="form-group image-group">
              <label htmlFor="imageInput" className="form-label">이미지</label>

              <div className="file-row">
                <label htmlFor="imageInput" className="file-button">사진 고르기</label>

                <input
                  type="file"
                  id="imageInput"
                  className="file-input"
                  accept=".png, .jpg, .jpeg"
                  onChange={handleImageChange}
                />

                <span className="file-name" id="fileName">{selectedFileName}</span>
              </div>

              <p className="helper-text" id="imageHelper">{imageError}</p>
            </div>

            <button type="submit" className="submit-button" id="writeSubmitButton" disabled={!isActive}>
              {isSubmitting ? "심는 중..." : "토마토 심기"}
            </button>
          </form>

          <p className="packet-footer">🍅 오늘의 작은 기록이 천천히 익어가요.</p>
        </section>
      </main>
    </div>
  );
}
