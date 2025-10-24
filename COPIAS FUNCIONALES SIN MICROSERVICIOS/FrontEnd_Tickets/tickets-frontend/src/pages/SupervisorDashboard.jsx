// ✅ src/pages/SupervisorDashboard.jsx — versión final conectada con KanbanView
import { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../../src/components/Sidebar.jsx";
import MapaModal from "../components/MapaModal.jsx";
import VisitaDetalleModal from "../components/VisitaDetalleModal.jsx";
import CreateVisitaModal from "../components/CreateVisitaModal.jsx";
import ConfirmModal from "../components/ConfirmModal.jsx";
import KanbanView from "../components/KanbanView.jsx";
import { cerrarTicket, eliminarTicket } from "../../app/api/ticketsApi.js";
import { getAuth, getRoleId, getToken } from "../../app/utils/auth.js";
import { toast } from "react-toastify";
import "./VisitasGlass.css";

export default function SupervisorDashboard() {
  const [tickets, setTickets] = useState([]); // todos los tickets
  const [visitas, setVisitas] = useState([]); // solo activas
  const [mapData, setMapData] = useState(null);
  const [detalleId, setDetalleId] = useState(null);
  const [openCreate, setOpenCreate] = useState(false);
  const [mostrarKanban, setMostrarKanban] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [ticketToDelete, setTicketToDelete] = useState(null);

  const authRaw = getAuth();
  const detectedRoleId = getRoleId();
  const detectedRoleText = authRaw?.rol || "SIN_ROL";

  useEffect(() => {
    cargarVisitasActivas();
  }, []);

  // 🔹 Cargar visitas activas (estado 1 o 2)
  async function cargarVisitasActivas() {
    try {
      const token = getToken();
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await axios.get("http://localhost:5058/api/tickets", { headers });
      let data = Array.isArray(res.data) ? res.data : [];

      // obtener título desde /tickets/{id}
      const enhanced = await Promise.all(
        data.map(async (v) => {
          if (v.titulo) return v;
          try {
            const { data: detalle } = await axios.get(
              `http://localhost:5058/api/tickets/${v.ticketId}`,
              { headers }
            );
            return { ...v, titulo: detalle?.titulo || "—" };
          } catch {
            return { ...v, titulo: "—" };
          }
        })
      );

      setTickets(enhanced);
      setVisitas(enhanced.filter((v) => v.estadoId === 1 || v.estadoId === 2));
    } catch (err) {
      console.error("Error cargando visitas activas", err);
    }
  }

  // ================================================================
// 🔹 CERRAR TICKET (CheckOut de visita)
// ================================================================
async function onClosed(ticketId) {
  try {
    // Llamar al endpoint del backend para cerrar el ticket
    const res = await cerrarTicket(ticketId);

    // Si todo sale bien...
    if (res.ok) {
      // ✅ Notificaciones visuales
      toast.success("✅ Ticket cerrado correctamente", {
        position: "top-center",
        autoClose: 2500,
      });
      toast.info("📧 Correo enviado correctamente", {
        position: "top-center",
        autoClose: 2500,
      });

      // 🧹 Eliminar la visita de la lista actual
      setVisitas((prev) => prev.filter((v) => v.ticketId !== ticketId));

      // 🔄 Volver a cargar las visitas activas
      await cargarVisitasActivas();

      // 🌐 Emitir evento global para que el Kanban se actualice automáticamente
      if (window.dispatchEvent) {
        window.dispatchEvent(
          new CustomEvent("kanbanRefresh", {
            detail: { id: ticketId, estadoId: 3 }, // estado 3 = Resuelto
          })
        );
      }
    } else {
      // ⚠️ Error controlado desde el servidor
      toast.error("⚠️ No se pudo cerrar la visita correctamente.");
    }
  } catch (err) {
    // ❌ Error general (fallo de conexión o excepción)
    console.error("Error cerrando ticket:", err);
    toast.error("❌ Error al cerrar la visita o enviar el correo.");
  }
}

  // 🔹 Eliminar ticket
  async function handleDeleteTicket() {
    if (!ticketToDelete) return;
    try {
      await eliminarTicket(ticketToDelete);
      setVisitas((prev) => prev.filter((v) => v.ticketId !== ticketToDelete));
      setTickets((prev) => prev.filter((v) => v.ticketId !== ticketToDelete));
      toast.info("🗑️ Ticket eliminado correctamente");
    } catch (err) {
      console.error("Error eliminando ticket", err);
      toast.error("❌ No se pudo eliminar el ticket");
    } finally {
      setShowConfirm(false);
      setTicketToDelete(null);
    }
  }

  // 🔹 Abrir mapa modal
  function abrirMapa(v) {
    const lat = v.latitudSalida ?? v.latitudIngreso ?? v.latitud ?? v.lat ?? null;
    const lng = v.longitudSalida ?? v.longitudIngreso ?? v.longitud ?? v.lng ?? null;
    if (!lat || !lng) {
      alert("Este registro no tiene coordenadas.");
      return;
    }
    setMapData({
      lat,
      lng,
      cliente: v.cliente ?? v.clienteNombre ?? "Cliente",
      tecnico: v.tecnico ?? v.asignadoA ?? "Técnico",
      titulo: v.titulo ?? "—",
    });
  }

  return (
    <>
      <Sidebar />
      <div className="vd-wrap" style={{ marginLeft: 230 }}>
        <div className="vd-lights" />
        <div className="vd-container">
          <header className="vd-head">
            <div className="vd-title">
              <span className="pin">📍</span>
              <h2>Visitas Activas</h2>
            </div>

            <div className="vd-actions">
              <button
                className="btn-pill glass"
                onClick={() => setMostrarKanban((prev) => !prev)}
              >
                {mostrarKanban ? "📋 Ver tabla" : "📊 Kanban"}
              </button>

              {(detectedRoleId === 1 ||
                detectedRoleId === 4 ||
                detectedRoleText === "admin" ||
                detectedRoleText === "supervisor") && (
                <button
                  className="btn-pill primary"
                  onClick={() => setOpenCreate(true)}
                >
                  ✚ Nueva visita
                </button>
              )}
            </div>
          </header>

          {!mostrarKanban ? (
            // 🔹 Tabla
            <div className="vd-card glass">
              <div className="vd-table">
                <div className="vd-thead">
                  <div className="th id">ID</div>
                  <div className="th cliente">Cliente</div>
                  <div className="th titulo">Título</div>
                  <div className="th tecnico">Técnico</div>
                  <div className="th hora">Hora</div>
                  <div className="th mapa">Acciones</div>
                </div>

                <div className="vd-tbody">
                  {visitas.length ? (
                    visitas.map((v) => (
                      <div key={v.ticketId} className="vd-row glass-row">
                        <div className="td id">#{v.ticketId}</div>
                        <div className="td cliente">{v.cliente ?? v.clienteNombre ?? "—"}</div>
                        <div className="td titulo">
                          {v.titulo && v.titulo !== "—" ? (
                            <span style={{ color: "#9bd4ff", fontWeight: 600 }}>
                              {v.titulo}
                            </span>
                          ) : (
                            <span style={{ opacity: 0.4 }}>—</span>
                          )}
                        </div>
                        <div className="td tecnico">
                          {v.tecnico ?? v.asignadoA ?? "—"}
                        </div>
                        <div className="td hora">
                          {v.horaIngreso
                            ? new Date(v.horaIngreso).toLocaleTimeString()
                            : "—"}
                        </div>
                        <div className="td mapa" style={{ display: "flex", gap: "8px" }}>
                          <button
                            className="icon-btn glass-icon"
                            title="Ver detalles"
                            onClick={() => setDetalleId(v.ticketId)}
                          >
                            👁
                          </button>
                          <button
                            className="icon-btn glass-icon"
                            title="Cerrar visita"
                            onClick={() => onClosed(v.ticketId)}
                          >
                            ✅
                          </button>
                          <button
                            className="icon-btn glass-icon"
                            title="Eliminar"
                            onClick={() => {
                              setTicketToDelete(v.ticketId);
                              setShowConfirm(true);
                            }}
                          >
                            🗑️
                          </button>
                          <button
                            className="radar-btn"
                            onClick={() => abrirMapa(v)}
                            title="Ver ubicación"
                          >
                            <span className="radar">
                              <span className="r-pulse" />
                              <span className="r-dot" />
                            </span>
                            <span>Mapa</span>
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="vd-empty">No hay visitas activas</div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            // 🔹 KanbanView conectado
            <KanbanView
  tickets={tickets}
  estados={[
    { estadoId: 1, nombre: "Abierto" },
    { estadoId: 2, nombre: "En Proceso" },
    { estadoId: 3, nombre: "Resuelto" },
    { estadoId: 4, nombre: "Cerrado" },
  ]}
  prioridades={[
    { prioridadId: 1, nombre: "Baja" },
    { prioridadId: 2, nombre: "Media" },
    { prioridadId: 3, nombre: "Alta" },
  ]}
  // 🔹 cuando se cierra
  onClosed={(id) => {
    setVisitas((prev) => prev.filter((v) => v.ticketId !== id));
    setTickets((prev) => prev.filter((v) => v.ticketId !== id));
  }}
  // 🔹 cuando cambia de estado abierto/en proceso
  onUpdate={(id, nuevoEstadoId) => {
    setTickets((prev) =>
      prev.map((v) =>
        v.ticketId === id ? { ...v, estadoId: nuevoEstadoId } : v
      )
    );
    setVisitas((prev) =>
      prev.map((v) =>
        v.ticketId === id ? { ...v, estadoId: nuevoEstadoId } : v
      )
    );
  }}
/>
          )}
        </div>
      </div>

      {/* Modales */}
      {mapData && <MapaModal {...mapData} onClose={() => setMapData(null)} />}
      {detalleId && (
        <VisitaDetalleModal
          ticketId={detalleId}
          onClose={() => setDetalleId(null)}
        />
      )}
      {openCreate && (
        <CreateVisitaModal
          open={openCreate}
          onClose={() => setOpenCreate(false)}
          onCreated={() => {
            setOpenCreate(false);
            cargarVisitasActivas();
          }}
        />
      )}
      <ConfirmModal
        open={showConfirm}
        message="¿Deseas eliminar esta visita permanentemente?"
        onConfirm={handleDeleteTicket}
        onCancel={() => {
          setShowConfirm(false);
          setTicketToDelete(null);
        }}
      />
    </>
  );
}
