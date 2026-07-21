import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Edit3, FolderCog, Plus, Power, X } from "lucide-react";
import { contabilidadApi } from "../../api/contabilidadApi";
import type { CategoriaGasto } from "../../types/contabilidad";
import { getApiErrorMessage } from "../../utils/getApiErrorMessage";

type Props = {
  onClose: () => void;
  onChanged: () => void;
};

export function CategoriasGastoModal({ onClose, onChanged }: Props) {
  const [categorias, setCategorias] = useState<CategoriaGasto[]>([]);
  const [editing, setEditing] = useState<CategoriaGasto | null>(null);
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let isActive = true;

    const load = async () => {
      try {
        const response = await contabilidadApi.getCategorias({
          page_size: 100,
          ordering: "nombre",
        });
        if (!isActive) return;
        setCategorias(response.results);
        setErrorMessage("");
      } catch (error) {
        if (!isActive) return;
        setErrorMessage(
          getApiErrorMessage(error, "No fue posible cargar las categorías."),
        );
      } finally {
        if (isActive) setIsLoading(false);
      }
    };

    void load();
    return () => {
      isActive = false;
    };
  }, [refreshKey]);

  const filteredCategorias = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return categorias;
    return categorias.filter((categoria) =>
      [categoria.nombre, categoria.descripcion ?? ""].some((value) =>
        value.toLowerCase().includes(term),
      ),
    );
  }, [categorias, search]);

  const resetForm = () => {
    setEditing(null);
    setNombre("");
    setDescripcion("");
  };

  const handleEdit = (categoria: CategoriaGasto) => {
    setEditing(categoria);
    setNombre(categoria.nombre);
    setDescripcion(categoria.descripcion ?? "");
    setErrorMessage("");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");

    if (!nombre.trim()) {
      setErrorMessage("El nombre de la categoría es obligatorio.");
      return;
    }

    try {
      setIsSubmitting(true);
      if (editing) {
        await contabilidadApi.updateCategoria(editing.id, {
          nombre: nombre.trim(),
          descripcion: descripcion.trim() || null,
        });
      } else {
        await contabilidadApi.createCategoria({
          nombre: nombre.trim(),
          descripcion: descripcion.trim() || null,
          activo: true,
        });
      }
      resetForm();
      setIsLoading(true);
      setRefreshKey((current) => current + 1);
      onChanged();
    } catch (error) {
      setErrorMessage(
        getApiErrorMessage(error, "No fue posible guardar la categoría."),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggle = async (categoria: CategoriaGasto) => {
    try {
      setTogglingId(categoria.id);
      setErrorMessage("");
      await contabilidadApi.updateCategoria(categoria.id, {
        activo: !categoria.activo,
      });
      setIsLoading(true);
      setRefreshKey((current) => current + 1);
      onChanged();
    } catch (error) {
      setErrorMessage(
        getApiErrorMessage(
          error,
          "No fue posible cambiar el estado de la categoría.",
        ),
      );
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4">
      <div className="max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-slate-200 p-6">
          <div>
            <h3 className="flex items-center gap-2 text-xl font-black text-[#17445A]">
              <FolderCog size={22} /> Categorías de gasto
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Crea, edita, activa o desactiva categorías contables.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-slate-500 hover:bg-slate-100"
            aria-label="Cerrar"
          >
            <X size={20} />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6 p-6 lg:grid-cols-[360px_1fr]">
          <form
            onSubmit={handleSubmit}
            className="h-fit space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-5"
          >
            <div>
              <h4 className="font-black text-[#17445A]">
                {editing ? "Editar categoría" : "Nueva categoría"}
              </h4>
              <p className="mt-1 text-sm text-slate-500">
                Las categorías inactivas se conservan en gastos anteriores.
              </p>
            </div>

            {errorMessage && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                {errorMessage}
              </div>
            )}

            <div>
              <label className="mb-2 block text-sm font-bold text-[#17445A]">
                Nombre
              </label>
              <input
                value={nombre}
                onChange={(event) => setNombre(event.target.value)}
                maxLength={100}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#F5822A]"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-[#17445A]">
                Descripción
              </label>
              <textarea
                rows={3}
                value={descripcion}
                onChange={(event) => setDescripcion(event.target.value)}
                className="w-full resize-none rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#F5822A]"
              />
            </div>

            <div className="flex flex-wrap justify-end gap-2">
              {editing && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-xl border border-slate-300 px-4 py-2 font-bold text-slate-600"
                >
                  Cancelar edición
                </button>
              )}
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 rounded-xl bg-[#F5822A] px-4 py-2 font-bold text-white hover:bg-[#FF9A3D] disabled:opacity-50"
              >
                <Plus size={17} />
                {isSubmitting ? "Guardando..." : "Guardar"}
              </button>
            </div>
          </form>

          <div>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar categoría..."
              className="mb-4 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#F5822A]"
            />

            {isLoading ? (
              <div className="py-12 text-center font-semibold text-slate-500">
                Cargando categorías...
              </div>
            ) : filteredCategorias.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 py-12 text-center font-bold text-slate-500">
                No hay categorías registradas.
              </div>
            ) : (
              <div className="space-y-3">
                {filteredCategorias.map((categoria) => (
                  <article
                    key={categoria.id}
                    className="flex flex-col gap-3 rounded-2xl border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h5 className="font-black text-[#17445A]">
                          {categoria.nombre}
                        </h5>
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-black ${
                            categoria.activo
                              ? "bg-green-100 text-green-700"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {categoria.activo ? "Activa" : "Inactiva"}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-slate-500">
                        {categoria.descripcion || "Sin descripción"}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleEdit(categoria)}
                        className="rounded-xl bg-[#E8F1F5] p-2 text-[#255F7A] hover:bg-blue-100"
                        aria-label="Editar categoría"
                      >
                        <Edit3 size={17} />
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleToggle(categoria)}
                        disabled={togglingId === categoria.id}
                        className={`rounded-xl p-2 text-white disabled:opacity-50 ${
                          categoria.activo
                            ? "bg-slate-500 hover:bg-slate-600"
                            : "bg-green-600 hover:bg-green-700"
                        }`}
                        aria-label={
                          categoria.activo
                            ? "Desactivar categoría"
                            : "Activar categoría"
                        }
                      >
                        <Power size={17} />
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
