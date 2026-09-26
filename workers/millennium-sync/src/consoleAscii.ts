/**
 * Saída do worker no terminal só em ASCII: o console do Windows nem sempre está em UTF-8 e
 * acentos/símbolos viram "�". Os logs gravados no banco (sync_log) não passam por aqui.
 */
const SYMBOLS: Record<string, string> = {
  "·": "|",
  "→": "->",
  "←": "<-",
  "…": "...",
  "─": "-",
  "—": "-",
  "–": "-",
  "▶": ">",
  "✓": "OK",
  "✗": "ERRO",
  "⚠": "AVISO",
  "⏱": "",
  "×": "x",
  "‖": "||",
  "•": "-",
  "↗": "+",
  "↘": "-",
  "≈": "~",
  "“": '"',
  "”": '"',
  "‘": "'",
  "’": "'",
  "\u00a0": " ",
  "\u202f": " ",
};

export function toAscii(text: string): string {
  return text
    .replace(/[^\x00-\x7f]/g, (ch) => SYMBOLS[ch] ?? ch)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\x00-\x7f]/g, "");
}

function asciiArg(arg: unknown): unknown {
  if (typeof arg === "string") return toAscii(arg);
  if (arg instanceof Error) return toAscii(arg.stack ?? arg.message);
  return arg;
}

export function installAsciiConsole(): void {
  for (const method of ["log", "info", "warn", "error"] as const) {
    const original = console[method].bind(console);
    console[method] = (...args: unknown[]) => original(...args.map(asciiArg));
  }
}
