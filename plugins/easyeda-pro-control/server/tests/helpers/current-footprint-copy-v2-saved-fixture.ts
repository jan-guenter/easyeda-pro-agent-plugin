/** Synthetic closed SQL and native-cache graph. No actual EasyEDA owner,
 * parser execution, fresh generation or durable writer validation. */
import { createContext, runInContext } from "node:vm";
import type { Context } from "node:vm";
import { prepareCurrentFootprintSourcePlan } from "../../src/current-footprint-source-plan.ts";
import { prepareCurrentFootprintCopyV2Plan } from "../../src/current-footprint-copy-v2-plan.ts";
import { prepareCurrentFootprintCopyV2SqlPlan, verifyCurrentFootprintCopyV2SqlEffect } from "../../src/current-footprint-copy-v2-sql.ts";
import { prepareCurrentFootprintCopyV2SavedProjection } from "../../src/current-footprint-copy-v2-saved-source.ts";
import { currentFootprintCopyStatePacketSchema } from "../../src/current-footprint-copy-state.ts";
import { CURRENT_FOOTPRINT_COPY_V2_SAVED_CACHE_READ_FUNCTION } from "../../src/current-footprint-copy-v2-saved-cache-read.ts";
import { IDS, TIMES, WITNESS, applyEffect, encrypted, fixture, inventory, mutate } from "./symbol-sql-fixture.ts";

export const CLIENT = "f".repeat(16), PROJECT = "1".repeat(64), TARGET = "e".repeat(16);
const OLD_CLIENT = "a".repeat(16), OLD_META = { title: "Source", description: "Keep Ω", tags: [], source: "old-source" };
const NEW_META = { ...OLD_META, title: "Source_1", source: "" };
const ACTOR = { uuid: IDS.actor, username: "synthetic-user", nickname: "Synthetic" };
export const IDENTITY = Object.freeze({ projectUuid: PROJECT, branchUuid: IDS.branch, windowTabId: "synthetic-window" });
export const REQUEST = Object.freeze({ identity: IDENTITY, footprintUuid: TARGET, client: CLIENT, maximumTicket: 102 });
export const STATE = currentFootprintCopyStatePacketSchema.parse({ profile: "private.current-footprint-copy-state.v1", identity: IDENTITY,
  client: CLIENT, maximumTicket: 102, capturedUser: "own-undefined", samples: 2, originalConstructorManagerMatched: true,
  atomicSnapshotVerified: false, cacheBranchObserved: false, executionAuthorized: false, persistenceVerified: false });
