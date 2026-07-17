import { Building2, MapPin, Phone, Search, UserRound } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { clientesApi } from "../../api/clientesApi";
import type { Cliente } from "../../types/client";
import { getApiErrorMessage } from "../../utils/getApiErrorMessage";

interface ClienteSelectorProps {
  value: number | null;
  onChange: (clienteId: number | null) => void;
  disabled?: boolean;
}

export function ClienteSelector({
  value,
  onChange,
  disabled = false,
}: ClienteSelectorProps) {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let isActive = true;

    const loadClientes = async () => {
      try {
        const response = await clientesApi.getClientes({
          page: 1,
          page_size: 100,
          ordering: "nombre_solicitante",
        });

        if (isActive) {
          setClientes(response.results);
        }
      } catch (error) {
        if (isActive) {
          setErrorMessage(
            getApiErrorMessage(
              error,
              "No fue posible cargar los clientes.",
            ),
          );
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    void loadClientes();

    return () => {
      isActive = false;
    };
  }, []);

  const filteredClientes = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    if (!normalizedSearch) {
      return clientes;
    }

    return clientes.filter((cliente) =>
      [
        cliente.nombre_solicitante,
        cliente.empresa,
        cliente.telefono,
      ].some((field) => field.toLowerCase().includes(normalizedSearch)),
    );
  }, [clientes, search]);

  const selectedCliente = clientes.find((cliente) => cliente.id === value);

  return (
    <div>
      <label className="text-sm font-bold text-[#17445A]">
        Cliente registrado *
      </label>

      <div className="relative mt-2">
        <Search
          size={18}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
        />

        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Buscar por nombre, empresa o teléfono..."
          disabled={disabled || isLoading}
          className="w-full rounded-xl border border-slate-300 py-3 pl-11 pr-4 outline-none focus:ring-2 focus:ring-[#F5822A] disabled:bg-slate-100"
        />
      </div>

      <select
        value={value ?? ""}
        onChange={(event) =>
          onChange(event.target.value ? Number(event.target.value) : null)
        }
        disabled={disabled || isLoading}
        required
        className="mt-3 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-[#F5822A] disabled:bg-slate-100"
      >
        <option value="">
          {isLoading ? "Cargando clientes..." : "Selecciona un cliente"}
        </option>

        {filteredClientes.map((cliente) => (
          <option key={cliente.id} value={cliente.id}>
            {cliente.nombre_solicitante}
            {cliente.empresa ? ` · ${cliente.empresa}` : ""}
          </option>
        ))}
      </select>

      {errorMessage && (
        <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {errorMessage}
        </div>
      )}

      {!isLoading && clientes.length === 0 && !errorMessage && (
        <p className="mt-3 text-sm text-slate-500">
          No hay clientes activos. Registra uno en{" "}
          <Link
            to="/clientes"
            className="font-bold text-[#F5822A] hover:underline"
          >
            Clientes
          </Link>
          .
        </p>
      )}

      {selectedCliente && (
        <div className="mt-4 grid grid-cols-1 gap-3 rounded-2xl bg-[#E8F1F5] p-4 text-sm md:grid-cols-2">
          <div className="flex items-center gap-2 text-[#17445A]">
            <UserRound size={17} />
            <strong>{selectedCliente.nombre_solicitante}</strong>
          </div>

          <div className="flex items-center gap-2 text-slate-600">
            <Building2 size={17} />
            <span>{selectedCliente.empresa || "Sin empresa"}</span>
          </div>

          <div className="flex items-center gap-2 text-slate-600">
            <Phone size={17} />
            <span>{selectedCliente.telefono || "Sin teléfono"}</span>
          </div>

          <div className="flex items-start gap-2 text-slate-600">
            <MapPin size={17} className="mt-0.5 shrink-0" />
            <span>{selectedCliente.direccion}</span>
          </div>
        </div>
      )}
    </div>
  );
}
