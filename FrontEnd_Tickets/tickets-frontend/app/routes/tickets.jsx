// ============================================================
// 📍 Tickets.jsx — Dashboard de Visitas Activas (SkyNet Frontend)
// ============================================================
import { useEffect, useState } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// ✅ URL base dinámica (usa variable del entorno de Vite o Azure)
const API_BASE =
  import.meta.env.VITE_TICKETS_BASE_URL ||
  "https://skynet-ticketapi-eyd8aaa8hzb0crdh.canadacentral-01.azurewebsites.net/api";

export default function Tickets() {
  const [visitas, setVisitas] = useState([]);
  const [loading, setLoading] = useState(true);

  // ============================================================
  // 🔹 Cargar visitas activas desde backend
  // ============================================================
  const cargarVisitasActivas = async () => {
    try {
      const res = await axios.get(`${API_BASE}/tickets/visitas/activas`);
      setVisitas(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("❌ Error cargando visitas activas:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarVisitasActivas();
  }, []);

  // ============================================================
  // 🧾 Generar PDF con jsPDF + autoTable
  // ============================================================
  const generarPDF = () => {
    if (!visitas.length) {
      alert("No hay visitas activas para generar el reporte.");
      return;
    }

    const doc = new jsPDF("landscape"); // horizontal para más columnas
    doc.setFontSize(16);
    doc.text("Reporte de Visitas Activas — SkyNet S.A.", 14, 20);
    doc.setFontSize(10);
    doc.text(`Generado: ${new Date().toLocaleString()}`, 14, 27);
    doc.line(14, 30, 280, 30);

    autoTable(doc, {
      startY: 35,
      head: [["ID", "Cliente", "Título", "Técnico", "Hora Ingreso", "Ubicación"]],
      body: visitas.map((v) => [
        v.ticketId,
        v.cliente,
        v.titulo || "—",
        v.tecnico || "—",
        v.horaIngreso ? new Date(v.horaIngreso).toLocaleString() : "—",
        v.latitudIngreso && v.longitudIngreso
          ? `${v.latitudIngreso}, ${v.longitudIngreso}`
          : "Sin ubicación",
      ]),
      styles: { fontSize: 9 },
      headStyles: { fillColor: [0, 150, 255] },
    });

    doc.save(`Visitas_Activas_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  // ============================================================
  // 💅 Render del dashboard (Glass UI adaptado)
  // ============================================================
  return (
    <div className="glass-container">
      <div className="header-bar">
        <h2 className="title">📍 Visitas Activas</h2>
        <div className="actions">
          <button onClick={generarPDF} className="btn-glass info">
            📄 Reporte PDF
          </button>
          <button className="btn-glass secondary">Kanban</button>
          <button className="btn-glass primary">+ Nueva visita</button>
        </div>
      </div>

      {loading ? (
        <div className="alert-glass">Cargando…</div>
      ) : (
        <div className="table-glass">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>CLIENTE</th>
                <th>TÍTULO</th>
                <th>TÉCNICO</th>
                <th>HORA</th>
                <th>ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              {visitas.length ? (
                visitas.map((v) => (
                  <tr key={v.ticketId}>
                    <td>#{v.ticketId}</td>
                    <td>{v.cliente}</td>
                    <td>{v.titulo}</td>
                    <td>{v.tecnico || "—"}</td>
                    <td>
                      {v.horaIngreso
                        ? new Date(v.horaIngreso).toLocaleTimeString()
                        : "—"}
                    </td>
                    <td>
                      {v.latitudIngreso && v.longitudIngreso ? (
                        <a
                          className="btn-glass small"
                          href={`https://maps.google.com/?q=${v.latitudIngreso},${v.longitudIngreso}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          📍 Mapa
                        </a>
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center text-muted">
                    No hay visitas activas.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
