import {
  Camera,
  CheckCircle2,
  KeyRound,
  LoaderCircle,
  Save,
  Trash2,
  UserCircle,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";

import { actividadApi } from "../api/actividadApi";
import { authApi } from "../api/authApi";
import { useAuth } from "../auth/useAuth";
import { ROLE_LABELS } from "../auth/permissions";
import { ActivityTable } from "../components/usuarios/ActivityTable";
import type { ActivityRecord } from "../types/userManagement";
import { getApiErrorMessage } from "../utils/getApiErrorMessage";

export function ProfilePage() {
  const { profile, refreshProfile } = useAuth();
  const [firstName, setFirstName] = useState(profile?.first_name ?? "");
  const [lastName, setLastName] = useState(profile?.last_name ?? "");
  const [email, setEmail] = useState(profile?.email ?? "");
  const [phone, setPhone] = useState(profile?.telefono ?? "");
  const [photo, setPhoto] = useState<File | null>(null);
  const [removePhoto, setRemovePhoto] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [profileSuccess, setProfileSuccess] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  const [activities, setActivities] = useState<ActivityRecord[]>([]);
  const [isLoadingActivity, setIsLoadingActivity] = useState(true);
  const [activityError, setActivityError] = useState("");

  const localPreview = useMemo(
    () => (photo ? URL.createObjectURL(photo) : null),
    [photo],
  );

  useEffect(() => {
    return () => {
      if (localPreview) URL.revokeObjectURL(localPreview);
    };
  }, [localPreview]);

  useEffect(() => {
    let isActive = true;
    const loadActivity = async () => {
      try {
        const response = await actividadApi.getActivity({ page_size: 15 });
        if (isActive) setActivities(response.results);
      } catch (error) {
        if (isActive) {
          setActivityError(
            getApiErrorMessage(
              error,
              "No fue posible cargar tu actividad reciente.",
            ),
          );
        }
      } finally {
        if (isActive) setIsLoadingActivity(false);
      }
    };
    void loadActivity();
    return () => {
      isActive = false;
    };
  }, []);

  if (!profile) return null;

  const visiblePhoto = removePhoto
    ? null
    : localPreview ?? profile.foto_perfil;

  const handlePhotoChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setProfileError("Selecciona un archivo de imagen válido.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setProfileError("La fotografía no puede superar 5 MB.");
      return;
    }
    setPhoto(file);
    setRemovePhoto(false);
    setProfileError("");
  };

  const handleProfileSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    if (!firstName.trim() || !email.trim()) {
      setProfileError("El nombre y el correo son obligatorios.");
      return;
    }

    setIsSavingProfile(true);
    setProfileError("");
    setProfileSuccess("");
    try {
      await authApi.updateProfile({
        first_name: firstName,
        last_name: lastName,
        email,
        telefono: phone,
        foto_perfil: photo,
        eliminar_foto: removePhoto,
      });
      await refreshProfile();
      setPhoto(null);
      setRemovePhoto(false);
      setProfileSuccess("Perfil actualizado correctamente.");
    } catch (error) {
      setProfileError(
        getApiErrorMessage(error, "No fue posible actualizar tu perfil."),
      );
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("Completa los tres campos de contraseña.");
      return;
    }
    setIsSavingPassword(true);
    setPasswordError("");
    setPasswordSuccess("");
    try {
      const response = await authApi.changePassword({
        current_password: currentPassword,
        new_password: newPassword,
        confirm_password: confirmPassword,
      });
      await refreshProfile();
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordSuccess(response.message);
    } catch (error) {
      setPasswordError(
        getApiErrorMessage(error, "No fue posible cambiar la contraseña."),
      );
    } finally {
      setIsSavingPassword(false);
    }
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-black text-[#17445A]">Mi perfil</h1>
        <p className="mt-1 text-slate-500">
          Administra tu información, fotografía y contraseña.
        </p>
      </header>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <form
          onSubmit={handleProfileSubmit}
          className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-3xl bg-[#E8F1F5]">
              {visiblePhoto ? (
                <img
                  src={visiblePhoto}
                  alt="Fotografía de perfil"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-[#255F7A]">
                  <UserCircle size={68} />
                </div>
              )}
            </div>
            <div>
              <h2 className="text-xl font-black text-[#17445A]">
                {profile.nombre_completo}
              </h2>
              <p className="text-sm font-semibold text-slate-500">
                @{profile.username} · {ROLE_LABELS[profile.rol]}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[#255F7A] px-4 py-2 text-sm font-black text-white hover:bg-[#17445A]">
                  <Camera size={17} />
                  Cambiar fotografía
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                </label>
                {(profile.foto_perfil || photo) && (
                  <button
                    type="button"
                    onClick={() => {
                      setPhoto(null);
                      setRemovePhoto(true);
                    }}
                    className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2 text-sm font-black text-red-600 hover:bg-red-50"
                  >
                    <Trash2 size={17} />
                    Quitar
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="mt-7 grid gap-5 md:grid-cols-2">
            <label className="text-sm font-bold text-[#17445A]">
              Nombre
              <input
                value={firstName}
                onChange={(event) => setFirstName(event.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 font-normal text-slate-800 outline-none focus:ring-2 focus:ring-[#F5822A]"
                required
              />
            </label>
            <label className="text-sm font-bold text-[#17445A]">
              Apellidos
              <input
                value={lastName}
                onChange={(event) => setLastName(event.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 font-normal text-slate-800 outline-none focus:ring-2 focus:ring-[#F5822A]"
              />
            </label>
            <label className="text-sm font-bold text-[#17445A]">
              Correo
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 font-normal text-slate-800 outline-none focus:ring-2 focus:ring-[#F5822A]"
                required
              />
            </label>
            <label className="text-sm font-bold text-[#17445A]">
              Teléfono
              <input
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 font-normal text-slate-800 outline-none focus:ring-2 focus:ring-[#F5822A]"
              />
            </label>
          </div>

          {profileError && (
            <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              {profileError}
            </div>
          )}
          {profileSuccess && (
            <div className="mt-5 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
              <CheckCircle2 size={18} />
              {profileSuccess}
            </div>
          )}

          <div className="mt-6 flex justify-end border-t border-slate-100 pt-5">
            <button
              type="submit"
              disabled={isSavingProfile}
              className="inline-flex items-center gap-2 rounded-xl bg-[#F5822A] px-5 py-3 font-black text-white hover:bg-[#FF9A3D] disabled:opacity-60"
            >
              {isSavingProfile ? (
                <LoaderCircle className="animate-spin" size={19} />
              ) : (
                <Save size={19} />
              )}
              {isSavingProfile ? "Guardando..." : "Guardar perfil"}
            </button>
          </div>
        </form>

        <form
          onSubmit={handlePasswordSubmit}
          className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-[#FFF0E3] p-3 text-[#F5822A]">
              <KeyRound size={25} />
            </div>
            <div>
              <h2 className="text-xl font-black text-[#17445A]">
                Cambiar contraseña
              </h2>
              <p className="text-sm text-slate-500">
                La contraseña actual es obligatoria.
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <label className="block text-sm font-bold text-[#17445A]">
              Contraseña actual
              <input
                type="password"
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
                autoComplete="current-password"
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 font-normal outline-none focus:ring-2 focus:ring-[#F5822A]"
              />
            </label>
            <label className="block text-sm font-bold text-[#17445A]">
              Nueva contraseña
              <input
                type="password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                autoComplete="new-password"
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 font-normal outline-none focus:ring-2 focus:ring-[#F5822A]"
              />
            </label>
            <label className="block text-sm font-bold text-[#17445A]">
              Confirmar nueva contraseña
              <input
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                autoComplete="new-password"
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 font-normal outline-none focus:ring-2 focus:ring-[#F5822A]"
              />
            </label>
          </div>

          {passwordError && (
            <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              {passwordError}
            </div>
          )}
          {passwordSuccess && (
            <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
              {passwordSuccess}
            </div>
          )}

          <button
            type="submit"
            disabled={isSavingPassword}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#255F7A] px-5 py-3 font-black text-white hover:bg-[#17445A] disabled:opacity-60"
          >
            {isSavingPassword ? (
              <LoaderCircle className="animate-spin" size={19} />
            ) : (
              <KeyRound size={19} />
            )}
            {isSavingPassword ? "Actualizando..." : "Cambiar contraseña"}
          </button>
        </form>
      </div>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4">
          <h2 className="text-xl font-black text-[#17445A]">
            Mi actividad reciente
          </h2>
          <p className="text-sm text-slate-500">
            Cambios, altas, eliminaciones y restauraciones realizadas.
          </p>
        </div>
        <ActivityTable
          activities={activities}
          isLoading={isLoadingActivity}
          errorMessage={activityError}
        />
      </section>
    </div>
  );
}
