import assert from "node:assert/strict";
import test from "node:test";

import {
  formatCount,
  formatDate,
  getImageCandidate,
  getProfileImageCandidate,
  getUserLabel,
} from "../ui.js";

test("formatCount keeps post card counts compact", () => {
  assert.equal(formatCount(0), "0");
  assert.equal(formatCount(999), "999");
  assert.equal(formatCount(1000), "1k");
  assert.equal(formatCount(10000), "10k");
  assert.equal(formatCount(100000), "100k");
});

test("formatDate handles empty and invalid values safely", () => {
  assert.equal(formatDate(""), "");
  assert.equal(formatDate("not-a-date"), "not-a-date");
});

test("image helpers accept renderable remote and data-url images only", () => {
  assert.equal(
    getImageCandidate("https://example.com/tomato.png"),
    "https://example.com/tomato.png",
  );
  assert.equal(
    getProfileImageCandidate("data:image/png;base64,abc"),
    "data:image/png;base64,abc",
  );
  assert.equal(getImageCandidate("/local/path.png"), "");
});

test("getUserLabel creates a one-letter profile fallback", () => {
  assert.equal(getUserLabel("belle"), "B");
  assert.equal(getUserLabel("토마토"), "토");
  assert.equal(getUserLabel(""), "T");
});
