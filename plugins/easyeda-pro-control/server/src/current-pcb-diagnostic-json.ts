/** Duplicate-aware bounded JSON decoder shared by transport and fixed result
 * readers. It imports no protocol or generated program. */
function framingError(): Error { return new Error("PCB_DIAGNOSTIC_PIPE_FRAMING"); }
export function decodeCurrentPcbDiagnosticJson(bytes: Buffer): unknown {
  const text = new TextDecoder("utf-8", { fatal: true, ignoreBOM: true }).decode(bytes);
  const nesting: (Set<string> | null)[] = [];
  for (let offset = 0; offset < text.length; offset += 1) {
    const character = text[offset];
    if (character === "{" || character === "[") {
      if (nesting.length >= 64) { throw framingError(); }
      nesting.push(character === "{" ? new Set() : null);
    } else if (character === "}" || character === "]") { nesting.pop(); }
    else if (character === '"') {
      const start = offset; offset += 1;
      while (offset < text.length && text[offset] !== '"') {
        if (text[offset] === "\\") { offset += 1; }
        offset += 1;
      }
      let following = offset + 1;
      while (following < text.length && [" ", "\t", "\n", "\r"].includes(text[following] ?? "")) { following += 1; }
      if (text[following] === ":") {
        const keys = nesting.at(-1); const key: unknown = JSON.parse(text.slice(start, offset + 1));
        if (keys === null || keys === undefined || typeof key !== "string" || keys.has(key)) { throw framingError(); }
        keys.add(key);
      }
    }
  }
  const parsed: unknown = JSON.parse(text, (_key: string, value: unknown): unknown => {
    if (typeof value === "number" && !Number.isFinite(value)) { throw framingError(); }
    return value;
  });
  return parsed;
}
