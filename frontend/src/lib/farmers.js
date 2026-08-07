export const ITEM_LABELS = {
  STRAW_HAT: "밀짚모자",
  RED_BOOTS: "빨간 장화",
  GREEN_APRON: "토마토 앞치마",
  TOMATO_BAG: "토마토 가방",
  WATERING_CAN: "토마토 펫",
  SMALL_SHOVEL: "작은 삽",
  TOMATO_HAIRPIN: "토마토 머리핀",
  FARMER_GLOVES: "새싹 머리핀",
};

export function getEquippedItemLabels(items) {
  return (Array.isArray(items) ? items : []).map((itemCode) => ITEM_LABELS[itemCode] || itemCode);
}

export function sortFarmersForCurrentUser(farmers, user) {
  const currentUserId = user?.id ?? user?.userId;

  return [...(Array.isArray(farmers) ? farmers : [])].sort((left, right) => {
    const leftIsMine = String(left.id ?? "") === String(currentUserId ?? "");
    const rightIsMine = String(right.id ?? "") === String(currentUserId ?? "");

    if (leftIsMine !== rightIsMine) {
      return leftIsMine ? -1 : 1;
    }

    return Number(right.myPostCount || 0) - Number(left.myPostCount || 0);
  });
}
