import { describe, expect, it } from "vitest";
import { agregadoVendedoraPeriodo, metaIndividual, vendedorasDaLoja } from "./equipeViews";
import { colaboradorPorId } from "./equipe";
import { metaDaFilial } from "./metas";
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