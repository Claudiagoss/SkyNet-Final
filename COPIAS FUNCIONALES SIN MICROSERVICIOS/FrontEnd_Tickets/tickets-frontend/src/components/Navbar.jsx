// src/components/Navbar.jsx
import { Link, NavLink, useNavigate } from "react-router-dom";
import { getUser, clearAuth, isLoggedIn, canCreateVisita, getRoleId } from "../../app/utils/auth";

const linkStyle = ({ isActive }) => ({
  padding: "8px 16px",
  borderRadius: "8px",
  textDecoration: "none",
  color: isActive ? "#fff" : "#ddd",
  background: isActive ? "#1a1a1a" : "#2b2b2b",
  fontSize: "14px",
  transition: "0.2s",
});

export default function Navbar() {
  const user = getUser();
  const roleId = getRoleId();
  const nav = useNavigate();

  const logout = () => {
    clearAuth();
    nav("/login", { replace: true });
  };

  return (
    <nav
      style={{
        padding: "12px 24px",
        borderBottom: "1px solid #333",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        background: "#222",
      }}
    >
      {/* LOGO */}
      <Link
        to="/"
        style={{
          fontWeight: 700,
          color: "#fff",
          textDecoration: "none",
          fontSize: "16px",
        }}
      >
        ⚙ SkyNet S. A.
      </Link>

      {/* MENÚ SOLO SI HAY LOGIN */}
      {isLoggedIn() && (
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          {/* Solo ADMIN (1) y SUPERVISOR (4) */}
          {canCreateVisita() && (
            <>
              <NavLink to="/clientes" style={linkStyle}>
                Clientes
              </NavLink>
              <NavLink to="/visitas" style={linkStyle}>
                Visitas activas
              </NavLink>
              <NavLink to="/historicokanban" style={linkStyle}>
                Histórico Kanban
              </NavLink>
            </>
          )}

          {/* Solo ADMIN (1) */}
          {roleId === 1 && (
            <>
              <NavLink to="/asignaciones" style={linkStyle}>
                Asignaciones
              </NavLink>
              <NavLink to="/reportes" style={linkStyle}>
                Reportes
              </NavLink>
            </>
          )}

          {/* BOTÓN SALIR */}
          <button
            onClick={logout}
            style={{
              background: "#ff3b30",
              padding: "8px 14px",
              borderRadius: "6px",
              border: "none",
              cursor: "pointer",
              color: "white",
              fontWeight: "bold",
              marginLeft: "8px",
            }}
          >
            👤 {user} — Salir
          </button>
        </div>
      )}

      {/* NO LOGUEADO — SOLO ENTRAR */}
      {!isLoggedIn() && (
        <button
          onClick={() => nav("/login")}
          style={{
            background: "#ff3b30",
            padding: "8px 14px",
            borderRadius: "6px",
            border: "none",
            cursor: "pointer",
            color: "white",
            fontWeight: "bold",
          }}
        >
          Entrar
        </button>
      )}
    </nav>
  );
}
