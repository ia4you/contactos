import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { EventoDetalleShell } from "./EventoDetalleShell";

export default async function EventoDetalle({ params }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  return <EventoDetalleShell eventoId={Number(params.id)} />;
}
