const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080";

export class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

async function parseResponse(response) {
  const contentType = response.headers.get("content-type") || "";
  const text = await response.text();

  if (!text) {
    return null;
  }

  if (contentType.includes("application/json")) {
    try {
      return JSON.parse(text);
    } catch (error) {
      return { message: text };
    }
  }

  return text ? { message: text } : null;
}

async function request(path, options = {}) {
  const { method = "GET", token = "", body } = options;

  const headers = {
    Accept: "application/json",
  };

  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const data = await parseResponse(response);

  if (!response.ok) {
    const message =
      data?.message ||
      data?.error ||
      `${response.status} 요청 처리 중 문제가 발생했습니다.`;

    throw new ApiError(message, response.status, data);
  }

  return data;
}

function isRetryableEndpointMismatch(error) {
  return [400, 403, 404, 405].includes(error?.status);
}

function normalizeUser(source) {
  if (!source) {
    return null;
  }

  return {
    ...source,
    id: source.id ?? source.userId ?? source.memberId ?? null,
    email: source.email ?? "",
    nickname: source.nickname ?? source.name ?? "",
    profileImage: source.profileImage ?? source.profileImageUrl ?? "",
    tomatoLevel: source.tomatoLevel ?? source.level ?? "",
    sunlight: source.sunlight ?? source.point ?? 0,
    growthStage: source.growthStage ?? source.tomatoLevel ?? source.level ?? "",
    myPostCount: source.myPostCount ?? source.postCount ?? source.postsCount ?? 0,
    itemShop: Array.isArray(source.itemShop) ? source.itemShop : [],
  };
}

export function normalizeAuthResponse(response) {
  const token =
    response?.token ??
    response?.accessToken ??
    response?.jwt ??
    response?.data?.token ??
    "";

  const user =
    normalizeUser(response?.user) ??
    normalizeUser(response?.data?.user) ?? {
      id: response?.userId ?? response?.id ?? null,
      email: response?.email ?? "",
      nickname: response?.nickname ?? "",
      profileImage: response?.profileImage ?? "",
      tomatoLevel: response?.tomatoLevel ?? "",
      sunlight: response?.sunlight ?? 0,
    };

  if (!token) {
    throw new ApiError("로그인 응답에서 토큰을 찾지 못했습니다.", 500, response);
  }

  return { token, user };
}

export async function loginUser(formData) {
  return request("/users/login", {
    method: "POST",
    body: formData,
  });
}

export async function signupUser(formData) {
  return request("/users/signup", {
    method: "POST",
    body: formData,
  });
}

export async function fetchMyProfile(token) {
  const data = await request("/users/me", {
    method: "GET",
    token,
  });

  return normalizeUser(data);
}

export async function fetchPosts(token) {
  return request("/posts", {
    method: "GET",
    token,
  });
}

export async function createPost(token, payload) {
  return request("/posts", {
    method: "POST",
    token,
    body: payload,
  });
}

export async function fetchPostDetail(postId, increaseView = true) {
  if (!increaseView) {
    try {
      return await request(`/posts/${postId}?increaseView=false`, {
        method: "GET",
      });
    } catch (error) {
      if (!isRetryableEndpointMismatch(error)) {
        throw error;
      }

      return request(`/posts/${postId}`, {
        method: "GET",
      });
    }
  }

  try {
    await request(`/posts/${postId}/view`, {
      method: "POST",
    });

    try {
      return await request(`/posts/${postId}?increaseView=false`, {
        method: "GET",
      });
    } catch (error) {
      if (!isRetryableEndpointMismatch(error)) {
        throw error;
      }

      return request(`/posts/${postId}`, {
        method: "GET",
      });
    }
  } catch (error) {
    if (!isRetryableEndpointMismatch(error)) {
      throw error;
    }

    try {
      return await request(`/posts/${postId}?increaseView=true`, {
        method: "GET",
      });
    } catch (fallbackError) {
      if (!isRetryableEndpointMismatch(fallbackError)) {
        throw fallbackError;
      }

      return request(`/posts/${postId}`, {
        method: "GET",
      });
    }
  }
}

export async function updatePost(token, postId, payload) {
  return request(`/posts/${postId}`, {
    method: "PATCH",
    token,
    body: payload,
  });
}

export async function deletePost(token, postId) {
  return request(`/posts/${postId}`, {
    method: "DELETE",
    token,
  });
}

export async function fetchPostLikeStatus(token, postId) {
  return request(`/posts/${postId}/likes/me`, {
    method: "GET",
    token,
  });
}

export async function likePost(token, postId) {
  return request(`/posts/${postId}/likes`, {
    method: "POST",
    token,
  });
}

export async function unlikePost(token, postId) {
  return request(`/posts/${postId}/likes`, {
    method: "DELETE",
    token,
  });
}

export async function fetchComments(postId) {
  return request(`/posts/${postId}/comments`, {
    method: "GET",
  });
}

export async function createComment(token, postId, payload) {
  return request(`/posts/${postId}/comments`, {
    method: "POST",
    token,
    body: payload,
  });
}

export async function updateComment(token, commentId, payload) {
  return request(`/comments/${commentId}`, {
    method: "PATCH",
    token,
    body: payload,
  });
}

export async function deleteComment(token, commentId, postId = null) {
  try {
    return await request(`/comments/${commentId}`, {
      method: "DELETE",
      token,
    });
  } catch (error) {
    if (!postId || !isRetryableEndpointMismatch(error)) {
      throw error;
    }

    return request(`/posts/${postId}/comments/${commentId}`, {
      method: "DELETE",
      token,
    });
  }
}

export async function fetchMyPosts(token) {
  return request("/users/me/posts", {
    method: "GET",
    token,
  });
}

export async function updateMyProfile(token, payload) {
  const data = await request("/users/me", {
    method: "PATCH",
    token,
    body: payload,
  });

  return normalizeUser(data);
}

export async function updateMyPassword(token, payload) {
  const data = await request("/users/me/password", {
    method: "PATCH",
    token,
    body: payload,
  });

  return normalizeUser(data);
}

export async function purchaseMyItem(token, itemCode) {
  const data = await request(`/users/me/items/${itemCode}/purchase`, {
    method: "POST",
    token,
  });

  return normalizeUser(data);
}

export async function equipMyItem(token, itemCode) {
  const data = await request(`/users/me/items/${itemCode}/equip`, {
    method: "POST",
    token,
  });

  return normalizeUser(data);
}

export async function unequipMyItem(token, itemCode) {
  const data = await request(`/users/me/items/${itemCode}/unequip`, {
    method: "POST",
    token,
  });

  return normalizeUser(data);
}
