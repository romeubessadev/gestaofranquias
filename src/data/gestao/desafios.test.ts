import { describe, expect, it } from "vitest";
import {
  alvoGerenteDoDesafio,
  desafios,
  desafiosAtivos,
  pisoDoDesafio,
  progressoGerenteCapped,
  progressoIndividual,
} from "./desafios";
import { colaboradorPorId } from "./equipe";

describe("T1: desafios ativos (EQUIP-05)", () => {
  it("competência corrente tem 4 desafios ativos", () => {
    expect(desafiosAtivos("2026-09").length).toBe(4);
  });

  it("competência sem desafios devolve lista vazia", () => {
    expect(desafiosAtivos("2026-08")).toEqual([]);
    expect(desafiosAtivos("2025-01")).toEqual([]);
  });

  it("cobre os tipos usados no mock: quantidade, produto, P.A. e ticket", () => {
    const tipos = desafiosAtivos("2026-09").map((d) => d.tipo);
    expect(new Set(tipos)).toEqual(new Set(["quantidade", "produto", "pa", "ticket"]));
  });

  it("desafios nunca em reais como unidade de meta: prêmio é o único campo de recompensa", () => {
    for (const d of desafios) {
      expect(["un", "x", "R$"]).toContain(d.unidade);
      expect(d.premio).toBeGreaterThan(0);
      expect(d.premioGerente).toBeGreaterThan(0);
      expect(d.minimoVendedorasAtingindo).toBeGreaterThan(0);
      expect(d.minimoVendedorasAtingindo).toBeLessThanOrEqual(d.participantes.length);
    }
  });

  it("participantes são vendedoras elegíveis existentes e sem férias no meio", () => {
    for (const d of desafiosAtivos("2026-09")) {
      expect(d.participantes.length).toBeGreaterThan(0);
      for (const id of d.participantes) {
        const c = colaboradorPorId(id);
        expect(c).toBeDefined();
        expect(c!.tipo).toBe("VENDEDOR");
        expect(id).not.toBe("c06"); // Fernanda em férias
        expect(id).not.toBe("c09"); // caixa
      }
    }
  });

  it("cada desafio pertence a uma loja; participantes são da mesma loja", () => {
    const ativos = desafiosAtivos("2026-09");
    const perf = ativos.find((d) => d.id === "d-perfumaria")!;
    const body = ativos.find((d) => d.id === "d-bodycream")!;
    const pa = ativos.find((d) => d.id === "d-pa")!;
    const ticket = ativos.find((d) => d.id === "d-ticket")!;
    expect(perf.filialId).toBe("f1");
    expect(pa.filialId).toBe("f1");
    expect(body.filialId).toBe("f2");
    expect(ticket.filialId).toBe("f2");
    for (const d of ativos) {
      expect(d.filialId).toBeTruthy();
      for (const id of d.participantes) {
        expect(colaboradorPorId(id)!.filialId).toBe(d.filialId);
      }
    }
    expect(perf.participantes.length).toBeLessThanOrEqual(pa.participantes.length);
    expect(body.participantes.length).toBeLessThanOrEqual(ticket.participantes.length);
  });

  it("progresso individual é determinístico (mesma chave, mesmo valor)", () => {
    const d = desafiosAtivos("2026-09")[0];
    const id = d.participantes[0];
    expect(progressoIndividual(d, id)).toBe(progressoIndividual(d, id));
  });

  it("progresso individual nunca é negativo e respeita não-participante", () => {
    const d = desafiosAtivos("2026-09")[0];
    for (const id of d.participantes) {
      expect(progressoIndividual(d, id)).toBeGreaterThanOrEqual(0);
    }
    expect(progressoIndividual(d, "c09")).toBe(0);
  });

  it("progresso de quantidade/produto é sempre unidade inteira", () => {
    for (const d of desafiosAtivos("2026-09").filter((x) => x.unidade === "un")) {
      for (const id of d.participantes) {
        const p = progressoIndividual(d, id);
        expect(Number.isInteger(p)).toBe(true);
      }
    }
  });

  it("cada desafio tem janela inicio/fim válida na competência", () => {
    for (const d of desafiosAtivos("2026-09")) {
      expect(d.inicio <= d.fim).toBe(true);
      expect(d.inicio.startsWith("2026-09")).toBe(true);
      expect(d.fim.startsWith("2026-09")).toBe(true);
    }
  });

  it("meta do gerente: un = piso × N; índices (pa/ticket) = o próprio piso; capped não deixa 1 carregar", () => {
    const perf = desafiosAtivos("2026-09").find((d) => d.id === "d-perfumaria")!;
    const pa = desafiosAtivos("2026-09").find((d) => d.id === "d-pa")!;
    expect(alvoGerenteDoDesafio(perf, perf.participantes.length)).toBe(pisoDoDesafio(perf) * 3);
    expect(alvoGerenteDoDesafio(pa, pa.participantes.length)).toBe(pisoDoDesafio(pa));
    // 1 pessoa com 10 e 4 com 0 → capped = 3 (não 10)
    expect(progressoGerenteCapped([10, 0, 0, 0, 0], 3)).toBe(3);
    expect(progressoGerenteCapped([3, 3, 3, 0, 0], 3)).toBe(9);
  });

  it("progresso de P.A. fica na faixa de índice (~0,5–2,5), não soma absurda", () => {
    const pa = desafiosAtivos("2026-09").find((d) => d.id === "d-pa")!;
    for (const id of pa.participantes) {
      const p = progressoIndividual(pa, id);
      expect(p).toBeGreaterThanOrEqual(0);
      expect(p).toBeLessThanOrEqual(3);
    }
  });

  it("desafio a começar (ticket) ainda não tem progresso", () => {
    const ticket = desafiosAtivos("2026-09").find((d) => d.id === "d-ticket")!;
    for (const id of ticket.participantes) {
      expect(progressoIndividual(ticket, id)).toBe(0);
    }
  });
});
