import { describe, expect, it } from "vitest";
import { montarAoVivoView } from "./aoVivo";
import type { Escopo } from "./dashboard";

function escopo(filialIds: string[] = []): Escopo {
  return { filialIds, periodo: { tipo: "esteMes" }, divisao: null };
}

describe("montarAoVivoView", () => {
  it("mostra KPIs do mês com subtítulo do dia", () => {
    const v = montarAoVivoView(escopo(["f1"]));
    expect(v.kpis).toHaveLength(4);
    expect(v.kpis[0].label).toBe("Total de Vendas");
    expect(v.kpis[1].label).toBe("Faturamento");
    expect(v.kpis[0].sub).toMatch(/^Hoje /);
    expect(v.kpis[1].sub).toMatch(/^Hoje /);
    expect(v.kpis[2].label).toBe("Meta Mensal");
    expect(v.kpis[3].label).toBe("Atingimento");
  });

  it("ranking do mês ordenado por faturamento decrescente", () => {
    const v = montarAoVivoView(escopo(["f1"]));
    expect(v.ranking.length).toBeGreaterThan(0);
    for (let i = 1; i < v.ranking.length; i++) {
      expect(v.ranking[i - 1].faturamento).toBeGreaterThanOrEqual(v.ranking[i].faturamento);
    }
    expect(v.ranking[0].posicao).toBe(1);
  });

  it("agrega Todas as lojas no ranking", () => {
    const uma = montarAoVivoView(escopo(["f1"]));
    const todas = montarAoVivoView(escopo([]));
    expect(todas.ranking.length).toBeGreaterThanOrEqual(uma.ranking.length);
  });

  it("lista desafios ativos da competência", () => {
    const v = montarAoVivoView(escopo(["f1"]));
    // Body Cream e P.A. estão ativos em 15/09; ticket começa dia 20; perfumaria encerrou dia 10
    expect(v.desafios.every((d) => d.prazoRotulo !== "Encerrado")).toBe(true);
    expect(v.desafios.length).toBeGreaterThan(0);
  });

  it("meta da competência com porVendedor e porGrupo", () => {
    const v = montarAoVivoView(escopo(["f1"]));
    expect(v.meta).not.toBeNull();
    expect(v.meta!.alvo).toBeGreaterThan(0);
    expect(v.meta!.porVendedor.length).toBeGreaterThan(0);
    expect(v.meta!.porGrupo.length).toBeGreaterThan(0);
    expect(v.meta!.niveis.length).toBe(4);
  });

  it("evolução e insight mock preenchidos", () => {
    const v = montarAoVivoView(escopo(["f1"]));
    expect(v.evolucaoMeses.length).toBe(6);
    expect(v.evolucao.length).toBeGreaterThan(0);
    expect(v.insightMock.length).toBeGreaterThan(20);
  });
});
