import { redirect } from "next/navigation";
import { ClubDetalleShell } from "./ClubDetalleShell";

export default async function ClubDetallePage({ params }) {
  if (params.slug !== "club-ebano") {
    redirect(`/clubs?club=${params.slug}`);
  }

  return <ClubDetalleShell slug={params.slug} />;
}
