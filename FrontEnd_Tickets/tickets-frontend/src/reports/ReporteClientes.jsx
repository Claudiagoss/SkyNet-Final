import React, { useEffect, useState } from "react";
import jsPDF from "jspdf";
import { crearEncabezado, exportarTabla } from "./pdfUtils";
import { obtenerClientes } from "../api/clientesApi";

export default function ReporteClientes() {
  const [clientes, setClientes] = useState([]);

  useEffect(() => {
    const cargar = async () => {
      const token = localStorage.getItem("token");
      const res = await obtenerClientes(token);
      setClientes(res.data);
    };
    cargar();
  }, []);

  const generarPDF = () => {
    const doc = new jsPDF();
    crearEncabezado(doc, "Reporte de Clientes");

    const columnas = ["Cliente", "Contacto", "Email", "Teléfono"];
    const datos = clientes.map((c) => [
      c.nombre,
      c.contacto,
      c.email,
      c.telefono,
    ]);

    exportarTabla(doc, columnas, datos, "Reporte_Clientes");
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>📋 Reporte de Clientes</h2>
      <button onClick={generarPDF}>📄 Generar PDF</button>
    </div>
  );
}
