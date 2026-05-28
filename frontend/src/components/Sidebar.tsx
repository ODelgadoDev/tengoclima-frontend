import {
  BookOpen,
  CheckCircle2,
  ClipboardList,
  CreditCard,
  FolderKanban,
  LayoutDashboard,
  LogOut,
} from "lucide-react";
import { NavLink } from "react-router-dom";

const menuItems = [
  {
    label: "Dashboard",
    path: "/dashboard",
    icon: LayoutDashboard,
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
  return (
  <aside className="w-80 min-h-screen bg-[#255F7A] text-white flex flex-col">
<div className="p-5 border-b border-white/15">
  <div className="flex items-center justify-center">
    <img
      src="/images/logo-tengoclima.png"
      alt="Logo TENGOCLIMA"
      className="h-50 w-auto object-contain drop-shadow-md"
    />
  </div>

  <div className="mt-4">
    <p className="text-sm leading-relaxed text-white/85">
      Control de proyectos, cotizaciones y cobranza
    </p>
  </div>
</div>

      <nav className="flex-1 p-4 space-y-2">
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

      <div className="p-4 border-t border-white/15">
        <button className="w-full flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-white/80 hover:bg-white/10 hover:text-white">
          <LogOut size={20} />
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}