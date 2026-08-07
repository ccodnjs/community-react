import assert from "node:assert/strict";
import test from "node:test";

import { ApiError, fetchPosts, normalizeAuthResponse } from "../api.js";

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json",
    },
  });
}

function withMockFetch(handler) {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = handler;

  return () => {
    if (originalFetch) {
      globalThis.fetch = originalFetch;
      return;
    }

    delete globalThis.fetch;
  };
}

test("normalizeAuthResponse extracts token and normalized user data", () => {
  const result = normalizeAuthResponse({
    accessToken: "test-token",
    user: {
      userId: 7,
      name: "belle",
      point: 30,
    },
  });

  assert.equal(result.token, "test-token");
  assert.equal(result.user.id, 7);
  assert.equal(result.user.nickname, "belle");
  assert.equal(result.user.sunlight, 30);
});

test("normalizeAuthResponse throws ApiError when token is missing", () => {
  assert.throws(
    () => normalizeAuthResponse({ user: { nickname: "belle" } }),
    ApiError,
  );
});

test("fetchPosts sends encoded keyword and bearer token", async () => {
  let requestedUrl = "";
  let requestedOptions = null;

  const restoreFetch = withMockFetch(async (url, options) => {
    requestedUrl = url;
    requestedOptions = options;
    return jsonResponse([{ id: 1, title: "비 오는 오후" }]);
  });

  try {
    const posts = await fetchPosts("token-123", " 비 오는 오후 ");

    assert.deepEqual(posts, [{ id: 1, title: "비 오는 오후" }]);
    assert.equal(
      requestedUrl,
      "http://localhost:8080/posts?keyword=%EB%B9%84%20%EC%98%A4%EB%8A%94%20%EC%98%A4%ED%9B%84",
    );
    assert.equal(requestedOptions.method, "GET");
    assert.equal(requestedOptions.headers.Authorization, "Bearer token-123");
  } finally {
    restoreFetch();
  }
});

test("fetchPosts omits keyword query when search text is blank", async () => {
  let requestedUrl = "";

  const restoreFetch = withMockFetch(async (url) => {
    requestedUrl = url;
    return jsonResponse([]);
  });

  try {
    const posts = await fetchPosts("", "   ");

    assert.deepEqual(posts, []);
    assert.equal(requestedUrl, "http://localhost:8080/posts");
  } finally {
    restoreFetch();
  }
});
