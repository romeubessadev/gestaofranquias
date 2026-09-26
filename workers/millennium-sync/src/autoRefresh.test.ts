import { describe, expect, it } from "vitest";
import {
  localClock,
  nextAutoRefreshAt,
  parseStoreHours,
  pendingDays,
  planAutoRound,
  recoveryFloor,
  storePhase,
  type AutoStore,
} from "./autoRefresh.ts";

const TZ = "America/Campo_Grande"; // UTC−4
/** Horário local em Campo Grande → Date. */
const at = (isoLocal: string) => new Date(`${isoLocal}-04:00`);

const weekdays = parseStoreHours({
  "0": null,
  "1": { open: "10:00", close: "22:00" },
  "2": { open: "10:00", close: "22:00" },
  "3": { open: "10:00", close: "22:00" },
  "4": { open: "10:00", close: "22:00" },
  "5": { open: "10:00", close: "22:00" },
  "6": { open: "10:00", close: "22:00" },
});

describe("parseStoreHours", () => {
  it("sem horário = 10h–22h todos os dias; null = fechado", () => {
    expect(parseStoreHours(null)[0]).toEqual({ open: "10:00", close: "22:00" });
    expect(weekdays[0]).toBeNull();
  });
});

describe("localClock", () => {
  it("dia, dia da semana e minuto no fuso", () => {
    // 2026-09-25 é sexta.
    expect(localClock(at("2026-09-25T13:45:00"), TZ)).toEqual({ day: "2026-09-25", dow: 5, minutes: 13 * 60 + 45 });
  });
});

describe("storePhase", () => {
  it("antes, aberta, fechou há < 30 min, fechamento devido, fechada", () => {
    expect(storePhase(weekdays, at("2026-09-25T09:59:00"), TZ)).toBe("before");
    expect(storePhase(weekdays, at("2026-09-25T10:00:00"), TZ)).toBe("open");
    expect(storePhase(weekdays, at("2026-09-25T22:10:00"), TZ)).toBe("wrapup");
    expect(storePhase(weekdays, at("2026-09-25T22:30:00"), TZ)).toBe("closeDue");
    expect(storePhase(weekdays, at("2026-09-27T12:00:00"), TZ)).toBe("closed"); // domingo
  });
});

describe("pendingDays", () => {
  it("dias entre o último fechado e hoje, no máx. 3, do mais antigo", () => {
    expect(pendingDays("2026-09-24", "2026-09-25")).toEqual([]);
    expect(pendingDays("2026-09-20", "2026-09-25")).toEqual(["2026-09-21", "2026-09-22", "2026-09-23"]);
  });
  it("sem base = nada; chão = dia 1 do mês anterior", () => {
    expect(pendingDays(null, "2026-09-25")).toEqual([]);
    expect(recoveryFloor("2026-01-10")).toBe("2025-12-01");
    expect(pendingDays("2026-05-01", "2026-09-25", 1)).toEqual(["2026-08-01"]);
  });
});

describe("planAutoRound", () => {
  const store = (id: string, lastClosedDay: string | null = null): AutoStore => ({
    id,
    timezone: TZ,
    hours: weekdays,
    lastClosedDay,
  });

  it("loja aberta entra quando o intervalo venceu", () => {
    const now = at("2026-09-25T14:00:00");
    expect(planAutoRound({ stores: [store("a")], now, intervalMin: 30, lastAutoAt: null })).toEqual({
      storeIds: ["a"],
      closeStoreIds: [],
    });
    expect(
      planAutoRound({ stores: [store("a")], now, intervalMin: 30, lastAutoAt: at("2026-09-25T13:40:00") }),
    ).toBeNull();
  });

  it("rodada perdida (desconectado) → todas as lojas abertas assim que voltar", () => {
    expect(
      planAutoRound({
        stores: [store("a"), store("b")],
        now: at("2026-09-25T15:26:00"),
        intervalMin: 30,
        lastAutoAt: at("2026-09-25T14:52:00"),
      }),
    ).toEqual({ storeIds: ["a", "b"], closeStoreIds: [] });
  });

  it("fechamento + 30 min fecha o dia (uma vez)", () => {
    const now = at("2026-09-25T22:35:00");
    expect(
      planAutoRound({
        stores: [store("a", "2026-09-24")],
        now,
        intervalMin: 30,
        lastAutoAt: at("2026-09-25T22:00:00"),
      }),
    ).toEqual({ storeIds: ["a"], closeStoreIds: ["a"] });
    expect(planAutoRound({ stores: [store("a", "2026-09-25")], now, intervalMin: 30, lastAutoAt: null })).toBeNull();
  });

  it("fora do expediente não roda", () => {
    expect(
      planAutoRound({
        stores: [store("a", "2026-09-24")],
        now: at("2026-09-25T08:00:00"),
        intervalMin: 15,
        lastAutoAt: null,
      }),
    ).toBeNull();
  });
});

describe("nextAutoRefreshAt", () => {
  const s = { timezone: TZ, hours: weekdays };
  const next = (now: string, lastAutoAt: string | null) =>
    nextAutoRefreshAt({ stores: [s], now: at(now), intervalMin: 30, lastAutoAt: lastAutoAt ? at(lastAutoAt) : null });
  it("aberta: última rodada automática + intervalo; atrasada = agora", () => {
    expect(next("2026-09-25T14:10:00", "2026-09-25T14:00:00")).toEqual(at("2026-09-25T14:30:00"));
    expect(next("2026-09-25T15:26:00", "2026-09-25T14:52:00")).toEqual(at("2026-09-25T15:26:00"));
  });
  it("intervalo passa do fechamento → rodada de fechamento (fechamento + 30 min)", () => {
    expect(next("2026-09-25T21:50:00", "2026-09-25T21:45:00")).toEqual(at("2026-09-25T22:30:00"));
    expect(next("2026-09-25T22:10:00", null)).toEqual(at("2026-09-25T22:30:00"));
  });
  it("depois do fechamento + 30 min / fechada = sem próxima", () => {
    expect(next("2026-09-25T22:40:00", null)).toBeNull();
    expect(next("2026-09-27T12:00:00", null)).toBeNull();
  });
});
