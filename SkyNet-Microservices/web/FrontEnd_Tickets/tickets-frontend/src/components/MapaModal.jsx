
// src/components/MapaModal.jsx
import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export default function MapaModal({ lat, lng, cliente, tecnico, onClose }) {
  const mapRef = useRef(null);
  const divRef = useRef(null);

  useEffect(() => {
    if (!divRef.current) return;

    const map = L.map(divRef.current, { zoomControl: false }).setView([lat, lng], 16);
    mapRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 20,
      attribution: "&copy; OpenStreetMap",
    }).addTo(map);

    L.marker([lat, lng]).addTo(map).bindPopup(`<b>${cliente}</b><br/>${tecnico}`).openPopup();

    return () => {
      map.remove();
    };
  }, [lat, lng, cliente, tecnico]);

  return (
    <div style={overlay} onClick={onClose}>
      <div style={modal} onClick={(e) => e.stopPropagation()}>
        <div style={header}>
          <div>
            <div style={{ fontWeight: 700 }}>Ubicación</div>
            <div style={{ fontSize: 12, opacity: 0.8 }}>
              {cliente} — {tecnico}
            </div>
          </div>
        </div>

        {/* ✅ Botón flotante y ANIMADO */}
        <button
          style={btnCloseFloating}
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
        >
          ✕
        </button>

        <div ref={divRef} style={{ height: 360, borderRadius: 10, overflow: "hidden" }} />
      </div>
    </div>
  );
}

const overlay = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,.55)",
  backdropFilter: "blur(6px)",
  display: "grid",
  placeItems: "center",
  zIndex: 9999,
  padding: 16,
};

const modal = {
  width: "100%",
  maxWidth: 640,
  background: "radial-gradient(100% 100% at 50% 0%, #14181c 0%, #171c21 100%)",
  border: "1px solid #26313b",
  borderRadius: 16,
  boxShadow: "0 20px 80px rgba(0,0,0,.5)",
  overflow: "hidden",
  position: "relative", // necesario para posicionar bien la X flotante
};

const header = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "12px 14px",
  borderBottom: "1px solid #26313b",
  color: "#e6edf3",
};

// 🎯 Botón flotante animado y elegante
const btnCloseFloating = {
  position: "absolute",
  top: 10,
  right: 10,
  width: 34,
  height: 34,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "rgba(255,75,75,0.9)",
  color: "white",
  border: "none",
  borderRadius: "50%",
  cursor: "pointer",
  fontWeight: 700,
  fontSize: 16,
  transition: "transform .15s ease, opacity .2s",
  backdropFilter: "blur(4px)",
  boxShadow: "0 4px 15px rgba(0,0,0,.4)",
};

btnCloseFloating[":hover"] = {
  transform: "scale(1.08)",
  opacity: 0.9,
};
