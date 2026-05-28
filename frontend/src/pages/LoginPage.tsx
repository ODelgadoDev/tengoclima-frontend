import { useNavigate } from "react-router-dom";

export function LoginPage() {
  const navigate = useNavigate();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    navigate("/dashboard");
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#17445A] via-[#255F7A] to-[#1D526B] flex items-center justify-center p-6">
      <section className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl">
        <div className="flex justify-center">
          <img
            src="/images/logo-tengoclima.png"
            alt="Logo TENGOCLIMA"
            className="h-32 w-auto object-contain"
          />
        </div>

        <h1 className="mt-4 text-center text-3xl font-black text-[#17445A]">
          Sistema Administrativo
        </h1>

        <p className="mt-2 text-center text-slate-500">
          Control de clientes, cotizaciones, proyectos y cobranza.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div>
            <label className="text-sm font-bold text-[#17445A]">Usuario</label>
            <input
              type="text"
              placeholder="admin@tengoclima.com"
              className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-[#F5822A]"
            />
          </div>

          <div>
            <label className="text-sm font-bold text-[#17445A]">
              Contraseña
            </label>
            <input
              type="password"
              placeholder="••••••••"
              className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-[#F5822A]"
            />
          </div>

          <button className="w-full rounded-xl bg-[#F5822A] py-3 font-black text-white hover:bg-[#FF9A3D] transition shadow-md">
            Iniciar sesión
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-slate-400">
          TENGOCLIMA · HVAC & Sistema Solar de Chihuahua
        </p>
      </section>
    </main>
  );
}