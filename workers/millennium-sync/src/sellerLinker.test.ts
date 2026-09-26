import { beforeEach, describe, expect, it, vi } from "vitest";
import type { SalesSellerDayAgg } from "../../../src/data/wedash/salesTypes.ts";
import type { ErpSeller } from "./millenniumSellers.ts";
import {
  createSellerLinker,
  mergeNameKeys,
  resetSellerLinkerMemory,
  resolveSellerKey,
  type KnownSeller,
  type SellerLinkerDeps,
} from "./sellerLinker.ts";

const STORE = { id: "s1", code: "00010", millenniumStoreId: 8 };
const NOW = new Date("2026-09-24T12:00:00Z");

function row(sellerKey: string, day = "2026-09-24", sellerGeradorId?: number): SalesSellerDayAgg {
  return {
    tenantId: "t1",
    storeId: STORE.id,
    day,
    sellerKey,
    sellerName: sellerKey,
    ...(sellerGeradorId != null ? { sellerGeradorId } : {}),
    brand: "ALL",
    revenueCents: 1000,
    salesCount: 1,
  };
}

function erp(employeeId: number, name: string, geradorId: number | null = null): ErpSeller {
  const flags = { desativado: false, inativo: false, afastado: false, naoMostrarNoEvento: false };
  return { employeeId, code: String(employeeId), name, login: null, role: "VENDEDOR", active: true, flags, geradorId };
}

function setup(opts: { known: KnownSeller[]; erpList?: ErpSeller[]; fetchError?: Error }) {
  const logs: string[] = [];
  const deps: SellerLinkerDeps = {
    loadSellerDirectory: vi.fn().mockResolvedValue({ sellers: opts.known }),
    fetchStoreSellers: opts.fetchError
      ? vi.fn().mockRejectedValue(opts.fetchError)
      : vi.fn().mockResolvedValue(opts.erpList ?? []),
    syncStoreSellers: vi.fn().mockImplementation(async (args: { sellers: ErpSeller[] }) =>
      args.sellers.map((s) => ({
        storeId: STORE.id,
        employeeId: s.employeeId,
        nameKeys: mergeNameKeys([], s.name),
        geradorId: s.geradorId,
      })),
    ),
  };
  const link = createSellerLinker({
    deps,
    tenantId: "t1",
    getSession: () => "sess",
    now: () => NOW,
    log: (_level, message) => logs.push(message),
    isSessionDead: (m) => m.includes("401"),
  });
  return { deps, link, logs };
}

beforeEach(() => resetSellerLinkerMemory());

describe("resolveSellerKey", () => {
  const sellers: KnownSeller[] = [
    { storeId: "s1", employeeId: 1, nameKeys: ["ANA SILVA", "ANA SOUZA"] },
    { storeId: "s2", employeeId: 2, nameKeys: ["BIA"] },
    { storeId: "s1", employeeId: 3, nameKeys: ["CARLA"] },
    { storeId: "s1", employeeId: 4, nameKeys: ["CARLA"] },
  ];

  it("resolve pelo nome atual ou antigo", () => {
    expect(resolveSellerKey(sellers, "s1", "ANA SOUZA")).toEqual({ employeeId: 1 });
    expect(resolveSellerKey(sellers, "s1", "ANA SILVA")).toEqual({ employeeId: 1 });
  });

  it("acha vendedora de outra loja do tenant", () => {
    expect(resolveSellerKey(sellers, "s1", "BIA")).toEqual({ employeeId: 2 });
  });

  it("homônimas na mesma loja = ambíguo; desconhecido = null", () => {
    expect(resolveSellerKey(sellers, "s1", "CARLA")).toEqual({ ambiguous: true });
    expect(resolveSellerKey(sellers, "s1", "ZELIA")).toBeNull();
  });
});

describe("mergeNameKeys", () => {
  it("acrescenta o nome novo normalizado sem perder o antigo", () => {
    expect(mergeNameKeys(["ANA SILVA"], "Ana  Souza")).toEqual(["ANA SILVA", "ANA SOUZA"]);
    expect(mergeNameKeys(["EMILLY VICTORIA"], "Emilly Victória")).toEqual(["EMILLY VICTORIA"]);
  });
});

