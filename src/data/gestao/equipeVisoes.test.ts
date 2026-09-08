import { describe, expect, it } from "vitest";
import { agregadoVendedoraPeriodo, degrausDaFilial, escadaVendedora, metaIndividual, vendedorasDaLoja, type MetaIndividual } from "./equipeViews";
import { colaboradorPorId } from "./equipe";
import { metaDaFilial, type Degrau } from "./metas";
import { HOJE_ISO } from "./relogio";

describe("T2: meta individual derivada (EQUIP-03)", () => {
  it("soma das metas individuais fecha exato com a meta da loja", () => {
    const meta = metaDaFilial("f1", "2026-09")!.valorLoja;
    const vendedoras = vendedorasDaLoja("f1", "2026-09");
    const soma = vendedoras.reduce((s, c) => s + (metaIndividual(c, "f1", "2026-09")?.valor ?? 0), 0);
    expect(Math.round(soma)).toBe(meta);
  });

  it("meta individual segue o peso: maior pesoVenda recebe maior meta", () => {
    const ana = colaboradorPorId("c01")!; // peso 1.35
    const helena = colaboradorPorId("c08")!; // peso 0.7
    const mAna = metaIndividual(ana, "f1", "2026-09")!.valor;
    const mHelena = metaIndividual(helena, "f1", "2026-09")!.valor;
    expect(mAna).toBeGreaterThan(mHelena);
  });

  it("sem meta cadastrada na competência devolve null", () => {
    const c = colaboradorPorId("c01")!;
    expect(metaIndividual(c, "f1", "2025-01")).toBeNull();
  });

  it("vendedora em período parcial tem meta proporcional com flag e dias", () => {
    // Fernanda (c06) entra em férias em 10/09: dias elegíveis < dias abertos do mês.
    const fernanda = colaboradorPorId("c06")!;
    const m = metaIndividual(fernanda, "f1", "2026-09")!;
    expect(m.proporcional).toBe(true);
    expect(m.diasElegiveis).toBeLessThan(m.diasAbertosMes);
    expect(m.diasElegiveis).toBeGreaterThan(0);
    // A metade cheia de outra vendedora não é proporcional.
    const ana = colaboradorPorId("c01")!;
    const mAna = metaIndividual(ana, "f1", "2026-09")!;
    expect(mAna.proporcional).toBe(false);
  });

  it("elegibilidade por data: Rafaela (admissão 08/09) é parcial no mês", () => {
    const rafaela = colaboradorPorId("c18")!;
    const m = metaIndividual(rafaela, "f2", "2026-09")!;
    expect(m.proporcional).toBe(true);
  });

  it("dias elegíveis respeitam a inatividade (Fernanda: 1–9/set em loja que abre todo dia)", () => {
    const fernanda = colaboradorPorId("c06")!;
    const m = metaIndividual(fernanda, "f1", "2026-09")!;
    expect(m.diasElegiveis).toBe(9);
  });
});

describe("T2: agregados por vendedora no período (EQUIP-02)", () => {
  it("agregado de uma vendedora é consistente com o mês da loja", () => {
    const ana = colaboradorPorId("c01")!;
    const a = agregadoVendedoraPeriodo(ana, "f1", "2026-09-01", HOJE_ISO);
    expect(a.faturamento).toBeGreaterThan(0);
    expect(a.diasTrabalhados).toBeGreaterThan(0);
    // Faturamento individual é fração do total; não pode exceder o total do mês da loja.
    const totalMeta = metaDaFilial("f1", "2026-09")!.valorLoja;
    expect(a.faturamento).toBeLessThan(totalMeta);
  });

  it("vendedora sem venda no período devolve zeros sem erro", () => {
    const ana = colaboradorPorId("c01")!;
    const a = agregadoVendedoraPeriodo(ana, "f1", "2024-01-01", "2024-01-05");
    expect(a.faturamento).toBe(0);
    expect(a.atendimentos).toBe(0);
    expect(a.diasTrabalhados).toBe(0);
  });

  it("vendedora inativa no período soma só até a inatividade (Fernanda, férias 10/09)", () => {
    const fernanda = colaboradorPorId("c06")!;
    const a = agregadoVendedoraPeriodo(fernanda, "f1", "2026-09-01", HOJE_ISO);
    // Tem venda de 1–9/set e nenhuma de 10/09 em diante.
    expect(a.faturamento).toBeGreaterThan(0);
    const ate9 = agregadoVendedoraPeriodo(fernanda, "f1", "2026-09-01", "2026-09-09");
    expect(a.faturamento).toBe(ate9.faturamento);
  });

  it("hoje conta só até a hora atual (agregado de hoje é fração do dia)", () => {
    const ana = colaboradorPorId("c01")!;
    const ateAgora = agregadoVendedoraPeriodo(ana, "f1", HOJE_ISO, HOJE_ISO);
    expect(ateAgora.faturamento).toBeGreaterThanOrEqual(0);
  });
});

