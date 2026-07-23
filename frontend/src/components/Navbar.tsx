import {
  BellRing,
  ChevronDown,
  FileText,
  LogOut,
  Menu,
  UserCircle,
  Users,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../auth/useAuth";
import { usePermissions } from "../auth/usePermissions";
import { GlobalSearch } from "./GlobalSearch";
import { NotificationBell } from "./notificaciones/NotificationBell";

export function Navbar() {
  const navigate = useNavigate();
  const { profile, logout } = useAuth();
  const { canManage, displayName, roleLabel } = usePermissions();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6">
      <div>
        <h1 className="text-lg font-black text-[#17445A]">
          Panel administrativo
        </h1>
        <p className="text-sm text-slate-500">TENGOCLIMA</p>
      </div>

      <div className="flex items-center gap-3">
        <GlobalSearch />

        <NotificationBell />

        <div ref={menuRef} className="relative">
          <button
            type="button"
            onClick={() => setIsOpen((current) => !current)}
            className="flex items-center gap-2 rounded-xl px-2 py-1.5 text-left transition hover:bg-slate-100"
            aria-expanded={isOpen}
            aria-haspopup="menu"
          >
            <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl bg-[#E8F1F5] text-[#255F7A]">
              {profile?.foto_perfil ? (
                <img
                  src={profile.foto_perfil}
                  alt="Fotografía de perfil"
                  className="h-full w-full object-cover"
                />
              ) : (
                <UserCircle size={27} />
              )}
            </div>
            <div className="hidden sm:block">
              <p className="max-w-36 truncate text-sm font-bold text-[#17445A]">
                {displayName}
              </p>
              <p className="text-xs text-slate-500">{roleLabel}</p>
            </div>
            <ChevronDown
              size={16}
              className={`hidden text-slate-400 transition sm:block ${
                isOpen ? "rotate-180" : ""
              }`}
            />
            <Menu size={20} className="text-[#255F7A] sm:hidden" />
          </button>

          {isOpen && (
            <div
              role="menu"
              className="absolute right-0 top-[calc(100%+10px)] z-50 w-72 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
            >
              <div className="border-b border-slate-100 bg-slate-50 px-4 py-4">
                <p className="font-black text-[#17445A]">{displayName}</p>
                <p className="mt-0.5 text-sm text-slate-500">
                  {profile?.email || "Sin correo"}
                </p>
                <span className="mt-2 inline-flex rounded-full bg-[#E8F1F5] px-2.5 py-1 text-xs font-black text-[#255F7A]">
                  {roleLabel}
                </span>
              </div>

              <div className="p-2">
                <Link
                  to="/perfil"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-100"
                >
                  <UserCircle size={19} className="text-[#255F7A]" />
                  Mi perfil
                </Link>

                <Link
                  to="/notificaciones"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-100"
                >
                  <BellRing size={19} className="text-[#255F7A]" />
                  Notificaciones
                </Link>

                {canManage && (
                  <Link
                    to="/usuarios"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-100"
                  >
                    <Users size={19} className="text-[#255F7A]" />
                    Administrar usuarios
                  </Link>
                )}

                <Link
                  to="/terminos-y-condiciones"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-100"
                >
                  <FileText size={19} className="text-[#255F7A]" />
                  Términos y condiciones
                </Link>
              </div>

              <div className="border-t border-slate-100 p-2">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-bold text-red-600 hover:bg-red-50"
                >
                  <LogOut size={19} />
                  Cerrar sesión
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
