import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { DashboardLayout } from "../layouts/DashboardLayout";
import { CobrosPage } from "../pages/CobrosPage";
import { CotizacionesPage } from "../pages/CotizacionesPage";
import { DashboardPage } from "../pages/DashboardPage";
import { LibroPage } from "../pages/LibroPage";
import { LoginPage } from "../pages/LoginPage";
import { PendientesPage } from "../pages/PendientesPage";
import { ProyectosPage } from "../pages/ProyectosPage";

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />

        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/pendientes" element={<PendientesPage />} />
          <Route path="/cotizaciones" element={<CotizacionesPage />} />
          <Route path="/proyectos" element={<ProyectosPage />} />
          <Route path="/cobros" element={<CobrosPage />} />
          <Route path="/libro" element={<LibroPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}