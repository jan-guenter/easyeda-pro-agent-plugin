/** Remove generated C# indentation without changing strings, comments or
 * token boundaries. Line breaks remain exact, including inside verbatim text.
 * This is build-time size packing, not a runtime source transformation. */
export function compactGeneratedCSharpIndentation(source: string): string {
  let state: "code" | "string" | "character" | "verbatim" | "line-comment" | "block-comment" = "code";
  let lineStart = true, output = "";
  for (let index = 0; index < source.length; index += 1) {
    const char = source[index], next = source[index + 1];
    // oxlint-disable-next-line eslint/no-continue -- Skip only leading layout bytes; literal/comment bytes always reach the state machine.
    if (lineStart && state === "code" && (char === " " || char === "\t")) { continue; }
    output += char;
    lineStart = char === "\n";
    if (state === "code") {
      if (char === "@" && next === '"') { output += next; index += 1; state = "verbatim"; }
      else if (char === '"') { state = "string"; }
      else if (char === "'") { state = "character"; }
      else if (char === "/" && (next === "/" || next === "*")) { output += next; index += 1; state = next === "/" ? "line-comment" : "block-comment"; }
    } else if (state === "line-comment") {
      if (char === "\n") { state = "code"; }
    } else if (state === "block-comment") {
      if (char === "*" && next === "/") { output += next; index += 1; state = "code"; }
    } else if (state === "verbatim") {
      if (char === '"') {
        if (next === '"') { output += next; index += 1; }
        else { state = "code"; }
      }
    } else if (char === "\\") {
      if (next === undefined) { throw new Error("Generated C# escape is incomplete"); }
      output += next; index += 1;
    } else if (char === (state === "string" ? '"' : "'")) { state = "code"; }
  }
  if (state !== "code" && state !== "line-comment") { throw new Error("Generated C# literal or comment is incomplete"); }
  return output;
}