describe("T3: escada de degraus e comissão (EQUIP-04)", () => {
  const degrausPadrao = degrausDaFilial("f1", "2026-09");
  const metaBase: MetaIndividual = { valor: 1000, proporcional: false, diasElegiveis: 30, diasAbertosMes: 30 };
  const escadaDe = (degraus: Degrau[], meta = metaBase) => (realizado: number) => escadaVendedora(realizado, meta, degraus);

  it("antes do primeiro degrau: degrau null, comissão e bônus 0", () => {
    const e = escadaDe(degrausPadrao)(400); // 40% < 100%
    expect(e!.degrau).toBeNull();
    expect(e!.comissao).toBe(0);
    expect(e!.bonus).toBe(0);
  });

  it("fronteira exata: 100% entra no degrau Meta, 120% no Super Meta", () => {
    const exata = escadaDe(degrausPadrao)(1000);
    expect(exata!.degrau!.nome).toBe("Meta");
    expect(exata!.comissao).toBeCloseTo(1000 * 0.015, 6);
    expect(exata!.bonus).toBe(50);
    const superMeta = escadaDe(degrausPadrao)(1200);
    expect(superMeta!.degrau!.nome).toBe("Super Meta");
    expect(superMeta!.comissao).toBeCloseTo(1200 * 0.02, 6);
    expect(superMeta!.bonus).toBe(100);
  });

  it("degrau alcançado é o maior possível (150% → Hiper, não Super)", () => {
    const e = escadaDe(degrausPadrao)(1500);
    expect(e!.degrau!.nome).toBe("Hiper Meta");
  });

  it("bônus entra uma única vez (não dobra na projeção)", () => {
    const e = escadaDe(degrausPadrao)(1500);
    // bônus do Hiper = 150, uma vez; comissão separada do bônus.
    expect(e!.bonus).toBe(150);
    expect(e!.comissao).toBeCloseTo(1500 * 0.025, 6);
  });

  it("próximo degrau: falta = meta × minPct ÷ 100 − realizado", () => {
    const e = escadaDe(degrausPadrao)(1000);
    expect(e!.proximo!.nome).toBe("Super Meta");
    expect(e!.proximo!.faltaValor).toBeCloseTo(1200 - 1000, 6);
    // Já no último: null.
    const topo = escadaDe(degrausPadrao)(1900);
    expect(topo!.proximo).toBeNull();
  });

  it("sem meta individual (null ou zero) escada é null", () => {
    expect(escadaVendedora(500, null, degrausPadrao)).toBeNull();
    expect(escadaVendedora(500, { ...metaBase, valor: 0 }, degrausPadrao)).toBeNull();
  });

  it("escada lê degraus CUSTOMIZADOS da meta da filial, não os padrões", () => {
    const custom: Degrau[] = [
      { nome: "Bronze", atingimentoMinPct: 60, comissaoPct: 1.0, bonus: 10 },
      { nome: "Prata", atingimentoMinPct: 90, comissaoPct: 2.0, bonus: 30 },
    ];
    const e = escadaDe(custom)(900); // 90% → Prata na custom (seria Sem degrau na padrão)
    expect(e!.degrau!.nome).toBe("Prata");
    expect(e!.comissao).toBeCloseTo(900 * 0.02, 6);
    expect(e!.bonus).toBe(30);
    expect(e!.proximo).toBeNull();
  });

  it("degrausDaFilial devolve os degraus da competência (smoke da fonte)", () => {
    expect(degrausDaFilial("f1", "2026-09")).toBe(metaDaFilial("f1", "2026-09")!.degraus);
  });
});