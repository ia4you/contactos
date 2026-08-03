export function LegalPage({ titulo, children }) {
  return (
    <main className="flex min-h-screen justify-center bg-fondo px-4 py-16">
      <div className="h-fit w-full max-w-[800px] rounded-xl border border-borde bg-surface p-8 sm:p-10">
        <h1 className="font-display text-3xl font-semibold text-champan">{titulo}</h1>
        <div className="mt-8 space-y-5 font-body text-sm leading-relaxed text-texto-secundario [&_strong]:text-texto">
          {children}
        </div>
      </div>
    </main>
  );
}
