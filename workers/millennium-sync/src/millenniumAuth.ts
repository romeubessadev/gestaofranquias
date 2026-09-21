/** Millennium login/logout for Node worker (ported from Edge _shared/millennium.ts). */

export type LoginReason = "password" | "busy" | "other";

function classify401(body: string): LoginReason {
  const t = body.toLowerCase();
  if (t.includes("senha inválida") || t.includes("senha invalida")) return "password";
  if (
    t.includes("ultrapassado o máximo") ||
    t.includes("ultrapassado o maximo") ||
    t.includes("máximo de sess") ||
    t.includes("maximo de sess") ||
    t.includes("já está conectado") ||
    t.includes("ja esta conectado")
  ) {
    return "busy";
  }
  return "other";
}

function extractSession(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") return null;
  const o = payload as Record<string, unknown>;
  for (const k of ["session", "Session", "SESSION", "token", "Token"]) {
    const v = o[k];
    if (typeof v === "string" && v.length > 0) return v;
  }
  if (o.data && typeof o.data === "object") return extractSession(o.data);
  return null;
}

export function millenniumBaseUrl(): string {
  return (process.env.MILLENNIUM_API_BASE ?? "http://177.85.160.35:6017/api").replace(/\/$/, "");
}

export async function loginMillennium(
  username: string,
  password: string,
): Promise<{ ok: true; session: string } | { ok: false; reason: LoginReason; raw: string }> {
  const url = `${millenniumBaseUrl()}/login?$format=json&$dateformat=iso`;
  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "WTS-Authorization": `${username}/${password}`,
        "WTS-AppName": "millenium",
        "WTS-LicenceType": "retag",
      },
      body: "{}",
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { ok: false, reason: "other", raw: msg };
  }

  const raw = await res.text();
  if (res.status === 401) return { ok: false, reason: classify401(raw), raw };
  if (!res.ok) return { ok: false, reason: "other", raw };

  let parsed: unknown = null;
  try {
    parsed = raw ? JSON.parse(raw) : null;
  } catch {
    /* plain */
  }
  const session =
    extractSession(parsed) ??
    (raw.trim().length > 0 && !raw.trim().startsWith("{") ? raw.trim() : null);
  if (!session) return { ok: false, reason: "other", raw: raw || "login sem session" };
  return { ok: true, session };
}

export async function logoutMillennium(session: string): Promise<void> {
  try {
    await fetch(`${millenniumBaseUrl()}/logout?$format=json&$dateformat=iso`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "WTS-Session": session,
      },
      body: "{}",
    });
  } catch {
    /* best-effort */
  }
}
