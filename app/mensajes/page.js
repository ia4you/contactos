import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { MensajesShell } from "./MensajesShell";

export default async function Mensajes() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  return <MensajesShell usuarioId={Number(session.user.id)} />;
}
