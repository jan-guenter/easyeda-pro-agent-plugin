/** Run the fixed PCB N0 program against the complete PCB renderer fixture. */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { stripTypeScriptTypes } from "node:module";
import { test } from "node:test";
import { createContext, runInContext } from "node:vm";
import { isRecord } from "../src/core.ts";
import { buildCurrentPcbRenameWriterClockProgram, decodeCurrentPcbRenameWriterClockReply } from "../src/current-pcb-rename-writer-clock-program.ts";
import { PCB_PROGRAM_ACTOR, PCB_PROGRAM_TARGET, pcbProgramPreparation } from "./helpers/current-pcb-rename-program-fixture.ts";

const request = { target: PCB_PROGRAM_TARGET, expectedActor: PCB_PROGRAM_ACTOR };
type Prepared = Awaited<ReturnType<typeof pcbProgramPreparation>>;
async function fixture(prepared: Prepared, options: Record<string, unknown> = {}): Promise<{ run: () => Promise<unknown>; evaluate: (source: string) => unknown; expire: () => void }> {
  const text = await readFile(new URL("current-pcb-rename-program.test.ts", import.meta.url), "utf8");
  const prefix = text.slice(0, text.indexOf("\nvoid test(")); assert.ok(prefix.length > 0 && prefix.length < text.length);
  const source = stripTypeScriptTypes(prefix).replaceAll(/^import[\s\S]*?;\n/gmu, "");
  const scope = createContext({ assert, TextEncoder, createContext, runInContext, PCB_PROGRAM_TARGET, PCB_PROGRAM_ACTOR, CURRENT_PCB_RENAME_TIMEOUT_MS: 10_000,
    buildCurrentPcbRenameProgram: (): string => buildCurrentPcbRenameWriterClockProgram(request) });
  const factory: unknown = runInContext(`${source}\nfixture;`, scope); assert.ok(typeof factory === "function");
  const instance: unknown = Reflect.apply(factory, undefined, [prepared, options]); assert.ok(isRecord(instance));
  const call = (name: string, args: unknown[]): unknown => { const method = instance[name]; assert.ok(typeof method === "function"); return Reflect.apply(method, instance, args) as unknown; };
  return { run: async (): Promise<unknown> => await call("run", []), evaluate: program => call("evaluate", [program]), expire: (): void => { call("expire", []); } };
}
function reply(value: unknown): unknown { return { content: [], structuredContent: { ok: true, result: value } }; }

void test("PCB N0 records one dual-actor renderer bracket with no project RPC, mutation or Save", async () => {
  const f = await fixture(await pcbProgramPreparation()); const envelope = structuredClone(await f.run());
  const sample = decodeCurrentPcbRenameWriterClockReply(reply(envelope), request);
  assert.equal(sample.notifyTabId, "1".repeat(16)); assert.equal(sample.rendererTimezoneOffsetMinutes, 0); assert.ok(Object.isFrozen(sample));
  assert.equal(sample.rendererBeforeMs <= sample.serverTimeMs && sample.serverTimeMs <= sample.rendererAfterMs, true);
  assert.equal(f.evaluate("calls.length"), 0); assert.equal(f.evaluate("writes"), 0); assert.equal(f.evaluate("clockCalls"), 1);
  assert.deepEqual(structuredClone(f.evaluate("forbidden")), []);
  assert.throws(() => decodeCurrentPcbRenameWriterClockReply(reply(envelope), { ...request, target: { ...request.target, pcbUuid: "f".repeat(32) } }));
  assert.throws(() => decodeCurrentPcbRenameWriterClockReply(reply(envelope), { ...request, expectedActor: { ...request.expectedActor, username: "other" } }));
});

void test("PCB N0 refuses unexpected target fields/getters, unsettled AST and auxiliary panels before reading the clock", async () => {
  let getterRead = false;
  const getter = Object.defineProperty({ ...request.target }, "pcbUuid", { get() { getterRead = true; return request.target.pcbUuid; } });
  for (const input of [{ ...request, code: "write()" }, { ...request, target: { ...request.target, symbolUuid: request.target.pcbUuid } },
    { ...request, target: getter }, { ...request, target: { ...request.target, pcbUuid: "invalid" } }]) { assert.throws(() => buildCurrentPcbRenameWriterClockProgram(input)); }
  assert.equal(getterRead, false);
  const prepared = await pcbProgramPreparation();
  for (const setup of ["astManager.batchDepth=1;", "temp.transId++;", "standardPanels.push({});", "standardMarkers.push({});", "gVars.loginedUserInfo.uuid='f'.repeat(32);"]) {
    const f = await fixture(prepared, { setup }); await assert.rejects(f.run(), /CURRENT_PCB_RENAME_WRITER_CLOCK_REFUSED/u);
    assert.equal(f.evaluate("writes"), 0); assert.equal(f.evaluate("calls.length"), 0); assert.equal(f.evaluate("clockCalls"), 0);
  }
});

void test("PCB N0 preserves clock, actors, project and settled holders across its one await and expires without retry", async () => {
  const prepared = await pcbProgramPreparation();
  for (const afterClock of ["gVars.concurrentBus=new ClockBus();", "Date.now=()=>tick++;", "Date.prototype.getTimezoneOffset=()=>60;",
    "gVars.loginedUserInfo={...gVars.loginedUserInfo};", "info.tabs=[...info.tabs];", "ast.transId++;", "standardPanels.push({});", "standardMarkers.push({});",
    "tick=0;", "return tick+20;", "return -0;"]) {
    const f = await fixture(prepared, { afterClock }); await assert.rejects(f.run(), /CURRENT_PCB_RENAME_WRITER_CLOCK_REFUSED/u);
    assert.equal(f.evaluate("writes"), 0); assert.equal(f.evaluate("calls.length"), 0); assert.equal(f.evaluate("clockCalls"), 1);
  }
  const pending = await fixture(prepared, { afterClock: "await new Promise(resolve=>{globalThis.releaseClock=resolve;});" });
  const result = pending.run(); await Promise.resolve(); pending.expire(); await assert.rejects(result, /CURRENT_PCB_RENAME_WRITER_CLOCK_REFUSED/u);
  pending.evaluate("releaseClock();"); await Promise.resolve(); assert.equal(pending.evaluate("clockCalls"), 1); assert.equal(pending.evaluate("writes"), 0);
});
