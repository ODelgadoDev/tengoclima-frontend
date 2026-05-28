import { Bell, Search, UserCircle } from "lucide-react";

export function Navbar() {
  return (
    <header className="h-16 border-b border-slate-200 bg-white px-6 flex items-center justify-between">
      <div>
        <h1 className="text-lg font-black text-[#17445A]">
          Panel administrativo
        </h1>
        <p className="text-sm text-slate-500">TENGOCLIMA</p>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden md:flex items-center gap-2 rounded-xl bg-[#E8F1F5] px-3 py-2">
          <Search size={18} className="text-[#255F7A]" />
          <input
            className="bg-transparent outline-none text-sm placeholder:text-slate-500"
            placeholder="Buscar cliente, proyecto..."
          />
        </div>

        <button className="rounded-xl p-2 hover:bg-[#FFF0E3]">
          <Bell size={20} className="text-[#255F7A]" />
        </button>

        <div className="flex items-center gap-2">
          <UserCircle size={28} className="text-[#255F7A]" />
          <div className="hidden sm:block">
            <p className="text-sm font-bold text-[#17445A]">Orlando</p>
            <p className="text-xs text-slate-500">Administrador</p>
          </div>
        </div>
      </div>
    </header>
  );
}