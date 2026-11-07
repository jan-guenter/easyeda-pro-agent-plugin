/** Explicit checkpoint assertion seam only; no production bypass. */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { test } from "node:test";
import { runInThisContext } from "node:vm";
import { transform } from "esbuild";
import { canonicalJson } from "../src/core.ts";
import { buildGeneratedSchematicRelevanceDisplayNativeArguments } from "../src/generated-schematic-relevance-display-source.ts";
import { data } from "./generated-schematic-relevance-display-fixture.ts";

void test("new argument issuer requires its original distinct checkpoint and preserves all six peers", async () => {
  const { args, history } = data(), prepared = Object.freeze({ qualification: { target: args.target }, history });
  const url = new URL("../src/generated-schematic-relevance-display-source.ts", import.meta.url); const sourceRequire = createRequire(url); const compiled = await transform(await readFile(url, "utf8"), { loader: "ts", format: "cjs", target: "node24" }); const loaded: { exports: Record<string, unknown> } = { exports: {} };
  const evaluate: unknown = runInThisContext(`(function(require,module,exports){${compiled.code}\n})`); assert.ok(typeof evaluate === "function");
  Reflect.apply(evaluate, undefined, [(name: string): unknown => { const actual: unknown = sourceRequire(name); if (name !== "./managed-schematic-relevance-fixture-open-checkpoint.ts") { return actual; } assert.ok(actual !== null && typeof actual === "object"); return { ...actual, assertOriginalGeneratedSchematicRelevanceFixtureOpenCheckpoint(value: unknown): void { assert.equal(value, prepared); } }; }, loaded, loaded.exports]);
  const build = loaded.exports["buildGeneratedSchematicRelevanceDisplayNativeArguments"], requireOriginal = loaded.exports["requireOriginalGeneratedSchematicRelevanceDisplayNativeArguments"]; assert.ok(typeof build === "function"); assert.ok(typeof requireOriginal === "function");
  const issued: unknown = Reflect.apply(build, undefined, [prepared, args.operation.operationId, { x: 25, bold: true }]); assert.equal(canonicalJson(issued), canonicalJson(args));
  Reflect.apply(requireOriginal, undefined, [issued, prepared]); assert.throws(() => Reflect.apply(requireOriginal, undefined, [structuredClone(issued), prepared])); assert.throws(() => Reflect.apply(build, undefined, [{ ...prepared }, args.operation.operationId, { x: 25 }]));
  assert.throws(() => Reflect.apply(buildGeneratedSchematicRelevanceDisplayNativeArguments, undefined, [prepared, args.operation.operationId, { x: 25 }]), /Original/u);
});
