// app/routes/tickets.$id.jsx
import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import {
  obtenerTicketPorId,
  actualizarTicket,
} from "../api/ticketsApi";

import { obtenerEstados, obtenerPrioridades } from "../api/catalogosApi";
import { obtenerClientes } from "../api/clientesApi";

export default function TicketDetalle() {
  const { id } = useParams();
  const qc = useQueryClient();

  const { data: estados = [] } = useQuery({ queryKey: ["estados"], queryFn: obtenerEstados });
  const { data: prioridades = [] } = useQuery({ queryKey: ["prioridades"], queryFn: obtenerPrioridades });
  const { data: clientes = [] } = useQuery({ queryKey: ["clientes"], queryFn: obtenerClientes });

  const {
    data: ticket,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["ticket", id],
    queryFn: () => obtenerTicketPorId(Number(id)),
  });

  const [descripcion, setDescripcion] = useState("");

  useMemo(() => {
    if (ticket?.descripcion != null) setDescripcion(ticket.descripcion);
  }, [ticket?.descripcion]);

  const mutGuardar = useMutation({
    mutationFn: (desc) => actualizarTicket(Number(id), { descripcion: desc }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ticket", id] });
      qc.invalidateQueries({ queryKey: ["tickets"] });
    },
  });

  const mutCerrar = useMutation({
    mutationFn: () => actualizarTicket(Number(id), { estadoId: 3 }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ticket", id] });
      qc.invalidateQueries({ queryKey: ["tickets"] });
    },
  });

  const estadoNombre = estados.find((e) => e.estadoId === ticket?.estadoId)?.nombre ?? ticket?.estadoId;
  const prioridadNombre = prioridades.find((p) => p.prioridadId === ticket?.prioridadId)?.nombre ?? ticket?.prioridadId;
  const clienteNombre = clientes.find((c) => c.clienteId === ticket?.clienteId)?.nombre ?? ticket?.clienteId;

  if (isLoading) return <Shell><Panel><p>Cargando…</p></Panel></Shell>;
  if (isError) {
    return (
      <Shell>
        <Panel>
          <p style={{ color: "#fca5a5" }}>
            Error al cargar: {String(error?.message || error)}
          </p>
        </Panel>
      </Shell>
    );
  }
  if (!ticket) {
    return (
      <Shell>
        <Panel><p>No se encontró la visita.</p></Panel>
      </Shell>
    );
  }

  return (
    <Shell>
      <TicketDetalleStyles />

      <div className="topbar">
        <Link to="/tickets" className="back">← Volver a Visitas</Link>
        <div className="idpill">#{ticket.ticketId}</div>
      </div>

      <div className="grid">
        <aside className="side">
          <div className="card">
            <div className="card__title">Resumen</div>
            <div className="meta">
              <div><span className="lbl">Cliente:</span><span>{clienteNombre}</span></div>
              <div><span className="lbl">Estado:</span><span>{estadoNombre}</span></div>
              <div><span className="lbl">Prioridad:</span><span>{prioridadNombre}</span></div>
              <div>
                <span className="lbl">Creado:</span>
                <span>{ticket.creadoEl ? new Date(ticket.creadoEl).toLocaleString() : "-"}</span>
              </div>
              {ticket.limiteEl ? (
                <div><span className="lbl">Límite:</span>
                  <span>{new Date(ticket.limiteEl).toLocaleString()}</span>
                </div>
              ) : null}
            </div>

            <div className="actions">
              {Number(ticket.estadoId) !== 3 ? (
                <button
                  className="btn btn--success"
                  onClick={() => mutCerrar.mutate()}
                  disabled={mutCerrar.isLoading}
                  title="Marcar como Resuelto"
                >
                  {mutCerrar.isLoading ? "Cerrando…" : "✓ Marcar Resuelto"}
                </button>
              ) : (
                <div className="done">✅ Resuelto</div>
              )}
            </div>
          </div>
        </aside>

        <main className="main">
          <div className="card glass">
            <div className="card__header">
              <h2 className="h2">{ticket.titulo}</h2>
              <span className={`chip ${Number(ticket.estadoId) === 3 ? "ok" : ""}`}>
                {estadoNombre}
              </span>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                mutGuardar.mutate(descripcion);
              }}
              className="desc-form"
            >
              <label className="label">Descripción de la visita</label>
              <textarea
                className="textarea"
                rows={8}
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Describe el problema, acciones realizadas, hallazgos, etc."
              />

              <div className="form-actions">
                <button
                  type="submit"
                  className="btn btn--primary"
                  disabled={mutGuardar.isLoading}
                >
                  {mutGuardar.isLoading ? "Guardando…" : "Guardar cambios"}
                </button>
                <Link to="/tickets" className="btn btn--ghost">Cancelar</Link>
              </div>
            </form>
          </div>
        </main>
      </div>
    </Shell>
  );
}

