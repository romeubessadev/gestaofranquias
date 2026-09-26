import { useEffect, useRef, useState } from "react";
import { Button, FormField, Input } from "@/components/ui";
import { allocateSlugFromName } from "@/data/wedash/erp";
import { Marca } from "@/components/wedash/TenantBrand";

export type RascunhoEmpresa = {
  nome: string;
  /** Gerado automaticamente a partir do nome (wedash.app/{slug}). */
  slug: string;
  logo: string | null;
};

export const rascunhoEmpresaVazio: RascunhoEmpresa = {
  nome: "",
  slug: "",
  logo: null,
};

const btnPrimario =
  "h-[46px] w-full rounded-xl bg-acc text-sm font-bold text-white transition-colors hover:bg-acc-2 disabled:cursor-not-allowed disabled:opacity-50";

export function Step1Brand({
  valor,
  onChange,
  onConcluir,
}: {
  valor: RascunhoEmpresa;
  onChange: (patch: Partial<RascunhoEmpresa>) => void;
  onConcluir: () => void;
}) {
  const [gerandoSlug, setGerandoSlug] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const arquivoRef = useRef<HTMLInputElement>(null);
  const { nome, slug, logo } = valor;

  // Slug automático a partir do nome (sem campo na UI).
  useEffect(() => {
    if (nome.trim().length < 2) {
      setGerandoSlug(false);
      return;
    }
    let ativo = true;
    setGerandoSlug(true);
    const t = window.setTimeout(() => {
      void allocateSlugFromName(nome).then((next) => {
        if (!ativo) return;
        setGerandoSlug(false);
        onChange({ slug: next ?? "" });
      });
    }, 350);
    return () => {
      ativo = false;
      window.clearTimeout(t);
    };
  }, [nome]); // onChange é estável o suficiente no onboarding

  const pode = nome.trim().length >= 2 && Boolean(slug) && !gerandoSlug && !salvando;

  async function concluir() {
    if (!pode) return;
    setSalvando(true);
    await new Promise((r) => setTimeout(r, 500));
    setSalvando(false);
    onConcluir();
  }

  return (
    <div>
      <h1 className="mb-2 text-2xl font-extrabold tracking-tight text-t0">Sua empresa</h1>
      <p className="mb-7 text-sm text-t2">Informe como sua empresa será identificada na WeDash. A logo é opcional.</p>

      <div className="flex flex-col gap-3.5">
        <FormField label="Nome da empresa" required hint="Esse nome será exibido para sua equipe e pode ser diferente da razão social.">
          <Input
            value={nome}
            onChange={(e) => onChange({ nome: e.target.value })}
            placeholder="Ex.: Essência Perfumaria"
            autoFocus
            maxLength={60}
          />
        </FormField>

        <FormField label="Logo da empresa" hint="PNG ou SVG com fundo transparente. Opcional.">
          <div className="flex items-center gap-3">
            <Marca size={56} nome={nome || "Empresa"} logoUrl={logo} fallback="iniciais" />
            <div className="flex flex-col gap-1.5">
              <Button variant="outline" size="sm" onClick={() => arquivoRef.current?.click()}>
                {logo ? "Trocar logo" : "Adicionar logo"}
              </Button>
              {logo && (
                <button type="button" onClick={() => onChange({ logo: null })} className="text-left text-[11.5px] font-semibold text-t2 hover:text-bad">
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
                if (f) onChange({ logo: URL.createObjectURL(f) });
              }}
            />
          </div>
        </FormField>

        <button type="button" disabled={!pode} onClick={concluir} className={btnPrimario} style={{ boxShadow: "0 8px 24px -8px var(--acc)" }}>
          {salvando ? "Salvando…" : "Continuar"}
        </button>
      </div>
    </div>
  );
}
