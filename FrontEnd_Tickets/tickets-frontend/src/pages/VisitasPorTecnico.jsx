// ============================================================
// 🧑‍🔧 VisitasPorTecnico.jsx — Admin / Supervisor Dashboard (Glass Dark Mejorado)
// ============================================================
import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar.jsx";
import { obtenerUsuarios } from "../../app/api/usuariosApi.js";
import { ticketsApi } from "../../app/config/axios.js";
import { getToken } from "../../app/utils/auth.js";
import "../pages/VisitasGlass.css";

export default function VisitasPorTecnico() {
  const [tecnicos, setTecnicos] = useState([]);
  const [visitas, setVisitas] = useState([]);
  const [selected, setSelected] = useState("");
  const [loading, setLoading] = useState(false);

  // ============================================================
  // 🔹 Cargar técnicos (rolId = 5)
  // ============================================================
  useEffect(() => {
    async function loadTecnicos() {
      try {
        const data = await obtenerUsuarios(5);
        setTecnicos(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error("❌ Error cargando técnicos:", e);
      }
    }
    loadTecnicos();
  }, []);

  // ============================================================
  // 🔹 Consultar visitas activas del técnico seleccionado
  // ============================================================
  async function loadVisitasPorTecnico(id) {
    if (!id) return;
    setLoading(true);
    setVisitas([]);

    try {
      const token = getToken();
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await ticketsApi.get(`/tickets/visitas/tecnico/${id}`, { headers });
      setVisitas(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.error("❌ Error obteniendo visitas del técnico:", e);
    } finally {
      setLoading(false);
    }
  }

  // ============================================================
  // 💅 Render principal (Glass UI mejorado)
  // ============================================================
  return (
    <>
      <Sidebar />
      <div className="vd-wrap" style={{ marginLeft: 0 }}>
        <div className="vd-lights" />
        <div className="vd-container">
          {/* Header */}
          <header className="vd-head">
            <div className="vd-title" style={{ alignItems: "center", gap: 10 }}>
              <span
                className="pin"
                style={{
                  fontSize: 24,
                  filter: "drop-shadow(0 0 6px rgba(0,180,255,0.8))",
                }}
              >
                🧑‍🔧
              </span>
              <h2 style={{ letterSpacing: 0.5 }}>Visitas por Técnico</h2>
            </div>
          </header>

          {/* 🔽 Selector */}
          <div
            className="glass"
            style={{
              padding: 24,
              marginBottom: 25,
              border: "1px solid rgba(80,140,255,0.2)",
              boxShadow: "0 0 25px rgba(0,80,255,0.1)",
              borderRadius: 14,
            }}
          >
            <label
              style={{
                color: "#a7d4ff",
                fontWeight: 600,
                fontSize: 15,
                marginBottom: 8,
                display: "block",
              }}
            >
              Selecciona un técnico:
            </label>
            <select
              value={selected}
              onChange={(e) => {
                const id = e.target.value;
                setSelected(id);
                loadVisitasPorTecnico(id);
              }}
              style={{
                width: "100%",
                marginTop: 6,
                padding: "12px 14px",
                borderRadius: 12,
                background: "rgba(15,20,24,0.9)",
                color: "#e6edf3",
                border: "1px solid #26313b",
                fontSize: 15,
                boxShadow: "inset 0 0 8px rgba(0,150,255,0.15)",
                outline: "none",
                transition: "0.3s all",
              }}
            >
              <option value="">— Selecciona técnico —</option>
              {tecnicos.map((t) => (
                <option key={t.usuarioId} value={t.usuarioId}>
                  {t.nombre} {t.apellido}
                </option>
              ))}
            </select>
          </div>

          {/* 📋 Tabla mejor alineada */}
          <div
            className="glass"
            style={{
              padding: 22,
              borderRadius: 16,
              border: "1px solid rgba(80,140,255,0.2)",
              boxShadow: "0 0 35px rgba(0,80,255,0.08)",
            }}
          >
            {loading ? (
              <p
                style={{
                  textAlign: "center",
                  color: "#87bfff",
                  fontStyle: "italic",
                  padding: 40,
                }}
              >
                Cargando visitas...
              </p>
            ) : visitas.length ? (
              <div className="vd-table" style={{ width: "100%", overflowX: "auto" }}>
                {/* Contador dinámico */}
                <p
                  style={{
                    textAlign: "right",
                    color: "#9fd2ff",
                    fontSize: 14,
                    marginBottom: 8,
                    opacity: 0.9,
                  }}
                >
                  👷 {visitas.length} visita{visitas.length > 1 ? "s" : ""} activa
                  {visitas.length > 1 ? "s" : ""}
                </p>

                {/* Encabezado */}
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    color: "#d3e9ff",
                    fontSize: 14,
                    textAlign: "center",
                  }}
                >
                  <thead>
                    <tr
                      style={{
                        background: "rgba(255,255,255,0.05)",
                        color: "#9fd2ff",
                        textTransform: "uppercase",
                        letterSpacing: 0.5,
                        fontSize: 13,
                      }}
                    >
                      <th style={{ padding: "10px 8px", width: "80px" }}>ID</th>
                      <th style={{ padding: "10px 8px", width: "220px" }}>Cliente</th>
                      <th style={{ padding: "10px 8px", width: "280px" }}>Título</th>
                      <th style={{ padding: "10px 8px", width: "130px" }}>Estado</th>
                      <th style={{ padding: "10px 8px", width: "160px" }}>Fecha Límite</th>
                      <th style={{ padding: "10px 8px", width: "130px" }}>Ubicación</th>
                    </tr>
                  </thead>

                  <tbody>
                    {visitas.map((v, i) => (
                      <tr
                        key={v.ticketId}
                        style={{
                          background:
                            i % 2 === 0
                              ? "rgba(255,255,255,0.03)"
                              : "rgba(255,255,255,0.05)",
                          borderTop: "1px solid rgba(255,255,255,0.07)",
                          transition: "0.25s all",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.background = "rgba(0,100,255,0.15)")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.background =
                            i % 2 === 0
                              ? "rgba(255,255,255,0.03)"
                              : "rgba(255,255,255,0.05)")
                        }
                      >
                        <td style={{ padding: "10px 8px", color: "#7cbfff" }}>
                          <strong>#{v.ticketId}</strong>
                        </td>
                        <td style={{ padding: "10px 8px" }}>{v.cliente}</td>
                        <td style={{ padding: "10px 8px", color: "#9fd2ff" }}>
                          {v.titulo}
                        </td>
                        <td
                          style={{
                            padding: "10px 8px",
                            fontWeight: 600,
                            color:
                              v.estado === "En proceso"
                                ? "#ffb74d"
                                : v.estado === "Abierto"
                                ? "#4FC3F7"
                                : "#81C784",
                          }}
                        >
                          {v.estado}
                        </td>
                        <td style={{ padding: "10px 8px", opacity: 0.8 }}>
                          {v.fechaLimite
                            ? new Date(v.fechaLimite).toLocaleDateString("es-GT", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })
                            : "—"}
                        </td>
                        <td style={{ padding: "10px 8px" }}>
                          {v.googleMapsUrl ? (
                            <a
                              href={v.googleMapsUrl}
                              target="_blank"
                              rel="noreferrer"
                              style={{
                                color: "#00bcd4",
                                textDecoration: "none",
                                fontWeight: 500,
                              }}
                            >
                              🌍 Ver mapa
                            </a>
                          ) : (
                            <span style={{ opacity: 0.3 }}>—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : selected ? (
              <p
                style={{
                  textAlign: "center",
                  opacity: 0.6,
                  padding: 50,
                  fontSize: 15,
                  color: "#a8cfff",
                }}
              >
                No hay visitas activas para este técnico.
              </p>
            ) : (
              <p
                style={{
                  textAlign: "center",
                  opacity: 0.6,
                  padding: 50,
                  fontSize: 15,
                  color: "#a8cfff",
                }}
              >
                Selecciona un técnico para ver sus visitas.
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
