import { Card } from "@/components/ui";

/** Avisos explicando blocos ocultos. Nunca silencioso: quem tira print entende o que falta. */
export function Avisos({ itens }: { itens: string[] }) {
  if (itens.length === 0) return null;
  return (
    <div className="flex flex-col gap-2">
      {itens.map((a) => (
        <div key={a} className="flex items-start gap-2.5 rounded-[var(--radius-vela-md)] border border-info/30 bg-info-soft px-3.5 py-2.5 text-[12.5px] leading-relaxed text-t0">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--info)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4M12 8h.01" />
          </svg>
          <span>{a}</span>
        </div>
      ))}
    </div>
  );
}

/** Leitura da IA no topo da visão. Só renderiza quando há algo a dizer. */
export function LeituraIA({ texto }: { texto: string | null }) {
  if (!texto) return null;
  return (
    <Card padding="sm" className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(120% 120% at 0% 0%, var(--acc-soft), transparent 55%)" }} />
      <div className="relative flex items-start gap-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-acc text-white">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m13 2-3 7h6l-3 7" />
          </svg>
        </span>
        <div className="min-w-0">
          <p className="text-[10.5px] font-bold uppercase tracking-wider text-t2">Leitura</p>
          <p className="mt-0.5 text-[13.5px] leading-relaxed text-t0">{texto}</p>
        </div>
      </div>
    </Card>
  );
}
