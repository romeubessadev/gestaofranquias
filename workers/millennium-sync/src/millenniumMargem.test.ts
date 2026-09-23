import { describe, expect, it } from "vitest";
import {
  cmvCentsFromMargemLines,
  milleniumMargemDataRange,
  parseRelatorioMargemPayload,
} from "./millenniumMargem.ts";

describe("parseRelatorioMargemPayload", () => {
  it("maps CUSTO_FRANQUIAS / QTDE / CUSTO_TOTAL", () => {
    const lines = parseRelatorioMargemPayload([
      {
        COD_PRODUTO: "375",
        QTDE_VENDIDA: 7,
        CUSTO_FRANQUIAS: 48.35,
        CUSTO_TOTAL: 338.45,
        TOTALVENDA: 747.75,
        PERC_MARGEM: 45.26,
      },
      {
        COD_PRODUTO: "100",
        QTDE_VENDIDA: 2,
        CUSTO_FRANQUIAS: 10,
        // CUSTO_TOTAL omitido → deriva
        TOTALVENDA: 50,
      },
    ]);
    expect(lines).toHaveLength(2);
    expect(lines[0]).toMatchObject({
      codProduto: "375",
      qty: 7,
      custoFranquias: 48.35,
      custoTotal: 338.45,
    });
    expect(lines[1].custoTotal).toBe(20);
  });

  it("sums CMV cents from CUSTO_TOTAL (imposto 0)", () => {
    const lines = parseRelatorioMargemPayload([
      { COD_PRODUTO: "a", QTDE_VENDIDA: 1, CUSTO_FRANQUIAS: 10, CUSTO_TOTAL: 10 },
      { COD_PRODUTO: "b", QTDE_VENDIDA: 2, CUSTO_FRANQUIAS: 5.5, CUSTO_TOTAL: 11 },
    ]);
    expect(cmvCentsFromMargemLines(lines)).toBe(2100);
  });
});

describe("milleniumMargemDataRange", () => {
  it("uses inclusive DATAF (same calendar end day, not Lista +1)", () => {
    expect(milleniumMargemDataRange("2026-09-01", "2026-09-01")).toEqual({
      datai: "2026-09-01T04:00:00.000Z",
      dataf: "2026-09-01T04:00:00.000Z",
    });
    expect(milleniumMargemDataRange("2026-09-01", "2026-09-22")).toEqual({
      datai: "2026-09-01T04:00:00.000Z",
      dataf: "2026-09-22T04:00:00.000Z",
    });
  });
});
