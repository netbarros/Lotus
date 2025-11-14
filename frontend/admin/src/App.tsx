/**
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║ 🎯 APP - Main application component                                     ║
 * ║ MagicSaaS System-∞ Admin - Enterprise Metronic Dashboard                ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 */

import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MasterLayout } from '@components/layout/MasterLayout';
import { Dashboard } from '@pages/Dashboard';
import { SofiaDashboard } from '@pages/SofiaDashboard';
import { useAuthStore } from '@store/authStore';

// Create QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 30000, // 30 seconds
    },
  },
});

function App() {
  const { isAuthenticated, loading, loadUser } = useAuthStore();

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Carregando...</span>
        </div>
      </div>
    );
  }

  // For now, we'll skip auth for demo purposes
  // In production, implement proper login/auth flow
  const skipAuth = import.meta.env.VITE_SKIP_AUTH === 'true' || import.meta.env.DEV;

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Protected Routes */}
          <Route
            path="/"
            element={
              skipAuth || isAuthenticated ? <MasterLayout /> : <Navigate to="/login" replace />
            }
          >
            {/* Main Dashboard */}
            <Route index element={<Dashboard />} />

            {/* Sofia AI Routes */}
            <Route path="sofia/dashboard" element={<SofiaDashboard />} />
            <Route path="sofia/intention" element={<div>Intention Engine Page</div>} />
            <Route path="sofia/vectors" element={<div>Vector Search Page</div>} />
            <Route path="sofia/traces" element={<div>Langfuse Traces Page</div>} />

            {/* Pétalas Routes */}
            <Route path="petalas" element={<div>Pétalas List Page</div>} />
            <Route path="petalas/:id" element={<div>Pétala Detail Page</div>} />
            <Route path="petalas/marketplace" element={<div>Marketplace Page</div>} />

            {/* MCP Routes */}
            <Route path="mcp" element={<div>MCP Connections Page</div>} />

            {/* System Routes */}
            <Route path="users" element={<div>Users Page</div>} />
            <Route path="settings" element={<div>Settings Page</div>} />
            <Route path="profile" element={<div>Profile Page</div>} />
          </Route>

          {/* Auth Routes */}
          <Route path="/login" element={<div>Login Page</div>} />

          {/* 404 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
