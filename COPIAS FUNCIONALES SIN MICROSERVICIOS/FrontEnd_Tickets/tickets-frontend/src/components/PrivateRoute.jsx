// ✅ src/components/PrivateRoute.jsx
import { Navigate } from "react-router-dom";
import { isLoggedIn, hasRole } from "../../app/utils/auth";

export default function PrivateRoute({ element, allowRoles = [] }) {
  if (!isLoggedIn()) {
    return <Navigate to="/login" replace />;
  }

  if (allowRoles.length > 0 && !hasRole(allowRoles)) {
    // Usuario logueado pero sin permisos → redirigir a su página principal
    const role = Number(localStorage.getItem("auth") ? JSON.parse(localStorage.getItem("auth")).rolId : 0);
    if (role === 4) return <Navigate to="/visitas" replace />; // supervisor
    if (role === 1) return <Navigate to="/clientes" replace />; // admin
    return <Navigate to="/" replace />;
  }

  return element;
}
