import React, { useEffect, useState } from "react";
import jsPDF from "jspdf";
import { crearEncabezado, exportarTabla } from "./pdfUtils";
import { obtenerUsuarios } from "../api/usuariosApi";

export default function ReporteTecnicos() {
  const [tecnicos, setTecnicos] = useState([]);

  useEffect(() => {
    const cargar = async () => {
      const token = localStorage.getItem("token");
      const res = await obtenerUsuarios(token);
      const soloTecnicos = res.data.filter((u) => u.rolId === 5);
      setTecnicos(soloTecnicos);
    };
    cargar();
  }, []);

  const generarPDF = () => {
    const doc = new jsPDF();
    crearEncabezado(doc, "Reporte de Técnicos");

    const columnas = ["Nombre", "Usuario", "Email", "Estado"];
    const datos = tecnicos.map((t) => [
      `${t.nombre} ${t.apellido}`,
      t.username,
      t.email,
      t.esActivo ? "Activo" : "Inactivo",
    ]);

    exportarTabla(doc, columnas, datos, "Reporte_Tecnicos");
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>👨‍🔧 Reporte de Técnicos</h2>
      <button onClick={generarPDF}>📄 Generar PDF</button>
    </div>
  );
}
