import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import { ProtectedRoute } from "../auth/ProtectedRoute";
import { PublicRoute } from "../auth/PublicRoute";
import { DashboardLayout } from "../layouts/DashboardLayout";
import { CobrosPage } from "../pages/CobrosPage";
import { CotizacionesPage } from "../pages/CotizacionesPage";
import { DashboardPage } from "../pages/DashboardPage";
import { LibroPage } from "../pages/LibroPage";
import { LoginPage } from "../pages/LoginPage";
import { PagadosPage } from "../pages/PagadosPage";
import { PendientesPage } from "../pages/PendientesPage";
import { ProjectDetailPage } from "../pages/ProjectDetailPage";
import { ProyectosPage } from "../pages/ProyectosPage";
import { ClientesPage } from "../pages/ClientesPage";

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicRoute />}>
          <Route path="/" element={<LoginPage />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/clientes" element={<ClientesPage />} />
            <Route path="/pendientes" element={<PendientesPage />} />
            <Route
              path="/cotizaciones"
              element={<CotizacionesPage />}
            />
            <Route path="/proyectos" element={<ProyectosPage />} />
            <Route
              path="/proyectos/:id"
              element={<ProjectDetailPage />}
            />
            <Route path="/pagados" element={<PagadosPage />} />
            <Route path="/cobros" element={<CobrosPage />} />
            <Route path="/libro" element={<LibroPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}