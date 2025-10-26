import React, { useEffect, useState } from "react";
import jsPDF from "jspdf";
import { crearEncabezado, exportarTabla } from "./pdfUtils";
import { obtenerUsuarios } from "../api/usuariosApi";

export default function ReporteUsuarios() {
  const [usuarios, setUsuarios] = useState([]);

  useEffect(() => {
    const cargar = async () => {
      const token = localStorage.getItem("token");
      const res = await obtenerUsuarios(token);
      setUsuarios(res.data);
    };
    cargar();
  }, []);

  const generarPDF = () => {
    const doc = new jsPDF();
    crearEncabezado(doc, "Reporte General de Usuarios");

    const columnas = ["Nombre", "Usuario", "Rol", "Email"];
    const datos = usuarios.map((u) => [
      `${u.nombre} ${u.apellido}`,
      u.username,
      u.rol?.nombre || "—",
      u.email,
    ]);

    exportarTabla(doc, columnas, datos, "Reporte_Usuarios");
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>👥 Reporte de Usuarios</h2>
      <button onClick={generarPDF}>📄 Generar PDF</button>
    </div>
  );
}
