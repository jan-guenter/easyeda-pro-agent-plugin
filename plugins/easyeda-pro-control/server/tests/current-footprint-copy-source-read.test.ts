/** Synthetic owned VM objects and SQLite inventories only. No EasyEDA or live
 * profile access, native bridge admission or writer support is established. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { createContext, runInContext } from "node:vm";
import type { Context } from "node:vm";
import { z } from "zod";
import { expectedCurrentFootprintCopySource, prepareCurrentFootprintCopyAppendPlan } from "../src/current-footprint-copy-append.ts";
import { prepareCurrentFootprintCopyPlan } from "../src/current-footprint-copy-plan.ts";
import { currentFootprintCopyStatePacketSchema } from "../src/current-footprint-copy-state.ts";
import { CURRENT_FOOTPRINT_COPY_SOURCE_READ_FUNCTION, CURRENT_FOOTPRINT_COPY_SOURCE_READ_LIMITS,
  captureCurrentFootprintCopySourceReadReply, decodeCurrentFootprintCopySourceRead } from "../src/current-footprint-copy-source-read.ts";
import type { CurrentFootprintCopySourceReadRequest } from "../src/current-footprint-copy-source-read.ts";
import { CurrentFootprintCopySourceReadRunner } from "../src/current-footprint-copy-source-read-runner.ts";
import type { CurrentFootprintCopySourceReadTransport } from "../src/current-footprint-copy-source-read-runner.ts";
import { IDS, encrypted, fixture, inventory, mutate } from "./helpers/symbol-sql-fixture.ts";

const PROJECT = "1".repeat(64);
const IDENTITY = Object.freeze({ projectUuid: PROJECT, branchUuid: IDS.branch, windowTabId: "synthetic-window" });
const CLIENT = "a".repeat(16);
const REQUEST = Object.freeze({ identity: IDENTITY, footprintUuid: IDS.target, client: CLIENT, maximumTicket: 100 });
const STATE = currentFootprintCopyStatePacketSchema.parse({ profile: "private.current-footprint-copy-state.v1", identity: IDENTITY,
  client: CLIENT, maximumTicket: 100, capturedUser: "own-undefined", samples: 2, originalConstructorManagerMatched: true,
  atomicSnapshotVerified: false, cacheBranchObserved: false, executionAuthorized: false, persistenceVerified: false });
const SETUP = `globalThis.calls=0;globalThis.traps=0;globalThis.after=async()=>{};
class zy{};class Vc extends zy{constructor(){super();this.client=${JSON.stringify(CLIENT)};this.maxTicket=100;}getMaxTicket(){return this.maxTicket;}}
class ja extends Vc{};class Pi{constructor(project){this.projectManager=project;this.client=project.consistencyManager.client;this.user=undefined;}get maxTicket(){return this.projectManager.consistencyManager.getMaxTicket();}}
class ar extends Pi{constructor(project){super(project);this.data={};}}
class Tg extends ar{async getStr(){calls++;await after();return{success:true,result:sourceContent};}}
class Gd{};class Lg extends Gd{getCanvasByConsistency(){return Promise.resolve("");}compress(){return Promise.resolve("");}}
globalThis.originalProject=new Lg;globalThis.originalBus={};globalThis.originalConsistency=new ja;
Object.assign(originalProject,{uuid:${JSON.stringify(PROJECT)},_branchUuid:${JSON.stringify(IDS.branch)},workerBus:originalBus,consistencyManager:originalConsistency});
globalThis.originalFootprint=new Tg(originalProject);originalProject.footprint=originalFootprint;
originalFootprint.data[${JSON.stringify(IDS.target)}]={ticket:90,title:"Source",description:"Keep",tags:[],source:"",version:"100",updateTime:100};
globalThis.PROJECT=originalProject;globalThis._TAB_ID_=${JSON.stringify(IDENTITY.windowTabId)};
globalThis.selected=${JSON.stringify(REQUEST)};globalThis.originalConstructors=[Tg,ar,Pi,ja,Vc,zy];
globalThis.originalMethods=[Tg.prototype.getStr,Object.getOwnPropertyDescriptor(Pi.prototype,"maxTicket").get,Vc.prototype.getMaxTicket,Lg.prototype.getCanvasByConsistency,Lg.prototype.compress];`;
const EXPRESSION = `(${CURRENT_FOOTPRINT_COPY_SOURCE_READ_FUNCTION}).call(originalFootprint,originalProject,originalBus,originalConsistency,selected,originalConstructors,originalMethods)`;
function context(content = "synthetic native bytes"): Context {
  const result = createContext({ setTimeout, clearTimeout, TextEncoder, sourceContent: content }); runInContext(SETUP, result); return result;
}
async function reply(vm: Context): Promise<unknown> {
  const value: unknown = await runInContext(EXPRESSION, vm); return { result: { type: "string", value } };
}
function stateReply(patch: Readonly<Record<string, unknown>> = {}): unknown {
  return { result: { type: "string", value: JSON.stringify({ schema: "easyeda-pro-control.current-footprint-copy-state.v1",
    identity: IDENTITY, client: CLIENT, maximumTicket: 100, capturedUser: "own-undefined", ...patch }) } };
}
function sourceReply(content: string, patch: Readonly<Record<string, unknown>> = {}): unknown {
  return { result: { type: "string", value: JSON.stringify({ schema: "easyeda-pro-control.current-footprint-copy-source-read.v1",
    ...REQUEST, capturedUser: "own-undefined", content, cacheEffectsPossible: true, executionAuthorized: false, persistenceVerified: false, ...patch }) } };
}
async function appendPlan(): Promise<Awaited<ReturnType<typeof prepareCurrentFootprintCopyAppendPlan>>> {
  const original = await fixture({ project: PROJECT, branch: IDS.branch, target: IDS.target });
  const raw = [`${JSON.stringify({ type: "EDIT_HEAD" })}||${JSON.stringify({ uuid: IDS.actor, username: "synthetic", nickname: "", updateTime: 100 })}`,
    `${JSON.stringify({ type: "DOCHEAD", ticket: 100 })}||${JSON.stringify({ docType: "FOOTPRINT", client: CLIENT, uuid: IDS.target,
      updateTime: 100, version: "100", editVersion: "3.2.209", user: { uuid: IDS.actor, username: "synthetic", nickname: "" } })}`,
    '{"type":"META","ticket":90,"id":"META"}||{"title":"Source","description":"Keep","tags":[],"source":""}',
    '{"type":"CANVAS","ticket":2,"id":"canvas"}||{"originX":0}',
    '{"type":"PAD","ticket":3,"id":"0a123456789bcdef"}||{"number":"1"}'].join("|\n");
  mutate(original.path, `UPDATE history_data SET dataStr='${encrypted(raw, IDS.oldHead, IDS.oldKey)}' WHERE uuid='${IDS.oldHead}'`);
  const before = await inventory(original.path), copy = await prepareCurrentFootprintCopyPlan(before,
    { projectUuid: PROJECT, branchUuid: IDS.branch, footprintUuid: IDS.target });
  return prepareCurrentFootprintCopyAppendPlan(before, copy);
}

void test("footprint fixed async getter checks retained receiver relations and decodes exact source bytes", async () => {
  const vm = context(); const sample = decodeCurrentFootprintCopySourceRead(await reply(vm));
  assert.equal(sample.content, "synthetic native bytes"); assert.deepEqual(sample.identity, IDENTITY);
  assert.equal(sample.cacheEffectsPossible, true); assert.equal(sample.executionAuthorized, false);
  assert.equal(runInContext("calls", vm) as unknown, 1); assert.equal(runInContext("traps", vm) as unknown, 0);
});

void test("footprint async getter refuses substituted owners, accessors and shadow methods before native invocation", async () => {
  for (const change of ["PROJECT={...originalProject}", "originalProject.footprint=new Tg(originalProject)",
    "originalProject.consistencyManager=new ja", "originalProject.workerBus={}", "originalFootprint.user={uuid:'user'}",
    "delete originalFootprint.user", "originalConsistency.maxTicket++", "originalFootprint.client='b'.repeat(16)",
    "Object.defineProperty(originalFootprint,'user',{get(){traps++;return undefined;}})",
    "originalFootprint.getStr=async()=>{traps++;return{success:true,result:'wrong'};}",
    "Object.defineProperty(originalFootprint,'maxTicket',{get(){traps++;return 100;}})",
    "Object.defineProperty(originalFootprint.data[selected.footprintUuid],'title',{get(){traps++;return 'Source';}})",
    "Object.setPrototypeOf(originalConsistency,{...Object.getPrototypeOf(originalConsistency)})",
    "originalConstructors[0]=class Tg extends ar{}", "originalConstructors.reverse()",
    "Object.defineProperty(originalConstructors,'0',{get(){traps++;return Tg;}})",
    "Object.setPrototypeOf(originalFootprint,(class Tg extends ar{}).prototype)",
    "Tg.prototype.getStr=async()=>{traps++;return{success:true,result:'wrong'};}",
    "Vc.prototype.getMaxTicket=()=>{traps++;return 100;}", "originalMethods.reverse()",
    "Object.defineProperty(Pi.prototype,'maxTicket',{get(){traps++;return 100;}})",
    "Lg.prototype.compress=()=>{traps++;return Promise.resolve('wrong');}"]) {
    const vm = context(); runInContext(change, vm);
    await assert.rejects(reply(vm), /CURRENT_FOOTPRINT_COPY_SOURCE_READ_REFUSED/u);
    assert.equal(runInContext("calls", vm) as unknown, 0, change); assert.equal(runInContext("traps", vm) as unknown, 0, change);
  }
});

void test("footprint async getter rechecks descriptor and prototype bindings after its native await", async () => {
  for (const change of ["PROJECT={...originalProject}", "originalProject.footprint=new Tg(originalProject)",
    "originalConsistency.maxTicket++", "originalFootprint.data[selected.footprintUuid].title='Changed'",
    "Tg.prototype.getStr=async()=>({success:true,result:'wrong'})", "originalProject.workerBus={}",
    "Object.defineProperty(originalFootprint,'user',{value:undefined,enumerable:false})",
    "originalConstructors[0]=class Tg extends ar{}", "Object.setPrototypeOf(originalFootprint,(class Tg extends ar{}).prototype)",
    "originalMethods[0]=async()=>({success:true,result:'wrong'})"]) {
    const vm = context(); runInContext(`after=async()=>{${change};}`, vm);
    await assert.rejects(reply(vm), /CURRENT_FOOTPRINT_COPY_SOURCE_READ_REFUSED/u);
    assert.equal(runInContext("calls", vm) as unknown, 1, change);
  }
});

void test("footprint getter timeout consumes its native call and late completion supplies no result", async () => {
  const vm = context(); runInContext("globalThis.complete=null;after=()=>new Promise(resolve=>{complete=resolve;});globalThis.deadline=null;setTimeout=(callback,ms)=>{if(ms!==8000)throw Error('wrong deadline');deadline=callback;return 1;};clearTimeout=()=>{};", vm);
  const pending = reply(vm); runInContext("deadline()", vm);
  await assert.rejects(pending, /CURRENT_FOOTPRINT_COPY_SOURCE_READ_DEADLINE/u);
  runInContext("complete()", vm); await Promise.resolve(); await Promise.resolve();
  assert.equal(runInContext("calls", vm) as unknown, 1);
});

void test("footprint source decoder rejects oversized text, malformed replies and elevated claims", () => {
  const large = "x".repeat(20_000); assert.equal(decodeCurrentFootprintCopySourceRead(sourceReply(large)).content, large);
  for (const raw of [sourceReply("ok", { executionAuthorized: true }), sourceReply("ok", { extra: true }),
    sourceReply("ok", { maximumTicket: -1 }), sourceReply("ok", { client: `${CLIENT}\n` }), sourceReply("\uD800"),
    sourceReply("Ω".repeat(CURRENT_FOOTPRINT_COPY_SOURCE_READ_LIMITS.contentBytes)),
    { result: { type: "string", value: "{invalid}" } }, { result: { type: "string", value: "{}" }, exceptionDetails: {} }]) {
    assert.throws(() => decodeCurrentFootprintCopySourceRead(raw));
  }
  let traps = 0;
  for (const hostile of [new Proxy({}, { ownKeys: (): string[] => { traps += 1; return []; } }),
    { get result(): unknown { traps += 1; return {}; } }, { result: { type: "string", get value(): string { traps += 1; return "{}"; } } }]) {
    assert.throws(() => captureCurrentFootprintCopySourceReadReply(hostile), /CAPTURE/u);
  }
  assert.equal(traps, 0);
});

async function runnerFixture(patch?: (raw: unknown, phase: "state" | "source", index: number) => unknown): Promise<Readonly<{
  runner: CurrentFootprintCopySourceReadRunner; transport: CurrentFootprintCopySourceReadTransport;
  calls: string[]; expire: () => void; revive: () => void; expected: string;
}>> {
  const plan = await appendPlan(); const expected = expectedCurrentFootprintCopySource(plan, CLIENT, "before-create"), vm = context(expected);
  const calls: string[] = []; let current = true;
  const transport: CurrentFootprintCopySourceReadTransport = {
    assertOriginalState: async (state): Promise<void> => { await Promise.resolve(); assert.equal(state, STATE, "original state required"); assert.ok(current, "owner lost"); },
    observeState: async (): Promise<unknown> => {
      calls.push("state"); await Promise.resolve(); return patch === undefined ? stateReply() : patch(stateReply(), "state", calls.length);
    },
    readSource: async (request: CurrentFootprintCopySourceReadRequest): Promise<unknown> => {
      calls.push("source"); assert.deepEqual(request, REQUEST); const raw = await reply(vm);
      return patch === undefined ? raw : patch(raw, "source", calls.length);
    },
  };
  return { runner: new CurrentFootprintCopySourceReadRunner(transport, STATE, plan), transport, calls, expected,
    expire: (): void => { current = false; }, revive: (): void => { current = true; } };
}

void test("footprint source runner brackets two real synthetic getters and retains only original completion authority", async () => {
  const f = await runnerFixture(), packet = await f.runner.observe();
  assert.deepEqual(f.calls, ["state", "source", "state", "state", "source", "state"]);
  assert.equal(packet.content, f.expected); assert.equal(packet.persistenceVerified, false); assert.equal(packet.cacheBranchObserved, false);
  assert.equal(await f.runner.requireOriginal(packet), packet); assert.equal(f.runner.retainedReplies().length, 6);
  await assert.rejects(f.runner.requireOriginal(structuredClone(packet)), /original completed source packet/u);
  await assert.rejects(f.runner.observe(), /attempt consumed/u); assert.equal(f.calls.length, 6);
  f.expire(); await assert.rejects(f.runner.requireOriginal(packet), /owner lost/u); f.revive();
  await assert.rejects(f.runner.requireOriginal(packet), /original completed source packet/u);
});

void test("footprint source runner retains failed arrivals and never repeats a consumed getter", async () => {
  for (const kind of ["owner", "malformed", "bytes", "ticket", "identity"] as const) {
    const f = await runnerFixture((raw, phase, index) => {
      if (kind === "ticket" && phase === "state" && index === 3) { return stateReply({ maximumTicket: 101 }); }
      if (phase !== "source") { return raw; }
      if (kind === "owner") { f.expire(); return raw; }
      if (kind === "malformed") { return { result: { type: "string", value: "{invalid}" } }; }
      if (kind === "bytes") { return sourceReply("changed native bytes"); }
      if (kind === "identity") { return sourceReply(f.expected, { identity: { ...IDENTITY, branchUuid: "b".repeat(32) } }); }
      return raw;
    });
    await assert.rejects(f.runner.observe()); const count = f.calls.length;
    assert.equal(f.calls.filter(value => value === "source").length, 1); assert.ok(f.runner.retainedReplies().length >= 2);
    f.revive(); await assert.rejects(f.runner.observe(), /attempt consumed/u); assert.equal(f.calls.length, count);
  }
});

void test("footprint source runner refuses forged state/append objects and substituted transport methods", async () => {
  const plan = await appendPlan(); let dispatched = false;
  const transport: CurrentFootprintCopySourceReadTransport = {
    assertOriginalState: async (state): Promise<void> => { await Promise.resolve(); assert.equal(state, STATE, "original state required"); },
    observeState: (): Promise<unknown> => { dispatched = true; return Promise.resolve(stateReply()); },
    readSource: (): Promise<unknown> => { dispatched = true; return Promise.resolve(sourceReply("unused")); },
  };
  assert.throws(() => new CurrentFootprintCopySourceReadRunner(transport, STATE, structuredClone(plan)), /original/u);
  const forged = new CurrentFootprintCopySourceReadRunner(transport, structuredClone(STATE), plan);
  await assert.rejects(forged.observe(), /original state required/u); assert.equal(dispatched, false);
  const original = new CurrentFootprintCopySourceReadRunner(transport, STATE, plan);
  Object.defineProperty(transport, "readSource", { value: (): Promise<unknown> => { dispatched = true; return Promise.resolve({}); } });
  await assert.rejects(original.observe(), /original transport changed/u); assert.equal(dispatched, false);
  assert.equal(z.object({ phase: z.literal("failed") }).parse(original.status()).phase, "failed");
});
