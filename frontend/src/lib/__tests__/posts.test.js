import assert from "node:assert/strict";
import test from "node:test";

import { filterPostsByOwner, getPostCardViewModel, normalizeSearchKeyword } from "../posts.js";

test("normalizeSearchKeyword trims search input safely", () => {
  assert.equal(normalizeSearchKeyword("  비 오는 오후  "), "비 오는 오후");
  assert.equal(normalizeSearchKeyword(null), "");
});

test("filterPostsByOwner keeps only posts written by the current user", () => {
  const posts = [
    { id: 1, userId: 7 },
    { id: 2, authorId: "7" },
    { id: 3, writerId: 8 },
    { id: 4 },
  ];

  assert.deepEqual(filterPostsByOwner(posts, { id: 7 }), [
    { id: 1, userId: 7 },
    { id: 2, authorId: "7" },
  ]);
});

test("getPostCardViewModel prepares safe display values for post cards", () => {
  const result = getPostCardViewModel({
    id: 11,
    title: "",
    likeCount: 1000,
    viewCount: 12,
    commentCount: 3,
    nickname: "belle",
    profileImage: "data:image/png;base64,profile",
    image: "https://example.com/tomato.jpg",
    createdAt: "2026-08-03T06:05:00Z",
  });

  assert.equal(result.id, 11);
  assert.equal(result.title, "제목 없음");
  assert.equal(result.likeLabel, "1k");
  assert.equal(result.viewLabel, "12");
  assert.equal(result.commentLabel, "3");
  assert.equal(result.authorName, "belle");
  assert.equal(result.authorProfileImage, "data:image/png;base64,profile");
  assert.equal(result.postImage, "https://example.com/tomato.jpg");
  assert.match(result.formattedDate, /^2026-/);
});
