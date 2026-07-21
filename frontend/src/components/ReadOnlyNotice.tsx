import { Eye } from "lucide-react";

import { usePermissions } from "../auth/usePermissions";

export function ReadOnlyNotice() {
  const { isReadOnly, roleLabel } = usePermissions();

  if (!isReadOnly) {
    return null;
  }

  return (
    <div className="mb-6 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
      <Eye className="mt-0.5 shrink-0" size={18} />
      <p>
        <strong>{roleLabel}:</strong> tienes acceso de consulta. Las acciones
        de creación, edición, eliminación y restauración están ocultas.
      </p>
    </div>
  );
}
