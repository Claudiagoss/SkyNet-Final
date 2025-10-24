// ✅ src/components/KanbanView.jsx — versión final con arrastre + sincronización completa
import { useMemo, useState, useEffect } from "react";
import { cerrarTicket, cambiarEstadoTicket } from "../../app/api/ticketsApi.js";
import MapaModal from "./MapaModal.jsx";
import { useToasts } from "./useToasts.jsx";

export default function KanbanView({ tickets, estados, prioridades, onUpdate, onClosed }) {
  const [draggingId, setDraggingId] = useState(null);
  const [busy, setBusy] = useState(false);
  const [mapData, setMapData] = useState(null);
  const { push, Toasts } = useToasts();

  // 🔹 Agrupar por estado
  const columnas = useMemo(() => estados, [estados]);
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

  // 🔹 Manejar drag & drop
  async function moverTicket(ticketId, nuevoEstadoId) {
    if (busy) return;
    setBusy(true);
    try {
      const estadoDestino = estados.find((e) => e.estadoId === nuevoEstadoId);
      const esFinal =
        nuevoEstadoId === 3 ||
        nuevoEstadoId === 4 ||
        estadoDestino?.nombre?.toLowerCase().includes("resuelto") ||
        estadoDestino?.nombre?.toLowerCase().includes("cerrado");

      if (esFinal) {
        // Cerrar ticket = enviar correo y actualizar
        await cerrarTicket(ticketId);
        push("✅ Ticket cerrado correctamente", "success");
        push("📧 Correo enviado correctamente", "info");

        // 🔄 Notificar al Dashboard
        if (onClosed) onClosed(ticketId);

        // 🌐 Evento global (para HistoricoKanban)
        if (window.dispatchEvent) {
          window.dispatchEvent(
            new CustomEvent("kanbanRefresh", {
              detail: { id: ticketId, estadoId: nuevoEstadoId },
            })
          );
        }
      } else {
        // Solo cambiar estado normal
        await cambiarEstadoTicket(ticketId, nuevoEstadoId);
        push("🔄 Estado actualizado correctamente", "info");

        // 🔄 Actualiza dashboard local
        if (onUpdate) onUpdate(ticketId, nuevoEstadoId);
      }
    } catch (err) {
      console.error("Error al mover ticket", err);
      push("❌ No se pudo actualizar el estado", "error");
    } finally {
      setBusy(false);
      setDraggingId(null);
    }
  }

  // 🔹 Escuchar eventos de actualización global (sin recargar)
  useEffect(() => {
    const handler = (e) => {
      const { id, estadoId } = e.detail || {};
      if (!id || !estadoId) return;
      if (onUpdate) onUpdate(id, estadoId);
    };
    window.addEventListener("kanbanRefresh", handler);
    return () => window.removeEventListener("kanbanRefresh", handler);
  }, [onUpdate]);

  return (
    <>
      <Toasts />

      <div className="kanban-head">
        <div className="legend">
          <span className="dot open" /> Abierto
          <span className="dot prog" /> En Proceso
          <span className="dot solved" /> Resuelto
          <span className="dot closed" /> Cerrado
        </div>
        {busy && <div className="spinner">Guardando...</div>}
      </div>

      {/* 🧱 GRID DE COLUMNAS */}
      <div className="kanban-grid">
        {columnas.map((col) => (
          <div
            key={col.estadoId}
            className="kanban-col"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const id = Number(e.dataTransfer.getData("text/plain"));
              moverTicket(id, col.estadoId);
            }}
          >
            <div className="kanban-col-head">
              <h3>{col.nombre}</h3>
              <span className="pill">{porEstado.get(col.estadoId)?.length ?? 0}</span>
            </div>

            {/* 🔹 Tarjetas */}
            <div className="kanban-dropzone">
              {(porEstado.get(col.estadoId) ?? []).map((t) => (
                <div
                  key={t.ticketId}
                  draggable
                  onDragStart={(e) => {
                    setDraggingId(t.ticketId);
                    e.dataTransfer.setData("text/plain", String(t.ticketId));
                  }}
                  onDragEnd={() => setDraggingId(null)}
                  className={`kanban-card ${draggingId === t.ticketId ? "dragging" : ""}`}
                >
                  <div className="card-head">
                    <span className="ticket-id">#{t.ticketId}</span>
                    <button
                      className="btn-mini blue"
                      onClick={() =>
                        setMapData({
                          lat: t.latitudIngreso ?? 0,
                          lng: t.longitudIngreso ?? 0,
                          cliente: t.clienteNombre ?? t.cliente,
                          tecnico: t.asignadoA ?? t.tecnico,
                        })
                      }
                    >
                      📍
                    </button>
                  </div>

                  <div className="card-title">{t.titulo || "—"}</div>
                  <div className="card-meta">
                    <span className="badge">
                      {prioridades.find((p) => p.prioridadId === t.prioridadId)?.nombre ||
                        "N/A"}
                    </span>
                    <span className="meta">
                      {t.clienteNombre ?? t.cliente ?? "Cliente desconocido"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {mapData && <MapaModal {...mapData} onClose={() => setMapData(null)} />}
    </>
  );
}
