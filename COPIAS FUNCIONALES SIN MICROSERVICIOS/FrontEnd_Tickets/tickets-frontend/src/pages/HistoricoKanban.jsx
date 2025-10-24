// ✅ src/pages/HistoricoKanban.jsx — versión final con normalización de estado + arrastre funcional
import { useEffect, useMemo, useState } from "react";
import Sidebar from "../../src/components/Sidebar.jsx";
import {
  obtenerTickets,
  actualizarTicket,
  eliminarTicket,
} from "../../app/api/ticketsApi.js";
import MapaModal from "../components/MapaModal.jsx";
import ConfirmModal from "../components/ConfirmModal.jsx";
import "../pages/VisitasGlass.css";
import { useToasts } from "../components/useToasts.jsx";

const ESTADOS = [
  { estadoId: 1, nombre: "Abierto" },
  { estadoId: 2, nombre: "En Proceso" },
  { estadoId: 3, nombre: "Resuelto" },
  { estadoId: 4, nombre: "Cerrado" },
];

const PRIORIDADES = {
  1: "Baja",
  2: "Media",
  3: "Alta",
};

export default function HistoricoKanban() {
  const [tickets, setTickets] = useState([]);
  const [busy, setBusy] = useState(false);
  const [mapData, setMapData] = useState(null);
  const [editTicket, setEditTicket] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [ticketToDelete, setTicketToDelete] = useState(null);
  const { push, Toasts } = useToasts();

  useEffect(() => {
    cargar();
    // 🔄 Escucha eventos globales de cierre (desde Dashboard)
    window.addEventListener("kanbanRefresh", cargar);
    return () => window.removeEventListener("kanbanRefresh", cargar);
  }, []);

  // 🔹 Cargar todos los tickets y normalizar
  async function cargar() {
    try {
      const data = await obtenerTickets();

      // 🔹 Normalizar estructura
      const normalizados = (Array.isArray(data) ? data : []).map((t) => {
        let estadoId = 1;
        switch ((t.estado || "").toLowerCase()) {
          case "abierto":
            estadoId = 1;
            break;
          case "en progreso":
          case "en proceso":
            estadoId = 2;
            break;
          case "resuelto":
            estadoId = 3;
            break;
          case "cerrado":
            estadoId = 4;
            break;
        }
        return {
          ...t,
          estadoId,
          clienteNombre: t.cliente,
          asignadoA: t.tecnico,
        };
      });

      setTickets(normalizados);
    } catch (err) {
      console.error("Error cargando tickets:", err);
      push("❌ Error cargando tickets del servidor", "error");
    }
  }

  // 🔄 Mover ticket entre columnas
  async function moverTicket(ticketId, nuevoEstadoId) {
    if (busy) return;
    setBusy(true);
    try {
      await actualizarTicket(ticketId, { estadoId: Number(nuevoEstadoId) });
      setTickets((prev) =>
        prev.map((t) =>
          t.ticketId === ticketId ? { ...t, estadoId: Number(nuevoEstadoId) } : t
        )
      );
      push("🔄 Estado actualizado correctamente", "info");
    } catch (err) {
      console.error("Error al mover ticket", err);
      push("❌ No se pudo actualizar el estado", "error");
    } finally {
      setBusy(false);
    }
  }

  // 🗑️ Confirmar borrado
  async function confirmarBorrado() {
    if (!ticketToDelete) return;
    try {
      await eliminarTicket(ticketToDelete);
      setTickets((prev) => prev.filter((t) => t.ticketId !== ticketToDelete));
      push("🗑️ Ticket eliminado correctamente", "success");
    } catch (err) {
      console.error("Error eliminando ticket", err);
      push("❌ No se pudo eliminar el ticket", "error");
    } finally {
      setShowConfirm(false);
      setTicketToDelete(null);
    }
  }

  // ✏️ Guardar cambios de edición
  async function guardarCambios() {
    if (!editTicket) return;
    try {
      await actualizarTicket(editTicket.ticketId, {
        titulo: editTicket.titulo,
        prioridadId: editTicket.prioridadId,
        descripcion: editTicket.descripcion,
      });
      setTickets((prev) =>
        prev.map((t) =>
          t.ticketId === editTicket.ticketId ? { ...t, ...editTicket } : t
        )
      );
      push("✅ Ticket actualizado correctamente", "success");
      setEditTicket(null);
    } catch (err) {
      console.error("Error al actualizar", err);
      push("❌ No se pudo actualizar el ticket", "error");
    }
  }

  // 🗺️ Ver mapa
  function abrirMapa(t) {
    const lat = Number(t.latitudSalida ?? t.latitudIngreso ?? null) || null;
    const lng = Number(t.longitudSalida ?? t.longitudIngreso ?? null) || null;
    if (lat == null || lng == null || isNaN(lat) || isNaN(lng)) {
      alert("Este ticket no tiene coordenadas válidas registradas.");
      return;
    }
    setMapData({
      lat,
      lng,
      cliente: t.clienteNombre ?? "Cliente",
      tecnico: t.asignadoA ?? "Técnico",
    });
  }

  const columnas = useMemo(() => ESTADOS, []);
  const porEstado = useMemo(() => {
    const map = new Map();
    columnas.forEach((c) => map.set(c.estadoId, []));
    tickets.forEach((t) => {
      const id = Number(t.estadoId) || 1;
      if (!map.has(id)) map.set(id, []);
      map.get(id).push(t);
    });
    return map;
  }, [tickets, columnas]);

  return (
    <>
      <Sidebar />
      <Toasts />

      <div className="vd-wrap" style={{ marginLeft: 230 }}>
        <div className="vd-lights" />
        <div className="vd-container">
          <header className="vd-head">
            <div className="vd-title">
              <span className="pin">📊</span>
              <h2>Kanban General de Tickets</h2>
            </div>
            {busy && (
              <div style={{ color: "#9fd2ff", fontSize: 12 }}>Guardando...</div>
            )}
          </header>

          {/* 🧱 GRID PRINCIPAL */}
          <div
            style={{
              display: "grid",
              gap: 18,
              gridTemplateColumns: "repeat(4, minmax(350px, 1fr))",
              alignItems: "flex-start",
            }}
          >
            {columnas.map((col) => (
              <div
                key={col.estadoId}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  const id = Number(e.dataTransfer.getData("text/plain"));
                  moverTicket(id, col.estadoId);
                }}
                className="vd-card glass"
                style={{
                  padding: 14,
                  minHeight: "600px",
                  transition: "0.2s",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 10,
                    alignItems: "center",
                  }}
                >
                  <h3 style={{ color: "#e8f2ff", margin: 0, fontWeight: 700 }}>
                    {col.nombre}
                  </h3>
                  <span
                    style={{
                      background:
                        "linear-gradient(180deg, rgba(255,255,255,.06), rgba(255,255,255,.02))",
                      border: "1px solid rgba(120,180,255,.25)",
                      color: "#9bd4ff",
                      padding: "4px 10px",
                      borderRadius: 12,
                      fontSize: 12,
                    }}
                  >
                    {porEstado.get(col.estadoId)?.length ?? 0}
                  </span>
                </div>

                {/* 🔹 Tarjetas */}
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {(porEstado.get(col.estadoId) ?? []).map((t) => (
                    <div
                      key={t.ticketId}
                      draggable
                      onDragStart={(e) =>
                        e.dataTransfer.setData("text/plain", String(t.ticketId))
                      }
                      style={{
                        padding: "14px 16px",
                        borderRadius: 14,
                        display: "flex",
                        flexDirection: "column",
                        gap: 6,
                        cursor: "grab",
                        background:
                          "linear-gradient(145deg, rgba(255,255,255,0.06), rgba(0,0,0,0.15))",
                        boxShadow:
                          "0 2px 5px rgba(0,0,0,0.3), inset 0 0 1px rgba(255,255,255,0.1), inset 0 0 12px rgba(90,170,255,0.1)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        backdropFilter: "blur(6px)",
                        transition: "all 0.25s ease",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <span style={{ color: "#9bd4ff", fontWeight: 700 }}>
                          #{t.ticketId}
                        </span>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button
                            className="btn-pill glass"
                            style={{ padding: "4px 10px", fontSize: 12 }}
                            onClick={() => abrirMapa(t)}
                            title="Ver ubicación"
                          >
                            📍
                          </button>
                          <button
                            className="btn-pill glass"
                            style={{
                              padding: "4px 10px",
                              fontSize: 12,
                              background: "rgba(255,255,255,0.08)",
                            }}
                            onClick={() => setEditTicket(t)}
                            title="Editar ticket"
                          >
                            ✏️
                          </button>
                          <button
                            className="btn-pill danger"
                            style={{
                              padding: "4px 8px",
                              fontSize: 12,
                              background: "rgba(255,80,80,0.15)",
                              border: "1px solid rgba(255,120,120,0.35)",
                              color: "#ff9b9b",
                              cursor: "pointer",
                            }}
                            onClick={() => {
                              setTicketToDelete(t.ticketId);
                              setShowConfirm(true);
                            }}
                            title="Eliminar ticket"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                      <div style={{ fontWeight: 700 }}>{t.titulo}</div>
                      <div style={{ fontSize: 12, color: "#9bbce3" }}>
                        {PRIORIDADES[t.prioridadId]} • {t.clienteNombre}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {mapData && (
        <MapaModal
          lat={mapData.lat}
          lng={mapData.lng}
          cliente={mapData.cliente}
          tecnico={mapData.tecnico}
          onClose={() => setMapData(null)}
        />
      )}

      {editTicket && (
        <EditTicketModal
          editTicket={editTicket}
          setEditTicket={setEditTicket}
          guardarCambios={guardarCambios}
        />
      )}

      <ConfirmModal
        open={showConfirm}
        message="¿Deseas eliminar este ticket del histórico?"
        onConfirm={confirmarBorrado}
        onCancel={() => {
          setShowConfirm(false);
          setTicketToDelete(null);
        }}
      />
    </>
  );
}

// 🧱 Modal de edición
function EditTicketModal({ editTicket, setEditTicket, guardarCambios }) {
  const inputStyle = {
    width: "100%",
    background: "rgba(255,255,255,0.1)",
    border: "1px solid rgba(255,255,255,0.2)",
    borderRadius: 8,
    color: "#fff",
    padding: "6px 10px",
    marginBottom: 10,
  };
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: "rgba(0,0,0,0.6)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
        backdropFilter: "blur(8px)",
      }}
    >
      <div
        style={{
          background: "rgba(30,41,59,0.95)",
          borderRadius: 16,
          padding: 24,
          width: 400,
          color: "#fff",
          boxShadow: "0 0 25px rgba(0,0,0,0.4)",
        }}
      >
        <h3 style={{ marginBottom: 16 }}>
          ✏️ Editar Ticket #{editTicket.ticketId}
        </h3>

        <label>Título</label>
        <input
          style={inputStyle}
          value={editTicket.titulo}
          onChange={(e) =>
            setEditTicket({ ...editTicket, titulo: e.target.value })
          }
        />

        <label>Descripción</label>
        <textarea
          style={{ ...inputStyle, height: 80 }}
          value={editTicket.descripcion || ""}
          onChange={(e) =>
            setEditTicket({ ...editTicket, descripcion: e.target.value })
          }
        />

        <label>Prioridad</label>
        <select
          style={inputStyle}
          value={editTicket.prioridadId}
          onChange={(e) =>
            setEditTicket({
              ...editTicket,
              prioridadId: Number(e.target.value),
            })
          }
        >
          <option value={1}>Baja</option>
          <option value={2}>Media</option>
          <option value={3}>Alta</option>
        </select>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <button className="btn-pill glass" onClick={() => setEditTicket(null)}>
            ❌ Cancelar
          </button>
          <button
            className="btn-pill glass"
            style={{
              background: "rgba(0,255,160,0.15)",
              border: "1px solid rgba(0,255,160,0.35)",
              color: "#7affc3",
            }}
            onClick={guardarCambios}
          >
            💾 Guardar
          </button>
        </div>
      </div>
    </div>
  );
}
