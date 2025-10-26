// src/reports/pdfUtils.js
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export function crearEncabezado(doc, titulo) {
  doc.setFontSize(18);
  doc.text(titulo, 14, 20);
  doc.setFontSize(10);
  doc.text(`Generado: ${new Date().toLocaleString()}`, 14, 28);
  doc.line(14, 30, 195, 30);
}

export function exportarTabla(doc, columnas, datos, nombreArchivo) {
  autoTable(doc, {
    startY: 35,
    head: [columnas],
    body: datos,
    styles: { fontSize: 10 },
    headStyles: { fillColor: [0, 123, 255] },
  });

  doc.save(`${nombreArchivo}_${new Date().toISOString().slice(0, 10)}.pdf`);
}
