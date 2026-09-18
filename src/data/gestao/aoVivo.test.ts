import { describe, expect, it } from "vitest";
import { montarAoVivoView } from "./aoVivo";
import type { Escopo } from "./dashboard";

function escopo(filialIds: string[] = []): Escopo {
  return { filialIds, periodo: { tipo: "esteMes" }, divisao: null };
}

describe("montarAoVivoView", () => {
  it("mostra KPIs do mês e strip do dia", () => {
    const v = montarAoVivoView(escopo(["f1"]));
    expect(v.kpis).toHaveLength(4);
    expect(v.kpis[0].label).toBe("Faturamento");
    expect(v.kpis[1].label).toBe("Nº de vendas");
    expect(v.kpis[0].sub).not.toMatch(/^Hoje /);
    expect(v.kpis[1].sub).not.toMatch(/^Hoje /);
    expect(v.kpis[2].label).toBe("Meta Mensal");
    expect(v.kpis[3].label).toBe("Atingimento");
    expect(v.kpisHoje).toHaveLength(4);
    expect(v.kpisHoje[0].label).toBe("Faturamento hoje");
    expect(v.kpisHoje[1].label).toBe("Nº de vendas hoje");
    expect(v.kpisHoje[2].label).toBe("Ticket médio hoje");
    expect(v.kpisHoje[3].label).toBe("Itens hoje");
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

  it("meta da competência: 1 loja = meta da loja; Todas = meta somada", () => {
    const uma = montarAoVivoView(escopo(["f1"]));
    expect(uma.meta).not.toBeNull();
    expect(uma.meta!.alvo).toBeGreaterThan(0);
    expect(uma.meta!.porVendedor.length).toBeGreaterThan(0);
    expect(uma.meta!.porGrupo.length).toBeGreaterThan(0);
    expect(uma.meta!.niveis.length).toBe(4);

    const todas = montarAoVivoView(escopo([]));
    expect(todas.meta).not.toBeNull();
    expect(todas.meta!.alvo).toBeGreaterThan(uma.meta!.alvo);
  });
});
