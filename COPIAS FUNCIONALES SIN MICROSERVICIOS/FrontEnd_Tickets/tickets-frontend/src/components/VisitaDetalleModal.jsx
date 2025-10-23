// ✅ src/components/VisitaDetalleModal.jsx (LIMPIO sin "Hora de Ingreso")
import { useEffect, useState } from "react";

export default function VisitaDetalleModal({ ticketId, onClose }) {
  const [data, setData] = useState(null);

  // ✅ Obtener token
  const auth = localStorage.getItem("auth");
  const token = auth ? JSON.parse(auth).token : null;

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`http://localhost:5058/api/tickets/${ticketId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error("Error cargando detalles:", err);
      }
    }
    fetchData();
  }, [ticketId]);

  if (!data) return null;

  return (
    <div style={overlay} onClick={onClose}>
      <div style={modal} onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div style={header}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16 }}>
              🎫 Ticket #{data.ticketId} — {data.titulo}
            </div>
            <div style={{ fontSize: 12, opacity: 0.7 }}>
              Cliente: {data.clienteNombre} • Técnico: {data.asignadoA || "Sin asignar"}
            </div>
          </div>

          {/* Botón cerrar */}
          <button style={btnClose} onClick={onClose}>✕</button>
        </div>

        {/* Contenido */}
        <div style={{ padding: "16px" }}>
          <p><strong>📌 Estado:</strong> <Badge color={data.estado === "En Progreso" ? "#facc15" : "#4ade80"}>{data.estado}</Badge></p>
          <p><strong>⚠ Prioridad:</strong> <Badge color={data.prioridad === "Alta" ? "#ef4444" : "#3b82f6"}>{data.prioridad}</Badge></p>

          {data.descripcion && (
            <p><strong>📝 Descripción:</strong><br />{data.descripcion}</p>
          )}

          {data.limiteEl && (
            <p><strong>⏳ Fecha Límite:</strong> {new Date(data.limiteEl).toLocaleString()}</p>
          )}
        </div>
      </div>
    </div>
  );
}

// Etiqueta visual
function Badge({ color, children }) {
  return (
    <span style={{
      background: color,
      color: "#111",
      padding: "2px 8px",
      borderRadius: "6px",
      fontWeight: 600,
      fontSize: 12
    }}>
      {children}
    </span>
  );
}

/* ==== Estilos inline estilo Glass UI ==== */
const overlay = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,.55)",
  backdropFilter: "blur(6px)",
  display: "grid",
  placeItems: "center",
  zIndex: 9999,
  padding: 16,
};
const modal = {
  width: "100%",
  maxWidth: 600,
  background: "radial-gradient(100% 100% at 50% 0%, #14181c 0%, #171c21 100%)",
  border: "1px solid #26313b",
  borderRadius: 16,
  boxShadow: "0 20px 80px rgba(0,0,0,.5)",
  overflow: "hidden",
};
const header = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "12px 14px",
  borderBottom: "1px solid #26313b",
  color: "#e6edf3",
};
const btnClose = {
  width: 34,
  height: 34,
  borderRadius: "50%",
  border: "none",
  cursor: "pointer",
  background: "rgba(255,75,75,0.9)",
  color: "white",
  fontWeight: 700,
  boxShadow: "0 4px 15px rgba(0,0,0,.4)",
};
