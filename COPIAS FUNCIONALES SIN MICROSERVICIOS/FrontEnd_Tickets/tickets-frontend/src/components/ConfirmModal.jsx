// ✅ src/components/ConfirmModal.jsx — Modal Glass reutilizable

export default function ConfirmModal({ open, message, onConfirm, onCancel }) {
  if (!open) return null;

  return (
    <div className="glass-modal">
      <div className="glass-modal-content confirm">
        <h3 style={{ color: "#e8f2ff", marginBottom: 12 }}>⚠️ Confirmar acción</h3>
        <p
          style={{
            color: "#cfe4ff",
            fontSize: "0.95rem",
            marginBottom: 20,
          }}
        >
          {message || "¿Estás seguro de que deseas continuar?"}
        </p>

        <div style={{ display: "flex", justifyContent: "center", gap: 14 }}>
          <button
            className="btn-pill danger"
            onClick={onConfirm}
            style={{ minWidth: 100 }}
          >
            🗑️ Eliminar
          </button>
          <button
            className="btn-pill glass"
            onClick={onCancel}
            style={{ minWidth: 100 }}
          >
            ✖ Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