interface Atom { readonly type: string; readonly ticket: number; readonly id: string; readonly body: string }
const ATOMS: readonly Atom[] = [
  { type: "FILL", ticket: 11, id: "2", body: '{"points":[0,1]}' },
  { type: "CANVAS", ticket: 4, id: "CANVAS", body: '{"originX":0}' },
  { type: "PAD", ticket: 10, id: "pad", body: '{"number":"1", "x":10}' },
  { type: "LINE", ticket: 12, id: "deleted", body: "" },
];
function row(type: string, ticket: number, id: string, body: string): string { return `${JSON.stringify({ type, ticket, id })}||${body}`; }
function head(uuid: string, ticket: number, time: number, client: string, user?: unknown): string {
  return `${JSON.stringify({ type: "DOCHEAD", ticket })}||${JSON.stringify({ docType: "FOOTPRINT", client, uuid,
    updateTime: time, version: String(time), editVersion: "3.2.209", ...(user === undefined ? {} : { user }) })}`;
}
function edit(time: number): string { return `{"type":"EDIT_HEAD"}||${JSON.stringify({ ...ACTOR, updateTime: time })}`; }
export function stateReply(): unknown {
  return { result: { type: "string", value: JSON.stringify({ schema: "easyeda-pro-control.current-footprint-copy-state.v1",
    identity: IDENTITY, client: CLIENT, maximumTicket: 102, capturedUser: "own-undefined" }) } };
}
export async function savedFixture(equalClocks = false): Promise<Readonly<{
  copy: Awaited<ReturnType<typeof prepareCurrentFootprintCopyV2Plan>>;
  sql: Awaited<ReturnType<typeof prepareCurrentFootprintCopyV2SqlPlan>>;
  projection: Awaited<ReturnType<typeof prepareCurrentFootprintCopyV2SavedProjection>>;
  after: Awaited<ReturnType<typeof inventory>>; chunk: string; time: number; innerTicket: number;
}>> {
  const { path } = await fixture({ project: PROJECT, branch: IDS.branch, target: IDS.target });
  const rawRows = ATOMS.map(atom => row(atom.type, atom.ticket, atom.id, atom.body));
  const beforeText = [edit(1), head(IDS.target, 100, 300, OLD_CLIENT, ACTOR), row("META", 3, "META", JSON.stringify(OLD_META)), ...rawRows].join("|\n");
  mutate(path, `UPDATE history_data SET dataStr='${encrypted(beforeText, IDS.oldHead, IDS.oldKey)}' WHERE uuid='${IDS.oldHead}'`);
  const before = await inventory(path);
  const sourcePlan = await prepareCurrentFootprintSourcePlan(before, { projectUuid: PROJECT, branchUuid: IDS.branch, footprintUuid: IDS.target });
  const source = [head(IDS.target, 101, 300, OLD_CLIENT, ACTOR), row("META", 12, "META", JSON.stringify(OLD_META)),
    head(IDS.target, 100, 300, OLD_CLIENT, ACTOR), ...rawRows].join("|\n");
  const copy = await prepareCurrentFootprintCopyV2Plan(before, sourcePlan, { client: OLD_CLIENT, content: source });
  const sql = await prepareCurrentFootprintCopyV2SqlPlan({ before, copyPlan: copy, witness: {
    projectUuid: PROJECT, branchUuid: IDS.branch, backendActorUuid: IDS.actor, client: OLD_CLIENT, preDispatchMaxTicket: 100,
    documentClockMinMs: WITNESS.serverClockMinMs, documentClockMaxMs: WITNESS.serverClockMaxMs,
    backendClockMinMs: WITNESS.serverClockMinMs, backendClockMaxMs: WITNESS.serverClockMaxMs,
    backendLocalOffsetMinutes: WITNESS.serverLocalOffsetMinutes,
  } });
  const innerTicket = equalClocks ? 101 : 102, time = TIMES.document + (equalClocks ? 0 : 1);
  const chunk = [head(TARGET, 101, TIMES.document, OLD_CLIENT), row("META", 101, "META", JSON.stringify(NEW_META)),
    head(TARGET, 102, time, OLD_CLIENT), rawRows[0], row("META", 12, "META", JSON.stringify(OLD_META)), ...rawRows.slice(1)].join("|\n");
  applyEffect(path, [edit(TIMES.edit), chunk].join("|\n"));
  mutate(path, "UPDATE project_structures SET ticket=100");
  const after = await inventory(path), effect = await verifyCurrentFootprintCopyV2SqlEffect(sql, after, { returnedUuid: TARGET });
  return { copy, sql, projection: await prepareCurrentFootprintCopyV2SavedProjection(sql, effect, after), after, chunk, time, innerTicket };
}
export function nativeSavedCache(input: Awaited<ReturnType<typeof savedFixture>>, cacheActor: boolean): Context {
  const user = cacheActor ? { uuid: TARGET } : ACTOR;
  const header = { docType: "FOOTPRINT", client: CLIENT, uuid: TARGET, updateTime: input.time, version: String(input.time), editVersion: "3.2.209", user };
  const cacheKey = `https://client/dataStr/${IDS.newHead}-FOOTPRINT`;
  const nodes = ATOMS.map(atom => [atom.id, { last: { dataType: atom.type, ticket: atom.ticket,
    ...(atom.body === "" ? { data: "" } : { hId: IDS.newHead, hNum: 0, dNum: 0, start: input.chunk.indexOf(`||${atom.body}`) + 2 }) } }]);
  const vm = createContext({ setTimeout, clearTimeout, TextEncoder, InjectedDecoder: TextDecoder });
  runInContext(`globalThis.TextDecoder=InjectedDecoder;globalThis.vendorCalls=0;globalThis.matches=[];
class zy{};class Vc extends zy{getMaxTicket(){vendorCalls++;throw Error('vendor');}}class ja extends Vc{}
class Pi{get maxTicket(){vendorCalls++;throw Error('vendor');}}class ar extends Pi{}class Tg extends ar{getStr(){vendorCalls++;throw Error('vendor');}}
class Gd{}class Lg extends Gd{getCanvasByConsistency(){vendorCalls++;throw Error('vendor');}compress(){vendorCalls++;throw Error('vendor');}}
class ReadableStreamDefaultReader{constructor(bytes){this.bytes=bytes;this.index=0;}async read(){if(this.index>=this.bytes.length)return{value:undefined,done:true};const value=new Uint8Array(this.bytes.slice(this.index,this.index+97));this.index+=97;return{value,done:false};}async cancel(){}releaseLock(){}}
class ReadableStream{constructor(bytes){this.bytes=bytes;}getReader(){return new ReadableStreamDefaultReader(this.bytes);}}
class Response{constructor(bytes){this.bytes=bytes;}get body(){return new ReadableStream(this.bytes);}}
class Cache{async match(key){matches.push(key);return key===${JSON.stringify(cacheKey)}?new Response(${JSON.stringify([...Buffer.from(input.chunk)])}):undefined;}}
Object.assign(globalThis,{Cache,Response,ReadableStream,ReadableStreamDefaultReader});
class bb{constructor(){this.cacheName=${JSON.stringify(`project_${PROJECT}_v6`)};this.cache=new Cache;}}
class Mb{}class KP extends Mb{}class JP extends KP{}
globalThis.project=new Lg;globalThis.bus=new JP;globalThis.consistency=new ja;globalThis.manager=new Tg;
Object.assign(project,{uuid:'${PROJECT}',_branchUuid:'${IDS.branch}',workerBus:bus,consistencyManager:consistency,footprint:manager,cache:new bb});
Object.assign(consistency,{client:'${CLIENT}',maxTicket:102,docHead:{'${TARGET}':{...${JSON.stringify(header)},ticket:${String(input.innerTicket)}}},historyMap:{}});
Object.assign(manager,{projectManager:project,client:'${CLIENT}',user:undefined,data:{'${TARGET}':{...${JSON.stringify(NEW_META)},ticket:101,version:'${String(input.time)}',updateTime:${String(input.time)},modifier:${JSON.stringify(user)}}}});
globalThis.nodes=new Map(${JSON.stringify(nodes)});nodes.set('META',{last:{dataType:'META',ticket:101,data:'{}'}});
consistency.wDocData=new Map([['${TARGET}',nodes]]);globalThis.PROJECT=project;globalThis._TAB_ID_='synthetic-window';globalThis.PRO_EDITOR_VERSION='3.2.209';
globalThis.selected=${JSON.stringify(REQUEST)};globalThis.constructors=[Tg,ar,Pi,ja,Vc,zy,Lg,Gd,JP,KP,Mb];
globalThis.methods=[Tg.prototype.getStr,Object.getOwnPropertyDescriptor(Pi.prototype,'maxTicket').get,Vc.prototype.getMaxTicket,Lg.prototype.getCanvasByConsistency,Lg.prototype.compress,Cache.prototype.match,Object.getOwnPropertyDescriptor(Response.prototype,'body').get,ReadableStream.prototype.getReader,ReadableStreamDefaultReader.prototype.read,ReadableStreamDefaultReader.prototype.cancel,ReadableStreamDefaultReader.prototype.releaseLock,TextDecoder,TextDecoder.prototype.decode,Uint8Array];`, vm);
  return vm;
}
export async function nativeSavedReply(vm: Context): Promise<unknown> {
  const value: unknown = await runInContext(`(${CURRENT_FOOTPRINT_COPY_V2_SAVED_CACHE_READ_FUNCTION}).call(manager,project,bus,consistency,selected,constructors,methods)`, vm);
  return { result: { type: "string", value } };
}
