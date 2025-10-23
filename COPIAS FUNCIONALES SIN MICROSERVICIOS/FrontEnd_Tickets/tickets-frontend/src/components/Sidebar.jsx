import { NavLink, useNavigate } from "react-router-dom";
import { clearAuth, getUser, getRoleId } from "../../app/utils/auth";

export default function Sidebar() {
  const nav = useNavigate();
  const user = getUser();
  const isAdmin = getRoleId() === 1;

  const logout = () => {
    clearAuth();
    nav("/login", { replace: true });
  };

  return (
    <div style={sidebarStyle}>
      <div style={logoStyle}>⚙ SkyNet S. A.</div>

      <nav style={{ flex: 1, marginTop: 30 }}>
        <SidebarLink to="/clientes" icon="👥">Clientes</SidebarLink>
        <SidebarLink to="/visitas" icon="📍">Visitas Activas</SidebarLink>
        <SidebarLink to="/historicokanban" icon="📊">Histórico Kanban</SidebarLink>
        {isAdmin && <SidebarLink to="/usuarios" icon="🧑‍💼">Usuarios</SidebarLink>}
      </nav>

      <div style={footerStyle}>
        <div style={{ fontSize: 14, opacity: 0.75, marginBottom: 8 }}>
          👤 <strong>{user}</strong>
        </div>
        <button style={logoutBtn} onClick={logout}>🚪 Salir</button>
      </div>
    </div>
  );
}


// ✅ Link estilizado
function SidebarLink({ to, icon, children }) {
  return (
    <NavLink
      to={to}
      style={({ isActive }) => ({
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "14px 16px",
        margin: "6px 6px",
        borderRadius: 10,
        textDecoration: "none",
        color: isActive ? "#fff" : "#d2d9e3",
        background: isActive
          ? "linear-gradient(90deg, rgba(255,255,255,0.15), rgba(255,255,255,0.05))"
          : "transparent",
        transition: "all .25s ease",
        fontSize: 17,
        fontWeight: isActive ? 700 : 500,
        letterSpacing: "0.3px",
        boxShadow: isActive ? "0 0 12px rgba(255,255,255,0.1)" : "none",
      })}
    >
      <span style={{ fontSize: 20 }}>{icon}</span>
      {children}
    </NavLink>
  );
}


/* 🎨 Estilos generales */
const sidebarStyle = {
  width: "240px",
  backdropFilter: "blur(18px)",
  WebkitBackdropFilter: "blur(18px)",
  background:
    "linear-gradient(180deg, rgba(22,30,42,0.85), rgba(18,22,30,0.78))",
  borderRight: "1px solid rgba(255,255,255,0.06)",
  color: "#fff",
  display: "flex",
  flexDirection: "column",
  padding: "22px 14px",
  height: "100vh",
  position: "fixed",
  left: 0,
  top: 0,
  zIndex: 1000,
};

const logoStyle = {
  fontSize: 22,
  fontWeight: 800,
  padding: "10px 6px",
  letterSpacing: "0.8px",
  color: "#fff",
  textShadow: "0 0 10px rgba(0,153,255,0.4)",
  userSelect: "none",
};

const footerStyle = {
  padding: "14px 8px",
  borderTop: "1px solid rgba(255,255,255,0.08)",
  marginTop: 20,
};

const logoutBtn = {
  width: "100%",
  padding: "10px 16px",
  background: "linear-gradient(90deg, #e63a3c, #d3262a)",
  border: "none",
  borderRadius: 10,
  color: "#fff",
  cursor: "pointer",
  fontWeight: 700,
  fontSize: 15,
  letterSpacing: "0.3px",
  transition: "0.2s ease",
};
logoutBtn[":hover"] = {
  background: "linear-gradient(90deg, #ff4d4f, #e02d30)",
};
