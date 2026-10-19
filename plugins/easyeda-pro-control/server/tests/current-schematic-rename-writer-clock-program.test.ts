/** Run the fixed SCH N0 program against the complete SCH renderer fixture. */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { stripTypeScriptTypes } from "node:module";
import { test } from "node:test";
import { createContext, runInContext } from "node:vm";
import { isRecord } from "../src/core.ts";
import { buildCurrentSchematicRenameWriterClockProgram, decodeCurrentSchematicRenameWriterClockReply } from "../src/current-schematic-rename-writer-clock-program.ts";
import { ACTOR as SCH_PROGRAM_ACTOR, TARGET as SCH_PROGRAM_TARGET, schematicBaseline } from "./helpers/current-schematic-rename-observer-fixture.ts";
import { prepareCurrentSchematicChildRoster } from "../src/current-schematic-child-roster.ts";

async function prepare(): Promise<Awaited<ReturnType<typeof schematicBaseline>> & { roster: Awaited<ReturnType<typeof prepareCurrentSchematicChildRoster>> }> {
  const baseline = await schematicBaseline();
  return { ...baseline, roster: await prepareCurrentSchematicChildRoster(baseline.metadata, baseline.before) };
}
type Prepared = Awaited<ReturnType<typeof prepare>>;
function request(prepared: Prepared): unknown { return { target: SCH_PROGRAM_TARGET, expectedActor: SCH_PROGRAM_ACTOR, startup: prepared.roster.startupInput }; }
async function fixture(prepared: Prepared, options: Record<string, unknown> = {}): Promise<{ run: () => Promise<unknown>; evaluate: (source: string) => unknown; expire: () => void }> {
  const text = await readFile(new URL("current-schematic-rename-program.test.ts", import.meta.url), "utf8");
  const prefix = text.slice(0, text.indexOf("\nvoid test(")); assert.ok(prefix.length > 0 && prefix.length < text.length);
  const source = stripTypeScriptTypes(prefix).replaceAll(/^import[\s\S]*?;\n/gmu, "");
  const scope = createContext({ assert, TextEncoder, structuredClone, createContext, runInContext, SCH_PROGRAM_TARGET, SCH_PROGRAM_ACTOR, CURRENT_SCHEMATIC_RENAME_TIMEOUT_MS: 10_000,
    buildCurrentSchematicRenameProgram: (): string => buildCurrentSchematicRenameWriterClockProgram(request(prepared)) });
  const factory: unknown = runInContext(`${source}\nfixture;`, scope); assert.ok(typeof factory === "function");
  const instance: unknown = Reflect.apply(factory, undefined, [prepared, options]); assert.ok(isRecord(instance));
  const call = (name: string, args: unknown[]): unknown => { const method = instance[name]; assert.ok(typeof method === "function"); return Reflect.apply(method, instance, args) as unknown; };
  return { run: async (): Promise<unknown> => await call("run", []), evaluate: program => call("evaluate", [program]), expire: (): void => { call("expire", []); } };
}
function reply(value: unknown): unknown { return { content: [], structuredContent: { ok: true, result: value } }; }

void test("SCH N0 records one dual-actor renderer bracket with no project RPC, mutation or Save", async () => {
  const prepared = await prepare(), selected = request(prepared); assert.ok(isRecord(selected));
  const f = await fixture(prepared); const envelope = structuredClone(await f.run());
  const sample = decodeCurrentSchematicRenameWriterClockReply(reply(envelope), selected);
  assert.equal(sample.notifyTabId, "1".repeat(16)); assert.equal(sample.rendererTimezoneOffsetMinutes, 0); assert.ok(Object.isFrozen(sample));
  assert.equal(sample.rendererBeforeMs <= sample.serverTimeMs && sample.serverTimeMs <= sample.rendererAfterMs, true);
  assert.equal(f.evaluate("calls.length"), 0); assert.equal(f.evaluate("writes"), 0); assert.equal(f.evaluate("clockCalls"), 1);
  assert.deepEqual(structuredClone(f.evaluate("forbidden")), []);
  assert.throws(() => decodeCurrentSchematicRenameWriterClockReply(reply(envelope), { ...selected, target: { ...SCH_PROGRAM_TARGET, schematicUuid: "f".repeat(32) } }));
  assert.throws(() => decodeCurrentSchematicRenameWriterClockReply(reply(envelope), { ...selected, expectedActor: { ...SCH_PROGRAM_ACTOR, username: "other" } }));
  assert.throws(() => decodeCurrentSchematicRenameWriterClockReply(reply(envelope), { ...selected, startup: { sheetUuids: ["f".repeat(16)], templates: [] } }));
});

void test("SCH N0 refuses unexpected target fields/getters, unsettled AST and auxiliary panels before reading the clock", async () => {
  const prepared = await prepare(), selected = request(prepared); assert.ok(isRecord(selected));
  let getterRead = false;
  const getter = Object.defineProperty({ ...SCH_PROGRAM_TARGET }, "schematicUuid", { get() { getterRead = true; return SCH_PROGRAM_TARGET.schematicUuid; } });
  for (const input of [{ ...selected, code: "write()" }, { ...selected, target: { ...SCH_PROGRAM_TARGET, symbolUuid: SCH_PROGRAM_TARGET.schematicUuid } },
    { ...selected, target: getter }, { ...selected, target: { ...SCH_PROGRAM_TARGET, schematicUuid: "invalid" } }]) { assert.throws(() => buildCurrentSchematicRenameWriterClockProgram(input)); }
  assert.equal(getterRead, false);
  for (const setup of ["astManager.batchDepth=1;", "temp.transId++;", "standardPanels.push({});", "standardMarkers.push({});", "astSch.sort=[];", "gVars.loginedUserInfo.uuid='f'.repeat(32);"]) {
    const f = await fixture(prepared, { setup }); await assert.rejects(f.run(), /CURRENT_SCH_RENAME_WRITER_CLOCK_REFUSED/u);
    assert.equal(f.evaluate("writes"), 0); assert.equal(f.evaluate("calls.length"), 0); assert.equal(f.evaluate("clockCalls"), 0);
  }
});

void test("SCH N0 preserves clock, actors, project and settled holders across its one await and expires without retry", async () => {
  const prepared = await prepare();
  for (const afterClock of ["gVars.concurrentBus=new ClockBus();", "Date.now=()=>tick++;", "Date.prototype.getTimezoneOffset=()=>60;",
    "gVars.loginedUserInfo={...gVars.loginedUserInfo};", "info.tabs=[...info.tabs];", "ast.transId++;", "standardPanels.push({});", "standardMarkers.push({});",
    "tick=0;", "return tick+20;", "return -0;"]) {
    const f = await fixture(prepared, { afterClock }); await assert.rejects(f.run(), /CURRENT_SCH_RENAME_WRITER_CLOCK_REFUSED/u);
    assert.equal(f.evaluate("writes"), 0); assert.equal(f.evaluate("calls.length"), 0); assert.equal(f.evaluate("clockCalls"), 1);
  }
  const pending = await fixture(prepared, { afterClock: "await new Promise(resolve=>{globalThis.releaseClock=resolve;});" });
  const result = pending.run(); await Promise.resolve(); pending.expire(); await assert.rejects(result, /CURRENT_SCH_RENAME_WRITER_CLOCK_REFUSED/u);
  pending.evaluate("releaseClock();"); await Promise.resolve(); assert.equal(pending.evaluate("clockCalls"), 1); assert.equal(pending.evaluate("writes"), 0);
});

