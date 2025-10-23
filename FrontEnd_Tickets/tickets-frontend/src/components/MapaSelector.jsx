// ✅ src/components/MapaSelector.jsx — versión CORREGIDA sin recarga y con buscador funcional
import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export default function MapaSelector({
  value,
  onChange,
  height = 340,
  center = { lat: 14.6349, lng: -90.5069 },
  zoom = 13,
}) {
  const mapRef = useRef(null);
  const divRef = useRef(null);
  const markerRef = useRef(null);

  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  // ✅ Inicializar mapa
  useEffect(() => {
    if (!divRef.current) return;

    const map = L.map(divRef.current).setView([center.lat, center.lng], zoom);
    mapRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap",
    }).addTo(map);

    function placeOrMoveMarker(lat, lng) {
      if (!markerRef.current) {
        const m = L.marker([lat, lng], { draggable: true }).addTo(map);
        m.on("dragend", () => {
          const { lat: dlat, lng: dlng } = m.getLatLng();
          onChange?.({
            lat: Number(dlat.toFixed(6)),
            lng: Number(dlng.toFixed(6)),
          });
        });
        markerRef.current = m;
      } else {
        markerRef.current.setLatLng([lat, lng]);
      }
    }

    if (value?.lat && value?.lng) {
      placeOrMoveMarker(value.lat, value.lng);
      map.setView([value.lat, value.lng], zoom);
    }

    function onMapClick(e) {
      const { lat, lng } = e.latlng;
      placeOrMoveMarker(lat, lng);
      onChange?.({ lat: Number(lat.toFixed(6)), lng: Number(lng.toFixed(6)) });
    }
    map.on("click", onMapClick);

    return () => {
      map.off("click", onMapClick);
      map.remove();
    };
  }, []);

  // ✅ Buscar direcciones con Nominatim (sin recargar)
  async function handleSearch() {
    if (!query.trim()) return;
    setLoading(true);
    setResults([]);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          query
        )}&addressdetails=1&limit=5&countrycodes=gt`
      );
      const data = await res.json();
      setResults(data);
    } catch (err) {
      console.error("Error buscando dirección:", err);
    } finally {
      setLoading(false);
    }
  }

  // ✅ Seleccionar resultado
  function selectResult(r) {
    const lat = parseFloat(r.lat);
    const lng = parseFloat(r.lon);
    if (!mapRef.current) return;

    mapRef.current.setView([lat, lng], 16);
    if (!markerRef.current) {
      markerRef.current = L.marker([lat, lng], { draggable: true }).addTo(
        mapRef.current
      );
      markerRef.current.on("dragend", () => {
        const { lat: dlat, lng: dlng } = markerRef.current.getLatLng();
        onChange?.({
          lat: Number(dlat.toFixed(6)),
          lng: Number(dlng.toFixed(6)),
        });
      });
    } else {
      markerRef.current.setLatLng([lat, lng]);
    }
    onChange?.({ lat: Number(lat.toFixed(6)), lng: Number(lng.toFixed(6)) });
    setResults([]);
    setQuery(r.display_name);
  }

  return (
    <div style={{ position: "relative" }}>
      {/* 🔍 Barra de búsqueda (sin form) */}
      <div style={searchBox}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar dirección, colonia o lugar..."
          style={inputStyle}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleSearch();
            }
          }}
        />
        <button type="button" style={btnStyle} onClick={handleSearch}>
          {loading ? "⏳" : "🔍"}
        </button>
      </div>

      {/* 🔽 Resultados del buscador */}
      {results.length > 0 && (
        <div style={resultsBox}>
          {results.map((r, i) => (
            <div key={i} style={resultItem} onClick={() => selectResult(r)}>
              📍 {r.display_name}
            </div>
          ))}
        </div>
      )}

      {/* 🗺️ Mapa */}
      <div
        ref={divRef}
        style={{
          height,
          borderRadius: 10,
          overflow: "hidden",
          marginTop: 8,
        }}
      />

      {/* Coordenadas actuales */}
      <div
        style={{
          position: "absolute",
          right: 10,
          bottom: 10,
          background: "rgba(0,0,0,.6)",
          color: "white",
          padding: "6px 10px",
          borderRadius: 8,
          fontSize: 12,
        }}
      >
        {value?.lat && value?.lng
          ? `📍 ${value.lat}, ${value.lng}`
          : "Haz clic en el mapa o busca una dirección"}
      </div>
    </div>
  );
}

/* 🎨 Estilos inline */
const searchBox = {
  display: "flex",
  alignItems: "center",
  background: "rgba(0,0,0,0.55)",
  borderRadius: 10,
  padding: "4px 6px",
  position: "absolute",
  top: 10,
  left: 10,
  right: 10,
  zIndex: 1000,
  backdropFilter: "blur(4px)",
};

const inputStyle = {
  flex: 1,
  border: "none",
  outline: "none",
  background: "transparent",
  color: "#fff",
  padding: "6px 10px",
  fontWeight: 500,
  fontSize: 14,
};

const btnStyle = {
  background: "rgba(255,255,255,0.2)",
  border: "none",
  borderRadius: 6,
  padding: "6px 10px",
  color: "#fff",
  cursor: "pointer",
  transition: "all .2s ease",
};

const resultsBox = {
  position: "absolute",
  top: 50,
  left: 10,
  right: 10,
  background: "rgba(0,0,0,0.75)",
  borderRadius: 10,
  zIndex: 1001,
  backdropFilter: "blur(6px)",
  maxHeight: 160,
  overflowY: "auto",
  fontSize: 13,
  color: "#fff",
};

const resultItem = {
  padding: "6px 10px",
  cursor: "pointer",
  borderBottom: "1px solid rgba(255,255,255,0.1)",
  transition: "background .15s",
};
