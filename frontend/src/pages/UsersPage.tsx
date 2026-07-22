import {
  Ban,
  CheckCircle2,
  History,
  KeyRound,
  LoaderCircle,
  Pencil,
  Plus,
  RefreshCcw,
  Search,
  ShieldCheck,
  UserCheck,
  Users,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";

import { usuariosAdministracionApi } from "../api/usuariosAdministracionApi";
import { useAuth } from "../auth/useAuth";
import { usePermissions } from "../auth/usePermissions";
import { ROLE_LABELS } from "../auth/permissions";
import { ResetPasswordModal } from "../components/usuarios/ResetPasswordModal";
import { UserActivityModal } from "../components/usuarios/UserActivityModal";
import { UserFormModal } from "../components/usuarios/UserFormModal";
import type { UserRole } from "../types/auth";
import type { ManagedUser } from "../types/userManagement";
import { getApiErrorMessage } from "../utils/getApiErrorMessage";

const PAGE_SIZE = 10;

function formatDate(value: string | null): string {
  if (!value) return "Nunca";
  return new Intl.DateTimeFormat("es-MX", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function UsersPage() {
  const { profile } = useAuth();
  const { isOwner } = usePermissions();
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [role, setRole] = useState<UserRole | "">("");
  const [statusFilter, setStatusFilter] = useState<"" | "active" | "inactive">("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [formUser, setFormUser] = useState<ManagedUser | null | undefined>(undefined);
  const [resetUser, setResetUser] = useState<ManagedUser | null>(null);
  const [activityUser, setActivityUser] = useState<ManagedUser | null>(null);
  const [busyUserId, setBusyUserId] = useState<number | null>(null);

  useEffect(() => {
    let isCancelled = false;

    async function fetchUsers() {
      try {
        const response = await usuariosAdministracionApi.getUsers({
          page,
          page_size: PAGE_SIZE,
          search: search || undefined,
          perfilusuario__rol: role || undefined,
          is_active:
            statusFilter === "active"
              ? true
              : statusFilter === "inactive"
                ? false
                : undefined,
          ordering: "first_name,last_name,username",
        });

        if (isCancelled) return;

        setUsers(response.results);
        setCount(response.count);
        setErrorMessage("");
      } catch (error) {
        if (isCancelled) return;

        setErrorMessage(
          getApiErrorMessage(error, "No fue posible cargar los usuarios."),
        );
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }

    void fetchUsers();

    return () => {
      isCancelled = true;
    };
  }, [page, refreshKey, role, search, statusFilter]);

  const totalPages = useMemo(
    () => Math.max(Math.ceil(count / PAGE_SIZE), 1),
    [count],
  );

  const reload = () => {
    setIsLoading(true);
    setSuccessMessage("");
    setRefreshKey((current) => current + 1);
  };

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPage(1);
    setIsLoading(true);
    setSearch(searchInput.trim());
  };

  const canEditUser = (user: ManagedUser): boolean => {
    if (isOwner) return true;
    return user.rol !== "DUENO";
  };

  const canDeactivateUser = (user: ManagedUser): boolean => {
    return canEditUser(user) && user.id !== profile?.usuario_id;
  };

  const handleToggleStatus = async (user: ManagedUser) => {
    const action = user.activo ? "desactivar" : "activar";
    if (
      !window.confirm(
        `¿Confirmas que deseas ${action} a ${user.nombre_completo}?`,
      )
    ) {
      return;
    }

    setBusyUserId(user.id);
    setErrorMessage("");
    setSuccessMessage("");
    try {
      if (user.activo) {
        await usuariosAdministracionApi.deactivateUser(user.id);
      } else {
        await usuariosAdministracionApi.activateUser(user.id);
      }
      setSuccessMessage(
        `Usuario ${user.activo ? "desactivado" : "activado"} correctamente.`,
      );
      reload();
    } catch (error) {
      setErrorMessage(
        getApiErrorMessage(
          error,
          `No fue posible ${action} el usuario.`,
        ),
      );
    } finally {
      setBusyUserId(null);
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-black text-[#17445A]">
            Administración de usuarios
          </h1>
          <p className="mt-1 text-slate-500">
            Crea cuentas, asigna roles y controla el acceso al sistema.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={reload}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 font-black text-slate-700 hover:bg-slate-50"
          >
            <RefreshCcw size={18} />
            Actualizar
          </button>
          <button
            type="button"
            onClick={() => setFormUser(null)}
            className="inline-flex items-center gap-2 rounded-xl bg-[#F5822A] px-5 py-3 font-black text-white shadow-md hover:bg-[#FF9A3D]"
          >
            <Plus size={19} />
            Crear usuario
          </button>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-[#E8F1F5] p-3 text-[#255F7A]">
              <Users size={23} />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-500">Usuarios</p>
              <p className="text-2xl font-black text-[#17445A]">{count}</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-emerald-100 p-3 text-emerald-700">
              <UserCheck size={23} />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-500">Visibles en esta página</p>
              <p className="text-2xl font-black text-[#17445A]">
                {users.filter((user) => user.activo).length} activos
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-[#FFF0E3] p-3 text-[#F5822A]">
              <ShieldCheck size={23} />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-500">Tu nivel</p>
              <p className="text-lg font-black text-[#17445A]">
                {profile ? ROLE_LABELS[profile.rol] : "—"}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <form
          onSubmit={handleSearch}
          className="grid gap-3 lg:grid-cols-[1fr_220px_180px_auto]"
        >
          <div className="flex items-center gap-2 rounded-xl border border-slate-300 px-3">
            <Search size={18} className="text-slate-400" />
            <input
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Nombre, usuario, correo o teléfono"
              className="w-full py-3 outline-none"
            />
          </div>
          <select
            value={role}
            onChange={(event) => {
              setRole(event.target.value as UserRole | "");
              setPage(1);
              setIsLoading(true);
            }}
            className="rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none"
          >
            <option value="">Todos los roles</option>
            <option value="DUENO">Dueño</option>
            <option value="ADMINISTRADOR">Administrador</option>
            <option value="AYUDANTE">Ayudante</option>
          </select>
          <select
            value={statusFilter}
            onChange={(event) => {
              setStatusFilter(
                event.target.value as "" | "active" | "inactive",
              );
              setPage(1);
              setIsLoading(true);
            }}
            className="rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none"
          >
            <option value="">Todos</option>
            <option value="active">Activos</option>
            <option value="inactive">Inactivos</option>
          </select>
          <button
            type="submit"
            className="rounded-xl bg-[#255F7A] px-5 py-3 font-black text-white hover:bg-[#17445A]"
          >
            Buscar
          </button>
        </form>
      </section>

      {successMessage && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 font-semibold text-emerald-700">
          <CheckCircle2 size={19} />
          {successMessage}
        </div>
      )}
      {errorMessage && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 font-semibold text-red-700">
          {errorMessage}
        </div>
      )}

      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        {isLoading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-slate-500">
            <LoaderCircle className="animate-spin" size={22} />
            Cargando usuarios...
          </div>
        ) : users.length === 0 ? (
          <div className="py-16 text-center text-slate-500">
            No se encontraron usuarios con esos filtros.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1040px] text-left">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-5 py-4">Usuario</th>
                  <th className="px-5 py-4">Contacto</th>
                  <th className="px-5 py-4">Rol</th>
                  <th className="px-5 py-4">Estado</th>
                  <th className="px-5 py-4">Último acceso</th>
                  <th className="px-5 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-slate-100 last:border-0"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl bg-[#E8F1F5] font-black text-[#255F7A]">
                          {user.foto_perfil ? (
                            <img
                              src={user.foto_perfil}
                              alt=""
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            user.nombre_completo.charAt(0).toUpperCase()
                          )}
                        </div>
                        <div>
                          <p className="font-black text-[#17445A]">
                            {user.nombre_completo}
                          </p>
                          <p className="text-sm text-slate-400">
                            @{user.username}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-600">
                      <p>{user.email}</p>
                      <p className="mt-1 text-slate-400">
                        {user.telefono || "Sin teléfono"}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-black text-blue-700">
                        {ROLE_LABELS[user.rol]}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-col items-start gap-1">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-black ${
                            user.activo
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {user.activo ? "Activo" : "Inactivo"}
                        </span>
                        {user.requiere_cambio_contrasena && (
                          <span className="text-xs font-semibold text-orange-600">
                            Contraseña temporal
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-500">
                      {formatDate(user.last_login)}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => setActivityUser(user)}
                          title="Ver actividad"
                          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                        >
                          <History size={18} />
                        </button>
                        {canEditUser(user) && (
                          <>
                            <button
                              type="button"
                              onClick={() => setFormUser(user)}
                              title="Editar usuario"
                              className="rounded-lg p-2 text-[#255F7A] hover:bg-[#E8F1F5]"
                            >
                              <Pencil size={18} />
                            </button>
                            <button
                              type="button"
                              onClick={() => setResetUser(user)}
                              title="Restablecer contraseña"
                              className="rounded-lg p-2 text-orange-600 hover:bg-orange-50"
                            >
                              <KeyRound size={18} />
                            </button>
                          </>
                        )}
                        {canDeactivateUser(user) && (
                          <button
                            type="button"
                            onClick={() => void handleToggleStatus(user)}
                            disabled={busyUserId === user.id}
                            title={
                              user.activo
                                ? "Desactivar usuario"
                                : "Activar usuario"
                            }
                            className={`rounded-lg p-2 disabled:opacity-50 ${
                              user.activo
                                ? "text-red-600 hover:bg-red-50"
                                : "text-emerald-600 hover:bg-emerald-50"
                            }`}
                          >
                            {busyUserId === user.id ? (
                              <LoaderCircle
                                className="animate-spin"
                                size={18}
                              />
                            ) : user.activo ? (
                              <Ban size={18} />
                            ) : (
                              <UserCheck size={18} />
                            )}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <footer className="flex items-center justify-between border-t border-slate-200 px-5 py-4 text-sm text-slate-500">
          <span>
            Página {page} de {totalPages} · {count} usuarios
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                setPage((current) => Math.max(current - 1, 1));
                setIsLoading(true);
              }}
              disabled={page <= 1}
              className="rounded-lg border border-slate-300 px-3 py-2 font-bold disabled:opacity-40"
            >
              Anterior
            </button>
            <button
              type="button"
              onClick={() => {
                setPage((current) => Math.min(current + 1, totalPages));
                setIsLoading(true);
              }}
              disabled={page >= totalPages}
              className="rounded-lg border border-slate-300 px-3 py-2 font-bold disabled:opacity-40"
            >
              Siguiente
            </button>
          </div>
        </footer>
      </section>

      {formUser !== undefined && (
        <UserFormModal
          key={formUser?.id ?? "new-user"}
          user={formUser}
          onClose={() => setFormUser(undefined)}
          onSaved={(savedUser) => {
            setFormUser(undefined);
            setSuccessMessage(
              `Usuario ${savedUser.nombre_completo} guardado correctamente.`,
            );
            reload();
          }}
        />
      )}

      {resetUser && (
        <ResetPasswordModal
          user={resetUser}
          onClose={() => setResetUser(null)}
          onCompleted={(message) => {
            setResetUser(null);
            setSuccessMessage(message);
            reload();
          }}
        />
      )}

      {activityUser && (
        <UserActivityModal
          user={activityUser}
          onClose={() => setActivityUser(null)}
        />
      )}
    </div>
  );
}
