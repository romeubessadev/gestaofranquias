import { beforeEach, describe, expect, it } from "vitest";
import { parseCostTablePrices, parseCostTables } from "./millenniumCostTable.ts";
import {
  COST_TABLE_MIN_MATCHES,
  detectStoreCostTable,
  pickCostTable,
  resetCostTableDetectThrottle,
  type CostTableDetectDeps,
} from "./costTableSync.ts";

describe("parse das tabelas de custo", () => {
  it("lista do lookup", () => {
    expect(
      parseCostTables([
        { TABELA_CUSTO_TABELA: 20104, TABELA_CUSTO_CODIGO: "104", TABELA_CUSTO_DESCRICAO: "CENTO OESTE" },
        { TABELA_CUSTO_TABELA: null },
      ]),
    ).toEqual([{ tableId: 20104, code: "104", description: "CENTO OESTE" }]);
  });

  it("custo unitário em centavos; ignora 0 e fica o maior entre cores", () => {
    const p = parseCostTablePrices({
      RAW_DATA: [
        { PRODUTO_PRODUTO_COD_PRODUTO: "420", F_3814918930: 54.47 },
        { PRODUTO_PRODUTO_COD_PRODUTO: "504", F_3814918930: 0 },
        { PRODUTO_PRODUTO_COD_PRODUTO: "X1", F_3814918930: 10 },
        { PRODUTO_PRODUTO_COD_PRODUTO: "X1", F_3814918930: 12.5 },
      ],
    });
    expect([...p]).toEqual([
      ["420", 5447],
      ["X1", 1250],
    ]);
  });
});

function codes(n: number, unit: (i: number) => number) {
  return new Map(Array.from({ length: n }, (_, i) => [`P${i}`, unit(i)] as const));
}

describe("pickCostTable", () => {
  it("escolhe a tabela que mais bate com a margem (±1 centavo)", () => {
    const margem = codes(30, (i) => 1000 + i);
    const tables = new Map([
      [1, codes(30, (i) => 900 + i)],
      [20104, codes(30, (i) => (i < 27 ? 1000 + i + (i % 2) : 5000))],
    ]);
    expect(pickCostTable(margem, tables)).toEqual({ tableId: 20104, matches: 27, compared: 30 });
  });

  it("não escolhe com poucos produtos iguais", () => {
    const margem = codes(COST_TABLE_MIN_MATCHES - 1, () => 1000);
    expect(pickCostTable(margem, new Map([[1, codes(COST_TABLE_MIN_MATCHES - 1, () => 1000)]]))).toBeNull();
  });
});

function fakeDeps(over: Partial<CostTableDetectDeps> = {}) {
  const calls: string[] = [];
  const deps: CostTableDetectDeps = {
    storeNeedsTable: async () => true,
    margemUnitCosts: async () => codes(25, (i) => 1000 + i),
    tablePrices: async () =>
      new Map([
        [1, codes(25, () => 1)],
        [20104, codes(25, (i) => 1000 + i)],
      ]),
    setStoreTable: async (store, id) => void calls.push(`set:${store}:${id}`),
    ...over,
  };
  return { deps, calls };
}

describe("detectStoreCostTable", () => {
  beforeEach(() => resetCostTableDetectThrottle());

  it("loja sem tabela → escolhe a que bate e grava", async () => {
    const { deps, calls } = fakeDeps();
    expect(await detectStoreCostTable(deps, "s1")).toMatchObject({ tableId: 20104, matches: 25 });
    expect(calls).toEqual(["set:s1:20104"]);
  });

  it("loja com tabela escolhida → não mexe", async () => {
    const { deps, calls } = fakeDeps({ storeNeedsTable: async () => false });
    expect(await detectStoreCostTable(deps, "s1")).toBeNull();
    expect(calls).toEqual([]);
  });

  it("poucos produtos com custo na margem → espera", async () => {
    const { deps, calls } = fakeDeps({ margemUnitCosts: async () => codes(5, () => 1000) });
    expect(await detectStoreCostTable(deps, "s1")).toBeNull();
    expect(calls).toEqual([]);
  });

  it("no máx. 1 tentativa por hora por loja", async () => {
    let checks = 0;
    const { deps } = fakeDeps({
      storeNeedsTable: async () => {
        checks += 1;
        return false;
      },
    });
    const t0 = Date.parse("2026-09-26T12:00:00Z");
    await detectStoreCostTable(deps, "s1", t0);
    await detectStoreCostTable(deps, "s1", t0 + 30 * 60_000);
    await detectStoreCostTable(deps, "s1", t0 + 61 * 60_000);
    expect(checks).toBe(2);
  });
});
