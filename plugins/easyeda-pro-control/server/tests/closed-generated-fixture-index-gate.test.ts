import assert from "node:assert/strict";
import { installIndexFixtureDependencies } from "./helpers/index-fixture-dependencies.ts";
import { readFile } from "node:fs/promises";
import { stripTypeScriptTypes } from "node:module";
import { test } from "node:test";
import { createContext, runInContext } from "node:vm";
import { SerializedGate } from "../src/engine.ts";

async function originalIndexGate(hasCustody: () => boolean): Promise<(task: () => Promise<unknown>, allowOwn?: boolean) => Promise<void>> {
  const source = await readFile(new URL("../src/index.ts", import.meta.url), "utf8");
  const start = source.indexOf("function runFacadeGate<T>");
  const end = source.indexOf("const facadeSession =", start);
  assert.ok(start > 0 && end > start);
  const context = createContext({ bridgeGate: new SerializedGate(), hasClosedGeneratedDataCustody: hasCustody });
  installIndexFixtureDependencies(context,source);
  runInContext(stripTypeScriptTypes(source.slice(start, end)), context);
  const raw: unknown = context["runFacadeGate"]; assert.ok(typeof raw === "function");
  return async (task, allowOwn): Promise<void> => {
    const pending: unknown = Reflect.apply(raw, undefined, [task, allowOwn]);
    assert.ok(pending instanceof Promise); await pending;
  };
}

void test("original gate rechecks exclusive data custody for already-queued work", async () => {
  let calls = 0, retained = false;
  const run = await originalIndexGate((): boolean => retained);
  const entered = Promise.withResolvers<null>(), release = Promise.withResolvers<null>();
  const first = run(async () => { entered.resolve(null); await release.promise; });
  await entered.promise;
  const count = (): Promise<unknown> => { calls += 1; return Promise.resolve(); };
  const queued = run(count);
  retained = true; release.resolve(null); await first;
  await assert.rejects(queued, /reserves this serialized workflow/u); assert.equal(calls, 0);
  await run(count, true); assert.equal(calls, 1);
  retained = false; await run(count); assert.equal(calls, 2);
});

void test("changed custody observer refuses the queued callback without entering it", async () => {
  let called = false;
  const run = await originalIndexGate((): never => { throw new Error("Original observer changed"); });
  await assert.rejects(run((): Promise<unknown> => { called = true; return Promise.resolve(); }), /Original observer changed/u); assert.equal(called, false);
});
