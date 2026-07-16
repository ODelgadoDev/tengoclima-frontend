import {
  BookOpen,
  CheckCircle2,
  CircleDollarSign,
  ClipboardList,
  CreditCard,
  FolderKanban,
  LayoutDashboard,
  LogOut,
  Users,
} from "lucide-react";

import { NavLink, useNavigate } from "react-router-dom";

import { useAuth } from "../auth/useAuth";

const menuItems = [
  {
    label: "Dashboard",
    path: "/dashboard",
    icon: LayoutDashboard,
  },
  {
  label: "Clientes",
  path: "/clientes",
  icon: Users,
  },
  {
    label: "Pendientes",
    path: "/pendientes",
    icon: ClipboardList,
  },
  {
    label: "Cotizaciones",
    path: "/cotizaciones",
    icon: FolderKanban,
  },
  {
    label: "Proyectos",
    path: "/proyectos",
    icon: CheckCircle2,
  },
  {
    label: "Pagados",
    path: "/pagados",
    icon: CircleDollarSign,
  },
  {
    label: "X Cobrar",
    path: "/cobros",
    icon: CreditCard,
  },
  {
    label: "Libro",
    path: "/libro",
    icon: BookOpen,
  },
];

export function Sidebar() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();

    navigate("/", {
      replace: true,
    });
  };

  return (
    <aside className="flex min-h-screen w-80 flex-col bg-[#255F7A] text-white">
      <div className="border-b border-white/15 p-5">
        <div className="flex items-center justify-center">
          <img
            src="/images/logo-tengoclima.png"
            alt="Logo TENGOCLIMA"
            className="h-40 w-auto object-contain drop-shadow-md"
          />
        </div>

        <div className="mt-4">
          <p className="text-sm leading-relaxed text-white/85">
            Control de proyectos, cotizaciones y cobranza
          </p>
        </div>
      </div>

      <nav className="flex-1 space-y-2 p-4">
        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                  isActive
                    ? "bg-[#F5822A] text-white shadow-md"
                    : "text-white/80 hover:bg-white/10 hover:text-white"
                }`
              }
            >
              <Icon size={20} />
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      <div className="border-t border-white/15 p-4">
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-white/80 transition hover:bg-white/10 hover:text-white"
        >
          <LogOut size={20} />
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}