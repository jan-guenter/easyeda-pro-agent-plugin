/** Synthetic owned VM objects and SQLite inventories only. No EasyEDA or live
 * profile access, native bridge admission or writer support is established. */
/* oxlint-disable import/max-dependencies -- These regressions join both fixed readers, their original completed SQL projection and the retained source owner. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { createContext, runInContext } from "node:vm";
import type { Context } from "node:vm";
import { CURRENT_FOOTPRINT_COPY_CACHE_SOURCE_READ_FUNCTION } from "../src/current-footprint-copy-cache-source-read.ts";
import { z } from "zod";
import { expectedCurrentFootprintCopySource, prepareCurrentFootprintCopyAppendPlan } from "../src/current-footprint-copy-append.ts";
import { prepareCurrentFootprintCopyPlan } from "../src/current-footprint-copy-plan.ts";
import { currentFootprintCopyStatePacketSchema } from "../src/current-footprint-copy-state.ts";
import { CURRENT_FOOTPRINT_COPY_SOURCE_READ_FUNCTION, CURRENT_FOOTPRINT_COPY_SOURCE_READ_LIMITS,
  captureCurrentFootprintCopySourceReadReply, decodeCurrentFootprintCopySourceRead } from "../src/current-footprint-copy-source-read.ts";
import type { CurrentFootprintCopySourceReadRequest } from "../src/current-footprint-copy-source-read.ts";
import { CURRENT_FOOTPRINT_COPY_SOURCE_FRAME_BYTES } from "../src/current-footprint-copy-source-command.ts";
import { CURRENT_FOOTPRINT_COPY_SOURCE_STAGE_REQUESTS, CURRENT_FOOTPRINT_COPY_SOURCE_STAGE_TIMING,
  CurrentFootprintCopySourceReadRunner } from "../src/current-footprint-copy-source-read-runner.ts";
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
class Mb{}class KP extends Mb{}class JP extends KP{}
globalThis.originalProject=new Lg;globalThis.originalBus=new JP;globalThis.originalConsistency=new ja;
Object.assign(originalProject,{uuid:${JSON.stringify(PROJECT)},_branchUuid:${JSON.stringify(IDS.branch)},workerBus:originalBus,consistencyManager:originalConsistency});
globalThis.originalFootprint=new Tg(originalProject);originalProject.footprint=originalFootprint;
originalFootprint.data[${JSON.stringify(IDS.target)}]={ticket:90,title:"Source",description:"Keep",tags:[],source:"",version:"100",updateTime:100};
globalThis.PROJECT=originalProject;globalThis._TAB_ID_=${JSON.stringify(IDENTITY.windowTabId)};
globalThis.selected=${JSON.stringify(REQUEST)};globalThis.originalConstructors=[Tg,ar,Pi,ja,Vc,zy,Lg,Gd,JP,KP,Mb];
globalThis.originalMethods=[Tg.prototype.getStr,Object.getOwnPropertyDescriptor(Pi.prototype,"maxTicket").get,Vc.prototype.getMaxTicket,Lg.prototype.getCanvasByConsistency,Lg.prototype.compress];`;
const EXPRESSION = `(${CURRENT_FOOTPRINT_COPY_SOURCE_READ_FUNCTION}).call(originalFootprint,originalProject,originalBus,originalConsistency,selected,originalConstructors,originalMethods)`;
const CACHE_EXPRESSION = `(${CURRENT_FOOTPRINT_COPY_CACHE_SOURCE_READ_FUNCTION}).call(originalFootprint,originalProject,originalBus,originalConsistency,selected,originalConstructors,cacheMethods)`;

void test("source stage reserves both opening identity reads before the fixed cleanup boundary", () => {
  // Normal requests end at224;225..256 remain available only for cleanup.
  // Starting at161 would fit the former63-request estimate but exceeds the
  // Complete stage after both opening delegates reprove project identity.
  assert.equal(CURRENT_FOOTPRINT_COPY_SOURCE_STAGE_REQUESTS, 65);
  assert.equal(160 + CURRENT_FOOTPRINT_COPY_SOURCE_STAGE_REQUESTS - 1, 224);
  assert.ok(161 + CURRENT_FOOTPRINT_COPY_SOURCE_STAGE_REQUESTS - 1 > 224);
});
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
    ...REQUEST, capturedUser: "own-undefined", content, route: "native-get-str", sourceGetterDispatched: true, cacheEffectsPossible: true, executionAuthorized: false, persistenceVerified: false, ...patch }) } };
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
void test("source and serialized observation have separate byte bounds and admitted JSON fits the CDP frame", async () => {
  const edge = "\\".repeat(CURRENT_FOOTPRINT_COPY_SOURCE_READ_LIMITS.contentBytes), native = await reply(context(edge));
  assert.equal(decodeCurrentFootprintCopySourceRead(native).content, edge);
  const frame = JSON.stringify({ id: 256, sessionId: "x".repeat(128), result: native });
  assert.ok(Buffer.byteLength(frame) < CURRENT_FOOTPRINT_COPY_SOURCE_FRAME_BYTES);
  // The raw content fits2MiB, but six-byte JSON control escapes exceed the
  // Separate inner envelope. Native code refuses before returning a frame.
  const escaped = context("\u0001".repeat(CURRENT_FOOTPRINT_COPY_SOURCE_READ_LIMITS.contentBytes));
  await assert.rejects(reply(escaped), /SOURCE_READ_REFUSED/u);
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

void test("source runner permits bounded aggregate callbacks beyond the individual command deadline", async testContext => {
  const entered = Array.from({ length: 6 }, () => Promise.withResolvers<null>());
  const timingFixture = await runnerFixture((raw, phase, index) => {
    const waiting = Promise.withResolvers<unknown>();
    setTimeout(() => { waiting.resolve(raw); }, phase === "state" ? 12_000 : 14_000);
    entered[index - 1]?.resolve(null); return waiting.promise;
  });
  testContext.mock.timers.enable({ apis: ["setTimeout"] });
  let failure: unknown = null;
  const work = (async (): Promise<unknown> => {
    try { return await timingFixture.runner.observe(); } catch (error) { failure = error; return null; }
  })();
  for (const [index, entry] of entered.entries()) {
    await entry.promise;
    testContext.mock.timers.tick(index === 1 || index === 4 ? 14_000 : 12_000);
    for (let step = 0; step < 32; step += 1) { await Promise.resolve(); }
    assert.equal(failure, null);
  }
  const packet = z.object({ sourceSamples: z.number(), stateSamples: z.number() }).parse(await work);
  assert.equal(packet.sourceSamples, 2); assert.equal(packet.stateSamples, 4);
});

void test("aggregate source callback deadlines still consume stalled attempts", async testContext => {
  for (const selected of ["state", "source"] as const) {
    const entered = Promise.withResolvers<null>();
    const timingFixture = await runnerFixture((raw, phase) => {
      if (phase !== selected) { return raw; }
      // This original callback never completes.
      entered.resolve(null); return Promise.withResolvers<unknown>().promise;
    });
    testContext.mock.timers.enable({ apis: ["setTimeout"] });
    try {
      const work = timingFixture.runner.observe();
      const refused = assert.rejects(work, /HOST_DEADLINE/u);
      await entered.promise;
      testContext.mock.timers.tick(selected === "state" ? CURRENT_FOOTPRINT_COPY_SOURCE_STAGE_TIMING.stateCallbackMs :
        CURRENT_FOOTPRINT_COPY_SOURCE_STAGE_TIMING.sourceCallbackMs);
      await refused; const count = timingFixture.calls.length;
      await assert.rejects(timingFixture.runner.observe(), /attempt consumed/u); assert.equal(timingFixture.calls.length, count);
    } finally { testContext.mock.timers.reset(); }
  }
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


/** Native API peers here are synthetic; the separate metadata admission must
 * establish native intrinsics before the real owner can supply cacheMethods. */
