import { Outlet } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import { ReadOnlyNotice } from "../components/ReadOnlyNotice";
import { Sidebar } from "../components/Sidebar";

export function DashboardLayout() {
  return (
    <div className="min-h-screen bg-slate-100 flex">
      <Sidebar />

      <main className="flex-1 min-w-0">
        <Navbar />

        <section className="p-6">
          <ReadOnlyNotice />
          <Outlet />
        </section>
      </main>
    </div>
  );
}