import {
  ArchiveRestore,
  BookOpen,
  Pencil,
  Plus,
  RefreshCcw,
  Save,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent } from "react";

import { cotizacionesApi } from "../../api/cotizacionesApi";
import type {
  ConceptoCatalogo,
  UnidadConcepto,
} from "../../types/cotizacion";
import {
  formatUnidadConcepto,
  UNIDADES_CONCEPTO,
} from "../../utils/cotizacionUtils";
import { formatCurrency } from "../../utils/formatCurrency";
import { getApiErrorMessage } from "../../utils/getApiErrorMessage";

interface CatalogoConceptosModalProps {
  onClose: () => void;
}

interface CatalogoFormState {
  descripcion: string;
  unidad: UnidadConcepto;
  precioUnitario: string;
}

const EMPTY_FORM: CatalogoFormState = {
  descripcion: "",
  unidad: "PZA",
  precioUnitario: "",
};

export function CatalogoConceptosModal({
  onClose,
}: CatalogoConceptosModalProps) {
  const [items, setItems] = useState<ConceptoCatalogo[]>([]);
  const [isTrashMode, setIsTrashMode] = useState(false);
  const [search, setSearch] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingItem, setEditingItem] =
    useState<ConceptoCatalogo | null>(null);
  const [form, setForm] = useState<CatalogoFormState>(EMPTY_FORM);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let isActive = true;

    const loadItems = async () => {
      try {
        const response = isTrashMode
          ? await cotizacionesApi.getCatalogoConceptosEliminados(
              1,
              search,
            )
          : await cotizacionesApi.getCatalogoConceptos({
              page: 1,
              page_size: 100,
              search,
              ordering: "descripcion",
            });

        if (isActive) {
          setItems(response.results);
        }
      } catch (error) {
        if (isActive) {
          setErrorMessage(
            getApiErrorMessage(
              error,
              "No fue posible cargar el catálogo.",
            ),
          );
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    const timeoutId = window.setTimeout(() => {
      void loadItems();
    }, search ? 300 : 0);

    return () => {
      isActive = false;
      window.clearTimeout(timeoutId);
    };
  }, [isTrashMode, refreshKey, search]);

  const sortedItems = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase("es-MX");
    const filteredItems = normalizedSearch
      ? items.filter((item) =>
          [
            item.descripcion,
            formatUnidadConcepto(item.unidad),
            item.precio_unitario,
          ].some((value) =>
            value.toLocaleLowerCase("es-MX").includes(normalizedSearch),
          ),
        )
      : items;

    return [...filteredItems].sort((first, second) =>
      first.descripcion.localeCompare(second.descripcion, "es-MX"),
    );
  }, [items, search]);

  const resetForm = () => {
    setEditingItem(null);
    setForm(EMPTY_FORM);
  };

  const startEditing = (item: ConceptoCatalogo) => {
    setEditingItem(item);
    setForm({
      descripcion: item.descripcion,
      unidad: item.unidad,
      precioUnitario: item.precio_unitario,
    });
    setMessage("");
    setErrorMessage("");
  };

  const reload = () => {
    setIsLoading(true);
    setErrorMessage("");
    setRefreshKey((current) => current + 1);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");
    setErrorMessage("");

    const descripcion = form.descripcion.trim();
    const price = Number(form.precioUnitario.replace(",", "."));

    if (!descripcion) {
      setErrorMessage("La descripción es obligatoria.");
      return;
    }

    if (!Number.isFinite(price) || price < 0) {
      setErrorMessage("El precio unitario debe ser un número válido.");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        descripcion,
        unidad: form.unidad,
        precio_unitario: price.toFixed(2),
      };

      if (editingItem) {
        await cotizacionesApi.updateCatalogoConcepto(
          editingItem.id,
          payload,
        );
        setMessage("Concepto del catálogo actualizado correctamente.");
      } else {
        await cotizacionesApi.createCatalogoConcepto(payload);
        setMessage("Concepto agregado al catálogo correctamente.");
      }

      resetForm();
      reload();
    } catch (error) {
      setErrorMessage(
        getApiErrorMessage(
          error,
          "No fue posible guardar el concepto del catálogo.",
        ),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (item: ConceptoCatalogo) => {
    const confirmed = window.confirm(
      `¿Enviar “${item.descripcion}” a la papelera del catálogo?`,
    );

    if (!confirmed) {
      return;
    }

    setErrorMessage("");

    try {
      await cotizacionesApi.deleteCatalogoConcepto(item.id);
      setMessage("Concepto enviado a la papelera.");
      reload();
    } catch (error) {
      setErrorMessage(
        getApiErrorMessage(
          error,
          "No fue posible eliminar el concepto del catálogo.",
        ),
      );
    }
  };

  const handleRestore = async (item: ConceptoCatalogo) => {
    setErrorMessage("");

    try {
      const response = await cotizacionesApi.restoreCatalogoConcepto(
        item.id,
      );
      setMessage(response.message);
      reload();
    } catch (error) {
      setErrorMessage(
        getApiErrorMessage(
          error,
          "No fue posible restaurar el concepto.",
        ),
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
      <div className="max-h-[94vh] w-full max-w-6xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
        <div className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-5">
          <div>
            <h2 className="flex items-center gap-2 text-xl font-black text-[#17445A]">
              <BookOpen size={22} />
              Catálogo de conceptos
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Guarda descripción, unidad y precio para reutilizarlos.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar catálogo"
            className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100"
          >
            <X size={22} />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6 p-6 xl:grid-cols-[380px_1fr]">
          {!isTrashMode && (
            <form
              onSubmit={handleSubmit}
              className="h-fit rounded-2xl border border-slate-200 bg-slate-50 p-5"
            >
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-black text-[#17445A]">
                  {editingItem ? "Editar concepto" : "Nuevo concepto"}
                </h3>
                {editingItem && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="text-xs font-bold text-slate-500 hover:text-red-600"
                  >
                    Cancelar edición
                  </button>
                )}
              </div>

              <label className="mt-4 block">
                <span className="text-sm font-bold text-[#17445A]">
                  Descripción *
                </span>
                <textarea
                  value={form.descripcion}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      descripcion: event.target.value,
                    }))
                  }
                  rows={3}
                  disabled={isSubmitting}
                  required
                  className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-[#F5822A] disabled:bg-slate-100"
                />
              </label>

              <label className="mt-4 block">
                <span className="text-sm font-bold text-[#17445A]">
                  Unidad
                </span>
                <select
                  value={form.unidad}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      unidad: event.target.value as UnidadConcepto,
                    }))
                  }
                  disabled={isSubmitting}
                  className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-[#F5822A] disabled:bg-slate-100"
                >
                  {UNIDADES_CONCEPTO.map((unit) => (
                    <option key={unit.value} value={unit.value}>
                      {unit.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="mt-4 block">
                <span className="text-sm font-bold text-[#17445A]">
                  Precio unitario sugerido *
                </span>
                <input
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.01"
                  value={form.precioUnitario}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      precioUnitario: event.target.value,
                    }))
                  }
                  placeholder="0.00"
                  disabled={isSubmitting}
                  required
                  className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-right outline-none focus:ring-2 focus:ring-[#F5822A] disabled:bg-slate-100"
                />
              </label>

              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#F5822A] px-5 py-3 font-bold text-white transition hover:bg-[#FF9A3D] disabled:opacity-60"
              >
                <Save size={18} />
                {isSubmitting
                  ? "Guardando..."
                  : editingItem
                    ? "Guardar cambios"
                    : "Agregar al catálogo"}
              </button>
            </form>
          )}

          <section className={isTrashMode ? "xl:col-span-2" : ""}>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsLoading(true);
                    setErrorMessage("");
                    setIsTrashMode(false);
                    setMessage("");
                    resetForm();
                  }}
                  className={`rounded-xl px-4 py-2 text-sm font-bold transition ${
                    !isTrashMode
                      ? "bg-[#17445A] text-white"
                      : "border border-slate-300 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  Activos
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsLoading(true);
                    setErrorMessage("");
                    setIsTrashMode(true);
                    setMessage("");
                    resetForm();
                  }}
                  className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition ${
                    isTrashMode
                      ? "bg-[#17445A] text-white"
                      : "border border-slate-300 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <ArchiveRestore size={16} />
                  Papelera
                </button>
              </div>

              <button
                type="button"
                onClick={reload}
                disabled={isLoading}
                className="flex items-center justify-center gap-2 rounded-xl border border-[#255F7A] px-4 py-2 text-sm font-bold text-[#255F7A] hover:bg-[#E8F1F5] disabled:opacity-50"
              >
                <RefreshCcw
                  size={16}
                  className={isLoading ? "animate-spin" : ""}
                />
                Actualizar
              </button>
            </div>

            <div className="relative mt-4">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="search"
                value={search}
                onChange={(event) => {
                  setIsLoading(true);
                  setErrorMessage("");
                  setSearch(event.target.value);
                }}
                placeholder="Buscar concepto..."
                className="w-full rounded-xl border border-slate-300 py-3 pl-11 pr-4 outline-none focus:ring-2 focus:ring-[#F5822A]"
              />
            </div>

            {message && (
              <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
                {message}
              </div>
            )}
            {errorMessage && (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                {errorMessage}
              </div>
            )}

            <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200">
              {isLoading ? (
                <div className="flex min-h-48 items-center justify-center text-slate-500">
                  Cargando catálogo...
                </div>
              ) : sortedItems.length === 0 ? (
                <div className="flex min-h-48 flex-col items-center justify-center p-6 text-center text-slate-500">
                  <Plus size={28} />
                  <p className="mt-2 font-bold">
                    {isTrashMode
                      ? "La papelera está vacía"
                      : "No hay conceptos que coincidan"}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-[#E8F1F5] text-[#17445A]">
                      <tr>
                        <th className="p-4 text-left">Descripción</th>
                        <th className="p-4 text-left">Unidad</th>
                        <th className="p-4 text-right">Precio</th>
                        <th className="p-4 text-right">Usos</th>
                        <th className="p-4 text-center">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedItems.map((item) => (
                        <tr
                          key={item.id}
                          className="border-t border-slate-100"
                        >
                          <td className="p-4 font-bold text-[#17445A]">
                            {item.descripcion}
                          </td>
                          <td className="p-4 text-slate-600">
                            {formatUnidadConcepto(item.unidad)}
                          </td>
                          <td className="p-4 text-right font-bold text-slate-700">
                            {formatCurrency(Number(item.precio_unitario))}
                          </td>
                          <td className="p-4 text-right text-slate-600">
                            {item.usos}
                          </td>
                          <td className="p-4">
                            <div className="flex justify-center gap-2">
                              {isTrashMode ? (
                                <button
                                  type="button"
                                  onClick={() => handleRestore(item)}
                                  className="flex items-center gap-2 rounded-xl border border-emerald-200 px-3 py-2 text-xs font-bold text-emerald-700 hover:bg-emerald-50"
                                >
                                  <ArchiveRestore size={16} />
                                  Restaurar
                                </button>
                              ) : (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => startEditing(item)}
                                    className="rounded-xl p-2 text-amber-600 hover:bg-amber-50"
                                    aria-label="Editar concepto"
                                  >
                                    <Pencil size={18} />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDelete(item)}
                                    className="rounded-xl p-2 text-red-600 hover:bg-red-50"
                                    aria-label="Eliminar concepto"
                                  >
                                    <Trash2 size={18} />
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
