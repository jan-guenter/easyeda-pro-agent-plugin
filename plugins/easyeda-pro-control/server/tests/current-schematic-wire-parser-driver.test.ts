import assert from "node:assert/strict";
import { Session } from "node:inspector/promises";
import { test } from "node:test";
import { runInThisContext } from "node:vm";
import { Worker } from "node:worker_threads";
import { CURRENT_SCHEMATIC_WIRE_PARSER_HELPERS as SOURCE } from "../src/current-schematic-wire-parser-source.ts";
import { wireParserFixture } from "./helpers/current-schematic-wire-parser-fixture.ts";
import { INSTALLED_EASYEDA_SOURCE_SKIP_REASON, readConfiguredEasyedaAsset } from "./helpers/installed-easyeda-source.ts";

function object(value: unknown): object { assert.ok(value !== null && typeof value === "object"); return value; }
for (const [variant, mode] of [[0, "complete"], [1, "complete"], [0, "wrong-path"], [0, "rpc-error"], [0, "idle-tab"], [0, "foreign-caller"]] as const) {
  void test(`Wire owned parser event driver ${String(variant)} / ${mode}`, { timeout: 25_000 }, async context => {
    const source = await readConfiguredEasyedaAsset(SOURCE[variant].relativePath);
    if (source === null) { context.skip(INSTALLED_EASYEDA_SOURCE_SKIP_REASON); return; }
    const key = `__wireParserDriver${String(variant)}${mode.replaceAll("-", "_")}`; const url = `${key}.js`;
    const session = new Session(); session.connect(); await session.post("Debugger.enable");
    let scriptId = ""; session.on("Debugger.scriptParsed", event => { if (event.params.url === url) { scriptId = event.params.scriptId; } });
    const graph = object(runInThisContext(`${wireParserFixture(source, variant, mode)}\n//# sourceURL=${url}`));
    Object.defineProperty(globalThis, key, { value: graph, configurable: true }); assert.ok(scriptId.length > 0); session.disconnect();
    const done = Promise.withResolvers<unknown>();
    const worker = new Worker(new URL("helpers/current-schematic-wire-parser-driver-worker.ts", import.meta.url), {
      workerData: { key, scriptId, variant, source, mode },
    });
    context.after(async () => { Reflect.deleteProperty(globalThis, key); await worker.terminate(); });
    worker.on("error", done.reject); worker.on("message", (value: unknown) => {
      const message = object(value);
      if ("ready" in message) {
        const drive: unknown = Reflect.get(graph, "drive"); assert.ok(typeof drive === "function"); assert.equal(Reflect.apply(drive, graph, []), undefined);
      } else { done.resolve(value); }
    });
    const result = object(await done.promise); assert.ok(!("fixtureError" in result), JSON.stringify(result));
    if (mode === "complete") {
      assert.ok(!("error" in result), JSON.stringify(result));
      for (const name of ["sources", "removed", "released", "sameAst", "settled"]) { assert.equal(Reflect.get(result, name), true); }
      for (const [name, count] of [["pauses", 12], ["resumes", 12], ["sourceChecks", 22], ["normalRequests", 173], ["cleanupRequests", 13], ["attempts", 186], ["events", 46], ["promises", 6]] as const) {
        assert.equal(Reflect.get(result, name), count);
      }
      for (const name of ["nativeOwnerJoined", "originalWholeScriptOriginJoined", "parserCompleted", "saveAuthorized"]) { assert.equal(Reflect.get(result, name), false); }
      context.diagnostic(JSON.stringify(result));
    } else {
      assert.ok("error" in result, JSON.stringify(result)); assert.equal(Reflect.get(result, "failed"), true); assert.equal(Reflect.get(result, "firstCauseRetained"), true);
      assert.equal(Reflect.get(result, "sentResumes"), Reflect.get(result, "resumes"));
      if (mode === "foreign-caller") { assert.equal(Reflect.get(result, "resumes"), 0); assert.equal(Reflect.get(result, "normalRequests"), 12); }
    }
  });
}
