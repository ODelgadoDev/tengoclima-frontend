import { ArrowLeft, FileText, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/useAuth";

export function TermsPage() {
  const { isAuthenticated } = useAuth();
  return (
    <main className="min-h-screen bg-slate-100 px-4 py-10">
      <article className="mx-auto max-w-4xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-10">
        <Link
          to={isAuthenticated ? "/dashboard" : "/"}
          className="inline-flex items-center gap-2 text-sm font-black text-[#255F7A] hover:underline"
        >
          <ArrowLeft size={17} />
          {isAuthenticated ? "Volver al sistema" : "Volver al inicio"}
        </Link>

        <div className="mt-7 flex items-start gap-4">
          <div className="rounded-2xl bg-[#E8F1F5] p-3 text-[#255F7A]">
            <FileText size={30} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-[#17445A]">
              Términos y condiciones
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Sistema administrativo interno de TENGOCLIMA
            </p>
          </div>
        </div>

        <div className="mt-8 space-y-7 text-slate-700">
          <section>
            <h2 className="text-xl font-black text-[#17445A]">1. Uso autorizado</h2>
            <p className="mt-2 leading-relaxed">
              El acceso está reservado a personal autorizado por TENGOCLIMA.
              Cada cuenta es personal y no debe compartirse con terceros.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-black text-[#17445A]">2. Credenciales</h2>
            <p className="mt-2 leading-relaxed">
              El usuario es responsable de mantener la confidencialidad de su
              contraseña y de informar cualquier acceso sospechoso. La empresa
              puede desactivar cuentas cuando termine la relación laboral o
              cambien las responsabilidades del empleado.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-black text-[#17445A]">3. Información registrada</h2>
            <p className="mt-2 leading-relaxed">
              Los datos de clientes, cotizaciones, proyectos, pagos, gastos y
              archivos deben capturarse de forma correcta. Las acciones pueden
              quedar asociadas al usuario que las realizó para fines de control
              y seguimiento interno.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-black text-[#17445A]">4. Archivos y contenido</h2>
            <p className="mt-2 leading-relaxed">
              Solo deben cargarse documentos e imágenes relacionados con las
              operaciones de TENGOCLIMA. No se permite subir contenido ilegal,
              malicioso o ajeno al trabajo autorizado.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-black text-[#17445A]">5. Disponibilidad y cambios</h2>
            <p className="mt-2 leading-relaxed">
              El sistema puede recibir mantenimiento, mejoras o interrupciones
              temporales. TENGOCLIMA puede actualizar estas condiciones y las
              funciones disponibles cuando sea necesario.
            </p>
          </section>
          <section className="rounded-2xl border border-blue-200 bg-blue-50 p-5">
            <div className="flex items-center gap-2 font-black text-blue-800">
              <ShieldCheck size={20} />
              Protección de la información
            </div>
            <p className="mt-2 text-sm leading-relaxed text-blue-700">
              La información del sistema es de uso interno. Los usuarios deben
              evitar copiar, compartir o divulgar datos empresariales sin
              autorización.
            </p>
          </section>
        </div>

        <p className="mt-8 border-t border-slate-200 pt-5 text-xs text-slate-400">
          Última actualización: julio de 2026. Este texto puede ser revisado por
          la empresa antes del despliegue definitivo.
        </p>
      </article>
    </main>
  );
}
