/** Test-only module substitution. No production origin issuer is changed. */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { runInThisContext } from "node:vm";
import { transform } from "esbuild";

export async function loadSyntheticRegistryModule(url: URL, override: (name: string, actual: object) => unknown): Promise<Record<string, unknown>> {
  const sourceRequire = createRequire(url); const compiled = await transform(await readFile(url, "utf8"), { loader: "ts", format: "cjs", target: "node24", logLevel: "silent" });
  const loaded: { exports: Record<string, unknown> } = { exports: {} }; const evaluate: unknown = runInThisContext(`(function(require,module,exports){${compiled.code}\n})`); assert.ok(typeof evaluate === "function");
  Reflect.apply(evaluate, undefined, [(name: string): unknown => { const actual: unknown = sourceRequire(name); assert.ok(actual !== null && typeof actual === "object"); return override(name, actual); }, loaded, loaded.exports]);
  return loaded.exports;
}
