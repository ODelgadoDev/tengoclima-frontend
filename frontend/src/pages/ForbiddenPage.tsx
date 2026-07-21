import { ArrowLeft, Eye, LayoutDashboard } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";

interface ForbiddenLocationState {
  from?: string;
}

export function ForbiddenPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as ForbiddenLocationState | null;

  return (
    <section className="mx-auto max-w-3xl rounded-3xl border border-amber-200 bg-white p-8 text-center shadow-sm">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
        <Eye size={32} />
      </div>

      <h2 className="mt-5 text-2xl font-black text-[#17445A]">
        Acceso de solo consulta
      </h2>

      <p className="mx-auto mt-3 max-w-xl text-slate-600">
        Tu rol puede consultar la información del sistema, pero no crear,
        editar, eliminar ni restaurar registros.
      </p>

      {state?.from && (
        <p className="mt-3 text-sm text-slate-400">
          Ruta solicitada: {state.from}
        </p>
      )}

      <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 px-5 py-3 font-bold text-slate-600 transition hover:bg-slate-50"
        >
          <ArrowLeft size={18} />
          Regresar
        </button>

        <Link
          to="/dashboard"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#255F7A] px-5 py-3 font-bold text-white transition hover:bg-[#17445A]"
        >
          <LayoutDashboard size={18} />
          Ir al Dashboard
        </Link>
      </div>
    </section>
  );
}
