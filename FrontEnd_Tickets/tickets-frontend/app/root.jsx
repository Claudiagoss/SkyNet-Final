// app/root.jsx
import { createBrowserRouter, Outlet, Navigate } from "react-router-dom";
import Navbar from "../src/components/Navbar";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./config/queryClient"; // si no tienes este, puedes quitar QueryClientProvider
import Login from "./routes/Login";

// Páginas que ya tienes:
import SupervisorDashboard from "../src/pages/SupervisorDashboard.jsx";
import Tickets from "../app/routes/tickets.jsx"; // si tu tickets.jsx está en app/routes
// Si está en otra ruta, ajusta el import.

import PrivateRoute from "../src/components/PrivateRoute.jsx";

function Layout() {
  return (
    <QueryClientProvider client={queryClient}>
      <Navbar />
      <Outlet />
    </QueryClientProvider>
  );
}

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <Navigate to="/login" replace /> },
      { path: "login", element: <Login /> },

      // Supervisores/Admin => Dashboard
      {
        element: <PrivateRoute roles={["admin", "supervisor"]} />,
        children: [{ path: "dashboard", element: <SupervisorDashboard /> }],
      },

      // Técnicos (y cualquiera logueado) => Tickets
      {
        element: <PrivateRoute roles={["admin", "supervisor", "tecnico"]} />,
        children: [{ path: "tickets", element: <Tickets /> }],
      },

      // 404 simple
      { path: "*", element: <div className="p-4">404 — Página no encontrada</div> },
    ],
  },
]);
