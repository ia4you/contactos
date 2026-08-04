import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { AmistadesShell } from "./AmistadesShell";

export default async function Amistades() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  return <AmistadesShell />;
}
