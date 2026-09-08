import { describe, expect, it } from "vitest";
import { metaDaFilial } from "./metas";

// Smoke test provando que o runner Vitest resolve o alias `@` e importa módulos de domínio.
describe("smoke", () => {
  it("lê uma meta mockada da camada de domínio", () => {
    const meta = metaDaFilial("f1", "2026-09");
    expect(meta?.valorLoja).toBe(185000);
  });
});