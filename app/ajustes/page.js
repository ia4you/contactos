import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";

export default async function Ajustes() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  return (
    <main className="flex min-h-screen justify-center bg-fondo px-4 py-16">
      <div className="h-fit w-full max-w-[480px] rounded-xl border border-borde bg-surface p-8 text-center">
        <h1 className="font-display text-2xl font-semibold text-texto">Ajustes</h1>
        <p className="mt-3 text-sm text-texto-secundario">Próximamente.</p>
      </div>
    </main>
  );
}
