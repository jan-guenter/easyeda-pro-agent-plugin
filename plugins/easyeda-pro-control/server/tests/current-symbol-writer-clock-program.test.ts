/** Reuse the complete renderer fixture, running the actual fixed N0 compiler. */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { stripTypeScriptTypes } from "node:module";
import { test } from "node:test";
import { createContext, runInContext } from "node:vm";
import { isRecord } from "../src/core.ts";
import { buildCurrentSymbolWriterClockProgram, decodeCurrentSymbolWriterClockReply } from "../src/current-symbol-writer-clock-program.ts";

const target = { projectUuid: "a".repeat(64), branchUuid: "b".repeat(32), symbolUuid: "c".repeat(16), ownerUuid: "d".repeat(32) };
const expectedActor = { uuid: "1".repeat(32), username: "fixture-user", nickname: "Fixture" };
async function fixture(options: Record<string, unknown> = {}): Promise<{ run: () => Promise<unknown>; evaluate: (source: string) => unknown }> {
  const text = await readFile(new URL("current-symbol-write-program.test.ts", import.meta.url), "utf8");
  const prefix = text.slice(0, text.indexOf("\nvoid test(")); assert.ok(prefix.length > 0 && prefix.length < text.length);
  const source = stripTypeScriptTypes(prefix).replaceAll(/^import[\s\S]*?;\n/gmu, "");
  const scope = createContext({ assert, TextEncoder, createContext, runInContext, CURRENT_SYMBOL_WRITE_TIMEOUT_MS: 10_000,
    buildCurrentSymbolWriteProgram: (input: unknown): string => {
      assert.ok(isRecord(input)); return buildCurrentSymbolWriterClockProgram({ target: input["target"], expectedActor: input["expectedActor"] });
    },
  });
  const factory: unknown = runInContext(`${source}\nfixture;`, scope); assert.ok(typeof factory === "function");
  const instance: unknown = Reflect.apply(factory, undefined, [options]); assert.ok(isRecord(instance));
  const call = (name: string, args: unknown[]): unknown => { const method = instance[name]; assert.ok(typeof method === "function"); return Reflect.apply(method, instance, args) as unknown; };
  return { run: async (): Promise<unknown> => await call("run", []), evaluate: (program): unknown => call("evaluate", [program]) };
}
function reply(value: unknown): unknown { return { content: [], structuredContent: { ok: true, result: value } }; }

void test("writer N0 collector emits an exact original scalar bracket without project RPC, Save or mutation", async () => {
  const f = await fixture();
  const envelope = structuredClone(await f.run());
  const sample = decodeCurrentSymbolWriterClockReply(reply(envelope), { target, expectedActor });
  assert.equal(sample.notifyTabId, "1".repeat(16)); assert.equal(sample.rendererTimezoneOffsetMinutes, 0);
  assert.equal(sample.rendererBeforeMs <= sample.serverTimeMs && sample.serverTimeMs <= sample.rendererAfterMs, true);
  assert.equal(f.evaluate("calls.length"), 0); assert.equal(f.evaluate("writes"), 0); assert.equal(f.evaluate("clockCalls"), 1);
  assert.deepEqual(structuredClone(f.evaluate("forbidden")), []);
  assert.throws(() => decodeCurrentSymbolWriterClockReply(reply(envelope), { target: { ...target, symbolUuid: "f".repeat(16) }, expectedActor }));
});

void test("writer N0 collector refuses receiver, actor, clock, timezone and registry changes across its one await", async () => {
  for (const afterClock of ["gVars.concurrentBus=new ClockBus();", "Date.now=()=>tick++;", "Date.prototype.getTimezoneOffset=()=>60;",
    "gVars.loginedUserInfo={...gVars.loginedUserInfo};", "info.tabs=[...info.tabs];", "tick=0;", "return tick+20;", "return -0;"]) {
    const f = await fixture({ afterClock }); await assert.rejects(f.run(), /CURRENT_SYMBOL_WRITER_CLOCK_REFUSED/u);
    assert.equal(f.evaluate("writes"), 0); assert.equal(f.evaluate("calls.length"), 0); assert.equal(f.evaluate("clockCalls"), 1);
  }
});
