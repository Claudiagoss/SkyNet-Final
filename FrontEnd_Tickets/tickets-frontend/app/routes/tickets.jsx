import { useEffect, useState } from "react";
import axios from "axios";

export default function Tickets() {
  const [visitas, setVisitas] = useState([]);
  const [loading, setLoading] = useState(true);

  const cargarVisitasActivas = async () => {
    try {
      const res = await axios.get("http://localhost:5058/api/tickets/visitas/activas");
      setVisitas(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error cargando visitas activas", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarVisitasActivas();
  }, []);

  return (
    <div className="container mt-4">
      <h2 className="mb-3">📍 Dashboard — Visitas Activas</h2>

      {loading ? (
        <div className="alert alert-secondary">Cargando…</div>
      ) : (
        <div className="table-responsive shadow-sm">
          <table className="table table-striped table-hover">
            <thead className="table-dark">
              <tr>
                <th>ID</th>
                <th>Cliente</th>
                <th>Técnico</th>
                <th>Hora Ingreso</th>
                <th>Ver Mapa</th>
              </tr>
            </thead>
            <tbody>
              {visitas.length ? (
                visitas.map((v) => (
                  <tr key={v.ticketId}>
                    <td>{v.ticketId}</td>
                    <td>{v.cliente}</td>
                    <td>{v.tecnico}</td>
                    <td>{v.horaIngreso ? new Date(v.horaIngreso).toLocaleTimeString() : "-"}</td>
                    <td>
                      {v.latitudIngreso && v.longitudIngreso ? (
                        <a
                          className="btn btn-sm btn-primary"
                          href={`https://maps.google.com/?q=${v.latitudIngreso},${v.longitudIngreso}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Abrir en Google Maps
                        </a>
                      ) : (
                        <span className="text-muted">-</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center">
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

