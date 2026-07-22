import {
  Building2,
  FileText,
  FolderKanban,
  LoaderCircle,
  Search,
  UserRound,
  X,
  type LucideIcon,
} from "lucide-react";
import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
} from "react";
import { useNavigate } from "react-router-dom";

import { globalSearchApi } from "../api/globalSearchApi";
import type {
  GlobalSearchItem,
  GlobalSearchResponse,
} from "../types/globalSearch";
import { getApiErrorMessage } from "../utils/getApiErrorMessage";

interface ResultGroupProps {
  title: string;
  icon: LucideIcon;
  items: GlobalSearchItem[];
  onSelect: (item: GlobalSearchItem) => void;
}

function ResultGroup({
  title,
  icon: Icon,
  items,
  onSelect,
}: ResultGroupProps) {
  if (items.length === 0) return null;

  return (
    <section className="border-b border-slate-100 last:border-b-0">
      <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 text-xs font-black uppercase tracking-wide text-slate-500">
        <Icon size={14} />
        {title}
      </div>

      <div className="p-1.5">
        {items.map((item) => (
          <button
            key={`${item.tipo}-${item.id}`}
            type="button"
            onClick={() => onSelect(item)}
            className="block w-full rounded-xl px-3 py-2.5 text-left transition hover:bg-[#E8F1F5] focus:bg-[#E8F1F5] focus:outline-none"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-black text-[#17445A]">
                  {item.titulo}
                </p>
                {item.subtitulo && (
                  <p className="mt-0.5 truncate text-xs font-semibold text-slate-600">
                    {item.subtitulo}
                  </p>
                )}
                {item.descripcion && (
                  <p className="mt-1 line-clamp-1 text-xs text-slate-500">
                    {item.descripcion}
                  </p>
                )}
              </div>

              {item.estado && (
                <span className="shrink-0 rounded-full bg-white px-2 py-1 text-[10px] font-black text-[#255F7A] shadow-sm">
                  {item.estado.replaceAll("_", " ")}
                </span>
              )}
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}

const EMPTY_RESULTS: GlobalSearchResponse = {
  query: "",
  min_caracteres: 2,
  total: 0,
  clientes: [],
  cotizaciones: [],
  proyectos: [],
  usuarios: [],
};

export function GlobalSearch() {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] =
    useState<GlobalSearchResponse>(EMPTY_RESULTS);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  useEffect(() => {
    const normalizedQuery = query.trim();
    if (normalizedQuery.length < 2) return undefined;

    const controller = new AbortController();
    const timeoutId = window.setTimeout(async () => {
      try {
        const response = await globalSearchApi.search(
          normalizedQuery,
          controller.signal,
        );

        if (controller.signal.aborted) return;
        setResults(response);
        setErrorMessage("");
      } catch (error) {
        if (controller.signal.aborted) return;
        setResults({ ...EMPTY_RESULTS, query: normalizedQuery });
        setErrorMessage(
          getApiErrorMessage(
            error,
            "No fue posible realizar la búsqueda.",
          ),
        );
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }, 350);

    return () => {
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [query]);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    const normalizedValue = value.trim();

    setQuery(value);
    setErrorMessage("");
    setIsOpen(normalizedValue.length > 0);

    if (normalizedValue.length < 2) {
      setIsLoading(false);
      setResults({ ...EMPTY_RESULTS, query: normalizedValue });
      return;
    }

    setIsLoading(true);
  };

  const handleSelect = (item: GlobalSearchItem) => {
    setIsOpen(false);
    setQuery("");
    setResults(EMPTY_RESULTS);
    navigate(item.ruta);
  };

  const clearSearch = () => {
    setQuery("");
    setResults(EMPTY_RESULTS);
    setErrorMessage("");
    setIsLoading(false);
    setIsOpen(false);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      setIsOpen(false);
    }
  };

  const normalizedQuery = query.trim();
  const showDropdown = isOpen && normalizedQuery.length > 0;

  return (
    <div ref={containerRef} className="relative hidden md:block">
      <div className="flex w-80 items-center gap-2 rounded-xl bg-[#E8F1F5] px-3 py-2 xl:w-96">
        {isLoading ? (
          <LoaderCircle
            size={18}
            className="shrink-0 animate-spin text-[#255F7A]"
          />
        ) : (
          <Search size={18} className="shrink-0 text-[#255F7A]" />
        )}

        <input
          type="search"
          value={query}
          onChange={handleChange}
          onFocus={() => {
            if (normalizedQuery.length > 0) setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          className="min-w-0 flex-1 bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-500"
          placeholder="Buscar cliente, cotización o proyecto..."
          aria-label="Buscar en todo el sistema"
          aria-expanded={showDropdown}
          aria-controls="global-search-results"
          autoComplete="off"
        />

        {query && (
          <button
            type="button"
            onClick={clearSearch}
            className="rounded-lg p-1 text-slate-500 hover:bg-white hover:text-slate-700"
            title="Limpiar búsqueda"
          >
            <X size={15} />
          </button>
        )}
      </div>

      {showDropdown && (
        <div
          id="global-search-results"
          className="absolute left-0 top-[calc(100%+10px)] z-50 max-h-[70vh] w-[32rem] overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl"
        >
          {normalizedQuery.length < 2 ? (
            <p className="px-4 py-5 text-sm text-slate-500">
              Escribe al menos 2 caracteres para buscar.
            </p>
          ) : isLoading && results.query !== normalizedQuery ? (
            <div className="flex items-center gap-3 px-4 py-5 text-sm text-slate-500">
              <LoaderCircle size={18} className="animate-spin" />
              Buscando en el sistema…
            </div>
          ) : errorMessage ? (
            <p className="px-4 py-5 text-sm font-semibold text-red-600">
              {errorMessage}
            </p>
          ) : results.total === 0 ? (
            <div className="px-4 py-6 text-center">
              <Search size={25} className="mx-auto text-slate-300" />
              <p className="mt-2 text-sm font-bold text-slate-600">
                No encontramos coincidencias
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Prueba con un código, nombre, empresa o descripción.
              </p>
            </div>
          ) : (
            <>
              <ResultGroup
                title="Clientes"
                icon={Building2}
                items={results.clientes}
                onSelect={handleSelect}
              />
              <ResultGroup
                title="Cotizaciones"
                icon={FileText}
                items={results.cotizaciones}
                onSelect={handleSelect}
              />
              <ResultGroup
                title="Proyectos"
                icon={FolderKanban}
                items={results.proyectos}
                onSelect={handleSelect}
              />
              <ResultGroup
                title="Usuarios"
                icon={UserRound}
                items={results.usuarios}
                onSelect={handleSelect}
              />
            </>
          )}
        </div>
      )}
    </div>
  );
}