describe("createSellerLinker", () => {
  it("nome conhecido → não chama o ERP (sem sincronização por tempo)", async () => {
    const { deps, link } = setup({
      known: [{ storeId: "s1", employeeId: 10, nameKeys: ["PAMELA"] }],
    });
    const out = await link(STORE, [row("PAMELA")]);
    expect(out[0]!.sellerEmployeeId).toBe(10);
    await link(STORE, []);
    expect(deps.fetchStoreSellers).not.toHaveBeenCalled();
  });

  it("nome novo → sincroniza a loja 1× e resolve", async () => {
    const { deps, link } = setup({
      known: [{ storeId: "s1", employeeId: 10, nameKeys: ["PAMELA"] }],
      erpList: [erp(10, "PAMELA"), erp(11, "STEFANI")],
    });
    const out = await link(STORE, [row("PAMELA"), row("STEFANI")]);
    expect(out.map((r) => r.sellerEmployeeId)).toEqual([10, 11]);
    await link(STORE, [row("STEFANI", "2026-09-23")]);
    expect(deps.fetchStoreSellers).toHaveBeenCalledTimes(1);
  });

  it("gerador conhecido resolve mesmo com o nome trocado no ERP", async () => {
    const { deps, link } = setup({
      known: [{ storeId: "s1", employeeId: 61643, nameKeys: ["CLARA ALESSANDRA"], geradorId: 66161 }],
    });
    const out = await link(STORE, [row("CLARA SILVA", "2026-09-24", 66161)]);
    expect(out[0]!.sellerEmployeeId).toBe(61643);
    expect(deps.fetchStoreSellers).not.toHaveBeenCalled();
  });

  it("gerador novo → sincroniza consultando só quem ainda não tem gerador salvo", async () => {
    const { deps, link } = setup({
      known: [
        { storeId: "s1", employeeId: 10, nameKeys: ["PAMELA"], geradorId: 500, role: "VENDEDOR" },
        { storeId: "s1", employeeId: 11, nameKeys: ["STEFANI"], geradorId: null },
      ],
      erpList: [erp(10, "PAMELA", 500), erp(11, "STEFANI", 501), erp(12, "NOVA", 502)],
    });
    const out = await link(STORE, [row("NOVA", "2026-09-24", 502)]);
    expect(out[0]!.sellerEmployeeId).toBe(12);
    const call = (deps.fetchStoreSellers as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect([...call.known]).toEqual([[10, "VENDEDOR"]]);
  });

  it("gerador sem cadastro mas nome conhecido → resolve pelo nome, sem aviso", async () => {
    const { link, logs } = setup({
      known: [{ storeId: "s1", employeeId: 10, nameKeys: ["PAMELA"], geradorId: null }],
      erpList: [erp(10, "PAMELA", null)],
    });
    const out = await link(STORE, [row("PAMELA", "2026-09-24", 777)]);
    expect(out[0]!.sellerEmployeeId).toBe(10);
    expect(logs).toHaveLength(0);
  });

  it("syncStore (carga inicial) sincroniza sem precisar de venda", async () => {
    const { deps, link } = setup({ known: [], erpList: [erp(10, "PAMELA", 500)] });
    await link.syncStore(STORE);
    await link(STORE, [row("PAMELA", "2026-09-24", 500)]);
    expect(deps.fetchStoreSellers).toHaveBeenCalledTimes(1);
  });

  it("continua sem cadastro → fica só pelo nome, avisa 1× e não re-sincroniza no próximo job", async () => {
    const first = setup({ known: [], erpList: [erp(10, "PAMELA")] });
    const out = await first.link(STORE, [row("GERENTE X")]);
    expect(out[0]!.sellerEmployeeId).toBeNull();
    expect(first.logs).toHaveLength(1);
    expect(first.logs[0]).toContain("não está no cadastro");

    const second = setup({ known: [{ storeId: "s1", employeeId: 10, nameKeys: ["PAMELA"] }] });
    await second.link(STORE, [row("GERENTE X")]);
    expect(second.deps.fetchStoreSellers).not.toHaveBeenCalled();
    expect(second.logs).toHaveLength(0);
  });

  it("falha do ERP → vendas seguem só pelo nome, sem aviso de cadastro", async () => {
    const { link, logs } = setup({ known: [], fetchError: new Error("timeout") });
    const out = await link(STORE, [row("PAMELA")]);
    expect(out[0]!.sellerEmployeeId).toBeNull();
    expect(logs).toEqual(["Equipe de vendas (FUNCIONARIOS.Lista/Consulta) falhou: timeout"]);
  });

  it("sessão morta (401) propaga", async () => {
    const { link } = setup({ known: [], fetchError: new Error("Lista → 401") });
    await expect(link(STORE, [row("PAMELA")])).rejects.toThrow("401");
  });
});
