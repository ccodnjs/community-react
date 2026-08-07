import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import useLegacyPage from "../hooks/useLegacyPage";
import {
  equipMyItem,
  fetchMyPosts,
  fetchMyProfile,
  purchaseMyItem,
  unequipMyItem,
  updateMyProfile,
} from "../lib/api";
import { convertImageToOptimizedDataUrl, getProfileImageCandidate, getUserLabel } from "../lib/ui";

const INITIAL_FORM = {
  nickname: "",
  profileImage: "",
};

const ITEM_META = {
  STRAW_HAT: { className: "item-straw-hat", label: "밀짚모자", assetPath: "/items/straw-hat.png", price: 200 },
  RED_BOOTS: { className: "item-red-boots", label: "빨간 장화", assetPath: "/items/red-boots.png", price: 100 },
  GREEN_APRON: { className: "item-green-apron", label: "토마토 앞치마", assetPath: "/items/tomato-apron.png", price: 400 },
  TOMATO_BAG: { className: "item-tomato-bag", label: "토마토 가방", assetPath: "/items/tomato-bag.png", price: 300 },
  WATERING_CAN: { className: "item-watering-can", label: "토마토 펫", assetPath: "/items/tomato-pet.png", price: 999 },
  SMALL_SHOVEL: { className: "item-small-shovel", label: "작은 삽", assetPath: "/items/small-shovel.png", price: 30 },
  TOMATO_HAIRPIN: { className: "item-tomato-hairpin", label: "토마토 머리핀", assetPath: "/items/tomato-hairpin.png", price: 70 },
  FARMER_GLOVES: { className: "item-farmer-gloves", label: "새싹 머리핀", assetPath: "/items/sprout-hairpin.png", price: 50 },
};

function getItemActionState(item, sunlight) {
  const meta = ITEM_META[item?.code] || null;
  const price = Number(item?.price ?? meta?.price ?? 0);
  const canPurchase = Number(sunlight || 0) >= price;

  if (item?.equipped) {
    return { label: "장착 중", buttonLabel: "해제하기", actionType: "unequip", disabled: false };
  }

  if (item?.purchased) {
    return { label: "보유 중", buttonLabel: "장착하기", actionType: "equip", disabled: false };
  }

  return {
    label: canPurchase ? "구매 가능" : "구매 불가능",
    buttonLabel: "구매하기",
    actionType: "purchase",
    disabled: !canPurchase,
  };
}

