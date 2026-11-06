/** Production reader with only the complete builtin byte qualifier substituted.
 * Synthetic inspector packets grant no native/receiver/source ownership. */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { runInThisContext } from "node:vm";
import { transform } from "esbuild";
import { CURRENT_SELECTED_FILE_MAIN_FETCH_SOURCE as SOURCE } from "../../src/current-selected-file-main-fetch-source.ts";
import type { CurrentSelectedFileMainRequestReader } from "../../src/current-selected-file-main-request-reader.ts";
import type { CurrentSelectedFileMainSqlFenceCommand as Command } from "../../src/current-selected-file-main-sql-fence-protocol.ts";

const fakeSource = "x".repeat(SOURCE.bytes), sourceToken = Object.freeze({ syntheticBytesOnly: true });
export async function selectedRequestReaderConstructor(): Promise<typeof CurrentSelectedFileMainRequestReader> {
  const url = new URL("../../src/current-selected-file-main-request-reader.ts", import.meta.url); const actualRequire = createRequire(url);
  const compiled = await transform(await readFile(url, "utf8"), { loader: "ts", format: "cjs", target: "node24" }); const loaded: { exports: Record<string, unknown> } = { exports: {} };
  const evaluate: unknown = runInThisContext(`(function(require,module,exports){${compiled.code}\n})`); assert.ok(typeof evaluate === "function");
  Reflect.apply(evaluate, undefined, [(name: string): unknown => {
    const actual: unknown = actualRequire(name); if (name !== "./current-selected-file-main-fetch-source.ts") { return actual; }
    assert.ok(actual !== null && typeof actual === "object"); return { ...actual,
      qualifyCurrentSelectedFileMainFetchSource: (source: unknown): object => { assert.equal(source, fakeSource); return sourceToken; },
      requireOriginalCurrentSelectedFileMainFetchSource: (token: unknown): void => { assert.equal(token, sourceToken); } };
  }, loaded, loaded.exports]);
  const Constructor = loaded.exports["CurrentSelectedFileMainRequestReader"]; assert.ok(typeof Constructor === "function");
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Production constructor checked above; only the explicit non-authority source byte seam is replaced.
  return Constructor as typeof CurrentSelectedFileMainRequestReader;
}
type Bag = Record<string, unknown>;
const prop = (name: string, value: Bag): Bag => ({ name, value, isOwn: true, writable: false, configurable: true, enumerable: true });
const object = (objectId: string): Bag => ({ type: "object", objectId });
const fn = (objectId: string): Bag => ({ type: "function", objectId });
const array = (objectId: string, length: number): Bag => ({ result: { type: "object", subtype: "array", className: "Array", description: `Array(${String(length)})`, objectId } });
function metadata(role: "method" | "Request" | "brand" | "fetch", scriptId: string, delta: number): Bag {
  const row = role === "fetch" ? SOURCE.wrappers.fetch : SOURCE[role];
  return { result: [{ ...prop("name", { type: "string", value: row.name }), enumerable: false }, { ...prop("length", { type: "number", value: row.arity }), enumerable: false }],
    internalProperties: [{ name: "[[FunctionLocation]]", value: { type: "object", subtype: "internal#location", value: { scriptId, lineNumber: row.lineNumber, columnNumber: row.columnNumber + delta } } },
      { name: "[[Scopes]]", value: { type: "object", subtype: "internal#scopeList", className: "Array", objectId: role === "method" ? "getter-scopes" : "brand-scopes" } }] };
}
const scope = (objectId: string, description: string): Bag => ({ type: "object", subtype: "internal#scope", description, objectId });

export function selectedRequestPeer(command: Command, request: Readonly<{ method: string; url: string; delta?: number }>): unknown {
  if (command.phase === "sql-fence-driver-frame") { return array("request-frame", 7); }
  if (command.phase === "sql-fence-request-capture") { return array("request-capture", 9); }
  if (command.phase === "sql-fence-request-bind" || command.phase === "sql-fence-request-rebind") { return array("request-bound", 7); }
  if (command.phase === "sql-fence-fetch-source") { return { scriptSource: fakeSource }; }
  if (command.phase === "sql-fence-request-read") { return { result: { type: "object", value: { schema: "private.selected-file-main-request.v1", mode: "fetch", method: request.method, pureUrl: request.url, pureQuery: "", pathHeader: "f".repeat(64),
    originalRequestVerified: true, readonlySql: false, executionAuthorized: false, saveAuthorized: false } } }; }
  assert.equal(command.phase, "sql-fence-properties"); assert.ok("objectId" in command.params); const id = command.params.objectId;
  if (id === "request-capture") { return { result: [prop("5", fn("request-constructor")), prop("6", fn("request-getter")), prop("7", { type: "string", value: "fetch" })] }; }
  if (id === "request-frame") { return { result: [prop("5", fn("fetch-wrapper"))] }; }
  if (id === "request-getter") { return metadata("method", "builtin-fetch", request.delta ?? 0); }
  if (id === "request-constructor") { return metadata("Request", "builtin-fetch", 0); }
  if (id === "fetch-wrapper") { return metadata("fetch", "app", 0); }
  if (id === "brand") { return metadata("brand", "builtin-fetch", 0); }
  if (id === "getter-scopes") { return { result: [prop("0", scope("request-block", "Block (lib/web/fetch/request.js)")), prop("1", scope("request-closure", "Closure (lib/web/fetch/request.js)"))] }; }
  if (id === "request-block") { return { result: [prop("_Request", fn("request-constructor-scope"))] }; }
  if (id === "request-closure") { return { result: [prop("webidl", object("webidl"))] }; }
  if (id === "webidl") { return { result: [prop("brandCheck", fn("brand"))] }; }
  if (id === "brand-scopes") { return { result: [prop("0", scope("brand-closure", "Closure (lib/web/webidl/index.js)"))] }; }
  if (id === "brand-closure") { return { result: [prop("FunctionPrototypeSymbolHasInstance", fn("native-has-instance"))] }; }
  throw new Error(`Unexpected synthetic request property ${id}`);
}
