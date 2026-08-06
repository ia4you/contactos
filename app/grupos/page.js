import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { GruposShell } from "./GruposShell";

export default async function Grupos() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  return <GruposShell />;
}
