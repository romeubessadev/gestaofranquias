import { describe, expect, it } from "vitest";
import { desafios, desafiosAtivos, progressoIndividual } from "./desafios";
import { colaboradorPorId, colaboradores } from "./equipe";

describe("T1: desafios ativos (EQUIP-05)", () => {
  it("competência corrente tem 6 desafios ativos", () => {
    expect(desafiosAtivos("2026-09").length).toBe(6);
  });

  it("competência sem desafios devolve lista vazia", () => {
    expect(desafiosAtivos("2026-08")).toEqual([]);
    expect(desafiosAtivos("2025-01")).toEqual([]);
  });

  it("cobre os três tipos: produto, quantidade e índice (com repetição entre eles)", () => {
    const tipos = desafiosAtivos("2026-09").map((d) => d.tipo);
    expect(new Set(tipos)).toEqual(new Set(["produto", "quantidade", "indice"]));
  });

  it("desafios nunca em reais: prêmio é o único campo monetário", () => {
    for (const d of desafios) {
      expect(["un", "x"]).toContain(d.unidade);
      expect(d.premio).toBeGreaterThan(0);
    }
  });

  it("participantes são vendedoras elegíveis existentes", () => {
    for (const d of desafiosAtivos("2026-09")) {
      expect(d.participantes.length).toBeGreaterThan(0);
      for (const id of d.participantes) {
        const c = colaboradorPorId(id);
        expect(c).toBeDefined();
      }
    }
  });

  it("progresso individual é determinístico (mesma chave, mesmo valor)", () => {
    const d = desafiosAtivos("2026-09")[0];
    const id = d.participantes[0];
    expect(progressoIndividual(d, id)).toBe(progressoIndividual(d, id));
    expect(progressoIndividual(d, id)).toBe(progressoIndividual(d, id));
  });

  it("progresso individual nunca é negativo e respeita não-participante", () => {
    const d = desafiosAtivos("2026-09")[0];
    for (const id of d.participantes) {
      expect(progressoIndividual(d, id)).toBeGreaterThanOrEqual(0);
    }
    // CAIXA (c09) não está nos participantes: progresso 0.
    expect(progressoIndividual(d, "c09")).toBe(0);
  });

  it("todas as vendedoras elegíveis de setembro participam de todos os desafios", () => {
    const elegiveis = colaboradores.filter((c) => c.tipo === "VENDEDOR" && !c.excluirDeRanking && !c.inativoNoErp && c.dataAdmissao <= "2026-09-01" && (!c.dataInatividade || c.dataInatividade > "2026-09-01"));
    for (const d of desafiosAtivos("2026-09")) {
      expect(d.participantes.length).toBe(elegiveis.length);
    }
  });
});