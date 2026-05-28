type StatCardProps = {
  titulo: string;
  valor: string;
  descripcion: string;
};

export function StatCard({ titulo, valor, descripcion }: StatCardProps) {
  return (
    <article className="rounded-2xl bg-white p-5 shadow-sm border border-slate-200 hover:shadow-md transition">
      <p className="text-sm font-bold text-[#255F7A]">{titulo}</p>
      <h3 className="mt-2 text-3xl font-black text-[#17445A]">{valor}</h3>
      <p className="mt-2 text-sm text-slate-500">{descripcion}</p>
    </article>
  );
}