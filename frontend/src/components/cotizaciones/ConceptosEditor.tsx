import {
  BookOpen,
  Link2Off,
  LoaderCircle,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { cotizacionesApi } from "../../api/cotizacionesApi";
import type {
  ConceptoCatalogo,
  ConceptoFormValue,
  UnidadConcepto,
} from "../../types/cotizacion";
import {
  createEmptyConcepto,
  formatUnidadConcepto,
  parseMoney,
  UNIDADES_CONCEPTO,
} from "../../utils/cotizacionUtils";
import { formatCurrency } from "../../utils/formatCurrency";
import { getApiErrorMessage } from "../../utils/getApiErrorMessage";

interface ConceptosEditorProps {
  conceptos: ConceptoFormValue[];
  onChange: (conceptos: ConceptoFormValue[]) => void;
  disabled?: boolean;
}

function normalizeSearch(value: string): string {
  return value.trim().toLocaleLowerCase("es-MX");
}

export function ConceptosEditor({
  conceptos,
  onChange,
  disabled = false,
}: ConceptosEditorProps) {
  const [catalogo, setCatalogo] = useState<ConceptoCatalogo[]>([]);
  const [isLoadingCatalogo, setIsLoadingCatalogo] = useState(true);
  const [catalogoError, setCatalogoError] = useState("");
  const [activeSearchId, setActiveSearchId] = useState<string | null>(null);
  const [searchValues, setSearchValues] = useState<Record<string, string>>(
    {},
  );

  useEffect(() => {
    let isActive = true;

    const loadCatalogo = async () => {
      try {
        const response = await cotizacionesApi.getCatalogoConceptos({
          page: 1,
          page_size: 100,
          ordering: "descripcion",
        });

        if (isActive) {
          setCatalogo(response.results);
        }
      } catch (error) {
        if (isActive) {
          setCatalogoError(
            getApiErrorMessage(
              error,
              "No fue posible cargar el catálogo de conceptos.",
            ),
          );
        }
      } finally {
        if (isActive) {
          setIsLoadingCatalogo(false);
        }
      }
    };

    void loadCatalogo();

    return () => {
      isActive = false;
    };
  }, []);

  const catalogoById = useMemo(
    () => new Map(catalogo.map((item) => [item.id, item])),
    [catalogo],
  );

  const updateConcepto = <TField extends keyof ConceptoFormValue>(
    clientId: string,
    field: TField,
    value: ConceptoFormValue[TField],
  ) => {
    onChange(
      conceptos.map((concepto) =>
        concepto.clientId === clientId
          ? { ...concepto, [field]: value }
          : concepto,
      ),
    );
  };

  const updateConceptoFields = (
    clientId: string,
    fields: Partial<ConceptoFormValue>,
  ) => {
    onChange(
      conceptos.map((concepto) =>
        concepto.clientId === clientId
          ? { ...concepto, ...fields }
          : concepto,
      ),
    );
  };

  const addConcepto = () => {
    onChange([...conceptos, createEmptyConcepto()]);
  };

  const removeConcepto = (clientId: string) => {
    if (conceptos.length === 1) {
      return;
    }

    onChange(
      conceptos.filter((concepto) => concepto.clientId !== clientId),
    );
  };

  const applyCatalogo = (
    clientId: string,
    item: ConceptoCatalogo,
  ) => {
    updateConceptoFields(clientId, {
      catalogoId: item.id,
      descripcion: item.descripcion,
      unidad: item.unidad,
      precioUnitario: item.precio_unitario,
      guardarEnCatalogo: false,
    });
    setSearchValues((current) => ({
      ...current,
      [clientId]: item.descripcion,
    }));
    setActiveSearchId(null);
  };

  const clearCatalogoLink = (clientId: string) => {
    updateConcepto(clientId, "catalogoId", null);
    setSearchValues((current) => ({
      ...current,
      [clientId]: "",
    }));
  };

  const getSuggestions = (clientId: string): ConceptoCatalogo[] => {
    const query = normalizeSearch(searchValues[clientId] ?? "");

    if (!query) {
      return catalogo.slice(0, 8);
    }

    return catalogo
      .filter((item) =>
        [
          item.descripcion,
          formatUnidadConcepto(item.unidad),
          item.precio_unitario,
        ].some((value) =>
          value.toLocaleLowerCase("es-MX").includes(query),
        ),
      )
      .slice(0, 8);
  };

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="text-lg font-black text-[#17445A]">
            Conceptos de cotización
          </h3>
          <p className="text-sm text-slate-500">
            Reutiliza conceptos guardados o captura uno nuevo manualmente.
          </p>
        </div>

        <button
          type="button"
          onClick={addConcepto}
          disabled={disabled}
          className="flex items-center justify-center gap-2 rounded-xl bg-[#255F7A] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#17445A] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Plus size={17} />
          Agregar concepto
        </button>
      </div>

      {catalogoError && (
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700">
          {catalogoError} Puedes continuar capturando conceptos manualmente.
        </div>
      )}

      <div className="mt-5 space-y-4">
        {conceptos.map((concepto, index) => {
          const importe =
            parseMoney(concepto.cantidad) *
            parseMoney(concepto.precioUnitario);
          const catalogoVinculado = concepto.catalogoId
            ? catalogoById.get(concepto.catalogoId)
            : undefined;
          const suggestions = getSuggestions(concepto.clientId);

          return (
            <section
              key={concepto.clientId}
              className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-black text-[#17445A]">
                    Concepto {index + 1}
                  </p>
                  {catalogoVinculado && (
                    <p className="mt-1 text-xs font-semibold text-emerald-700">
                      Vinculado al catálogo: {catalogoVinculado.descripcion}
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => removeConcepto(concepto.clientId)}
                  disabled={disabled || conceptos.length === 1}
                  aria-label="Eliminar concepto"
                  className="rounded-xl p-2 text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Trash2 size={18} />
                </button>
              </div>

              <div className="relative mt-4">
                <label className="text-sm font-bold text-[#17445A]">
                  Buscar en el catálogo
                </label>
                <div className="relative mt-2">
                  {isLoadingCatalogo ? (
                    <LoaderCircle
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 animate-spin text-slate-400"
                    />
                  ) : (
                    <Search
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                  )}
                  <input
                    value={searchValues[concepto.clientId] ?? ""}
                    onChange={(event) => {
                      setSearchValues((current) => ({
                        ...current,
                        [concepto.clientId]: event.target.value,
                      }));
                      setActiveSearchId(concepto.clientId);
                    }}
                    onFocus={() => setActiveSearchId(concepto.clientId)}
                    onBlur={() => {
                      window.setTimeout(() => {
                        setActiveSearchId((current) =>
                          current === concepto.clientId ? null : current,
                        );
                      }, 150);
                    }}
                    disabled={disabled || isLoadingCatalogo}
                    placeholder="Escribe una descripción, unidad o precio..."
                    className="w-full rounded-xl border border-slate-300 py-3 pl-11 pr-4 outline-none focus:ring-2 focus:ring-[#F5822A] disabled:bg-slate-100"
                  />
                </div>

                {activeSearchId === concepto.clientId &&
                  !isLoadingCatalogo &&
                  suggestions.length > 0 && (
                    <div className="absolute z-20 mt-2 max-h-64 w-full overflow-y-auto rounded-xl border border-slate-200 bg-white p-2 shadow-xl">
                      {suggestions.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onMouseDown={(event) => event.preventDefault()}
                          onClick={() =>
                            applyCatalogo(concepto.clientId, item)
                          }
                          className="flex w-full items-center justify-between gap-4 rounded-lg px-3 py-3 text-left transition hover:bg-[#E8F1F5]"
                        >
                          <div>
                            <p className="font-bold text-[#17445A]">
                              {item.descripcion}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              {formatUnidadConcepto(item.unidad)} · {item.usos}{" "}
                              uso{item.usos === 1 ? "" : "s"}
                            </p>
                          </div>
                          <strong className="shrink-0 text-sm text-[#F5822A]">
                            {formatCurrency(Number(item.precio_unitario))}
                          </strong>
                        </button>
                      ))}
                    </div>
                  )}
              </div>

              {concepto.catalogoId !== null && (
                <button
                  type="button"
                  onClick={() => clearCatalogoLink(concepto.clientId)}
                  disabled={disabled}
                  className="mt-3 inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-red-600 disabled:opacity-50"
                >
                  <Link2Off size={15} />
                  Desvincular del catálogo
                </button>
              )}

              <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-[minmax(260px,1fr)_160px_140px_180px_160px]">
                <label className="block">
                  <span className="text-sm font-bold text-[#17445A]">
                    Descripción *
                  </span>
                  <input
                    value={concepto.descripcion}
                    onChange={(event) =>
                      updateConcepto(
                        concepto.clientId,
                        "descripcion",
                        event.target.value,
                      )
                    }
                    placeholder="Descripción del concepto"
                    disabled={disabled}
                    required
                    className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-[#F5822A] disabled:bg-slate-100"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-bold text-[#17445A]">
                    Unidad
                  </span>
                  <select
                    value={concepto.unidad}
                    onChange={(event) =>
                      updateConcepto(
                        concepto.clientId,
                        "unidad",
                        event.target.value as UnidadConcepto,
                      )
                    }
                    disabled={disabled}
                    className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-[#F5822A] disabled:bg-slate-100"
                  >
                    {UNIDADES_CONCEPTO.map((unidad) => (
                      <option key={unidad.value} value={unidad.value}>
                        {unidad.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="text-sm font-bold text-[#17445A]">
                    Cantidad *
                  </span>
                  <input
                    type="number"
                    inputMode="decimal"
                    min="0.01"
                    step="0.01"
                    value={concepto.cantidad}
                    onChange={(event) =>
                      updateConcepto(
                        concepto.clientId,
                        "cantidad",
                        event.target.value,
                      )
                    }
                    placeholder="0.00"
                    disabled={disabled}
                    required
                    className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2 text-right outline-none focus:ring-2 focus:ring-[#F5822A] disabled:bg-slate-100"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-bold text-[#17445A]">
                    Precio unitario *
                  </span>
                  <input
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="0.01"
                    value={concepto.precioUnitario}
                    onChange={(event) =>
                      updateConcepto(
                        concepto.clientId,
                        "precioUnitario",
                        event.target.value,
                      )
                    }
                    placeholder="0.00"
                    disabled={disabled}
                    required
                    className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2 text-right outline-none focus:ring-2 focus:ring-[#F5822A] disabled:bg-slate-100"
                  />
                </label>

                <div>
                  <span className="text-sm font-bold text-[#17445A]">
                    Importe
                  </span>
                  <div className="mt-2 rounded-xl bg-[#17445A] px-3 py-2.5 text-right font-black text-white">
                    {formatCurrency(importe)}
                  </div>
                </div>
              </div>

              {concepto.catalogoId === null && (
                <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-xl border border-[#C8DBE4] bg-[#E8F1F5] p-3 text-sm text-[#17445A]">
                  <input
                    type="checkbox"
                    checked={concepto.guardarEnCatalogo}
                    onChange={(event) =>
                      updateConcepto(
                        concepto.clientId,
                        "guardarEnCatalogo",
                        event.target.checked,
                      )
                    }
                    disabled={disabled}
                    className="mt-0.5 h-4 w-4 accent-[#F5822A]"
                  />
                  <span>
                    <strong className="flex items-center gap-2">
                      <BookOpen size={16} />
                      Guardar este concepto en el catálogo
                    </strong>
                    <span className="mt-1 block text-xs text-slate-600">
                      Se guardarán descripción, unidad y precio; la cantidad
                      seguirá siendo exclusiva de esta cotización.
                    </span>
                  </span>
                </label>
              )}
            </section>
          );
        })}
      </div>
    </article>
  );
}
