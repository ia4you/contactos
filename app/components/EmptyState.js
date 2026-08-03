import Image from "next/image";

export function EmptyState({ texto = "Aún no hay nada aquí" }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      <div className="relative h-[200px] w-[200px] opacity-60">
        <Image src="/images/rosa-burdeos.png" alt="" fill className="object-contain" />
      </div>
      <p className="mt-4 text-sm text-texto-secundario">{texto}</p>
    </div>
  );
}
