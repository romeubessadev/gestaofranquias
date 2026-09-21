import { describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { fetchSalesLista, mapVendasListaPayload } from "./millenniumSales";

const __dirname = dirname(fileURLToPath(import.meta.url));
const fixture = JSON.parse(
  readFileSync(join(__dirname, "../fixtures/vendas-lista.sample.json"), "utf8"),
);

describe("mapVendasListaPayload", () => {
  it("maps fixture-shaped VENDAS.Lista rows to SaleRow (cents + DATA_H)", () => {
    const rows = mapVendasListaPayload(fixture, { storeId: "store-uuid-1" });
    expect(rows.length).toBe(5);
    expect(rows[0]).toMatchObject({
      operationCode: "OP-1001",
      storeId: "store-uuid-1",
      revenueCents: 189_90,
      itemQty: 2,
    });
    expect(rows[0].occurredAt.toISOString()).toBe("2026-09-18T15:30:00.000Z");
    expect(rows[1].operationCode).toBe("OP-1001");
    expect(rows[1].revenueCents).toBe(89_90);
  });

  it("skips rows without COD_OPERACAO or DATA_H", () => {
    const rows = mapVendasListaPayload(
      {
        value: [
          { COD_OPERACAO: "X", DATA_H: "2026-09-18T12:00:00.000Z", VALOR_FINAL: 10, QUANTIDADE: 1 },
          { DATA_H: "2026-09-18T12:00:00.000Z", VALOR_FINAL: 10 },
          { COD_OPERACAO: "Y", VALOR_FINAL: 10 },
        ],
      },
      { storeId: "s1" },
    );
    expect(rows).toHaveLength(1);
    expect(rows[0].operationCode).toBe("X");
  });
});

describe("fetchSalesLista", () => {
  it("calls VENDAS.Lista with session and maps response", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => JSON.stringify(fixture),
    });

    const rows = await fetchSalesLista(
      {
        session: "sess-1",
        millenniumStoreId: 1,
        storeId: "store-uuid-1",
        from: "2026-09-18",
        to: "2026-09-19",
        baseUrl: "http://erp.test/api",
        fetchImpl: fetchMock as unknown as typeof fetch,
      },
    );

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toContain("VENDAS.Lista");
    expect(url).toContain("FILIAL=1");
    expect((init.headers as Record<string, string>)["WTS-Session"]).toBe("sess-1");
    expect(rows[0].operationCode).toBe("OP-1001");
    expect(rows).toHaveLength(5);
  });
});
