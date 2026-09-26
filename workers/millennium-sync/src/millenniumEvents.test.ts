import { describe, expect, it } from "vitest";
import {
  eventCodeFromLabel,
  formatEventoFilter,
  mapEventosListaPayload,
  resolveSalesEventIds,
  salesEventLabelsCovered,
  salesEventLabelsForStore,
} from "./millenniumEvents";

describe("salesEventLabelsForStore", () => {
  it("maps COD_FILIAL 00010 → S-10 plus globals (sem S-100)", () => {
    expect(salesEventLabelsForStore("00010").sort()).toEqual(
      ["S-03", "S-10", "S-X"].sort(),
    );
  });

  it("maps 00114 → S-114", () => {
    expect(salesEventLabelsForStore("00114")).toContain("S-114");
  });
});

describe("resolveSalesEventIds", () => {
  it("resolves ids for filial 00010 without S-100", () => {
    const events = mapEventosListaPayload({
      value: [
        { EVENTO: 17, CODIGO: "S-03" },
        { EVENTO: 24, CODIGO: "S-10" },
        { EVENTO: 22, CODIGO: "S-100" },
        { EVENTO: 107, CODIGO: "S-X" },
        { EVENTO: 99, CODIGO: "S-114" },
        { EVENTO: 50, CODIGO: "TRANSFERENCIA" },
      ],
    });
    expect(resolveSalesEventIds(events, "00010")).toEqual([17, 24, 107]);
    expect(formatEventoFilter([17, 24, 107])).toBe("(17,24,107)");
  });
});

describe("salesEventLabelsCovered", () => {
  const full = mapEventosListaPayload({
    value: [
      { EVENTO: 17, CODIGO: "S-03" },
      { EVENTO: 24, CODIGO: "S-10" },
      { EVENTO: 107, CODIGO: "S-X" },
      { EVENTO: 99, CODIGO: "S-114" },
    ],
  });

  it("true when DB has S-X / S-03 / S-10 for filial 00010", () => {
    expect(salesEventLabelsCovered(full, "00010")).toBe(true);
  });

  it("false when S-114 missing for filial 00114", () => {
    const partial = full.filter((e) => e.label !== "S-114");
    expect(salesEventLabelsCovered(partial, "00114")).toBe(false);
  });

  it("true for 00114 when S-114 present", () => {
    expect(salesEventLabelsCovered(full, "00114")).toBe(true);
  });
});

describe("eventCodeFromLabel", () => {
  it("takes first token uppercased", () => {
    expect(eventCodeFromLabel("S-10 Venda loja")).toBe("S-10");
    expect(eventCodeFromLabel("s-x")).toBe("S-X");
  });
});
