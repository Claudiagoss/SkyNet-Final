import { useState, useEffect } from "react";

/**
 * Hook simple para mostrar toasts flotantes en pantalla.
 * Uso:
 *   const { push } = useToasts();
 *   push("✅ Mensaje enviado correctamente", "success");
 */
export function useToasts() {
  const [toasts, setToasts] = useState([]);

  function push(message, type = "info", timeout = 3000) {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, timeout);
  }

  return { push, Toasts: () => <Toasts toasts={toasts} /> };
}

/* ---------------- UI del Toast ---------------- */
function Toasts({ toasts }) {
  useEffect(() => {
    if (toasts.length > 0) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "auto";
  }, [toasts]);

  return (
    <div style={styles.container}>
      {toasts.map((t) => (
        <div key={t.id} style={{ ...styles.toast, ...colorMap[t.type] }}>
          {t.message}
        </div>
      ))}
    </div>
  );
}

const styles = {
  container: {
    position: "fixed",
    top: "1.5rem",
    right: "1.5rem",
    display: "flex",
    flexDirection: "column",
    gap: "0.6rem",
    zIndex: 9999,
  },
  toast: {
    minWidth: "220px",
    padding: "10px 16px",
    borderRadius: "12px",
    fontWeight: 600,
    color: "#fff",
    boxShadow: "0 0 10px rgba(0,0,0,0.3)",
    backdropFilter: "blur(6px)",
    animation: "fadeIn 0.3s ease",
  },
};

const colorMap = {
  success: { background: "rgba(34,197,94,0.85)" },
  error: { background: "rgba(239,68,68,0.85)" },
  info: { background: "rgba(59,130,246,0.85)" },
};

export default useToasts;
