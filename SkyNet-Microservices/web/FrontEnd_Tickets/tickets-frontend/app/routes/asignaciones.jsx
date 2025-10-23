// app/routes/asignaciones.jsx
import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";

import { obtenerClientes } from "../api/clientesApi";
import { obtenerUsuarios } from "../api/usuariosApi";

import {
  asignarCliente,
  asignarPorDepartamento,
  obtenerDuenioCliente,
  recalcularCliente,
} from "../api/asignacionesApi";

import {
  crearCobertura,
  listarCoberturas,
  desactivarCobertura,
} from "../api/coberturasApi";

export default function Asignaciones() {
  // ===== Datos base =====
  const {
    data: rawClientes,
    isLoading: loadingClientes,
    isError: errClientes,
    error: errorClientes,
  } = useQuery({
    queryKey: ["clientes"],
    queryFn: obtenerClientes, // ya devuelve array, pero igual blindamos abajo
    retry: 1,
    refetchOnWindowFocus: false,
  });

  const {
    data: rawUsuarios,
    isLoading: loadingUsuarios,
    isError: errUsuarios,
    error: errorUsuarios,
  } = useQuery({
    queryKey: ["usuarios"],
    queryFn: obtenerUsuarios, // ya devuelve array, pero igual blindamos abajo
    retry: 1,
    refetchOnWindowFocus: false,
  });

  // 🔒 Normalización dura para evitar ".map is not a function"
  const clientes = Array.isArray(rawClientes)
    ? rawClientes
    : Array.isArray(rawClientes?.clientes)
    ? rawClientes.clientes
    : Array.isArray(rawClientes?.data)
    ? rawClientes.data
    : Array.isArray(rawClientes?.items)
    ? rawClientes.items
    : [];

  const usuarios = Array.isArray(rawUsuarios)
    ? rawUsuarios
    : Array.isArray(rawUsuarios?.usuarios)
    ? rawUsuarios.usuarios
    : Array.isArray(rawUsuarios?.data)
    ? rawUsuarios.data
    : Array.isArray(rawUsuarios?.items)
    ? rawUsuarios.items
    : [];

  // ===== Formularios =====
  const [fDir, setFDir] = useState({ clienteId: "", usuarioId: "" });
  const [fDepto, setFDepto] = useState({
    departamento: "",
    usuarioId: "",
    prioridad: 100,
  });
  const [fCob, setFCob] = useState({
    departamento: "",
    usuarioId: "",
    prioridad: 100,
  });
  const [consultaClienteId, setConsultaClienteId] = useState("");
  const [duenio, setDuenio] = useState(null);

  // ===== Coberturas (listado con filtro por departamento) =====
  const {
    data: rawCoberturas,
    isLoading: loadingCob,
    isError: errCob,
    error: errorCob,
    refetch: refetchCob,
  } = useQuery({
    queryKey: ["coberturas", fCob.departamento || ""],
    queryFn: () => listarCoberturas(fCob.departamento || undefined),
    retry: 1,
    refetchOnWindowFocus: false,
  });

  const coberturas = Array.isArray(rawCoberturas)
    ? rawCoberturas
    : Array.isArray(rawCoberturas?.coberturas)
    ? rawCoberturas.coberturas
    : Array.isArray(rawCoberturas?.data)
    ? rawCoberturas.data
    : Array.isArray(rawCoberturas?.items)
    ? rawCoberturas.items
    : [];

  // ===== Mutations =====
  const mDir = useMutation({
    mutationFn: asignarCliente,
    onSuccess: () => alert("Asignación directa creada"),
  });

  const mDepto = useMutation({
    mutationFn: asignarPorDepartamento,
    onSuccess: async () => {
      alert("Regla de cartera por departamento creada");
      await refetchCob();
    },
  });

  const mCob = useMutation({
    mutationFn: crearCobertura,
    onSuccess: async () => {
      alert("Cobertura creada");
      await refetchCob();
    },
  });

  const mCobDel = useMutation({
    mutationFn: desactivarCobertura,
    onSuccess: async () => {
      await refetchCob();
    },
  });

  // ===== Helpers UI =====
  const selectUser = (val, onChange) => (
    <select
      value={val}
      onChange={(e) => onChange(e.target.value)}
      style={{ padding: 8, border: "1px solid #ddd" }}
    >
      <option value="">-- Usuario --</option>
      {usuarios.map((u) => (
        <option key={u.usuarioId} value={u.usuarioId}>
          {u.usuarioId} - {u.nombre} {u.apellido}
        </option>
      ))}
    </select>
  );

  const consultarDuenio = async () => {
    if (!consultaClienteId) return;
    const r = await obtenerDuenioCliente(Number(consultaClienteId));
    setDuenio(r);
  };

  // ===== Loading / Error =====
  if (loadingClientes || loadingUsuarios || loadingCob) {
    return <p style={{ padding: 24 }}>Cargando...</p>;
  }
  if (errClientes || errUsuarios || errCob) {
    return (
      <div style={{ padding: 24 }}>
        <h3>Error al cargar datos</h3>
        <pre style={{ whiteSpace: "pre-wrap" }}>
          {String(errorClientes || errorUsuarios || errorCob)}
        </pre>
      </div>
    );
  }

  // ===== Render =====
  return (
    <div style={{ padding: 24, display: "grid", gap: 24 }}>
      <h1 style={{ fontSize: 20, fontWeight: 700 }}>Asignaciones / Coberturas</h1>

      {/* Asignación directa Cliente → Usuario */}
      <section style={box}>
        <h3 style={h3}>Asignación directa (Cliente → Usuario)</h3>
        <div style={row}>
          <select
            value={fDir.clienteId}
            onChange={(e) => setFDir({ ...fDir, clienteId: e.target.value })}
            style={ipt}
          >
            <option value="">-- Cliente --</option>
            {clientes.map((c) => (
              <option key={c.clienteId} value={c.clienteId}>
                {c.clienteId} - {c.nombre}
              </option>
            ))}
          </select>

          {selectUser(fDir.usuarioId, (v) => setFDir({ ...fDir, usuarioId: v }))}

          <button
            onClick={() =>
              mDir.mutate({
                clienteId: Number(fDir.clienteId),
                usuarioId: Number(fDir.usuarioId),
              })
            }
            disabled={!fDir.clienteId || !fDir.usuarioId}
            style={btn}
          >
            Asignar
          </button>
        </div>
      </section>

      {/* Cartera por departamento */}
      <section style={box}>
        <h3 style={h3}>Cartera por departamento</h3>
        <div style={row}>
          <input
            placeholder="Departamento"
            value={fDepto.departamento}
            onChange={(e) =>
              setFDepto({ ...fDepto, departamento: e.target.value })
            }
            style={ipt}
          />
          {selectUser(fDepto.usuarioId, (v) =>
            setFDepto({ ...fDepto, usuarioId: v })
          )}
          <input
            type="number"
            placeholder="Prioridad"
            value={fDepto.prioridad}
            onChange={(e) =>
              setFDepto({ ...fDepto, prioridad: Number(e.target.value) })
            }
            style={ipt}
          />
          <button
            onClick={() =>
              mDepto.mutate({
                departamento: fDepto.departamento,
                usuarioId: Number(fDepto.usuarioId),
                prioridad: Number(fDepto.prioridad),
              })
            }
            disabled={!fDepto.departamento || !fDepto.usuarioId}
            style={btn}
          >
            Crear regla
          </button>
        </div>
        <p style={{ color: "#666", marginTop: 8 }}>
          También se crea una cobertura con la misma prioridad.
        </p>
      </section>

      {/* Coberturas */}
      <section style={box}>
        <h3 style={h3}>Coberturas (Usuario ↔ Departamento)</h3>
        <div style={{ ...row, marginBottom: 12 }}>
          <input
            placeholder="Departamento (filtro)"
            value={fCob.departamento}
            onChange={(e) =>
              setFCob({ ...fCob, departamento: e.target.value })
            }
            style={ipt}
          />
          {selectUser(fCob.usuarioId, (v) =>
            setFCob({ ...fCob, usuarioId: v })
          )}
          <input
            type="number"
            placeholder="Prioridad"
            value={fCob.prioridad}
            onChange={(e) =>
              setFCob({ ...fCob, prioridad: Number(e.target.value) })
            }
            style={ipt}
          />
          <button
            onClick={() =>
              mCob.mutate({
                departamento: fCob.departamento,
                usuarioId: Number(fCob.usuarioId),
                prioridad: Number(fCob.prioridad),
              })
            }
            disabled={!fCob.departamento || !fCob.usuarioId}
            style={btn}
          >
            Agregar cobertura
          </button>
        </div>

        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            border: "1px solid #ddd",
          }}
        >
          <thead>
            <tr style={{ background: "#f7f7f7" }}>
              <th style={th}>ID</th>
              <th style={th}>Departamento</th>
              <th style={th}>Usuario</th>
              <th style={th}>Prioridad</th>
              <th style={th}>Activo</th>
              <th style={th}></th>
            </tr>
          </thead>
          <tbody>
            {coberturas.map((c) => (
              <tr key={c.usuarioCoberturaId}>
                <td style={td}>{c.usuarioCoberturaId}</td>
                <td style={td}>{c.departamento}</td>
                <td style={td}>{c.usuarioId}</td>
                <td style={td}>{c.prioridad}</td>
                <td style={td}>{c.activo ? "Sí" : "No"}</td>
                <td style={td}>
                  <button
                    onClick={() => mCobDel.mutate(c.usuarioCoberturaId)}
                    style={{ ...btn, background: "#d33" }}
                  >
                    Desactivar
                  </button>
                </td>
              </tr>
            ))}
            {!coberturas.length && (
              <tr>
                <td colSpan={6} style={{ padding: 12, color: "#666" }}>
                  Sin coberturas
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      {/* Consultar/Recalcular dueño de cliente */}
      <section style={box}>
        <h3 style={h3}>Consultar dueño de un cliente</h3>
        <div style={row}>
          <input
            placeholder="ClienteId"
            value={consultaClienteId}
            onChange={(e) => setConsultaClienteId(e.target.value)}
            style={ipt}
          />
          <button
            onClick={consultarDuenio}
            disabled={!consultaClienteId}
            style={btn}
          >
            Consultar
          </button>
          <button
            onClick={async () => {
              const r = await recalcularCliente(Number(consultaClienteId));
              setDuenio(r);
            }}
            disabled={!consultaClienteId}
            style={{ ...btn, background: "#444" }}
          >
            Recalcular
          </button>
        </div>
        {duenio && (
          <div style={{ marginTop: 8, fontFamily: "monospace" }}>
            {JSON.stringify(duenio)}
          </div>
        )}
      </section>
    </div>
  );
}

// estilos inline mínimos
const box = { border: "1px solid #ddd", padding: 16, borderRadius: 8 };
const h3 = { fontWeight: 600, marginBottom: 8 };
const row = { display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" };
const ipt = { padding: 8, border: "1px solid #ddd" };
const btn = {
  padding: "8px 12px",
  background: "#111",
  color: "#fff",
  borderRadius: 6,
  border: "none",
  cursor: "pointer",
};
const th = { padding: 8, border: "1px solid #ddd", textAlign: "left" };
const td = { padding: 8, border: "1px solid #ddd" };
