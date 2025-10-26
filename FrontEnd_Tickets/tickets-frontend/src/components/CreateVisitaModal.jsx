// ============================================================
// 🆕 CreateVisitaModal.jsx — Crear nueva visita técnica (SkyNet Frontend)
// ============================================================
import { useEffect, useState } from "react";
import axios from "axios";
import MapaSelector from "./MapaSelector.jsx";
import { crearVisitaConCheckIn } from "../../app/api/ticketsApi.js";
import { getToken } from "../../app/utils/auth.js";
import { obtenerUsuarios } from "../../app/api/usuariosApi.js"; // ✅ Importa desde AuthService

export default function CreateVisitaModal({ open, onClose, onCreated }) {
  const [clientes, setClientes] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    titulo: "",
    descripcion: "",
    clienteId: "",
    asignadoAUsuarioId: "",
    prioridadId: 2,
    estadoId: 1,
    limiteEl: "",
  });

  const [coord, setCoord] = useState({ lat: null, lng: null });

  // ✅ Base URL dinámica para clientes (TicketsService)
  const API_BASE =
    import.meta.env.VITE_TICKETS_BASE_URL ||
    "https://ticket-api-nueva-gcambrbedhawcaht.canadacentral-01.azurewebsites.net/api";

  // ============================================================
// 🔹 Cargar combos (Clientes del TicketsService y Técnicos del AuthService)
// ============================================================
useEffect(() => {
  if (!open) return;

  const authToken = getToken(); // ← cambio de nombre para evitar conflicto
  const headers = authToken ? { Authorization: `Bearer ${authToken}` } : {};

  async function load() {
    try {
      // 🧩 1. Cargar clientes (desde TicketsService)
      const clientesRes = await axios.get(`${API_BASE}/clientes`, { headers });
      const listaClientes = Array.isArray(clientesRes.data)
        ? clientesRes.data
        : [];
      setClientes(listaClientes);

      // 🧩 2. Cargar técnicos (desde AuthService) — SOLO rolId = 5
      const tecnicos = await obtenerUsuarios(5);
      setUsuarios(tecnicos);
    } catch (e) {
      console.error("❌ Error cargando combos:", e);
    }
  }

  load();
}, [open]);

  // ============================================================
  // 🔹 Cerrar modal y resetear formulario
  // ============================================================
  function close() {
    if (saving) return;
    onClose?.();
    setForm({
      titulo: "",
      descripcion: "",
      clienteId: "",
      asignadoAUsuarioId: "",
      prioridadId: 2,
      estadoId: 1,
      limiteEl: "",
    });
    setCoord({ lat: null, lng: null });
  }

  // ============================================================
  // 🔹 Enviar formulario (crear ticket + check-in)
  // ============================================================
  async function submit(e) {
    e.preventDefault();
    if (!form.clienteId) return alert("Selecciona un cliente.");
    if (!form.titulo.trim()) return alert("Escribe un título.");

    const auth = JSON.parse(localStorage.getItem("auth"));
    const payload = {
      titulo: form.titulo,
      descripcion: form.descripcion,
      clienteId: Number(form.clienteId),
      reportadoPorUsuarioId: auth?.usuarioId || 1,
      asignadoAUsuarioId: form.asignadoAUsuarioId
        ? Number(form.asignadoAUsuarioId)
        : null,
      prioridadId: Number(form.prioridadId),
      estadoId: Number(form.estadoId),
      limiteEl: form.limiteEl || null,
    };

    try {
      setSaving(true);
      await crearVisitaConCheckIn(payload, coord.lat, coord.lng);
      onCreated?.(); // refresca la lista
      close();
    } catch (err) {
      console.error("❌ Error creando visita:", err);
      alert("No se pudo crear la visita.");
    } finally {
      setSaving(false);
    }
  }

  if (!open) return null;

  // ============================================================
  // 💅 Render modal (Glass UI)
  // ============================================================
  return (
    <div style={overlay} onClick={close}>
      <div style={modal} onClick={(e) => e.stopPropagation()}>
        <div style={header}>
          <h3 style={{ margin: 0 }}>🆕 Nueva Visita</h3>
          <button onClick={close} style={xBtn}>✕</button>
        </div>

        <form onSubmit={submit} style={{ padding: 14 }}>
          <div className="grid-2">
            {/* CLIENTE */}
            <div className="field">
              <label>Cliente *</label>
              <select
                value={form.clienteId}
                onChange={(e) => setForm({ ...form, clienteId: e.target.value })}
                required
              >
                <option value="">— Selecciona —</option>
                {clientes.map((c) => (
                  <option key={c.clienteId} value={c.clienteId}>
                    {c.nombre}
                  </option>
                ))}
              </select>
            </div>

            {/* TÉCNICO */}
            <div className="field">
              <label>Técnico asignado</label>
              <select
                value={form.asignadoAUsuarioId}
                onChange={(e) =>
                  setForm({ ...form, asignadoAUsuarioId: e.target.value })
                }
              >
                <option value="">— (opcional) —</option>
                {usuarios.map((u) => (
                  <option key={u.usuarioId} value={u.usuarioId}>
                    👷 {u.nombre} {u.apellido}
                  </option>
                ))}
              </select>
            </div>

            {/* RESTO DE CAMPOS */}
            <div className="field">
              <label>Título *</label>
              <input
                value={form.titulo}
                onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                required
              />
            </div>

            <div className="field">
              <label>Prioridad</label>
              <select
                value={form.prioridadId}
                onChange={(e) => setForm({ ...form, prioridadId: e.target.value })}
              >
                <option value={1}>Baja</option>
                <option value={2}>Media</option>
                <option value={3}>Alta</option>
              </select>
            </div>

            <div className="field field-100">
              <label>Descripción</label>
              <textarea
                rows={3}
                value={form.descripcion}
                onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
              />
            </div>

            <div className="field">
              <label>Fecha límite</label>
              <input
                type="datetime-local"
                value={form.limiteEl}
                onChange={(e) => setForm({ ...form, limiteEl: e.target.value })}
              />
            </div>

            <div className="field">
              <label>Estado inicial</label>
              <select
                value={form.estadoId}
                onChange={(e) => setForm({ ...form, estadoId: e.target.value })}
              >
                <option value={1}>Abierto</option>
                <option value={2}>En Progreso</option>
                <option value={3}>Resuelto</option>
                <option value={4}>Cerrado</option>
              </select>
            </div>
          </div>

          {/* MAPA */}
          <div style={{ marginTop: 10 }}>
            <label style={{ display: "block", marginBottom: 6 }}>
              Ubicación (clic en el mapa)
            </label>
            <MapaSelector value={coord} onChange={setCoord} height={300} />
          </div>

          {/* BOTONES */}
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 10,
              marginTop: 14,
            }}
          >
            <button type="button" style={btnGhost} onClick={close} disabled={saving}>
              Cancelar
            </button>
            <button type="submit" style={btnPrimary} disabled={saving}>
              {saving ? "Creando…" : "Crear visita"}
            </button>
          </div>
        </form>

        <CreateVisitaStyles />
      </div>
    </div>
  );
}

