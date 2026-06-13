import { lazy, Suspense, useState, useCallback } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ProtectedRoute } from "./components/layout/ProtectedRoute";
import { Sidebar } from "./components/layout/Sidebar";
import LoginPage from "./pages/LoginPage";

// ✅ Lazy loading: cada página carga solo cuando se navega a ella
const DashboardPage       = lazy(() => import("./pages/DashboardPage"));
const ClientesPage        = lazy(() => import("./pages/ClientesPage"));
const ClienteDetailPage   = lazy(() => import("./pages/ClienteDetailPage"));
const VehiculosPage       = lazy(() => import("./pages/VehiculosPage"));
const ServiciosPage       = lazy(() => import("./pages/ServiciosPage"));
const ServicioDetailPage  = lazy(() => import("./pages/ServicioDetailPage"));
const UsersPage           = lazy(() => import("./pages/UsersPage"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
  },
});

function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const openSidebar  = useCallback(() => setSidebarOpen(true), []);
  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* Mobile topbar */}
      <div className="mobile-topbar">
        <button className="hamburger-btn" onClick={openSidebar} aria-label="Abrir menú">
          &#9776;
        </button>
        <span style={{ color: "#fff", fontWeight: 700, fontSize: "1rem" }}>Taller Tohan</span>
      </div>

      {/* Backdrop (mobile) */}
      {sidebarOpen && (
        <div className="sidebar-backdrop" onClick={closeSidebar} />
      )}

      <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />

      <main style={{ flex: 1, background: "#f5f5f5", overflow: "auto" }}>
        <Suspense fallback={<div style={{ padding: "2rem", color: "#888" }}>Cargando...</div>}>
          <Routes>
            <Route index element={<DashboardPage />} />
            <Route path="clientes" element={<ClientesPage />} />
            <Route path="clientes/:id" element={<ClienteDetailPage />} />
            <Route path="vehiculos" element={<VehiculosPage />} />
            <Route path="servicios" element={<ServiciosPage />} />
            <Route path="servicios/:id" element={<ServicioDetailPage />} />
            <Route path="usuarios" element={<UsersPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/*" element={<AppLayout />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
