// ✅ src/App.jsx — Dashboard Glass con Sidebar fijo y control por ruta
import { Routes, Route, useLocation } from "react-router-dom";
import Sidebar from "./components/Sidebar.jsx";
import HeroLanding from "./components/HeroLanding.jsx";
import Clientes from "../app/routes/clientes.jsx";
import Tickets from "../app/routes/tickets.jsx";
import SupervisorDashboard from "./pages/SupervisorDashboard.jsx";
import HistoricoKanban from "./pages/HistoricoKanban.jsx";
import Login from "../app/routes/Login.jsx";
import Usuarios from "../app/routes/Usuarios.jsx"; // 👈 tu CRUD de usuarios
import ReporteVisitas from "./reports/ReporteVisitas.jsx"; // 👈 NUEVO: módulo de reportes
import { isAdmin } from "../app/utils/auth.js";
import Dashboard from "./pages/Dashboard.jsx";
import VisitasPorTecnico from "../src/pages/VisitasPorTecnico.jsx";

// ✅ Toastify
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function App() {
  const location = useLocation();
  const path = location.pathname.toLowerCase();

  // ✅ Páginas sin sidebar (landing y login)
  const hideSidebar = path === "/" || path === "/login";

  // ✅ Páginas que NO deben tener margen adicional
  const noMarginPages = ["/clientes", "/visitas", "/historicokanban"];

  return (
    <div style={appWrapper}>
      {/* ✅ Sidebar visible en todo menos landing/login */}
      {!hideSidebar && <Sidebar />}

      {/* ✅ Contenido principal */}
      <div
        style={{
          ...mainContent,
          marginLeft:
            hideSidebar || noMarginPages.includes(path) ? 0 : "230px",
        }}
      >
        <Routes>
          {/* Páginas públicas */}
          <Route path="/" element={<HeroLanding />} />
          <Route path="/login" element={<Login />} />

          {/* Módulos principales */}
          <Route path="/clientes" element={<Clientes />} />
          <Route path="/visitas" element={<SupervisorDashboard />} />
          <Route path="/historicokanban" element={<HistoricoKanban />} />
          <Route path="/dashboard" element={<Dashboard />} />
<Route path="/visitas-portecnico" element={<VisitasPorTecnico />} />

          <Route path="/tickets" element={<Tickets />} />

          {/* ✅ Nuevo módulo: Reportes */}
          <Route path="/reportes" element={<ReporteVisitas />} />

          {/* Solo admin */}
          <Route
            path="/usuarios"
            element={
              isAdmin() ? (
                <Usuarios />
              ) : (
                <p style={forbidden}>🚫 Acceso no autorizado</p>
              )
            }
          />

          {/* 404 */}
          <Route
            path="*"
            element={
              <p style={{ padding: 24, color: "#fff" }}>
                404 — Página no encontrada
              </p>
            }
          />
        </Routes>
      </div>

      {/* ✅ Toast container */}
      <ToastContainer position="top-right" autoClose={3000} theme="dark" />
    </div>
  );
}

/* 🎨 Estilos base */
const appWrapper = {
  display: "flex",
  minHeight: "100vh",
  background:
    "radial-gradient(1200px 600px at -10% -10%, #0b1118 0%, #0c1116 30%, #0a0d12 80%)",
  color: "#e5e7eb",
  overflow: "hidden",
};

const mainContent = {
  flex: 1,
  padding: "0",
  background: "transparent",
  minHeight: "100vh",
  overflowY: "auto",
};

const forbidden = {
  padding: 40,
  color: "#f87171",
  fontWeight: "bold",
  textAlign: "center",
};
