// src/components/HeroLanding.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import "./HeroLanding.css";

export default function HeroLanding() {
  const navigate = useNavigate();

  return (
    <section className="hero">
      <div className="hero-overlay">
        <div className="hero-content">
          <h1 className="hero-title">
            Gestión inteligente de visitas y <br /> 
            soporte técnico en tiempo real.
          </h1>
          <p className="hero-subtitle">
            Centraliza clientes, asigna técnicos automáticamente y controla las visitas desde un solo panel.
          </p>

          <div className="hero-buttons">
            <button
              className="btn-primary"
              onClick={() => navigate("/login")} // ✅ Ahora va a /login
            >
              🚀 Iniciar sesión
            </button>

            <button className="btn-secondary">
              👁 Ver demo →
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
