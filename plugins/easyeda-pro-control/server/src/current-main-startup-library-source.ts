/** Static derivation from the complete pinned main bundle. Acorn decodes data;
 * no vendor function, SQL statement or library definition is executed here. */
import { createHash } from "node:crypto";
import { parseExpressionAt } from "acorn";
import { CURRENT_MAIN_STARTUP_LIBRARY_CHUNKS as CHUNKS, CURRENT_MAIN_STARTUP_LIBRARY_SOURCE as SOURCE } from "./current-main-startup-library-catalog.ts";
import { qualifyCurrentMainStartupConfigSource } from "./current-main-startup-config-sql.ts";

function need(value: boolean): asserts value { if (!value) { throw new Error("MAIN_STARTUP_LIBRARY_SOURCE"); } }
function hash(value: string): string { return createHash("sha256").update(value).digest("hex"); }
function location(source: string, start: number): readonly [number, number] {
  return [source.slice(0, start).split("\n").length - 1, start - source.lastIndexOf("\n", start - 1) - 1];
}
function template(source: string, start: number, end: number): string {
  const node = parseExpressionAt(source, start, { ecmaVersion: "latest" });
  need(node.type === "TemplateLiteral" && node.expressions.length === 0 && node.quasis.length === 1 && node.end === end);
  const value = node.quasis[0]?.value.cooked; need(typeof value === "string" && value.isWellFormed()); return value;
}
/** Check the actual JL body and the only three bindings captured at its English
 * call. Provider aliases from other closures must never enter this expression. */
export function assertCurrentMainStartupLibraryInvocationSource(input: unknown): void {
  const row = SOURCE.sourceRows.JL; need(typeof input === "string" && Buffer.byteLength(input) === row.bytes && hash(input) === row.sha256);
  const fn = parseExpressionAt(input, 0, { ecmaVersion: "latest" });
  need(fn.type === "FunctionExpression" && fn.async && !fn.generator && fn.id?.name === "JL" && fn.end === input.length &&
    fn.params.length === 1 && fn.params[0]?.type === "Identifier" && fn.params[0].name === "t" && fn.body.body.length === 1);
  const returned = fn.body.body[0]; need(returned?.type === "ReturnStatement" && returned.argument?.type === "SequenceExpression" && returned.argument.expressions.length === 2);
  const branch = returned.argument.expressions[0], receiver = returned.argument.expressions[1];
  need(branch?.type === "ConditionalExpression" && branch.test.type === "Identifier" && branch.test.name === "W0" &&
    receiver?.type === "Identifier" && receiver.name === "t" && branch.alternate.type === "AwaitExpression");
  const call = branch.alternate.argument;
  need(call.type === "CallExpression" && call.callee.type === "MemberExpression" && !call.callee.computed &&
    call.callee.object.type === "Identifier" && call.callee.object.name === "t" && call.callee.property.type === "Identifier" &&
    call.callee.property.name === "runScripts" && call.arguments.length === 1 && call.arguments[0]?.type === "Identifier" && call.arguments[0].name === "yE");
  const frame = parseExpressionAt(SOURCE.invocation.frameExpression, 0, { ecmaVersion: "latest" });
  need(frame.type === "ArrayExpression" && frame.elements.length === 3);
  for (const [index, name] of ["t", "W0", "yE"].entries()) {
    const binding = frame.elements[index]; need(binding?.type === "Identifier" && binding.name === name);
  }
}
/** Every source offset is a UTF16 offset, with zero-based inspector locations.
 * Chunk source spans cover raw template contents, excluding blank separators.
 * Their hashes and lengths describe the decoded strings passed to dbWrap.run. */
export function qualifyCurrentMainStartupLibrarySource(input: unknown): Readonly<{
  schema: "private.current-main-startup-library-source.v1"; chunkCount: 332;
  englishOnly: true; sourceQualified: true; runtimeBound: false; executionAuthorized: false;
}> {
  qualifyCurrentMainStartupConfigSource(input); need(typeof input === "string");
  for (const row of [...Object.values(SOURCE.sourceRows), ...SOURCE.callers]) {
    const value = input.slice(row.start, row.end), [line, column] = location(input, row.start);
    need(Buffer.byteLength(value) === row.bytes && hash(value) === row.sha256 && line === row.lineNumber && column === row.columnNumber);
  }
  assertCurrentMainStartupLibraryInvocationSource(input.slice(SOURCE.sourceRows.JL.start, SOURCE.sourceRows.JL.end));
  const declaration = SOURCE.sourceRows.yE; need(input.slice(declaration.start, declaration.start + 3) === "yE=");
  const script = template(input, declaration.start + 3, declaration.end);
  need(script.length === SOURCE.script.utf16 && Buffer.byteLength(script) === SOURCE.script.bytes && hash(script) === SOURCE.script.sha256);
  const chunks = script.replaceAll(/^--.*$/gu, "").split(/\r?\n\r?\n/mu).filter(chunk => !/^\s*$/u.test(chunk));
  need(chunks.length === SOURCE.script.chunkCount && CHUNKS.length === SOURCE.script.chunkCount);
  for (const row of CHUNKS) {
    const chunk = chunks[row.index], [line, column] = location(input, row.start);
    need(typeof chunk === "string" && chunk.length === row.utf16 && Buffer.byteLength(chunk) === row.bytes && hash(chunk) === row.sha256 && line === row.lineNumber && column === row.columnNumber);
    const raw = input.slice(row.start, row.end); const encoded = `\`${raw}\``;
    need(template(encoded, 0, encoded.length) === chunk);
  }
  return Object.freeze({ schema: "private.current-main-startup-library-source.v1", chunkCount: 332, englishOnly: true,
    sourceQualified: true, runtimeBound: false, executionAuthorized: false });
}
