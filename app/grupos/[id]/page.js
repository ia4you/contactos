import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { GrupoChatShell } from "./GrupoChatShell";

export default async function GrupoChat({ params }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  return <GrupoChatShell grupoId={Number(params.id)} usuarioId={Number(session.user.id)} />;
}