export default function ProfilePage() {
  useLegacyPage("/legacy/profile-edit.css", "토마토 키우기 - 회원정보수정");

  const navigate = useNavigate();
  const { token, user, logout, setUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState(INITIAL_FORM);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadProfilePage() {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const [profileResult, myPostsResult] = await Promise.allSettled([
          fetchMyProfile(token),
          fetchMyPosts(token),
        ]);

        if (profileResult.status !== "fulfilled") {
          throw profileResult.reason;
        }

        const nextProfile = {
          ...profileResult.value,
          myPostCount:
            typeof profileResult.value?.myPostCount === "number"
              ? profileResult.value.myPostCount
              : myPostsResult.status === "fulfilled" && Array.isArray(myPostsResult.value)
                ? myPostsResult.value.length
                : 0,
        };

        setProfile(nextProfile);
        setForm({
          nickname: nextProfile.nickname || "",
          profileImage: nextProfile.profileImage || "",
        });
        setUser((current) => ({
          ...current,
          ...nextProfile,
        }));
      } catch (error) {
        setErrorMessage(error.message || "프로필 정보를 불러오지 못했습니다.");
      } finally {
        setIsLoading(false);
      }
    }

    loadProfilePage();
  }, [setUser, token]);

  const isDirty =
    form.nickname.trim() !== (profile?.nickname || "") ||
    form.profileImage !== (profile?.profileImage || "");
  const isActive = Boolean(isDirty && form.nickname.trim() && !isSubmitting);
  const equippedItem = (profile?.itemShop || []).find((item) => item.equipped) || null;
  const equippedMeta = equippedItem ? ITEM_META[equippedItem.code] || null : null;
  const previewImage = getProfileImageCandidate(form.profileImage);
  const headerProfileImage = getProfileImageCandidate(profile?.profileImage || user?.profileImage);

  async function handleProfileImageChange(event) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    try {
      const imageDataUrl = await convertImageToOptimizedDataUrl(file);
      setForm((current) => ({
        ...current,
        profileImage: imageDataUrl,
      }));
      setMessage("프로필 이미지를 변경했어요.");
      setErrorMessage("");
    } catch (error) {
      setErrorMessage("이미지를 불러오지 못했습니다.");
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");
    setErrorMessage("");

    if (!form.nickname.trim()) {
      setErrorMessage("닉네임을 입력해주세요.");
      return;
    }

    if (form.nickname.includes(" ") || form.nickname.trim().length > 10) {
      setErrorMessage("닉네임은 공백 없이 10자 이하로 입력해주세요.");
      return;
    }

    setIsSubmitting(true);

    try {
      const updatedProfile = await updateMyProfile(token, {
        nickname: form.nickname.trim(),
        profileImage: form.profileImage,
      });

      const mergedProfile = {
        ...profile,
        ...updatedProfile,
      };

      setProfile(mergedProfile);
      setForm({
        nickname: mergedProfile.nickname || "",
        profileImage: mergedProfile.profileImage || "",
      });
      setUser((current) => ({
        ...current,
        ...mergedProfile,
      }));
      setMessage("수정완료");
    } catch (error) {
      setErrorMessage(error.message || "회원정보 수정에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleItemAction(itemCode, actionType) {
    setMessage("");
    setErrorMessage("");

    try {
      const nextProfile =
        actionType === "equip"
          ? await equipMyItem(token, itemCode)
          : actionType === "unequip"
            ? await unequipMyItem(token, itemCode)
            : await purchaseMyItem(token, itemCode);

      const mergedProfile = {
        ...profile,
        ...nextProfile,
        myPostCount: profile?.myPostCount ?? nextProfile?.myPostCount ?? 0,
      };

      setProfile(mergedProfile);
      setUser((current) => ({
        ...current,
        ...mergedProfile,
      }));
      setMessage("아이템 정보가 반영됐어요.");
    } catch (error) {
      setErrorMessage(error.message || "아이템 처리에 실패했습니다.");
    }
  }

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  if (isLoading) {
    return <div className="page-loader">프로필을 불러오는 중이에요...</div>;
  }

  if (errorMessage && !profile) {
    return <div className="page-loader">{errorMessage}</div>;
  }

  return (
    <div className="page">
      <div className="farm-deco deco-leaf leaf-left" aria-hidden="true" />
      <div className="farm-deco deco-leaf leaf-right" aria-hidden="true" />
      <div className="farm-deco deco-tomato tomato-left" aria-hidden="true" />
      <div className="farm-deco deco-tomato tomato-right" aria-hidden="true" />
      <div className="farm-deco deco-stake stake-left" aria-hidden="true" />
      <div className="farm-deco deco-stake stake-right" aria-hidden="true" />

      <header className="header">
        <div className="header-inner">
          <button className="back-button" id="backButton" type="button" onClick={() => navigate("/posts")}>
            &lt;
          </button>

          <h1 className="header-title">토마토 키우기</h1>

          <button className="header-profile-button" id="headerProfileButton" type="button" onClick={() => navigate("/profile")}>
            {headerProfileImage ? (
              <img
                alt="프로필 이미지"
                id="headerProfileImage"
                className="header-profile-image"
                src={headerProfileImage}
                decoding="async"
              />
            ) : (
              <span className="header-profile-image profile-fallback">{getUserLabel(profile?.nickname || profile?.email || "T")}</span>
            )}
          </button>
        </div>
      </header>

      <main className="profile-main">
        <section className="farmer-card">
          <div className="card-label">
            <span>🍅 tomato farmer profile</span>
          </div>

          <div className="card-tape" aria-hidden="true" />

          <h2 className="page-title">회원정보수정</h2>
          <p className="page-subtitle">토마토 농부의 프로필을 가꾸는 공간이에요.</p>

          <form onSubmit={handleSubmit}>
            <section className="profile-section">
              <p className="section-title">프로필 사진*</p>

              <div className="profile-preview-wrap">
                <div
                  id="equippedItemOverlay"
                  className={`equipped-item-overlay ${equippedMeta?.className || ""}${equippedMeta ? "" : " is-hidden"}`}
                  aria-hidden="true"
                >
                  {equippedMeta ? (
                    <img
                      id="equippedItemBadge"
                      className={`equipped-item-image ${equippedMeta.className}`}
                      src={equippedMeta.assetPath}
                      alt={equippedMeta.label}
                      decoding="async"
                    />
                  ) : null}
                </div>

                <div id="profilePreview" className="profile-preview">
                  {previewImage ? (
                    <img
                      id="profilePreviewImage"
                      className="profile-preview-image"
                      alt="프로필 미리보기"
                      src={previewImage}
                      decoding="async"
                    />
                  ) : (
                    <span id="profilePreviewImage" className="profile-preview-image profile-fallback">
                      {getUserLabel(form.nickname || profile?.nickname || profile?.email || "T")}
                    </span>
                  )}
                </div>
              </div>

              <div className="profile-button-row">
                <label htmlFor="profileInput" className="change-profile-button">
                  사진 변경
                </label>
                <input type="file" id="profileInput" accept="image/*" hidden onChange={handleProfileImageChange} />
              </div>

              <p id="profileHelper" className="helper-text">{errorMessage}</p>
              <p id="equippedItemsText" className="equipped-items-text">
                {equippedMeta ? `장착 중: ${equippedMeta.label}` : "장착 중 아이템이 없어요."}
              </p>
            </section>

            <section className="form-section">
              <p className="section-title">이메일</p>
              <div className="email-box" id="emailText">{profile?.email || ""}</div>
            </section>

            <section className="form-section">
              <label htmlFor="nicknameInput" className="section-title">닉네임</label>
              <input
                type="text"
                id="nicknameInput"
                className="nickname-input"
                placeholder="닉네임을 입력해주세요."
                value={form.nickname}
                maxLength={10}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    nickname: event.target.value,
                  }))
                }
              />
            </section>

            <section className="activity-section">
              <div className="activity-grid">
                <article className="activity-card">
                  <span className="activity-label">성장 단계</span>
                  <strong id="growthStageValue">{profile?.growthStage || "씨앗"}</strong>
                </article>

                <article className="activity-card">
                  <span className="activity-label">햇빛</span>
                  <strong id="sunlightValue">{profile?.sunlight ?? 0}</strong>
                </article>

                <article className="activity-card">
                  <span className="activity-label">내 토마토</span>
                  <strong id="myPostCountValue">{profile?.myPostCount ?? 0}</strong>
                </article>
              </div>

              <button type="button" id="myGardenMoveButton" className="my-garden-button" onClick={() => navigate("/my-posts")}>
                내 토마토 밭 보기
              </button>
            </section>

            <section className="shop-section">
              <div className="shop-header">
                <p className="section-title">농부 꾸미기 아이템</p>
                <p className="shop-helper">햇빛을 모아서 구매하고, 원하는 아이템을 장착해보세요.</p>
              </div>

              <div className="item-shop-list" id="itemShopList">
                {(profile?.itemShop || []).map((item) => {
                  const actionState = getItemActionState(item, profile?.sunlight ?? 0);
                  const statusClass = actionState.label.replaceAll(" ", "-");
                  const itemMeta = ITEM_META[item.code];
                  const displayPrice = item.price ?? itemMeta?.price;

                  return (
                    <article className={`item-card item-card--${statusClass}`} key={item.code}>
                      <div className="item-card-top">
                        <strong className="item-name">{itemMeta?.label || item.name}</strong>
                        <span className="item-price">☀️ {displayPrice}</span>
                      </div>

                      <div className="item-card-bottom">
                        <span className={`item-status item-status--${statusClass}`}>{actionState.label}</span>
                        <button
                          type="button"
                          className={`item-action-button item-action-button--${statusClass}`}
                          disabled={actionState.disabled}
                          onClick={() => handleItemAction(item.code, actionState.actionType)}
                        >
                          {actionState.buttonLabel}
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>

            <div className="button-group">
              <button type="submit" id="editProfileButton" className="submit-button" disabled={!isActive}>
                {isSubmitting ? "수정 중..." : "수정하기"}
              </button>

              <button type="button" id="passwordEditMoveButton" className="password-edit-button" onClick={() => navigate("/profile/password")}>
                비밀번호 수정
              </button>

              <button type="button" id="logoutButton" className="logout-button" onClick={handleLogout}>
                로그아웃
              </button>
            </div>
          </form>
        </section>
      </main>

      <div className={`toast${message ? " show" : ""}`} id="toastMessage">
        {message || "완료"}
      </div>
    </div>
  );
}
