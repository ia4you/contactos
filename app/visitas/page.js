import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { VisitasShell } from "./VisitasShell";

export default async function Visitas() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  return <VisitasShell />;
}
