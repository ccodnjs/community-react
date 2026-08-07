import assert from "node:assert/strict";
import test from "node:test";

import { getEquippedItemLabels, sortFarmersForCurrentUser } from "../farmers.js";

test("sortFarmersForCurrentUser puts my profile first and sorts others by post count", () => {
  const farmers = [
    { id: 2, nickname: "belle", myPostCount: 3 },
    { id: 1, nickname: "me", myPostCount: 1 },
    { id: 3, nickname: "tom", myPostCount: 9 },
  ];

  const sorted = sortFarmersForCurrentUser(farmers, { id: 1 });

  assert.deepEqual(
    sorted.map((farmer) => farmer.nickname),
    ["me", "tom", "belle"],
  );
});

test("getEquippedItemLabels converts item codes for the farmers page", () => {
  assert.deepEqual(getEquippedItemLabels(["STRAW_HAT", "FARMER_GLOVES", "UNKNOWN_ITEM"]), [
    "밀짚모자",
    "새싹 머리핀",
    "UNKNOWN_ITEM",
  ]);
});

test("farmers helpers tolerate empty values", () => {
  assert.deepEqual(sortFarmersForCurrentUser(null, null), []);
  assert.deepEqual(getEquippedItemLabels(null), []);
});
