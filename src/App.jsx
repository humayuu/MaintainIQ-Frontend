import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotifyProvider } from './context/NotifyContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

import Login from './pages/Login';
import Register from './pages/Register';
import PublicAssetPage from './pages/PublicAssetPage';
import Dashboard from './pages/Dashboard';
import AssetList from './pages/AssetList';
import AssetDetails from './pages/AssetDetails';
import CreateAsset from './pages/CreateAsset';
import IssueList from './pages/IssueList';
import IssueDetails from './pages/IssueDetails';
import TechnicianList from './pages/TechnicianList';
import NotFoundPage from './pages/NotFoundPage';

export default function App() {
  return (
    <NotifyProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
          <Route element={<Layout />}>
            {/* Public routes */}
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
              path="/technicians"
              element={
                <ProtectedRoute>
                  <TechnicianList />
                </ProtectedRoute>
              }
            />

            {/* Default + fallback */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
      </AuthProvider>
    </NotifyProvider>
  );
}
