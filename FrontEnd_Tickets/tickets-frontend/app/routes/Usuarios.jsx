// ✅ app/routes/Usuarios.jsx — CRUD Glass Dark con Reporte PDF incluido
import { useState, useMemo, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  obtenerUsuarios,
  crearUsuario,
  borrarUsuario,
  actualizarUsuario,
} from "../api/usuariosApi";
import ConfirmModal from "../../src/components/ConfirmModal.jsx";
import { getRoleId } from "../../app/utils/auth.js";
import { toast } from "react-toastify";
import "../../src/pages/VisitasGlass.css";

export default function Usuarios() {
  const qc = useQueryClient();
  const roleId = getRoleId();

  const [usuarios, setUsuarios] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [errors, setErrors] = useState({});
  const [globalError, setGlobalError] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [usuarioToDelete, setUsuarioToDelete] = useState(null);

  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    email: "",
    telefono: "",
    username: "",
    password: "",
    rolId: 5,
    esActivo: true,
  });

  // ============================================================
  // 🔹 Cargar lista de usuarios
  // ============================================================
  useEffect(() => {
    refresh();
  }, []);

  async function refresh() {
    try {
      setIsLoading(true);
      const lista = await obtenerUsuarios();
      setUsuarios(Array.isArray(lista) ? lista : []);
    } catch (err) {
      console.error("❌ Error cargando usuarios:", err);
      setError("No se pudieron cargar los usuarios.");
    } finally {
      setIsLoading(false);
    }
  }

  // ============================================================
  // 🔹 Mutaciones CRUD
  // ============================================================
  const mCreate = useMutation({
    mutationFn: crearUsuario,
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["usuarios"] });
      await refresh();
      closeModal();
      toast.success("✅ Usuario creado correctamente");
    },
  });

  const mUpdate = useMutation({
    mutationFn: ({ id, payload }) => actualizarUsuario(id, payload),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["usuarios"] });
      await refresh();
      closeModal();
      toast.success("✅ Usuario actualizado correctamente");
    },
  });

  const mDelete = useMutation({
    mutationFn: borrarUsuario,
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["usuarios"] });
      await refresh();
      toast.info("🗑️ Usuario eliminado correctamente");
    },
  });

  // ============================================================
  // 🧾 Generar reporte PDF
  // ============================================================
  const generarPDF = () => {
    if (!usuarios.length) {
      toast.warn("⚠️ No hay usuarios para generar el reporte.");
      return;
    }

    const doc = new jsPDF("landscape");
    doc.setFontSize(16);
    doc.text("Reporte de Usuarios — SkyNet S.A.", 14, 20);
    doc.setFontSize(10);
    doc.text(`Generado: ${new Date().toLocaleString()}`, 14, 27);
    doc.line(14, 30, 280, 30);

    autoTable(doc, {
      startY: 35,
      head: [["ID", "Nombre", "Apellido", "Email", "Teléfono", "Rol", "Activo"]],
      body: usuarios.map((u) => [
        u.usuarioId,
        u.nombre,
        u.apellido,
        u.email,
        u.telefono || "—",
        u.rolId === 1
          ? "Administrador"
          : u.rolId === 4
          ? "Supervisor"
          : u.rolId === 5
          ? "Técnico"
          : "Cliente",
        u.esActivo ? "✅ Sí" : "❌ No",
      ]),
      styles: { fontSize: 9 },
      headStyles: { fillColor: [0, 150, 255] },
    });

    doc.save(`Usuarios_SkyNet_${new Date().toISOString().slice(0, 10)}.pdf`);
    toast.success("📄 Reporte PDF generado correctamente");
  };

  // ============================================================
  // 🔹 Formularios y modales
  // ============================================================
  function openCreate() {
    setEditing(null);
    setErrors({});
    setGlobalError("");
    setForm({
      nombre: "",
      apellido: "",
      email: "",
      telefono: "",
      username: "",
      password: "",
      rolId: 5,
      esActivo: true,
    });
    setModalOpen(true);
  }

  function openEdit(u) {
    setEditing(u);
    setErrors({});
    setGlobalError("");
    setForm({
      nombre: u.nombre || "",
      apellido: u.apellido || "",
      email: u.email || "",
      telefono: u.telefono || "",
      username: u.username || "",
      password: "",
      rolId: u.rolId || 5,
      esActivo: u.esActivo ?? true,
    });
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
  }

  function handleDeleteClick(usuarioId) {
    setUsuarioToDelete(usuarioId);
    setShowConfirm(true);
  }

  async function confirmarEliminacion() {
    if (!usuarioToDelete) return;
    await mDelete.mutateAsync(usuarioToDelete);
    setUsuarioToDelete(null);
    setShowConfirm(false);
  }

  function cancelDelete() {
    setUsuarioToDelete(null);
    setShowConfirm(false);
  }

  function submitModal(e) {
    e.preventDefault();
    setGlobalError("");
    setErrors({});

    const required = ["nombre", "apellido", "email", "telefono", "username"];
    const newErrors = {};
    required.forEach((f) => {
      if (!form[f].trim()) newErrors[f] = "Campo obligatorio";
    });

    if (!editing && !form.password.trim())
      newErrors.password = "Contraseña requerida";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const payload = { ...form };
    if (editing) {
      if (!form.password.trim()) {
        delete payload.password;
        delete payload.passwordHash;
      } else {
        payload.passwordHash = form.password;
        delete payload.password;
      }
      mUpdate.mutate({ id: editing.usuarioId, payload });
    } else {
      if (form.password.trim()) {
        payload.passwordHash = form.password;
        delete payload.password;
      }
      mCreate.mutate(payload);
    }
  }

  // ============================================================
  // 🔹 Render principal
  // ============================================================
  if (roleId !== 1)
    return (
      <div className="vd-wrap" style={{ marginLeft: 230 }}>
        <div className="vd-container">
          <div className="vd-empty">
            🚫 Solo el rol Administrador puede ver esta sección.
          </div>
        </div>
      </div>
    );

  const gridCols = "80px 1fr 1fr 1.6fr 1fr 1fr 130px";

  return (
    <div className="vd-wrap" style={{ marginLeft: 0 }}>
      <div className="vd-lights" />
      <div className="vd-container">
        {/* HEADER */}
        <header className="vd-head">
          <div className="vd-title">
            <span className="pin">🧑‍💼</span>
            <h2>Usuarios</h2>
          </div>

          <div className="vd-actions">
            {/* 🧾 Botón de Reporte PDF */}
            <button className="btn-pill glass" onClick={generarPDF}>
              📄 Reporte PDF
            </button>

            <button className="btn-pill primary" onClick={openCreate}>
              ✚ Nuevo usuario
            </button>
          </div>
        </header>

        {/* TABLA */}
        <div className="vd-card glass">
          <div className="vd-table">
            <div className="vd-thead" style={{ gridTemplateColumns: gridCols }}>
              <div className="th id">ID</div>
              <div className="th">Nombre</div>
              <div className="th">Apellido</div>
              <div className="th">Email</div>
              <div className="th">Teléfono</div>
              <div className="th">Rol</div>
              <div className="th">Acciones</div>
            </div>

            <div className="vd-tbody">
              {isLoading && <div className="vd-empty">Cargando usuarios…</div>}
              {error && <div className="vd-empty">⚠ {error}</div>}
              {!isLoading &&
                !error &&
                usuarios.map((u) => (
                  <div
                    key={u.usuarioId}
                    className="vd-row glass-row"
                    style={{ gridTemplateColumns: gridCols }}
                  >
                    <div className="td id">#{u.usuarioId}</div>
                    <div className="td">{u.nombre}</div>
                    <div className="td">{u.apellido}</div>
                    <div className="td">{u.email}</div>
                    <div className="td">{u.telefono || "—"}</div>
                    <div className="td">
                      {u.rolId === 1
                        ? "Administrador"
                        : u.rolId === 4
                        ? "Supervisor"
                        : u.rolId === 5
                        ? "Técnico"
                        : "Cliente"}
                    </div>
                    <div className="td" style={{ display: "flex", gap: 8 }}>
                      <button
                        className="icon-btn glass-icon"
                        onClick={() => openEdit(u)}
                      >
                        ✏️
                      </button>
                      <button
                        className="icon-btn glass-icon"
                        style={{ color: "#ffb4b4" }}
                        onClick={() => handleDeleteClick(u.usuarioId)}
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

      {/* MODALES */}
      {modalOpen && (
        <ModalUsuario
          editing={editing}
          form={form}
          setForm={setForm}
          errors={errors}
          globalError={globalError}
          closeModal={closeModal}
          submitModal={submitModal}
        />
      )}

      <ConfirmModal
        open={showConfirm}
        message="¿Deseas eliminar este usuario permanentemente?"
        onConfirm={confirmarEliminacion}
        onCancel={cancelDelete}
      />
    </div>
  );
}

// ============================================================
// 🔹 Subcomponentes UI
// ============================================================
function ModalUsuario({
  editing,
  form,
  setForm,
  errors,
  globalError,
  closeModal,
  submitModal,
}) {
  return (
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
          width: 480,
          borderRadius: 16,
          border: "1px solid rgba(120,180,255,.22)",
          background:
            "linear-gradient(180deg, rgba(23,30,40,.82), rgba(18,25,33,.78))",
          boxShadow:
            "0 22px 48px rgba(0,0,0,.55), 0 0 0 1px rgba(130,160,200,.08) inset, 0 0 36px rgba(0,170,255,.18)",
          padding: 18,
        }}
      >
        <h3 style={{ color: "#e8f2ff", fontWeight: 800, marginBottom: 14 }}>
          {editing ? "Editar Usuario" : "Nuevo Usuario"}
        </h3>

        <form onSubmit={submitModal} style={{ display: "grid", gap: 10 }}>
          <Row2>
            <GlassInput
              placeholder="Nombre"
              value={form.nombre}
              onChange={(v) => setForm({ ...form, nombre: v })}
              error={errors.nombre}
            />
            <GlassInput
              placeholder="Apellido"
              value={form.apellido}
              onChange={(v) => setForm({ ...form, apellido: v })}
              error={errors.apellido}
            />
          </Row2>

          <Row2>
            <GlassInput
              placeholder="Email"
              value={form.email}
              onChange={(v) => setForm({ ...form, email: v })}
              error={errors.email}
            />
            <GlassInput
              placeholder="Teléfono"
              value={form.telefono}
              onChange={(v) => setForm({ ...form, telefono: v })}
              error={errors.telefono}
            />
          </Row2>

          <Row2>
            <GlassInput
              placeholder="Usuario"
              value={form.username}
              onChange={(v) => setForm({ ...form, username: v })}
              error={errors.username}
            />
            <GlassInput
              placeholder="Contraseña"
              type="password"
              value={form.password}
              onChange={(v) => setForm({ ...form, password: v })}
              error={errors.password}
            />
          </Row2>

          <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 10 }}>
            <select
              value={form.rolId}
              onChange={(e) =>
                setForm({ ...form, rolId: Number(e.target.value) })
              }
              style={{
                background: "rgba(255,255,255,.05)",
                color: "#e8f2ff",
                border: "1px solid rgba(255,255,255,.15)",
                borderRadius: 10,
                padding: "10px",
                fontWeight: 600,
              }}
            >
              <option value={1}>Administrador</option>
              <option value={4}>Supervisor</option>
              <option value={5}>Técnico</option>
              <option value={3}>Cliente</option>
            </select>
            <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <input
                type="checkbox"
                checked={form.esActivo}
                onChange={(e) =>
                  setForm({ ...form, esActivo: e.target.checked })
                }
              />
              <span>Activo</span>
            </label>
          </div>

          {globalError && <div className="glass-warning">{globalError}</div>}

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
  );
}

function GlassInput({ value, onChange, placeholder, error, type = "text" }) {
  return (
    <div className={`glass-input-wrapper ${error ? "error" : ""}`}>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="glass-input"
      />
      {error && <span className="input-error-text">{error}</span>}
    </div>
  );
}

function Row2({ children }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
      {children}
    </div>
  );
}