/* ---------- estilos inline ---------- */
const overlay = { position: "fixed", inset: 0, background: "rgba(0,0,0,.55)", backdropFilter: "blur(6px)", display: "grid", placeItems: "center", zIndex: 9999, padding: 16 };
const modal = { width: "100%", maxWidth: 920, background: "radial-gradient(100% 100% at 50% 0%, #14181c 0%, #171c21 100%)", border: "1px solid #26313b", borderRadius: 16, boxShadow: "0 20px 80px rgba(0,0,0,.5)", overflow: "hidden" };
const header = { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", borderBottom: "1px solid #26313b", color: "#e6edf3" };
const xBtn = { width: 34, height: 34, borderRadius: "50%", border: "none", cursor: "pointer", background: "rgba(255,75,75,0.9)", color: "white", fontWeight: 700, boxShadow: "0 4px 15px rgba(0,0,0,.4)" };
const btnGhost = { background: "transparent", color: "#cfe7f4", border: "1px solid #2a3a48", padding: "10px 14px", borderRadius: 10, cursor: "pointer" };
const btnPrimary = { background: "#0a84ff", color: "white", border: "none", padding: "10px 14px", borderRadius: 10, cursor: "pointer", fontWeight: 700 };

function CreateVisitaStyles() {
  return (
    <style>{`
      .grid-2 { display: grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap:12px; }
      .field { display: grid; gap:6px; color:#e6edf3 }
      .field-100 { grid-column: 1 / -1 }
      .field input, .field select, .field textarea {
        background:#0f1418; color:#e6edf3; border:1px solid #26313b; border-radius:10px; padding:10px 12px;
      }
      @media (max-width: 860px) { .grid-2 { grid-template-columns: 1fr; } }
    `}</style>
  );
}
