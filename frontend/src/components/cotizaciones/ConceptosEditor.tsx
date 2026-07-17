import { Plus, Trash2 } from "lucide-react";

import type {
  ConceptoFormValue,
  UnidadConcepto,
} from "../../types/cotizacion";
import {
  createEmptyConcepto,
  UNIDADES_CONCEPTO,
} from "../../utils/cotizacionUtils";
import { formatCurrency } from "../../utils/formatCurrency";

interface ConceptosEditorProps {
  conceptos: ConceptoFormValue[];
  onChange: (conceptos: ConceptoFormValue[]) => void;
  disabled?: boolean;
}

export function ConceptosEditor({
  conceptos,
  onChange,
  disabled = false,
}: ConceptosEditorProps) {
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

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="text-lg font-black text-[#17445A]">
            Conceptos de cotización
          </h3>
          <p className="text-sm text-slate-500">
            Materiales, servicios, mano de obra o paquetes incluidos.
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

      <div className="mt-5 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-[#E8F1F5] text-[#17445A]">
            <tr>
              <th className="p-3 text-left">Descripción</th>
              <th className="p-3 text-left">Unidad</th>
              <th className="p-3 text-right">Cantidad</th>
              <th className="p-3 text-right">Precio unitario</th>
              <th className="p-3 text-right">Importe</th>
              <th className="p-3 text-center">Acción</th>
            </tr>
          </thead>

          <tbody>
            {conceptos.map((concepto) => {
              const importe =
                concepto.cantidad * concepto.precioUnitario;

              return (
                <tr
                  key={concepto.clientId}
                  className="border-t border-slate-100"
                >
                  <td className="min-w-[280px] p-3">
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
                      className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-[#F5822A] disabled:bg-slate-100"
                    />
                  </td>

                  <td className="min-w-[155px] p-3">
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
                      className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-[#F5822A] disabled:bg-slate-100"
                    >
                      {UNIDADES_CONCEPTO.map((unidad) => (
                        <option key={unidad.value} value={unidad.value}>
                          {unidad.label}
                        </option>
                      ))}
                    </select>
                  </td>

                  <td className="min-w-[130px] p-3">
                    <input
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={concepto.cantidad}
                      onChange={(event) =>
                        updateConcepto(
                          concepto.clientId,
                          "cantidad",
                          Number(event.target.value),
                        )
                      }
                      disabled={disabled}
                      required
                      className="w-full rounded-xl border border-slate-300 px-3 py-2 text-right outline-none focus:ring-2 focus:ring-[#F5822A] disabled:bg-slate-100"
                    />
                  </td>

                  <td className="min-w-[170px] p-3">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={concepto.precioUnitario}
                      onChange={(event) =>
                        updateConcepto(
                          concepto.clientId,
                          "precioUnitario",
                          Number(event.target.value),
                        )
                      }
                      disabled={disabled}
                      required
                      className="w-full rounded-xl border border-slate-300 px-3 py-2 text-right outline-none focus:ring-2 focus:ring-[#F5822A] disabled:bg-slate-100"
                    />
                  </td>

                  <td className="min-w-[145px] p-3 text-right font-black text-[#17445A]">
                    {formatCurrency(importe)}
                  </td>

                  <td className="p-3">
                    <div className="flex justify-center">
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
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </article>
  );
}
