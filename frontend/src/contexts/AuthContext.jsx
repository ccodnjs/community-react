import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  fetchMyProfile,
  loginUser,
  normalizeAuthResponse,
  signupUser,
} from "../lib/api";

const STORAGE_KEY = "tomato-grow-auth";

const AuthContext = createContext(null);

function readStoredAuth() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return { token: "", user: null };
    }

    const parsed = JSON.parse(raw);

    return {
      token: parsed?.token ?? "",
      user: parsed?.user ?? null,
    };
  } catch (error) {
    return { token: "", user: null };
  }
}

function persistAuth(nextAuth) {
  if (!nextAuth.token) {
    localStorage.removeItem(STORAGE_KEY);
    return;
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(nextAuth));
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState("");
  const [user, setUser] = useState(null);
  const [isReady, setIsReady] = useState(false);

  async function refreshProfile(currentToken = token) {
    if (!currentToken) {
      return null;
    }

    try {
      const nextUser = await fetchMyProfile(currentToken);
      setUser(nextUser);
      return nextUser;
    } catch (error) {
      if (error.status === 401 || error.status === 403) {
        setToken("");
        setUser(null);
      }

      throw error;
    }
  }

  useEffect(() => {
    const storedAuth = readStoredAuth();

    setToken(storedAuth.token);
    setUser(storedAuth.user);
    setIsReady(true);
  }, []);

  useEffect(() => {
    persistAuth({ token, user });
  }, [token, user]);

  useEffect(() => {
    if (isReady) {
      refreshProfile().catch(() => {});
    }
  }, [isReady, token]);

  async function login(formData) {
    const response = await loginUser(formData);
    const auth = normalizeAuthResponse(response);

    setToken(auth.token);
    setUser(auth.user);

    return auth;
  }

  async function signup(formData) {
    return signupUser(formData);
  }

  function logout() {
    setToken("");
    setUser(null);
  }

  const value = useMemo(
    () => ({
      token,
      user,
      isReady,
      login,
      signup,
      logout,
      setUser,
      refreshProfile,
    }),
    [isReady, token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth는 AuthProvider 안에서 사용해야 합니다.");
  }

  return context;
}
