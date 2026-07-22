import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "../auth/useAuth";
import { getApiErrorMessage } from "../utils/getApiErrorMessage";

interface LoginLocationState {
  from?: string;
}

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalizedUsername = username.trim();
    if (!normalizedUsername || !password) {
      setErrorMessage("Ingresa tu usuario y contraseña.");
      return;
    }
    setIsLoading(true);
    setErrorMessage("");
    try {
      const currentProfile = await login({
        username: normalizedUsername,
        password,
      });
      const locationState = location.state as LoginLocationState | null;
      navigate(
        currentProfile.requiere_cambio_contrasena
          ? "/cambiar-contrasena-inicial"
          : locationState?.from ?? "/dashboard",
        { replace: true },
      );
    } catch (error) {
      setErrorMessage(
        getApiErrorMessage(
          error,
          "No fue posible iniciar sesión. Verifica tus credenciales.",
        ),
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#17445A] via-[#255F7A] to-[#1D526B] p-6">
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
            <label htmlFor="username" className="text-sm font-bold text-[#17445A]">
              Usuario
            </label>
            <input
              id="username"
              name="username"
              type="text"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="Ingresa tu usuario"
              autoComplete="username"
              required
              disabled={isLoading}
              className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-[#F5822A] disabled:cursor-not-allowed disabled:bg-slate-100"
            />
          </div>
          <div>
            <label htmlFor="password" className="text-sm font-bold text-[#17445A]">
              Contraseña
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              required
              disabled={isLoading}
              className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-[#F5822A] disabled:cursor-not-allowed disabled:bg-slate-100"
            />
          </div>
          {errorMessage && (
            <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              {errorMessage}
            </div>
          )}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-xl bg-[#F5822A] py-3 font-black text-white shadow-md transition hover:bg-[#FF9A3D] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? "Iniciando sesión..." : "Iniciar sesión"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-slate-500">
          Al utilizar el sistema aceptas los{" "}
          <Link
            to="/terminos-y-condiciones"
            className="font-black text-[#255F7A] hover:underline"
          >
            Términos y condiciones
          </Link>
          .
        </p>

        <p className="mt-5 text-center text-xs text-slate-400">
          TENGOCLIMA · HVAC & Sistema Solar de Chihuahua
        </p>
      </section>
    </main>
  );
}
