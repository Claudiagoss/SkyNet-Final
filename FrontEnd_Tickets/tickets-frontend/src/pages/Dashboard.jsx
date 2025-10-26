import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar.jsx";
import { obtenerTickets } from "../../app/api/ticketsApi.js";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, Legend,
  RadialBarChart, RadialBar,
  BarChart, Bar, CartesianGrid
} from "recharts";
import { motion } from "framer-motion";
import "../pages/VisitasGlass.css";

const COLORS = ["#4FC3F7", "#7E57C2", "#81C784", "#FFB74D"];

export default function Dashboard() {
  const [tickets, setTickets] = useState([]);

  useEffect(() => {
    async function load() {
      try {
        const data = await obtenerTickets();
        setTickets(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("❌ Error cargando tickets:", err);
      }
    }
    load();
  }, []);

  // 🚦 Distribución de estados
  const estados = ["Abierto", "En Proceso", "Resuelto", "Cerrado"];
  const dataEstados = estados.map((nombre) => ({
    name: nombre,
    value: tickets.filter((t) =>
      (t.estado || "").toLowerCase().includes(nombre.toLowerCase())
    ).length,
  }));

  // 🗓️ Visitas por día (últimos 7 días)
  const dataFechas = Object.values(
    tickets.reduce((acc, t) => {
      const fecha = new Date(t.creadoEl || t.fecha || Date.now())
        .toLocaleDateString("es-GT");
      acc[fecha] = acc[fecha] || { fecha, total: 0 };
      acc[fecha].total++;
      return acc;
    }, {})
  ).slice(-7);

  // 📉 Porcentaje de tickets cerrados vs abiertos
  const total = tickets.length || 1;
  const cerrados = tickets.filter((t) =>
    (t.estado || "").toLowerCase().includes("cerrado")
  ).length;
  const abiertos = total - cerrados;
  const ratio = ((cerrados / total) * 100).toFixed(1);

  const dataCierre = [
    { name: "Cerrados", value: cerrados, fill: "#4FC3F7" },
    { name: "Abiertos", value: abiertos, fill: "#FFB74D" },
  ];

  // 🧭 Tickets activos por prioridad
  const prioridades = ["Baja", "Media", "Alta", "Urgente"];
  const dataPrioridades = prioridades.map((p) => ({
    name: p,
    activos: tickets.filter(
      (t) =>
        (t.prioridad || "").toLowerCase().includes(p.toLowerCase()) &&
        (t.estadoId === 1 || t.estadoId === 2)
    ).length,
    cerrados: tickets.filter(
      (t) =>
        (t.prioridad || "").toLowerCase().includes(p.toLowerCase()) &&
        (t.estadoId === 3 || t.estadoId === 4)
    ).length,
  }));

  return (
    <>
      <Sidebar />
      <div className="vd-wrap" style={{ marginLeft: 0 }}>
        <div className="vd-lights" />
        <div className="vd-container">
          <header className="vd-head">
            <div className="vd-title">
              <span className="pin">📊</span>
              <h2>Dashboard General de SkyNet S.A.</h2>
            </div>
            <p style={{ color: "#9fd2ff", fontSize: 14, marginTop: 4 }}>
              Total de tickets registrados:{" "}
              <strong>{tickets.length}</strong>
            </p>
          </header>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(480px, 1fr))",
              gap: 24,
            }}
          >
            {/* 🚦 Distribución de estados */}
            <div className="glass" style={{ padding: 24 }}>
              <h3>🚦 Distribución de estados</h3>
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie
                    data={dataEstados}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={130}
                    label
                  >
                    {dataEstados.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "#121a25",
                      border: "none",
                      color: "#fff",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* 🗓️ Visitas por día */}
            <div className="glass" style={{ padding: 24 }}>
              <h3>🗓️ Visitas por día (últimos 7 días)</h3>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={dataFechas}>
                  <XAxis dataKey="fecha" stroke="#9fd2ff" />
                  <YAxis />
                  <Tooltip
                    contentStyle={{
                      background: "#121a25",
                      border: "none",
                      color: "#fff",
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="total"
                    stroke="#7E57C2"
                    strokeWidth={3}
                    dot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* 📉 Porcentaje de tickets cerrados vs abiertos */}
            <div className="glass" style={{ padding: 24, textAlign: "center" }}>
              <h3>📉 Porcentaje de cierre</h3>
              <ResponsiveContainer width="100%" height={350}>
                <RadialBarChart
                  innerRadius="60%"
                  outerRadius="100%"
                  data={dataCierre}
                  startAngle={180}
                  endAngle={0}
                >
                  <RadialBar
                    minAngle={15}
                    background
                    clockWise
                    dataKey="value"
                  />
                  <Legend
                    iconSize={10}
                    layout="horizontal"
                    verticalAlign="bottom"
                    align="center"
                  />
                </RadialBarChart>
              </ResponsiveContainer>
              <h2 style={{ color: "#4FC3F7", marginTop: -10 }}>
                {ratio}% cerrado
              </h2>
            </div>

            {/* 🧭 Tickets activos por prioridad */}
            <div className="glass" style={{ padding: 24 }}>
              <h3>🧭 Tickets activos por prioridad</h3>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={dataPrioridades}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis dataKey="name" stroke="#9fd2ff" />
                  <YAxis />
                  <Tooltip
                    contentStyle={{
                      background: "#121a25",
                      border: "none",
                      color: "#fff",
                    }}
                  />
                  <Legend />
                  <Bar dataKey="activos" stackId="a" fill="#FFB74D" />
                  <Bar dataKey="cerrados" stackId="a" fill="#4FC3F7" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}
