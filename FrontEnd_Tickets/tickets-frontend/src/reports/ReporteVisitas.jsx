import { useEffect, useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import axios from "axios";

const API_BASE =
  import.meta.env.VITE_TICKETS_BASE_URL ||
  "https://skynet-ticketapi-eyd8aaa8hzb0crdh.canadacentral-01.azurewebsites.net/api";

export default function Reportes() {
  const [tipo, setTipo] = useState("activas");
  const [datos, setDatos] = useState([]);
  const [loading, setLoading] = useState(false);

  // Cargar datos del tipo de reporte
  const cargarDatos = async () => {
    setLoading(true);
    try {
      const endpoint =
        tipo === "activas"
          ? `${API_BASE}/tickets/visitas/activas`
          : `${API_BASE}/tickets/historial`;

      const res = await axios.get(endpoint);
      setDatos(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("❌ Error cargando datos:", err);
      setDatos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, [tipo]);

  // Generar PDF dinámico
  const generarPDF = () => {
    if (!datos.length) {
      alert("No hay datos para generar el reporte.");
      return;
    }

    const doc = new jsPDF("landscape");
    const titulo =
      tipo === "activas"
        ? "Reporte de Visitas Activas — SkyNet S.A."
        : "Historial de Visitas — SkyNet S.A.";

    doc.setFontSize(16);
    doc.text(titulo, 14, 20);
    doc.setFontSize(10);
    doc.text(`Generado: ${new Date().toLocaleString()}`, 14, 27);
    doc.line(14, 30, 280, 30);

    autoTable(doc, {
      startY: 35,
      head:
        tipo === "activas"
          ? [["ID", "Cliente", "Título", "Técnico", "Hora Ingreso", "Ubicación"]]
          : [["ID", "Cliente", "Técnico", "Inicio", "Fin", "Reporte"]],
      body:
        tipo === "activas"
          ? datos.map((v) => [
              v.ticketId,
              v.cliente,
              v.titulo || "—",
              v.tecnico || "—",
              v.horaIngreso
                ? new Date(v.horaIngreso).toLocaleString()
                : "—",
              v.latitudIngreso && v.longitudIngreso
                ? `${v.latitudIngreso}, ${v.longitudIngreso}`
                : "Sin ubicación",
            ])
          : datos.map((v) => [
              v.ticketId,
              v.cliente,
              v.tecnico || "—",
              v.horaIngreso
                ? new Date(v.horaIngreso).toLocaleString()
                : "—",
              v.horaSalida
                ? new Date(v.horaSalida).toLocaleString()
                : "—",
              v.reporteFinal?.slice(0, 50) || "Sin reporte",
            ]),
      styles: { fontSize: 9 },
      headStyles: { fillColor: [0, 150, 255] },
    });

    doc.save(`${titulo.replaceAll(" ", "_")}_${new Date()
      .toISOString()
      .slice(0, 10)}.pdf`);
  };

  return (
    <div className="glass-container">
      <div className="header-bar">
        <h2 className="title">🧾 Reportes de Visitas</h2>
        <div className="actions">
          <select
            className="select-glass"
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
          >
            <option value="activas">Visitas Activas</option>
            <option value="historial">Historial por Técnico</option>
          </select>
          <button onClick={cargarDatos} className="btn-glass secondary">
            🔄 Recargar
          </button>
          <button onClick={generarPDF} className="btn-glass info">
            📄 Generar PDF
          </button>
        </div>
      </div>

      {loading ? (
        <div className="alert-glass">Cargando datos…</div>
      ) : (
        <div className="table-glass">
          <table className="table">
            <thead>
              <tr>
                {tipo === "activas" ? (
                  <>
                    <th>ID</th>
                    <th>CLIENTE</th>
                    <th>TÍTULO</th>
                    <th>TÉCNICO</th>
                    <th>INGRESO</th>
                  </>
                ) : (
                  <>
                    <th>ID</th>
                    <th>CLIENTE</th>
                    <th>TÉCNICO</th>
                    <th>INICIO</th>
                    <th>FIN</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {datos.length ? (
                datos.map((v) => (
                  <tr key={v.ticketId}>
                    <td>#{v.ticketId}</td>
                    <td>{v.cliente}</td>
                    {tipo === "activas" ? (
                      <>
                        <td>{v.titulo || "—"}</td>
                        <td>{v.tecnico || "—"}</td>
                        <td>
                          {v.horaIngreso
                            ? new Date(v.horaIngreso).toLocaleTimeString()
                            : "—"}
                        </td>
                      </>
                    ) : (
                      <>
                        <td>{v.tecnico || "—"}</td>
                        <td>
                          {v.horaIngreso
                            ? new Date(v.horaIngreso).toLocaleString()
                            : "—"}
                        </td>
                        <td>
                          {v.horaSalida
                            ? new Date(v.horaSalida).toLocaleString()
                            : "—"}
                        </td>
                      </>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center text-muted">
                    No hay registros disponibles.
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