async function cacheFixture(): Promise<Readonly<{ vm: Context; expected: string; bytes: number }>> {
  const plan = await appendPlan();
  const expected = expectedCurrentFootprintCopySource(plan, CLIENT, "before-create");
  const records = expected.split("|\n");
  const canvasBody = '{"originX":0}', chunk = records.slice(2).join("|\n"), padBody = '{"number":"1"}';
  const headerParts = (records[2] ?? "").split("||");
  const storedHead: unknown = JSON.parse(headerParts[1] ?? "null");
  const vm = context();
  runInContext(`globalThis.TextDecoder=InjectedDecoder;globalThis.matches=0;globalThis.cancelled=0;globalThis.afterMatch=async()=>{};globalThis.afterRead=async()=>{};globalThis.cacheMiss=false;
class ReadableStreamDefaultReader{constructor(){this.index=0;}async read(){await afterRead();const bytes=new Uint8Array(encoded);if(this.index>=bytes.length)return{value:undefined,done:true};const value=bytes.slice(this.index,this.index+7);this.index+=7;return{value,done:false};}async cancel(){cancelled++;}releaseLock(){}}
class ReadableStream{getReader(){return new ReadableStreamDefaultReader;}}class Response{get body(){return new ReadableStream;}}
class Cache{async match(key){matches++;if(key!==${JSON.stringify(`https://client/dataStr/${IDS.oldHead}-FOOTPRINT`)})throw Error('Wrong cache key');await afterMatch();return cacheMiss?undefined:new Response;}}
Object.assign(globalThis,{Cache,Response,ReadableStream,ReadableStreamDefaultReader});
class bb{constructor(){this.cacheName=${JSON.stringify(`project_${PROJECT}_v6`)};this.cache=new Cache;}}originalProject.cache=new bb;
const storedHead=${JSON.stringify(storedHead)};
storedHead.ticket=100;originalConsistency.docHead={[selected.footprintUuid]:storedHead};
originalFootprint.data[selected.footprintUuid].modifier=storedHead.user;
globalThis.nodes=new Map([['META',{last:{dataType:'META',ticket:90,data:'{}'}}],['canvas',{last:{dataType:'CANVAS',ticket:2,hId:${JSON.stringify(IDS.oldHead)},hNum:0,dNum:0,start:${chunk.indexOf(`||${canvasBody}`) + 2}}}],['0a123456789bcdef',{last:{dataType:'PAD',ticket:3,hId:${JSON.stringify(IDS.oldHead)},hNum:0,dNum:0,start:${chunk.indexOf(`||${padBody}`) + 2}}}]]);
originalConsistency.wDocData=new Map([[selected.footprintUuid,nodes]]);originalConsistency.historyMap={};globalThis.PRO_EDITOR_VERSION='3.2.209';
globalThis.cacheMethods=[...originalMethods,Cache.prototype.match,Object.getOwnPropertyDescriptor(Response.prototype,'body').get,ReadableStream.prototype.getReader,ReadableStreamDefaultReader.prototype.read,ReadableStreamDefaultReader.prototype.cancel,ReadableStreamDefaultReader.prototype.releaseLock,TextDecoder,TextDecoder.prototype.decode,Uint8Array];`,
    Object.assign(vm, { InjectedDecoder: TextDecoder, encoded: [...Buffer.from(chunk)] }));
  return { vm, expected, bytes: Buffer.byteLength(chunk) };
}
async function cacheReply(vm: Context): Promise<unknown> {
  const value: unknown = await runInContext(CACHE_EXPRESSION, vm); return { result: { type: "string", value } };
}

void test("native cache equivalent reconstructs checkpoint-equal bytes from cold nodes without a vendor getter or cache warming", async () => {
  const f = await cacheFixture(), result = decodeCurrentFootprintCopySourceRead(await cacheReply(f.vm));
  assert.equal(result.content, f.expected); assert.equal(result.route, "native-cache-equivalent");
  assert.equal(result.sourceGetterDispatched, false); assert.equal(result.cacheEffectsPossible, false);
  assert.deepEqual(result.cacheRead, { keys: 1, bytes: f.bytes, atoms: 2 });
  assert.equal(result.cacheWrites, 0); assert.equal(result.networkRequests, 0);
  assert.equal(runInContext("calls", f.vm) as unknown, 0); assert.equal(runInContext("matches", f.vm) as unknown, 1);
  assert.equal(runInContext("Object.keys(originalConsistency.historyMap).length", f.vm) as unknown, 0);
});

void test("cache miss and wrong native offsets refuse without a vendor fallback", async () => {
  for (const change of ["cacheMiss=true", "nodes.get('canvas').last.start++", "nodes.get('canvas').last.ticket++", "encoded=[255,255]"]) {
    const f = await cacheFixture(); runInContext(change, f.vm); await assert.rejects(cacheReply(f.vm));
    assert.equal(runInContext("calls", f.vm) as unknown, 0);
  }
});

void test("cache await refuses changed owners, source rosters or admitted native methods", async () => {
  for (const change of ["originalConsistency.maxTicket++", "originalProject.cache.cache=new Cache", "nodes.get('canvas').last.start++",
    "nodes.set('extra',{last:{dataType:'LINE',ticket:4,data:'{}'}})", "Cache.prototype.match=async()=>undefined",
    "originalFootprint.data[selected.footprintUuid].tags.push('changed')", "originalConsistency.docHead[selected.footprintUuid].extra=true",
    "nodes.get('canvas').last.extra=true", "PROJECT={...originalProject}"]) {
    const f = await cacheFixture(); runInContext(`afterMatch=async()=>{${change};}`, f.vm);
    await assert.rejects(cacheReply(f.vm), /SOURCE_READ_REFUSED/u, change); assert.equal(runInContext("calls", f.vm) as unknown, 0);
  }
});

void test("inline nodes need no cache I/O and stream-time owner loss cancels its retained reader", async () => {
  const f = await cacheFixture(); runInContext("nodes.get('canvas').last.data='{\"originX\":0}';nodes.get('0a123456789bcdef').last.data='{\"number\":\"1\"}';", f.vm);
  const result = decodeCurrentFootprintCopySourceRead(await cacheReply(f.vm)); assert.equal(result.content, f.expected);
  assert.deepEqual(result.cacheRead, { keys: 0, bytes: 0, atoms: 2 }); assert.equal(runInContext("matches", f.vm) as unknown, 0);
  const drift = await cacheFixture(); runInContext("afterRead=async()=>{originalConsistency.maxTicket++;};", drift.vm);
  await assert.rejects(cacheReply(drift.vm), /SOURCE_READ_REFUSED/u); assert.equal(runInContext("cancelled", drift.vm) as unknown, 1);
});

void test("a stalled native cache stream is canceled when the source deadline expires", async () => {
  const f = await cacheFixture();
  runInContext("globalThis.deadline=null;globalThis.finishRead=null;globalThis.released=0;afterRead=()=>new Promise(resolve=>{finishRead=resolve;});ReadableStreamDefaultReader.prototype.cancel=async()=>{cancelled++;finishRead();};ReadableStreamDefaultReader.prototype.releaseLock=()=>{released++;};cacheMethods[9]=ReadableStreamDefaultReader.prototype.cancel;cacheMethods[10]=ReadableStreamDefaultReader.prototype.releaseLock;setTimeout=(callback,ms)=>{if(ms===8000)deadline=callback;return ms;};clearTimeout=()=>{};", f.vm);
  const pending = cacheReply(f.vm);
  for (let i = 0; i < 50; i += 1) { await Promise.resolve(); }
  assert.equal(runInContext("typeof finishRead", f.vm) as unknown, "function");
  runInContext("deadline()", f.vm);
  await assert.rejects(pending, /SOURCE_READ_DEADLINE/u);
  assert.equal(runInContext("cancelled", f.vm) as unknown, 1);
  assert.equal(runInContext("released", f.vm) as unknown, 1);
  assert.equal(runInContext("calls", f.vm) as unknown, 0);
});
