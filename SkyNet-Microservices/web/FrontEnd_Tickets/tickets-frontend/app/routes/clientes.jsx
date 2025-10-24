// ✅ app/routes/clientes.jsx — Glass UI FINAL (sin columnas de coordenadas y mapa funcional)
import { useEffect, useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  obtenerClientes,
  crearCliente,
  actualizarCliente,
  borrarCliente,
} from "../api/clientesApi";
import { getAuth, getRoleId, getToken } from "../../app/utils/auth.js";
import MapaSelector from "../../src/components/MapaSelector.jsx";
import MapaModal from "../../src/components/MapaModal.jsx";
import ConfirmModal from "../../src/components/ConfirmModal.jsx";
import "../../src/pages/VisitasGlass.css";

const PAGE_SIZE = 10;

export default function Clientes() {
  const qc = useQueryClient();
  const authRaw = getAuth();
  const detectedRoleId = getRoleId();
  const detectedRoleText = authRaw?.rol || "SIN_ROL";

  const { data: clientesRaw = [], isLoading, isError, error } = useQuery({
    queryKey: ["clientes"],
    queryFn: obtenerClientes,
    staleTime: 60_000,
  });

  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [mapData, setMapData] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [clienteToDelete, setClienteToDelete] = useState(null);

  const [form, setForm] = useState({
    nombre: "",
    contacto: "",
    email: "",
    telefono: "",
    direccion: "",
    notas: "",
    latitud: "",
    longitud: "",
  });

  const mCreate = useMutation({
    mutationFn: async (payload) => crearCliente(payload, getToken()),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["clientes"] });
      closeModal();
    },
  });

  const mUpdate = useMutation({
    mutationFn: async ({ id, payload }) =>
      actualizarCliente(id, payload, getToken()),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["clientes"] });
      closeModal();
    },
  });

  const mDelete = useMutation({
    mutationFn: async (id) => borrarCliente(id, getToken()),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["clientes"] });
    },
  });

  const clientes = useMemo(() => {
    let arr = Array.isArray(clientesRaw) ? [...clientesRaw] : [];
    if (q.trim()) {
      const s = q.toLowerCase();
      arr = arr.filter(
        (c) =>
          (c.nombre || "").toLowerCase().includes(s) ||
          (c.contacto || "").toLowerCase().includes(s) ||
          (c.email || "").toLowerCase().includes(s) ||
          (c.telefono || "").toLowerCase().includes(s) ||
          (c.direccion || "").toLowerCase().includes(s)
      );
    }
    return arr;
  }, [clientesRaw, q]);

  const total = clientes.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const pageItems = clientes.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => setPage(1), [q]);

  function openCreate() {
    setEditing(null);
    setForm({
      nombre: "",
      contacto: "",
      email: "",
      telefono: "",
      direccion: "",
      notas: "",
      latitud: "",
      longitud: "",
    });
    setModalOpen(true);
  }

  function openEdit(cli) {
    setEditing(cli);
    setForm({
      nombre: cli.nombre ?? "",
      contacto: cli.contacto ?? "",
      email: cli.email ?? "",
      telefono: cli.telefono ?? "",
      direccion: cli.direccion ?? "",
      notas: cli.notas ?? "",
      latitud: cli.latitud ?? "",
      longitud: cli.longitud ?? "",
    });
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
  }

  function submitModal(e) {
    e.preventDefault();
    const payload = { ...form };
    if (editing) mUpdate.mutate({ id: editing.clienteId, payload });
    else mCreate.mutate(payload);
  }

  // 🧮 Simplificamos la tabla (sin columnas de lat/long)
  const gridCols = "70px 1.3fr 1fr 1.3fr 1fr 1.5fr 140px";

  const canCreate =
    detectedRoleId === 1 ||
    detectedRoleId === 4 ||
    detectedRoleText?.toLowerCase() === "admin" ||
    detectedRoleText?.toLowerCase() === "supervisor";

  function abrirMapa(c) {
    const lat = parseFloat(c.latitud) || 14.6349;
    const lng = parseFloat(c.longitud) || -90.5069;
    setMapData({
      lat,
      lng,
      cliente: c.nombre || "Cliente",
      tecnico: c.contacto || "",
    });
  }

  return (
    <>
      <div className="vd-wrap" style={{ marginLeft: 230 }}>
        <div className="vd-lights" />
        <div className="vd-container">
          {/* HEADER */}
          <header className="vd-head">
            <div className="vd-title">
              <span className="pin">👥</span>
              <h2>Clientes</h2>
            </div>

            <div className="vd-actions" style={{ gap: 10 }}>
              <div className="btn-pill glass" style={{ padding: 0, display: "flex", alignItems: "center" }}>
                <span style={{ paddingLeft: 12 }}>🔎</span>
                <input
                  placeholder="Buscar cliente..."
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  style={{
                    background: "transparent",
                    border: "none",
                    outline: "none",
                    color: "#bfe0ff",
                    padding: "10px 14px",
                    minWidth: 220,
                    fontWeight: 600,
                  }}
                />
              </div>
              {canCreate && (
                <button className="btn-pill primary" onClick={openCreate}>
                  ✚ Nuevo cliente
                </button>
              )}
            </div>
          </header>

          {/* TABLA */}
          <div className="vd-card glass">
            <div className="vd-table">
              <div className="vd-thead" style={{ gridTemplateColumns: gridCols }}>
                <div className="th id">ID</div>
                <div className="th">Nombre</div>
                <div className="th">Contacto</div>
                <div className="th">Email</div>
                <div className="th">Teléfono</div>
                <div className="th">Dirección</div>
                <div className="th">Acciones</div>
              </div>

              <div className="vd-tbody">
                {isLoading && <div className="vd-empty">Cargando clientes…</div>}
                {isError && (
                  <div className="vd-empty">⚠ Error: {String(error)}</div>
                )}
                {!isLoading &&
                  !isError &&
                  pageItems.map((c) => (
                    <div
                      key={c.clienteId}
                      className="vd-row glass-row"
                      style={{ gridTemplateColumns: gridCols }}
                    >
                      <div className="td id">#{c.clienteId}</div>
                      <div className="td">{c.nombre}</div>
                      <div className="td">{c.contacto}</div>
                      <div className="td">{c.email || "—"}</div>
                      <div className="td">{c.telefono}</div>
                      <div className="td">{c.direccion}</div>

                      <div className="td" style={{ display: "flex", gap: 8 }}>
                        {/* 📍 Ver mapa */}
                        <button
                          className="icon-btn glass-icon"
                          title="Ver mapa"
                          onClick={() => abrirMapa(c)}
                        >
                          📍
                        </button>

                        {/* ✏️ Editar */}
                        <button
                          className="icon-btn glass-icon"
                          title="Editar"
                          onClick={() => openEdit(c)}
                        >
                          ✏️
                        </button>

                        {/* 🗑️ Eliminar */}
                        <button
                          className="icon-btn glass-icon"
                          title="Eliminar"
                          onClick={() => {
                            setClienteToDelete(c.clienteId);
                            setShowConfirm(true);
                          }}
                          style={{ color: "#ffb4b4" }}
                        >
                          🗑
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 🧭 MODAL MAPA DETALLE */}
      {mapData && (
        <MapaModal
          lat={mapData.lat}
          lng={mapData.lng}
          cliente={mapData.cliente}
          tecnico={mapData.tecnico}
          onClose={() => setMapData(null)}
        />
      )}

      {/* ✏️ MODAL FORMULARIO */}
      {modalOpen && (
        <div
          onClick={closeModal}
          style={{
            position: "fixed",
            inset: 0,
            background:
              "radial-gradient(1000px 800px at 20% 10%, rgba(0,153,255,.10), transparent 60%), radial-gradient(900px 700px at 80% 20%, rgba(140,70,255,.10), transparent 65%), rgba(2,8,15,0.65)",
            backdropFilter: "blur(10px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: 460,
              borderRadius: 16,
              border: "1px solid rgba(120,180,255,.22)",
              background:
                "linear-gradient(180deg, rgba(23,30,40,.82), rgba(18,25,33,.78))",
              boxShadow:
                "0 22px 48px rgba(0,0,0,.55), 0 0 36px rgba(0,170,255,.18)",
              padding: 18,
            }}
          >
            <h3 style={{ color: "#e8f2ff", fontWeight: 800, marginBottom: 14 }}>
              {editing ? "Editar Cliente" : "Nuevo Cliente"}
            </h3>

            <form onSubmit={submitModal} style={{ display: "grid", gap: 10 }}>
              <GlassInput placeholder="Nombre" value={form.nombre} onChange={(v) => setForm({ ...form, nombre: v })} />
              <GlassInput placeholder="Contacto" value={form.contacto} onChange={(v) => setForm({ ...form, contacto: v })} />
              <GlassInput placeholder="Email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} />
              <GlassInput placeholder="Teléfono" value={form.telefono} onChange={(v) => setForm({ ...form, telefono: v })} />
              <GlassInput placeholder="Dirección" value={form.direccion} onChange={(v) => setForm({ ...form, direccion: v })} />
              <GlassTextarea placeholder="Notas" value={form.notas} onChange={(v) => setForm({ ...form, notas: v })} />

              {/* 📍 MapaSelector igual que en Visitas */}
              <MapaSelector
                value={{
                  lat: Number(form.latitud) || null,
                  lng: Number(form.longitud) || null,
                }}
                onChange={(pos) =>
                  setForm({ ...form, latitud: pos.lat, longitud: pos.lng })
                }
                height={280}
              />

              <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                <button type="button" className="btn-pill glass" onClick={closeModal}>
                  Cancelar
                </button>
                <button type="submit" className="btn-pill primary">
                  {editing ? "Guardar" : "Crear"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 🗑️ MODAL CONFIRMAR ELIMINACIÓN */}
      <ConfirmModal
        open={showConfirm}
        message="¿Deseas eliminar este cliente permanentemente?"
        onConfirm={() => {
          mDelete.mutate(clienteToDelete);
          setShowConfirm(false);
          setClienteToDelete(null);
        }}
        onCancel={() => {
          setShowConfirm(false);
          setClienteToDelete(null);
        }}
      />
    </>
  );
}

/* ============================= */
function GlassInput({ value, onChange, placeholder }) {
  return (
    <div className="btn-pill glass" style={{ display: "flex", overflow: "hidden" }}>
      <input
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        style={{
          flex: 1,
          background: "transparent",
          border: "none",
          outline: "none",
          color: "#e8f2ff",
          padding: "10px 12px",
          fontWeight: 600,
        }}
      />
    </div>
  );
}

function GlassTextarea({ value, onChange, placeholder, rows = 3 }) {
  return (
    <div className="btn-pill glass">
      <textarea
        rows={rows}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: "100%",
          background: "transparent",
          border: "none",
          outline: "none",
          color: "#e8f2ff",
          padding: "10px 12px",
          resize: "vertical",
          fontWeight: 600,
        }}
      />
    </div>
  );
}
