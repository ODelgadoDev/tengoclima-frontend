export function AuthLoadingScreen() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100">
      <div className="text-center">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-300 border-t-[#F5822A]" />

        <p className="mt-4 font-semibold text-[#17445A]">
          Verificando sesión...
        </p>
      </div>
    </main>
  );
}