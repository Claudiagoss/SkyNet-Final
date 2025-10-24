// src/routes/Login.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../api/authApi";
import { saveAuth } from "../utils/auth";


export default function Login() {
  const nav = useNavigate();
  const [form, setForm] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    setTimeout(() => setAnimate(true), 80);
  }, []);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { token, usuario, rol } = await login(form);
      saveAuth({ token, usuario, rol });
      nav("/visitas", { replace: true });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={pageWrapper}>
      {/* 🌌 Luces de fondo */}
      <div className="light-bg"></div>

      {/* 🎭 Contenedor animado */}
      <div style={{ ...loginBox, ...(animate ? loginBoxShow : loginBoxHidden) }}>
        <h2 style={title}>Bienvenido</h2>
        <p style={subtitle}>Inicia sesión para continuar</p>

        <form onSubmit={onSubmit}>
          <div style={fieldGroup}>
            <label style={label}>Usuario</label>
            <input type="text" name="username" value={form.username} onChange={onChange} style={input} placeholder="Escribe tu usuario" />
          </div>

          <div style={fieldGroup}>
            <label style={label}>Contraseña</label>
            <input type="password" name="password" value={form.password} onChange={onChange} style={input} placeholder="••••••••" />
          </div>

          <button type="submit" style={btnLogin}>
            {loading ? "Accediendo..." : "Entrar 🔓"}
          </button>
        </form>
      </div>
    </div>
  );
}

// 🎨 Estilos inline — Modernizados
const pageWrapper = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  height: "100vh",
  position: "relative",
  background: "linear-gradient(140deg, #eef2f7, #e6edff)",
  overflow: "hidden",
};

const loginBox = {
  background: "white",
  padding: "40px 50px",
  borderRadius: "16px",
  boxShadow: "0 20px 45px rgba(0,0,0,0.12)",
  width: "380px",
  textAlign: "center",
  transition: "all 0.4s ease",
  border: "1px solid rgba(255,255,255,0.5)",
  position: "relative",
  zIndex: 2,
};

const loginBoxHidden = { opacity: 0, transform: "scale(0.92)" };
const loginBoxShow = { opacity: 1, transform: "scale(1)" };

const title = { fontSize: "24px", fontWeight: "700", color: "#333", marginBottom: "4px" };
const subtitle = { fontSize: "14px", color: "#777", marginBottom: "20px" };
const fieldGroup = { textAlign: "left", marginBottom: "14px" };
const label = { fontSize: "13px", color: "#555", marginBottom: "4px", display: "block" };

const input = {
  width: "100%",
  padding: "11px",
  borderRadius: "8px",
  border: "1px solid #dcdcdc",
  fontSize: "14px",
  background: "#f9fbff",
  outline: "none", // ❌ SIN borde azul
};

const btnLogin = {
  width: "100%",
  background: "linear-gradient(90deg, #007bff, #4C8BFF)",
  color: "white",
  padding: "12px",
  border: "none",
  borderRadius: "8px",
  fontWeight: "600",
  cursor: "pointer",
  boxShadow: "0 6px 15px rgba(76, 139, 255, 0.4)",
  transition: "0.3s",
};
