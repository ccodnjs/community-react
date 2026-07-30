import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import useLegacyPage from "../hooks/useLegacyPage";
import { fetchPostDetail, updatePost } from "../lib/api";
import { convertImageToOptimizedDataUrl, getProfileImageCandidate, getUserLabel } from "../lib/ui";

export default function PostEditPage() {
  useLegacyPage("/legacy/post-edit.css", "토마토 키우기 - 게시글 수정");

  const navigate = useNavigate();
  const { postId } = useParams();
  const { token, user } = useAuth();
  const [form, setForm] = useState({
    title: "",
    content: "",
    image: "",
  });
  const [originalForm, setOriginalForm] = useState({
    title: "",
    content: "",
    image: "",
  });
  const [selectedFileName, setSelectedFileName] = useState("파일을 선택해주세요.");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [titleError, setTitleError] = useState("");
  const [contentError, setContentError] = useState("");
  const [imageError, setImageError] = useState("");
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    async function loadPost() {
      setIsLoading(true);
      setLoadError("");

      try {
        const post = await fetchPostDetail(postId, false);
        const currentUserId = user?.id ?? user?.userId;

        if (String(post.userId ?? "") !== String(currentUserId ?? "")) {
          setLoadError("본인 게시글만 수정할 수 있습니다.");
          return;
        }

        const nextForm = {
          title: post.title || "",
          content: post.content || "",
          image: post.image || "",
        };

        setForm(nextForm);
        setOriginalForm(nextForm);
        setSelectedFileName(post.image ? "기존 이미지가 있습니다." : "파일을 선택해주세요.");
      } catch (error) {
        setLoadError(error.message || "게시글을 불러오지 못했습니다.");
      } finally {
        setIsLoading(false);
      }
    }

    loadPost();
  }, [postId, user]);

  const isDirty = useMemo(
    () =>
      form.title.trim() !== originalForm.title ||
      form.content.trim() !== originalForm.content ||
      form.image !== originalForm.image,
    [form, originalForm]
  );

  const isActive = Boolean(isDirty && form.title.trim() && form.content.trim() && !isSubmitting);
  const profileImage = getProfileImageCandidate(user?.profileImage);

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
        image: originalForm.image,
      }));
      setSelectedFileName(originalForm.image ? "기존 이미지가 있습니다." : "파일을 선택해주세요.");
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

    if (!isDirty) {
      setContentError("변경된 내용이 없어요.");
      return;
    }

    setIsSubmitting(true);

    try {
      await updatePost(token, postId, {
        title: form.title.trim(),
        content: form.content.trim(),
        image: form.image,
      });

      navigate(`/posts/${postId}`, { replace: true });
    } catch (error) {
      setContentError(error.message || "게시글 수정에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return <div className="page-loader">게시글을 불러오는 중이에요...</div>;
  }

  if (loadError) {
    return <div className="page-loader">{loadError}</div>;
  }

  return (
    <div className="page">
      <div className="garden-deco deco-seed-pack" aria-hidden="true">
        <span>EDIT</span>
        <strong>🍅</strong>
      </div>
      <div className="garden-deco deco-mini-note" aria-hidden="true">
        <span>update</span>
        <p>
          제목 다듬기
          <br />
          내용 손보기
        </p>
      </div>
      <div className="garden-deco deco-shovel" aria-hidden="true" />
      <div className="garden-deco deco-rake" aria-hidden="true" />
      <div className="garden-deco deco-vine vine-left" aria-hidden="true" />
      <div className="garden-deco deco-vine vine-right" aria-hidden="true" />

      <header className="header">
        <div className="header-inner">
          <button className="back-button" id="backButton" type="button" onClick={() => navigate(`/posts/${postId}`)}>
            &lt;
          </button>

          <h1 className="header-title">토마토 키우기</h1>

          <button className="profile-button" id="profileButton" type="button" onClick={() => navigate("/profile")}>
            {profileImage ? (
              <img alt="프로필 이미지" className="profile-image" src={profileImage} />
            ) : (
              <span className="profile-image profile-fallback">{getUserLabel(user?.nickname || user?.email || "T")}</span>
            )}
          </button>
        </div>
      </header>

      <main className="edit-main">
        <section className="edit-packet">
          <div className="packet-hole" />

          <div className="packet-header">
            <p className="packet-small-text">TOMATO GROWING RECORD</p>
            <h2 className="page-title">내 토마토 다듬기</h2>
            <p className="packet-subtitle">edit your tiny tomato diary</p>
          </div>

          <div className="tomato-badge" aria-hidden="true">
            <div className="tomato-leaf" />
            <div className="tomato-body">
              <span />
              <span />
              <span />
            </div>
          </div>

          <form className="edit-form" id="editPostForm" onSubmit={handleSubmit}>
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
                placeholder="토마토 이름을 다시 적어주세요. (최대 26글자)"
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
                placeholder="익어가는 생각을 다시 정리해보세요."
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

            <button type="submit" className="submit-button" id="editSubmitButton" disabled={!isActive}>
              {isSubmitting ? "다듬는 중..." : "토마토 수정하기"}
            </button>
          </form>

          <p className="packet-footer">🍅 이미 심은 기록도 정성껏 다시 가꿀 수 있어요.</p>
        </section>
      </main>
    </div>
  );
}
