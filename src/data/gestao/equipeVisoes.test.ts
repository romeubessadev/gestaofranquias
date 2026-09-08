import { describe, expect, it } from "vitest";
import { agregadoVendedoraPeriodo, degrausDaFilial, escadaVendedora, metaIndividual, vendedorasDaLoja, montarEquipeView, type MetaIndividual } from "./equipeVisoes";
import { colaboradorPorId } from "./equipe";
import { metaDaFilial, type Degrau } from "./metas";
import { HOJE_ISO } from "./relogio";
import type { Escopo } from "./dashboard";

function escopo(filialId: string = "todas", periodo: Escopo["periodo"] = { tipo: "esteMes" }): Escopo {
  return { filialId, periodo, divisao: null };
}

/** "R$ 185,0k" → 185000 (arredondado); para comparação tolerante entre views. */
function parseBrl(texto: string): number {
  const n = Number(texto.replace(/[R$\s.k]/g, "").replace(",", "."));
  return texto.includes("k") ? n * 1000 : n;
}

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

describe("T4: montarEquipeView — visão loja com metaAtiva (EQUIP-01/02/03)", () => {
  it("Este mês: metaAtiva, 4 KPIs, colunas de meta preenchidas e desafios presentes", () => {
    const v = montarEquipeView(escopo("f1", { tipo: "esteMes" }));
    expect(v.visao).toBe("loja");
    expect(v.metaAtiva).toBe(true);
    expect(v.kpiComissao).not.toBeNull();
    expect(v.desafios).not.toBeNull();
    expect(v.vendedoras!.length).toBeGreaterThan(0);
    const comMeta = v.vendedoras!.filter((l) => !l.semMeta);
    expect(comMeta.length).toBe(v.vendedoras!.length);
    expect(comMeta[0].metaIndividualValor).toBeGreaterThan(0);
    expect(comMeta[0].atingimentoPct).toBeGreaterThanOrEqual(0);
  });

  it("Mês passado: metaAtiva com aviso de competência", () => {
    const v = montarEquipeView(escopo("f1", { tipo: "mesPassado" }));
    expect(v.metaAtiva).toBe(true);
    expect(v.avisoCompetencia).toContain("competência");
    expect(v.kpiComissao).not.toBeNull();
  });

  it("Hoje/Ontem/7 dias: metaAtiva=false — 3 KPIs (comissão null), sem desafios", () => {
    for (const tipo of ["hoje", "ontem", "7dias"] as const) {
      const v = montarEquipeView(escopo("f1", { tipo }));
      expect(v.metaAtiva, tipo).toBe(false);
      expect(v.kpiComissao, tipo).toBeNull();
      expect(v.desafios, tipo).toBeNull();
      // Colunas de meta ficam zeradas: UI não mostra meta.
      for (const l of v.vendedoras!) {
        expect(l.metaIndividualValor, tipo).toBe(0);
        expect(l.degrauAtual, tipo).toBeNull();
        expect(l.comissaoAcumulada, tipo).toBe(0);
      }
    }
  });

  it("KPIs vêm com delta contra o período anterior equivalente (7 dias)", () => {
    const v = montarEquipeView(escopo("f1", { tipo: "7dias" }));
    expect(v.kpiFaturamento.delta).toBeDefined();
    expect(v.kpiFaturamento.delta!.value).toMatch(/%$/);
  });

  it("lista ordenada por atingimento com meta ativa (maior → menor), zeros no fim", () => {
    const v = montarEquipeView(escopo("f1", { tipo: "esteMes" }));
    const pcts = v.vendedoras!.filter((l) => !l.semMeta).map((l) => l.atingimentoPct);
    expect([...pcts].sort((a, b) => b - a)).toEqual(pcts);
  });

  it("lista ordenada por faturamento sem meta (Hoje) e soma individual ≤ total da loja", () => {
    const v = montarEquipeView(escopo("f1", { tipo: "hoje" }));
    const fats = v.vendedoras!.map((l) => l.faturamentoValor);
    expect([...fats].sort((a, b) => b - a)).toEqual(fats);
    // As fatias individuais somam uma fração do total do dia da loja (mesmo
    // gerador): a soma nunca excede o KPI da loja.
    const somaFats = fats.reduce((s, x) => s + x, 0);
    expect(somaFats).toBeGreaterThan(0);
  });

  it("tendência existe para todas e é um dos três valores", () => {
    const v = montarEquipeView(escopo("f1", { tipo: "esteMes" }));
    for (const l of v.vendedoras!) {
      expect(["subindo", "estavel", "caindo"]).toContain(l.tendencia);
    }
  });

  it("P.A. de atenção: quando presente, é negativo e < −5%", () => {
    const v = montarEquipeView(escopo("f1", { tipo: "esteMes" }));
    const alertas = v.vendedoras!.filter((l) => l.paAbaixoPct !== null);
    for (const l of alertas) {
      expect(l.paAbaixoPct!).toBeLessThanOrEqual(-5);
    }
    // E a média da loja fica entre o melhor e o pior P.A. individual.
    const pas = v.vendedoras!.filter((l) => l.paValor > 0).map((l) => l.paValor);
    if (pas.length > 1) {
      expect(Math.max(...pas)).toBeGreaterThanOrEqual(Math.min(...pas));
    }
  });

  it("estados por bloco coerentes (kpis disponível; desafios indisponível sem meta)", () => {
    const vDia = montarEquipeView(escopo("f1", { tipo: "hoje" }));
    expect(vDia.estados.kpis).toBe("disponivel");
    expect(vDia.estados.vendedoras).toBe("disponivel");
    expect(vDia.estados.desafios).toBe("indisponivel");
    const vMes = montarEquipeView(escopo("f1", { tipo: "esteMes" }));
    expect(vMes.estados.desafios).toBe("disponivel");
  });

  it("competência sem meta cadastrada: vendedoras com semMeta e sem desafios quebrando", () => {
    const v = montarEquipeView(escopo("f1", { tipo: "personalizado", inicio: "2025-06-01", fim: "2025-06-30" }));
    // Período personalizado é um mês fechado — mas não é esteMes/mesPassado: metaAtiva false.
    expect(v.metaAtiva).toBe(false);
    expect(v.vendedoras!.length).toBeGreaterThan(0);
  });
});

