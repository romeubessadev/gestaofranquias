import { describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  addDaysYmd,
  fetchSalesLista,
  mapVendasListaPayload,
  milleniumDataRange,
  milleniumDayBoundIso,
  partitionRowsByFilial,
} from "./millenniumSales";

const __dirname = dirname(fileURLToPath(import.meta.url));
const fixture = JSON.parse(
  readFileSync(join(__dirname, "../fixtures/vendas-lista.sample.json"), "utf8"),
);

describe("mapVendasListaPayload", () => {
  it("maps fixture rows and keeps Millennium FILIAL", () => {
    const rows = mapVendasListaPayload(fixture, { storeId: "store-uuid-1" });
    expect(rows.length).toBe(5);
    expect(rows[0].revenueCents).toBe(189_90);
    expect(rows[0].millenniumFilial).toBe(1);
  });
});

describe("partitionRowsByFilial", () => {
  it("groups rows by FILIAL into WeDash storeIds", () => {
    const rows = mapVendasListaPayload(fixture, { storeId: "" });
    const map = new Map<number, { id: string }>([
      [1, { id: "wd-store-a" }],
      [2, { id: "wd-store-b" }],
    ]);
    const parts = partitionRowsByFilial(rows, map);
    expect(parts.size).toBe(2);
    expect(parts.get("wd-store-a")).toHaveLength(4);
    expect(parts.get("wd-store-b")).toHaveLength(1);
    expect(parts.get("wd-store-a")![0].storeId).toBe("wd-store-a");
    expect("millenniumFilial" in parts.get("wd-store-a")![0]).toBe(false);
  });
});

describe("milleniumDataRange", () => {
  it("DATAF is exclusive next local midnight (UI parity)", () => {
    expect(milleniumDayBoundIso("2026-09-21")).toBe("2026-09-21T04:00:00.000Z");
    expect(addDaysYmd("2026-09-21", 1)).toBe("2026-09-22");
    expect(milleniumDataRange("2026-09-21", "2026-09-21")).toEqual({
      datai: "2026-09-21T04:00:00.000Z",
      dataf: "2026-09-22T04:00:00.000Z",
    });
    expect(milleniumDataRange("2026-09-01", "2026-09-21").dataf).toBe("2026-09-22T04:00:00.000Z");
  });
});

describe("fetchSalesLista", () => {
  it("POSTs JSON body like browser curl (X-HTTP-Method: GET)", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => JSON.stringify(fixture),
    });

    const rows = await fetchSalesLista({
      session: "sess-1",
      millenniumStoreId: 8,
      storeId: "store-uuid-1",
      from: "2026-09-21",
      to: "2026-09-21",
      eventoIds: [107, 22, 24],
      baseUrl: "http://erp.test/api",
      fetchImpl: fetchMock as unknown as typeof fetch,
    });

    expect(rows).toHaveLength(5);
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("http://erp.test/api/millenium.VENDAS.Lista");
    expect(init.method).toBe("POST");
    expect((init.headers as Record<string, string>)["X-HTTP-Method"]).toBe("GET");
    expect((init.headers as Record<string, string>)["WTS-Session"]).toBe("sess-1");
    const body = JSON.parse(String(init.body));
    expect(body.FILIAL).toBe(8);
    expect(body.EVENTO).toBe("(107,22,24)");
    expect(body.DATAI).toBe("2026-09-21T04:00:00.000Z");
    expect(body.DATAF).toBe("2026-09-22T04:00:00.000Z");
  });

  it("allows FILIAL null for a single-day window", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => JSON.stringify(fixture),
    });

    const rows = await fetchSalesLista({
      session: "sess-1",
      millenniumStoreId: null,
      storeId: "",
      from: "2026-09-21",
      to: "2026-09-21",
      eventoIds: [17, 24],
      baseUrl: "http://erp.test/api",
      fetchImpl: fetchMock as unknown as typeof fetch,
    });

    expect(rows).toHaveLength(5);
    expect(rows[0].millenniumFilial).toBe(1);
    const body = JSON.parse(String(fetchMock.mock.calls[0][1].body));
    expect(body.FILIAL).toBeNull();
  });

  it("rejects FILIAL null for multi-day windows", async () => {
    await expect(
      fetchSalesLista({
        session: "s",
        millenniumStoreId: null,
        storeId: "",
        from: "2026-09-01",
        to: "2026-09-21",
        eventoIds: [17],
        baseUrl: "http://erp.test/api",
        fetchImpl: vi.fn() as unknown as typeof fetch,
      }),
    ).rejects.toThrow(/single-day/);
  });

  it("falls back when first POST returns 404", async () => {
    const fetchMock = vi.fn().mockImplementation(async (_url: string, init?: RequestInit) => {
      if (init?.method === "POST" && (init.headers as Record<string, string>)["X-HTTP-Method"] === "GET") {
        return { ok: false, status: 404, text: async () => "Not Found" };
      }
      if (init?.method === "POST") {
        return { ok: true, status: 200, text: async () => JSON.stringify(fixture) };
      }
      return { ok: false, status: 500, text: async () => "nope" };
    });

    const rows = await fetchSalesLista({
      session: "s",
      storeId: "x",
      millenniumStoreId: 8,
      from: "2026-09-01",
      to: "2026-09-01",
      eventoIds: [17],
      baseUrl: "http://erp.test/api",
      fetchImpl: fetchMock as unknown as typeof fetch,
    });
    expect(rows).toHaveLength(5);
    expect(fetchMock.mock.calls[1][1].method).toBe("POST");
    expect((fetchMock.mock.calls[1][1].headers as Record<string, string>)["X-HTTP-Method"]).toBeUndefined();
  });
});
