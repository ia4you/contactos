export function LegalPage({ titulo, children }) {
  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="font-display text-3xl font-semibold text-champan">{titulo}</h1>
      <div className="prose-legal mt-8 space-y-5 text-sm leading-relaxed text-[#F2EDE4]/80">
        {children}
      </div>
    </main>
  );
}