function Shell({ children }) {
  return (
    <div style={{ background: "#0d0f12", minHeight: "100vh", padding: 24 }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>{children}</div>
    </div>
  );
}

function Panel({ children }) {
  return (
    <div
      style={{
        background: "rgba(18,18,18,.9)",
        border: "1px solid rgba(60,70,80,.5)",
        borderRadius: 12,
        padding: 16,
        color: "#e5e7eb",
      }}
    >
      {children}
    </div>
  );
}

function TicketDetalleStyles() {
  return (
    <style>{`
      .topbar{ display:flex; align-items:center; justify-content:space-between; margin-bottom:14px; }
      .back{
        color:#9ac7e0; text-decoration:none; border:1px solid rgba(60,70,80,.6); padding:6px 10px; border-radius:8px;
        background:#0f1214;
      }
      .idpill{
        background:#0f1720; color:#9dd2ef; border:1px solid #233344; padding:6px 10px; border-radius:999px;
        font-weight:700;
      }
      .grid{ display:grid; gap:14px; grid-template-columns: 290px 1fr; }
      @media (max-width: 900px){ .grid{ grid-template-columns: 1fr; } }

      .card{ background:linear-gradient(180deg, rgba(24,27,31,.75), rgba(18,20,22,.72)); border:1px solid rgba(51,60,68,.5); border-radius:14px; padding:14px; color:#e5edf4; }
      .glass{ backdrop-filter: blur(10px); box-shadow: 0 10px 35px rgba(0,0,0,.35); }

      .label {
        color: #b6cadd;
        font-size: 13px;
        font-weight: 500;
        text-shadow: 0 0 8px rgba(255,255,255,0.08);
      }

      /* === GLASS STYLE PARA DESCRIPCIÓN === */
      .textarea {
        width: 100%;
        min-height: 200px;
        resize: vertical;
        background: rgba(255, 255, 255, 0.06);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.15);
        padding: 14px;
        border-radius: 12px;
        color: #e5edf4;
        font-size: 14px;
        line-height: 1.5;
        transition: all 0.25s ease-in-out;
        box-shadow: 0 4px 12px rgba(0,0,0,0.25);
      }

      .textarea:hover {
        border-color: rgba(255,255,255,0.25);
      }

      .textarea:focus {
        border-color: #38bdf8;
        box-shadow: 0 0 10px rgba(14,165,233,0.45), 0 6px 22px rgba(14,165,233,0.15);
        outline: none;
      }

      .btn {
        border:none; border-radius:8px; padding:10px 14px; cursor:pointer; font-weight:700;
      }

      .btn--primary{
        background: linear-gradient(135deg, #0ea5e9, #38bdf8); color:white;
      }
      .btn--ghost{
        background: transparent; color:#cfd7de; border:1px solid rgba(80,90,100,.6);
      }
      .btn--success{
        background:#22c55e; color:#0d2616; border:none; font-weight:700;
      }
      .btn:hover{ filter:brightness(1.05); }
    `}</style>
  );
}