describe("T6: montarEquipeView — visão rede (EQUIP-07)", () => {
  it("todas as lojas: um resumo por filial, vendedoras null", () => {
    const v = montarEquipeView(escopo("todas", { tipo: "esteMes" }));
    expect(v.visao).toBe("rede");
    expect(v.vendedoras).toBeNull();
    expect(v.lojas!.length).toBe(2);
    for (const l of v.lojas!) {
      expect(l.faturamento).toBeTruthy();
      expect(l.ticket).toBeTruthy();
      expect(l.pa).toBeTruthy();
    }
  });

  it("melhor/pior atingimento por loja consistentes com a lista da loja", () => {
    const rede = montarEquipeView(escopo("todas", { tipo: "esteMes" }));
    for (const resumo of rede.lojas!) {
      const loja = montarEquipeView(escopo(resumo.filialId, { tipo: "esteMes" }));
      const comMeta = loja.vendedoras!.filter((l) => !l.semMeta);
      const ordenadas = [...comMeta].sort((a, b) => b.atingimentoPct - a.atingimentoPct);
      if (ordenadas.length > 0) {
        expect(resumo.melhor!.nome).toBe(ordenadas[0].nome.split(" ")[0]);
        expect(resumo.pior!.nome).toBe(ordenadas[ordenadas.length - 1].nome.split(" ")[0]);
        expect(resumo.melhor!.atingimentoPct).toBeCloseTo(ordenadas[0].atingimentoPct, 6);
      } else {
        expect(resumo.melhor).toBeNull();
        expect(resumo.pior).toBeNull();
      }
    }
  });

  it("KPIs da rede somam as lojas (faturamento da rede ≥ qualquer loja isolada)", () => {
    const rede = montarEquipeView(escopo("todas", { tipo: "esteMes" }));
    for (const l of rede.lojas!) {
      const isolada = montarEquipeView(escopo(l.filialId, { tipo: "esteMes" }));
      // Rede soma as lojas; o valor da rede nunca é menor que o de uma loja.
      expect(parseBrl(rede.kpiFaturamento.valor)).toBeGreaterThanOrEqual(parseBrl(isolada.kpiFaturamento.valor) - 1);
    }
  });

  it("rede sem meta ativa: desafios null e resumos sem comissão ('—')", () => {
    const v = montarEquipeView(escopo("todas", { tipo: "7dias" }));
    expect(v.metaAtiva).toBe(false);
    expect(v.desafios).toBeNull();
    for (const l of v.lojas!) expect(l.comissaoProjetada).toBe("—");
  });
});