import { useEffect, useMemo, useRef, useState } from "react";
import { Button, Card, FormField, Input, useToast } from "@/components/ui";
import { cn } from "@/lib/cn";
import { verificarSlug, type SituacaoSlug } from "@/data/gestao/erp";
import { Marca } from "@/components/gestao/Marca";

function slugificar(nome: string): string {
  return nome
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

function hexParaHsl(hex: string): { h: number; s: number; l: number } {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l };
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) * 60;
  else if (max === g) h = ((b - r) / d + 2) * 60;
  else h = ((r - g) / d + 4) * 60;
  return { h, s, l };
}

function luminancia(hex: string): number {
  const canal = (c: number) => {
    const v = c / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * canal(parseInt(hex.slice(1, 3), 16)) + 0.7152 * canal(parseInt(hex.slice(3, 5), 16)) + 0.0722 * canal(parseInt(hex.slice(5, 7), 16));
}

function contrasteComBranco(hex: string): number {
  const l = luminancia(hex);
  return (1.05) / (l + 0.05);
}

function distanciaHue(a: number, b: number): number {
  const d = Math.abs(a - b) % 360;
  return d > 180 ? 360 - d : d;
}

/** Checa contraste com texto branco e distância dos semânticos de positivo e negativo. */
function avaliarCor(hex: string): { ok: boolean; avisos: string[] } {
  const avisos: string[] = [];
  const { h, s } = hexParaHsl(hex);
  if (contrasteComBranco(hex) < 3) avisos.push("Pouco contraste com texto branco. Botões ficam difíceis de ler.");
  if (s > 0.35 && distanciaHue(h, 150) < 25) avisos.push("Muito parecida com a cor de positivo (verde). Confunde com meta batida.");
  if (s > 0.35 && distanciaHue(h, 355) < 20) avisos.push("Muito parecida com a cor de negativo (vermelho). Confunde com alerta.");
  if (s > 0.35 && distanciaHue(h, 40) < 15) avisos.push("Muito parecida com a cor de atenção (âmbar).");
  return { ok: avisos.length === 0, avisos };
}

const PRESETS = ["#7c5cff", "#e64980", "#0ea5e9", "#14b8a6", "#f97316", "#8b5cf6"];

const textoSlug: Record<SituacaoSlug, { texto: string; tom: "ok" | "bad" | "neutro" }> = {
  vazio: { texto: "Só letras minúsculas, números e hífen. De 3 a 40 caracteres.", tom: "neutro" },
  invalido: { texto: "Endereço inválido. Só letras minúsculas, números e hífen, sem começar ou terminar com hífen.", tom: "bad" },
  reservado: { texto: "Esse endereço é reservado pelo sistema.", tom: "bad" },
  ocupado: { texto: "Esse endereço já está em uso por outra franquia.", tom: "bad" },
  disponivel: { texto: "Endereço disponível.", tom: "ok" },
};

export function Etapa1Marca({ onConcluir }: { onConcluir: () => void }) {
  const { show } = useToast();
  const [nome, setNome] = useState("");
  const [slug, setSlug] = useState("");
  const [slugEditado, setSlugEditado] = useState(false);
  const [situacao, setSituacao] = useState<SituacaoSlug>("vazio");
  const [verificando, setVerificando] = useState(false);
  const [logo, setLogo] = useState<string | null>(null);
  const [cor, setCor] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);
  const arquivoRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!slugEditado) setSlug(slugificar(nome));
  }, [nome, slugEditado]);

  useEffect(() => {
    if (!slug) {
      setSituacao("vazio");
      return;
    }
    let ativo = true;
    setVerificando(true);
    const t = setTimeout(() => {
      verificarSlug(slug).then((s) => {
        if (!ativo) return;
        setSituacao(s);
        setVerificando(false);
      });
    }, 400);
    return () => {
      ativo = false;
      clearTimeout(t);
    };
  }, [slug]);

  const avaliacao = useMemo(() => (cor ? avaliarCor(cor) : null), [cor]);
  const pode = nome.trim().length >= 2 && situacao === "disponivel" && !verificando && !salvando;
  const infoSlug = textoSlug[situacao];

  async function concluir() {
    if (!pode) return;
    setSalvando(true);
    await new Promise((r) => setTimeout(r, 800));
    show(`Endereço criado. Redirecionando para ${slug}.gestaofranquias.com.br`, "success");
    onConcluir();
  }

  return (
    <Card padding="lg">
      <h2 className="text-lg font-bold text-t0">Sua marca</h2>
      <p className="mb-6 mt-1 text-[13.5px] text-t2">É o que a sua equipe vê ao abrir o app. Só o nome e o endereço são obrigatórios.</p>

      <div className="flex flex-col gap-5">
        <FormField label="Nome de exibição" required hint="Como a franquia aparece para a equipe. Pode ser diferente da razão social.">
          <Input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex.: Essência Perfumaria" autoFocus maxLength={60} />
        </FormField>

        <FormField label="Endereço do app" required>
          <div className={cn("flex h-[42px] items-center overflow-hidden rounded-[var(--radius-vela-md)] border bg-bg-inset transition-colors focus-within:border-acc", infoSlug.tom === "bad" ? "border-bad" : "border-line")}>
            <input
              value={slug}
              onChange={(e) => {
                setSlugEditado(true);
                setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""));
              }}
              placeholder="essencia"
              className="h-full min-w-0 flex-1 bg-transparent px-3.5 font-mono text-[13px] text-t0 outline-none placeholder:text-t2"
            />
            <span className="hidden shrink-0 border-l border-line px-3 text-[12px] text-t2 sm:inline">.gestaofranquias.com.br</span>
            <span className="flex w-9 shrink-0 items-center justify-center">
              {verificando ? (
                <span className="h-4 w-4 rounded-full border-2 border-line-2 border-t-acc animate-vela-spin" />
              ) : situacao === "disponivel" ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--ok)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              ) : infoSlug.tom === "bad" ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--bad)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              ) : null}
            </span>
          </div>
          <p className={cn("mt-1.5 text-[11.5px]", infoSlug.tom === "bad" ? "font-medium text-bad" : infoSlug.tom === "ok" ? "font-medium text-ok" : "text-t2")}>
            {verificando ? "Verificando disponibilidade…" : infoSlug.texto}
          </p>
          <p className="mt-1 text-[11.5px] text-t2 sm:hidden">Endereço completo: {slug || "…"}.gestaofranquias.com.br</p>
        </FormField>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <FormField label="Logo" hint="PNG ou SVG com fundo transparente. Opcional.">
            <div className="flex items-center gap-3">
              <Marca size={56} nome={nome || "Marca"} logoUrl={logo} fallback="iniciais" />
              <div className="flex flex-col gap-1.5">
                <Button variant="outline" size="sm" onClick={() => arquivoRef.current?.click()}>
                  {logo ? "Trocar logo" : "Enviar logo"}
                </Button>
                {logo && (
                  <button onClick={() => setLogo(null)} className="text-left text-[11.5px] font-semibold text-t2 hover:text-bad">
                    Remover
                  </button>
                )}
              </div>
              <input
                ref={arquivoRef}
                type="file"
                accept="image/png,image/svg+xml,image/jpeg"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) setLogo(URL.createObjectURL(f));
                }}
              />
            </div>
          </FormField>

          <FormField label="Cor principal" hint="Usada em botões e destaques. Opcional.">
            <div className="flex flex-wrap items-center gap-2">
              {PRESETS.map((p) => (
                <button key={p} onClick={() => setCor(p)} aria-label={p} className={cn("h-8 w-8 rounded-full border-2 transition-transform hover:scale-110", cor === p ? "border-t0" : "border-transparent")} style={{ background: p }} />
              ))}
              <label className="relative flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-dashed border-line-2 text-t2 hover:text-t0">
                <input type="color" value={cor ?? "#7c5cff"} onChange={(e) => setCor(e.target.value)} className="absolute inset-0 cursor-pointer opacity-0" />
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </label>
              {cor && (
                <button onClick={() => setCor(null)} className="text-[11.5px] font-semibold text-t2 hover:text-t0">
                  Usar padrão
                </button>
              )}
            </div>
            {avaliacao && avaliacao.avisos.length > 0 && (
              <ul className="mt-2 flex flex-col gap-1">
                {avaliacao.avisos.map((a) => (
                  <li key={a} className="text-[11.5px] font-medium text-warn">
                    {a}
                  </li>
                ))}
              </ul>
            )}
            {avaliacao?.ok && <p className="mt-2 text-[11.5px] font-medium text-ok">Contraste e distância dos semânticos aprovados.</p>}
          </FormField>
        </div>

        <div className="rounded-[var(--radius-vela-md)] border border-line bg-bg-inset p-4">
          <p className="mb-2 text-[10.5px] font-bold uppercase tracking-wider text-t2">Prévia</p>
          <div className="flex items-center gap-3">
            <Marca size={40} nome={nome || "Marca"} logoUrl={logo} fallback="iniciais" />
            <div className="min-w-0">
              <p className="truncate text-[15px] font-extrabold text-t0">{nome || "Nome da franquia"}</p>
              <p className="truncate text-[11.5px] text-t2">{slug || "endereco"}.gestaofranquias.com.br</p>
            </div>
            <span className="ml-auto rounded-[9px] px-3 py-1.5 text-[12px] font-bold text-white" style={{ background: cor ?? "var(--acc)" }}>
              Botão
            </span>
          </div>
        </div>

        <div className="flex items-center justify-end pt-2">
          <Button onClick={concluir} disabled={!pode} size="lg">
            {salvando ? "Criando endereço…" : "Continuar"}
          </Button>
        </div>
      </div>
    </Card>
  );
}
