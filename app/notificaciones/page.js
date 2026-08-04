import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { NotificacionesShell } from "./NotificacionesShell";

export default async function Notificaciones() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  return <NotificacionesShell />;
}
