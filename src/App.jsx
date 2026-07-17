import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotifyProvider } from './context/NotifyContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import PublicAssetPage from './pages/PublicAssetPage';
import Dashboard from './pages/Dashboard';
import AssetList from './pages/AssetList';
import AssetDetails from './pages/AssetDetails';
import CreateAsset from './pages/CreateAsset';
import IssueList from './pages/IssueList';
import IssueDetails from './pages/IssueDetails';
import UserList from './pages/UserList';
import Profile from './pages/Profile';
import NotFoundPage from './pages/NotFoundPage';

export default function App() {
  return (
    <NotifyProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
          <Route element={<Layout />}>
            {/* Public routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/asset/:slug" element={<PublicAssetPage />} />

            {/* Protected routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/assets"
              element={
                <ProtectedRoute>
                  <AssetList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/assets/new"
              element={
                <ProtectedRoute>
                  <CreateAsset />
                </ProtectedRoute>
              }
            />
            <Route
              path="/assets/:id"
              element={
                <ProtectedRoute>
                  <AssetDetails />
                </ProtectedRoute>
              }
            />
            <Route
              path="/issues"
              element={
                <ProtectedRoute>
                  <IssueList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/issues/:id"
              element={
                <ProtectedRoute>
                  <IssueDetails />
                </ProtectedRoute>
              }
            />
            <Route
              path="/users"
              element={
                <ProtectedRoute>
                  <UserList />
                </ProtectedRoute>
              }
            />
            {/* Legacy alias — old /technicians links redirect to /users. */}
            <Route path="/technicians" element={<Navigate to="/users" replace />} />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
      </AuthProvider>
    </NotifyProvider>
  );
}
