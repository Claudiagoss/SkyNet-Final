import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { crearTicket } from "../../app/api/ticketsApi"; // ✅ Usa la ruta que SÍ tienes

export default function TicketFormModal({ open, onClose, estados, prioridades, clientes, onCreated }) {
  if (!open) return null;

  const [form, setForm] = useState({
    titulo: "",
    descripcion: "",
    clienteId: "",
    reportadoPorUsuarioId: 1, // Temporal
    asignadoAUsuarioId: "",
    estadoId: 1,
    prioridadId: 2,
    limiteEl: "",
  });

  const mut = useMutation({
    mutationFn: crearTicket,
    onSuccess: () => {
      onCreated?.();
    },
  });

  const submit = (e) => {
    e.preventDefault();
    mut.mutate({ ...form, clienteId: Number(form.clienteId) });
  };

  return (
    <>
      <div className="modal-overlay" onClick={onClose}></div>
      <div className="modal-glass">
        <h2>🎫 Nuevo Ticket</h2>
        <form onSubmit={submit}>
          <input placeholder="Título" value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} />
          <textarea placeholder="Descripción" value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} />

          <select value={form.clienteId} onChange={(e) => setForm({ ...form, clienteId: e.target.value })}>
            <option value="">-- Cliente --</option>
            {clientes.map((c) => (
              <option key={c.clienteId} value={c.clienteId}>{c.nombre}</option>
            ))}
          </select>

          <button type="submit" className="btn-primary">Crear</button>
        </form>
      </div>

      {/* ✅ Estilos Glass aplicados DIRECTO al DOM */}
      <style>{`
        .modal-overlay {
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.6);
          backdrop-filter: blur(4px);
          z-index: 99;
        }
        .modal-glass {
          position: fixed; top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          width: 420px;
          padding: 24px;
          border-radius: 14px;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(18px);
          color: #fff;
          box-shadow: 0 8px 30px rgba(0,0,0,0.4);
          z-index: 100;
        }
        .modal-glass h2 {
          margin-top: 0;
          font-size: 20px;
          margin-bottom: 16px;
        }
        .modal-glass form {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .modal-glass input, .modal-glass textarea, .modal-glass select {
          background: rgba(255,255,255,0.15);
          border: 1px solid rgba(255,255,255,0.2);
          padding: 8px 10px;
          border-radius: 8px;
          color: white;
        }
        .btn-primary {
          background: #0ea5e9;
          color: white;
          padding: 10px;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: bold;
        }
        .btn-primary:hover {
          filter: brightness(1.1);
        }
      `}</style>
    </>
  );
}
