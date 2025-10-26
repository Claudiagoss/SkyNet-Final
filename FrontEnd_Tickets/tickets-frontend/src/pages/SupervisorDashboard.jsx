// ============================================================
// 📊 SupervisorDashboard.jsx — Vista principal del supervisor
// ============================================================
import { useEffect, useState } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
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
  const [tickets, setTickets] = useState([]);
  const [visitas, setVisitas] = useState([]);
  const [mapData, setMapData] = useState(null);
  const [detalleId, setDetalleId] = useState(null);
  const [openCreate, setOpenCreate] = useState(false);
  const [editData, setEditData] = useState(null); // 🔹 NUEVO estado para edición
  const [mostrarKanban, setMostrarKanban] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [ticketToDelete, setTicketToDelete] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const VISITAS_POR_PAGINA = 6;

  const authRaw = getAuth();
  const detectedRoleId = getRoleId();
  const detectedRoleText = authRaw?.rol || "SIN_ROL";

  const API_BASE =
    import.meta.env.VITE_TICKETS_BASE_URL ||
    "https://skynet-ticketapi-eyd8aaa8hzb0crdh.canadacentral-01.azurewebsites.net/api";

  useEffect(() => {
    cargarVisitasActivas();
  }, []);

  async function cargarVisitasActivas() {
    try {
      const token = getToken();
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await axios.get(`${API_BASE}/tickets`, { headers });
      let data = Array.isArray(res.data) ? res.data : [];

      const enhanced = await Promise.all(
        data.map(async (v) => {
          if (v.titulo) return v;
          try {
            const { data: detalle } = await axios.get(
              `${API_BASE}/tickets/${v.ticketId}`,
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
      setCurrentPage(1);
    } catch (err) {
      console.error("❌ Error cargando visitas activas:", err);
      toast.error("No se pudieron cargar las visitas activas.");
    }
  }

  const generarReportePDF = () => {
    if (!visitas.length) {
      toast.warn("⚠️ No hay visitas activas para generar reporte.");
      return;
    }

    const doc = new jsPDF("landscape");
    doc.setFontSize(16);
    doc.text("Reporte de Visitas Activas — SkyNet S.A.", 14, 20);
    doc.setFontSize(10);
    doc.text(`Generado: ${new Date().toLocaleString()}`, 14, 27);
    doc.line(14, 30, 280, 30);

    autoTable(doc, {
      startY: 35,
      head: [["ID", "Cliente", "Título", "Ubicación"]],
      body: visitas.map((v) => [
        v.ticketId,
        v.cliente ?? v.clienteNombre ?? "—",
        v.titulo || "—",
        v.latitudIngreso && v.longitudIngreso
          ? `${v.latitudIngreso}, ${v.longitudIngreso}`
          : "Sin ubicación",
      ]),
      styles: { fontSize: 9 },
      headStyles: { fillColor: [0, 150, 255] },
    });

    doc.save(`Visitas_Activas_${new Date().toISOString().slice(0, 10)}.pdf`);
    toast.success("📄 Reporte PDF generado correctamente");
  };

  async function onClosed(ticketId) {
    try {
      const res = await cerrarTicket(ticketId);
      if (res.ok) {
        toast.success("✅ Ticket cerrado correctamente");
        setVisitas((prev) => prev.filter((v) => v.ticketId !== ticketId));
        await cargarVisitasActivas();
      } else {
        toast.error("⚠️ No se pudo cerrar la visita correctamente.");
      }
    } catch (err) {
      console.error("❌ Error cerrando ticket:", err);
      toast.error("❌ Error al cerrar la visita o enviar el correo.");
    }
  }

  async function handleDeleteTicket() {
    if (!ticketToDelete) return;
    try {
      await eliminarTicket(ticketToDelete);
      setVisitas((prev) => prev.filter((v) => v.ticketId !== ticketToDelete));
      setTickets((prev) => prev.filter((v) => v.ticketId !== ticketToDelete));
      toast.info("🗑️ Ticket eliminado correctamente");
    } catch (err) {
      console.error("❌ Error eliminando ticket:", err);
      toast.error("No se pudo eliminar el ticket.");
    } finally {
      setShowConfirm(false);
      setTicketToDelete(null);
    }
  }

  function abrirMapa(v) {
    const lat = v.latitudSalida ?? v.latitudIngreso ?? v.latitud ?? null;
    const lng = v.longitudSalida ?? v.longitudIngreso ?? v.longitud ?? null;
    if (!lat || !lng) {
      alert("Este registro no tiene coordenadas.");
      return;
    }
    setMapData({
      lat,
      lng,
      cliente: v.cliente ?? v.clienteNombre ?? "Cliente",
      titulo: v.titulo ?? "—",
    });
  }

  const totalPaginas = Math.ceil(visitas.length / VISITAS_POR_PAGINA);
  const visitasPaginadas = visitas.slice(
    (currentPage - 1) * VISITAS_POR_PAGINA,
    currentPage * VISITAS_POR_PAGINA
  );

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
              <button className="btn-pill glass" onClick={generarReportePDF}>
                📄 Reporte PDF
              </button>

              <button
                className="btn-pill glass"
                onClick={() => setMostrarKanban((prev) => !prev)}
              >
                {mostrarKanban ? "📋 Ver tabla" : "📊 Kanban"}
              </button>

              <button
                className="btn-pill primary"
                onClick={() => {
                  setEditData(null); // limpiar modo edición
                  setOpenCreate(true);
                }}
              >
                ✚ Nueva visita
              </button>
            </div>
          </header>

          {!mostrarKanban ? (
            <div className="vd-card glass">
              <div className="vd-table">
                <div className="vd-thead">
                  <div className="th id">ID</div>
                  <div className="th cliente">Cliente</div>
                  <div className="th titulo">Título</div>
                  <div className="th mapa">Acciones</div>
                </div>

                <div className="vd-tbody">
                  {visitas.length ? (
                    visitasPaginadas.map((v) => (
                      <div key={v.ticketId} className="vd-row glass-row">
                        <div className="td id">#{v.ticketId}</div>
                        <div className="td cliente">
                          {v.cliente ?? v.clienteNombre ?? "—"}
                        </div>
                        <div className="td titulo">
                          {v.titulo && v.titulo !== "—" ? (
                            <span style={{ color: "#9bd4ff", fontWeight: 600 }}>
                              {v.titulo}
                            </span>
                          ) : (
                            <span style={{ opacity: 0.4 }}>—</span>
                          )}
                        </div>
                        <div
                          className="td mapa"
                          style={{ display: "flex", gap: "8px" }}
                        >
                          <button
                            className="icon-btn glass-icon"
                            title="Ver detalles"
                            onClick={() => setDetalleId(v.ticketId)}
                          >
                            👁
                          </button>
                          {/* ✏️ NUEVO BOTÓN EDITAR */}
                          <button
                            className="icon-btn glass-icon"
                            title="Editar visita"
                            onClick={() => {
                              setEditData(v);
                              setOpenCreate(true);
                            }}
                          >
                            ✏️
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

                {/* PAGINADOR */}
                {totalPaginas > 1 && (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      gap: "12px",
                      padding: "16px 0",
                      borderTop: "1px solid rgba(255,255,255,0.06)",
                      marginTop: 10,
                    }}
                  >
                    <button
                      className="btn-pill glass"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage((p) => p - 1)}
                    >
                      ◀ Anterior
                    </button>
                    <span style={{ color: "#9fd2ff", fontWeight: 500 }}>
                      Página {currentPage} de {totalPaginas}
                    </span>
                    <button
                      className="btn-pill glass"
                      disabled={currentPage === totalPaginas}
                      onClick={() => setCurrentPage((p) => p + 1)}
                    >
                      Siguiente ▶
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
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
            />
          )}
        </div>
      </div>

      {/* 🧭 Modales */}
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
          editData={editData} // 🔹 Modo edición
          onClose={() => {
            setOpenCreate(false);
            setEditData(null);
          }}
          onCreated={() => {
            setOpenCreate(false);
            setEditData(null);
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
