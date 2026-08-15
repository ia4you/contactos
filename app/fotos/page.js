import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { FotosShell } from "./FotosShell";

export default async function Fotos() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  return <FotosShell />;
}
