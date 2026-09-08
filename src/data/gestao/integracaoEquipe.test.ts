/**
 * T8: consistência entre as abas — no mesmo escopo, KPIs da Equipe batem com
 * os da Visão geral (mesma fonte `agregadoLoja`/`agregadoPeriodo`, formatos
 * iguais) e os estados da view são coerentes. EQUIP-01.
 */
import { describe, expect, it } from "vitest";
import { montarEquipeView } from "./equipeVisoes";
import { montarLojaView } from "./dashboard";
import type { Escopo } from "./dashboard";

function escopo(filialId: string = "f1", periodo: Escopo["periodo"] = { tipo: "esteMes" }): Escopo {
  return { filialId, periodo, divisao: null };
}

describe("T8: integração — Equipe e Visão geral concordam (EQUIP-01)", () => {
  it("faturamento da Equipe = faturamento da Visão geral no mesmo escopo (loja e rede)", () => {
    for (const periodo of [{ tipo: "esteMes" }, { tipo: "hoje" }, { tipo: "7dias" }] as const) {
      for (const filialId of ["f1", "f2", "todas"]) {
        const eq = montarEquipeView(escopo(filialId, periodo));
        const dash = montarLojaView(escopo(filialId, periodo));
        expect(eq.kpiFaturamento.valor, `${filialId}/${periodo.tipo}`).toBe(dash.kpiFaturamento.valor);
      }
    }
  });

  it("delta do faturamento é o mesmo nas duas abas (mesma comparação do Dashboard)", () => {
    for (const filialId of ["f1", "todas"]) {
      const eq = montarEquipeView(escopo(filialId, { tipo: "7dias" }));
      const dash = montarLojaView(escopo(filialId, { tipo: "7dias" }));
      expect(eq.kpiFaturamento.delta?.value).toBe(dash.kpiFaturamento.delta?.value);
      expect(eq.kpiFaturamento.delta?.positive).toBe(dash.kpiFaturamento.delta?.positive);
    }
  });

  it("ticket e P.A. da Equipe batem com os da Visão geral (loja)", () => {
    for (const periodo of [{ tipo: "esteMes" }, { tipo: "hoje" }] as const) {
      const eq = montarEquipeView(escopo("f1", periodo));
      const dash = montarLojaView(escopo("f1", periodo));
      expect(eq.kpiTicket.valor).toBe(dash.kpiTicket.valor);
      expect(eq.kpiPA.valor).toBe(dash.kpiPA.valor);
    }
  });

  it("estados coerentes: kpis sempre disponível; desafios indisponível sem meta ativa", () => {
    const dia = montarEquipeView(escopo("f1", { tipo: "hoje" }));
    expect(dia.estados.kpis).toBe("disponivel");
    expect(dia.estados.desafios).toBe("indisponivel");
    const mes = montarEquipeView(escopo("f1", { tipo: "esteMes" }));
    expect(mes.estados.kpis).toBe("disponivel");
    expect(mes.estados.desafios).toBe("disponivel");
  });
});