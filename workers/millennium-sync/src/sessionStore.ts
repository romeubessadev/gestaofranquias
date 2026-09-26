/**
 * Persiste o token WTS-Session no disco do worker.
 * Se o processo morrer sem logout, o próximo boot ainda consegue encerrar a sessão órfã.
 * Em Vitest: só memória (não lê/grava o arquivo real).
 */
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const STORE_PATH = resolve(__dirname, "../.millennium-sessions.json");
const useMemory = process.env.VITEST === "true" || process.env.NODE_ENV === "test";

type Store = Record<string, string>;
let memoryStore: Store = {};

function readStore(): Store {
  if (useMemory) return { ...memoryStore };
  try {
    if (!existsSync(STORE_PATH)) return {};
    const raw = readFileSync(STORE_PATH, "utf8");
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return {};
    const out: Store = {};
    for (const [k, v] of Object.entries(parsed as Record<string, unknown>)) {
      if (typeof v === "string" && v.length > 0) out[k] = v;
    }
    return out;
  } catch {
    return {};
  }
}

function writeStore(store: Store): void {
  if (useMemory) {
    memoryStore = { ...store };
    return;
  }
  try {
    mkdirSync(dirname(STORE_PATH), { recursive: true });
    writeFileSync(STORE_PATH, JSON.stringify(store, null, 2), "utf8");
  } catch (e) {
    console.warn("Não foi possível gravar sessão Millennium local:", e instanceof Error ? e.message : e);
  }
}

export function rememberMillenniumSession(credentialId: string, session: string): void {
  const store = readStore();
  store[credentialId] = session;
  writeStore(store);
}

export function forgetMillenniumSession(credentialId: string): void {
  const store = readStore();
  if (!(credentialId in store)) return;
  delete store[credentialId];
  writeStore(store);
}

export function listRememberedSessions(): Array<{ credentialId: string; session: string }> {
  return Object.entries(readStore()).map(([credentialId, session]) => ({ credentialId, session }));
}

/** Encerra todas as sessões lembradas (boot / liberar busy). */
export async function logoutRememberedSessions(
  logout: (session: string) => Promise<void>,
): Promise<number> {
  const entries = listRememberedSessions();
  if (entries.length === 0) return 0;
  let n = 0;
  for (const { credentialId, session } of entries) {
    try {
      await logout(session);
      n += 1;
      console.log(`Logout sessão órfã · credencial ${credentialId.slice(0, 8)}…`);
    } catch (e) {
      console.warn(
        `Falha ao logout órfã ${credentialId.slice(0, 8)}…:`,
        e instanceof Error ? e.message : e,
      );
    }
    forgetMillenniumSession(credentialId);
  }
  return n;
}
