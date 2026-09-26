import { describe, expect, it } from "vitest";
import { beginSyncLog, endSyncLog, sanitizeLogMessage, syncLog } from "./syncLog.ts";

describe("sanitizeLogMessage", () => {
  it("mascara sessão, senha, bearer e query string", () => {
    const out = sanitizeLogMessage(
      'WTS-Session: abc123 {"password":"segredo"} Bearer eyJ.x.y GET https://erp.x/api/millenium/vendas/lista?$session=zzz&filial=1',
    );
    expect(out).not.toContain("abc123");
    expect(out).not.toContain("segredo");
    expect(out).not.toContain("eyJ");
    expect(out).not.toContain("zzz");
    expect(out).toContain("https://erp.x/api/millenium/vendas/lista?…");
  });

  it("não mexe em texto comum com a palavra sessão", () => {
    expect(sanitizeLogMessage("Sessão Millennium inválida (401) em 2026-09-01")).toBe(
      "Sessão Millennium inválida (401) em 2026-09-01",
    );
  });
});

describe("syncLog", () => {
  it("é no-op fora de job", () => {
    syncLog("WARN", "cmv", "x");
    expect(endSyncLog()).toEqual([]);
  });

  it("agrega repetição por origem + loja + mensagem em count/days", () => {
    beginSyncLog({ tenantId: "t", jobId: "j", jobKind: "FORCE" });
    const store = { id: "s1", code: "00010" };
    syncLog("WARN", "categorias", "sem permissão", { store, day: "2026-09-01" });
    syncLog("WARN", "categorias", "sem permissão", { store, day: "2026-09-02" });
    syncLog("WARN", "categorias", "sem permissão", { store: { id: "s2", code: "00020" }, day: "2026-09-01" });
    syncLog("ERROR", "job", "caiu");
    const rows = endSyncLog();
    expect(rows).toHaveLength(3);
    expect(rows[0]).toMatchObject({
      tenantId: "t",
      jobId: "j",
      jobKind: "FORCE",
      storeId: "s1",
      storeLabel: "00010",
      day: "2026-09-01",
      detail: { count: 2, days: ["2026-09-01", "2026-09-02"] },
    });
    expect(rows[2]).toMatchObject({ level: "ERROR", source: "job", storeId: null });
    expect(rows[0].detail?.worker).toMatchObject({ version: expect.any(String) });
    expect(endSyncLog()).toEqual([]);
  });

  it("grava stack só em ERROR, relativo ao worker e sanitizado", () => {
    beginSyncLog({ tenantId: "t", jobId: "j", jobKind: "FORCE" });
    const err = new Error("falhou token=abc123");
    err.stack =
      "Error: falhou token=abc123\n    at run (file:///C:/x/workers/millennium-sync/src/runSyncJob.ts:10:5)";
    syncLog("ERROR", "job", "caiu", { error: err });
    syncLog("WARN", "cmv", "aviso", { error: err });
    const [erro, aviso] = endSyncLog();
    expect(erro.detail?.stack).toBe("Error: falhou token=***\n    at run (src/runSyncJob.ts:10:5)");
    expect(aviso.detail?.stack).toBeUndefined();
  });
});
