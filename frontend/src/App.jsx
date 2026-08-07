import { lazy, Suspense } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "./contexts/AuthContext";

const FarmersPage = lazy(() => import("./pages/FarmersPage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const MyPostsPage = lazy(() => import("./pages/MyPostsPage"));
const PasswordEditPage = lazy(() => import("./pages/PasswordEditPage"));
const PostDetailPage = lazy(() => import("./pages/PostDetailPage"));
const PostEditPage = lazy(() => import("./pages/PostEditPage"));
const PostWritePage = lazy(() => import("./pages/PostWritePage"));
const PostsPage = lazy(() => import("./pages/PostsPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const SignupPage = lazy(() => import("./pages/SignupPage"));

function PageFallback() {
  return <div className="page-loader">페이지를 불러오는 중...</div>;
}

function HomeRedirect() {
  const { token, isReady } = useAuth();

  if (!isReady) {
    return <div className="page-loader">불러오는 중...</div>;
  }

  return <Navigate to={token ? "/posts" : "/login"} replace />;
}

function PublicOnlyRoute({ children }) {
  const { token, isReady } = useAuth();
  const location = useLocation();

  if (!isReady) {
    return <div className="page-loader">불러오는 중...</div>;
  }

  if (token) {
    return <Navigate to="/posts" replace state={{ from: location }} />;
  }

  return children;
}

export default function App() {
  return (
    <Suspense fallback={<PageFallback />}>
      <Routes>
        <Route path="/" element={<HomeRedirect />} />
        <Route
          path="/login"
          element={
            <PublicOnlyRoute>
              <LoginPage />
            </PublicOnlyRoute>
          }
        />
        <Route
          path="/signup"
          element={
            <PublicOnlyRoute>
              <SignupPage />
            </PublicOnlyRoute>
          }
        />
        <Route
          path="/posts"
          element={
            <ProtectedRoute>
              <PostsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-posts"
          element={
            <ProtectedRoute>
              <MyPostsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/farmers"
          element={
            <ProtectedRoute>
              <FarmersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/write"
          element={
            <ProtectedRoute>
              <PostWritePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile/password"
          element={
            <ProtectedRoute>
              <PasswordEditPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/posts/:postId"
          element={
            <ProtectedRoute>
              <PostDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/posts/:postId/edit"
          element={
            <ProtectedRoute>
              <PostEditPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
