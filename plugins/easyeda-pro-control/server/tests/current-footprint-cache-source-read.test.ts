/** Synthetic native cache graph only; no EasyEDA or connected validation. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { createContext, runInContext } from "node:vm";
import type { Context } from "node:vm";
import { CURRENT_FOOTPRINT_CACHE_SOURCE_READ_FUNCTION } from "../src/current-footprint-cache-source-read.ts";
import { decodeCurrentFootprintCopySourceRead } from "../src/current-footprint-copy-source-read.ts";

const PROJECT = "1".repeat(64);
const BRANCH = "2".repeat(32);
const FOOTPRINT = "3".repeat(32);
const CLIENT = "4".repeat(16);
const ACTOR = { avatar: "https://example.invalid/avatar.png", uuid: "5".repeat(32), nickname: "", username: "synthetic",
  extra: { active: true, labels: ["Ω", null, 1] } };
const HEADER = { docType: "FOOTPRINT", client: CLIENT, uuid: FOOTPRINT, updateTime: 100, version: "100", editVersion: "3.2.209", user: ACTOR };
const META = { title: "Source", description: "Full native records", tags: ["synthetic"], source: "" };
const EXPRESSION = `(${CURRENT_FOOTPRINT_CACHE_SOURCE_READ_FUNCTION}).call(manager,project,bus,consistency,selected,constructors,methods)`;
interface Row { readonly type: string; readonly id: string; readonly ticket: number; readonly body: string }
function line(header: Readonly<Record<string, unknown>>, body: string): string { return `${JSON.stringify(header)}||${body}`; }
function fixture(): Readonly<{ vm: Context; expected: string; bytes: number }> {
  const families = ["CANVAS", "PAD", "LINE", "ATTR", "LAYER", "FILL", "POLY", "ACTIVE_LAYER", "NET", "RULE_SELECTOR", "ELE_PLACEHOLDER"];
  const rows: Row[] = Array.from({ length: 45 }, (_, index) => ({ type: families[index % families.length] ?? "PAD",
    id: `row-${index}`, ticket: index + 2, body: index === 44 ? "" : JSON.stringify({ value: index, text: "Ω😀" }) }));
  const chunks = Array.from({ length: 7 }, (_, fragment) => [line({ type: "DOCHEAD", ticket: 100 }, JSON.stringify(HEADER)),
    ...rows.filter((row, index) => index % 7 === fragment && row.body !== "").map(row => line({ type: row.type, ticket: row.ticket, id: row.id }, row.body))].join("|\n"));
  const keys = chunks.map((_, index) => `https://client/dataStr/${String(index + 6).padStart(32, "0")}${index ? `-${index}` : ""}-FOOTPRINT${index ? `-${index}` : ""}`);
  const inputs = rows.map((row, index) => ({ id: row.type === "NET" || row.type === "RULE_SELECTOR" ? row.id.toUpperCase() : row.id,
    node: { dataType: row.type, ticket: row.ticket, ...(row.type === "NET" || row.type === "RULE_SELECTOR" ? { actualId: row.id } : {}),
      ...(row.body === "" ? { data: "" } : { hId: String(index % 7 + 6).padStart(32, "0"), hNum: index % 7, dNum: index % 7,
        start: (chunks[index % 7] ?? "").indexOf(`||${row.body}`) + 2 }) } })).toReversed();
  // Native order deliberately differs from checkpoint insertion order. The
  // Distinct source plan compares keyed records; the leaf preserves this order.
  const expected = [line({ type: "DOCHEAD", ticket: 101 }, JSON.stringify(HEADER)),
    line({ type: "META", ticket: 90, id: "META" }, JSON.stringify(META)),
    line({ type: "DOCHEAD", ticket: 100 }, JSON.stringify(HEADER)),
    ...rows.toReversed().map(row => line({ type: row.type, ticket: row.ticket, id: row.id,
      ...(row.ticket === 2 ? { firstTicket: 1 } : {}) }, row.body))].join("|\n");
  const cacheBytes = Object.fromEntries(keys.map((key, i) => [key, [...Buffer.from(chunks[i] ?? "")]]));
  const vm = createContext({ setTimeout, clearTimeout, TextEncoder, InjectedDecoder: TextDecoder });
  runInContext(`globalThis.TextDecoder=InjectedDecoder;globalThis.matches=[];globalThis.calls=0;globalThis.cancelled=0;globalThis.released=0;globalThis.traps=0;globalThis.afterMatch=async()=>{};globalThis.afterRead=async()=>{};
class zy{};class Vc extends zy{getMaxTicket(){calls++;throw Error('vendor');}}class ja extends Vc{}
class Pi{get maxTicket(){calls++;throw Error('vendor');}}class ar extends Pi{}class Tg extends ar{getStr(){calls++;throw Error('vendor');}}
class Gd{}class Lg extends Gd{getCanvasByConsistency(){calls++;throw Error('vendor');}compress(){calls++;throw Error('vendor');}}
class ReadableStreamDefaultReader{constructor(bytes){this.bytes=bytes;this.index=0;}async read(){await afterRead();if(this.index>=this.bytes.length)return{value:undefined,done:true};const value=new Uint8Array(this.bytes.slice(this.index,this.index+97));this.index+=97;return{value,done:false};}async cancel(){cancelled++;}releaseLock(){released++;}}
class ReadableStream{constructor(bytes){this.bytes=bytes;}getReader(){return new ReadableStreamDefaultReader(this.bytes);}}
class Response{constructor(bytes){this.bytes=bytes;}get body(){return new ReadableStream(this.bytes);}}
class Cache{async match(key){matches.push(key);await afterMatch();const bytes=cacheBytes[key];return bytes===undefined?undefined:new Response(bytes);}}
Object.assign(globalThis,{Cache,Response,ReadableStream,ReadableStreamDefaultReader});
class bb{constructor(){this.cacheName='project_${PROJECT}_v6';this.cache=new Cache;}}
globalThis.project=new Lg;globalThis.bus={};globalThis.consistency=new ja;globalThis.manager=new Tg;
Object.assign(project,{uuid:'${PROJECT}',_branchUuid:'${BRANCH}',workerBus:bus,consistencyManager:consistency,footprint:manager,cache:new bb});
Object.assign(consistency,{client:'${CLIENT}',maxTicket:100,docHead:{'${FOOTPRINT}':{...${JSON.stringify(HEADER)},ticket:100}},historyMap:{}});
Object.assign(manager,{projectManager:project,client:'${CLIENT}',user:undefined,data:{'${FOOTPRINT}':{...${JSON.stringify(META)},ticket:90,version:'100',updateTime:100,modifier:${JSON.stringify(ACTOR)}}}});
globalThis.nodes=new Map(${JSON.stringify(inputs)}.map(({id,node})=>[id,{last:node,...(node.ticket===2?{list:[{ticket:1}]}:{})}]));
for(const type of ['META','META_PLACEHOLDER','DELETE_DOC','META_CREATE','META_MODIFY'])nodes.set(type,{last:{dataType:type,ticket:90,data:'{}'}});
consistency.wDocData=new Map([['${FOOTPRINT}',nodes]]);globalThis.cacheBytes=${JSON.stringify(cacheBytes)};
globalThis.PROJECT=project;globalThis._TAB_ID_='synthetic-window';globalThis.PRO_EDITOR_VERSION='3.2.209';
globalThis.selected={identity:{projectUuid:'${PROJECT}',branchUuid:'${BRANCH}',windowTabId:'synthetic-window'},footprintUuid:'${FOOTPRINT}',client:'${CLIENT}',maximumTicket:100};
globalThis.constructors=[Tg,ar,Pi,ja,Vc,zy];globalThis.methods=[Tg.prototype.getStr,Object.getOwnPropertyDescriptor(Pi.prototype,'maxTicket').get,Vc.prototype.getMaxTicket,Lg.prototype.getCanvasByConsistency,Lg.prototype.compress,Cache.prototype.match,Object.getOwnPropertyDescriptor(Response.prototype,'body').get,ReadableStream.prototype.getReader,ReadableStreamDefaultReader.prototype.read,ReadableStreamDefaultReader.prototype.cancel,ReadableStreamDefaultReader.prototype.releaseLock,TextDecoder,TextDecoder.prototype.decode,Uint8Array];`, vm);
  return { vm, expected, bytes: chunks.reduce((sum, chunk) => sum + Buffer.byteLength(chunk), 0) };
}
async function reply(vm: Context): Promise<ReturnType<typeof decodeCurrentFootprintCopySourceRead>> {
  const value: unknown = await runInContext(EXPRESSION, vm);
  return decodeCurrentFootprintCopySourceRead({ result: { type: "string", value } });
}

void test("source-only cache leaf preserves 45 records, seven fragments, native order, full actor and empty tombstone", async () => {
  const f = fixture(), result = await reply(f.vm);
  assert.equal(result.content, f.expected); assert.deepEqual(result.cacheRead, { keys: 7, bytes: f.bytes, atoms: 45 });
  assert.equal(result.sourceGetterDispatched, false); assert.equal(result.cacheEffectsPossible, false);
  assert.equal(result.cacheWrites, 0); assert.equal(result.networkRequests, 0);
  assert.equal(runInContext("calls", f.vm) as unknown, 0); assert.equal(runInContext("Object.keys(consistency.historyMap).length", f.vm) as unknown, 0);
});
void test("source-only metadata with no drawing records returns the complete three-line source without cache I/O", async () => {
  const f = fixture(); runInContext("nodes.clear()", f.vm); const result = await reply(f.vm);
  assert.equal(result.content, f.expected.split("|\n").slice(0, 3).join("|\n"));
  assert.deepEqual(result.cacheRead, { keys: 0, bytes: 0, atoms: 0 }); assert.equal(runInContext("matches.length", f.vm) as unknown, 0);
});
void test("source-only leaf refuses pending, unique, normalized identity collisions and malformed actor before I/O", async () => {
  for (const change of ["nodes.get('row-0').last.pend=false", "nodes.get('row-0').last.unique=undefined", "nodes.get('row-0').list[0].pend=false",
    "nodes.get('ROW-8').last.actualId='wrong'", "nodes.get('row-0').last.actualId='row-0'", "nodes.set('row-8',{last:{dataType:'PAD',ticket:99,data:'{}'}})",
    "manager.data[selected.footprintUuid].modifier.extra=manager.data[selected.footprintUuid].modifier",
    "Object.defineProperty(manager.data[selected.footprintUuid].modifier,'avatar',{get(){traps++;return 'wrong';}})",
    "manager.data[selected.footprintUuid].modifier.avatar='Ω'.repeat(40000)",
    "manager.data[selected.footprintUuid].modifier.extra=Array.from({length:257},()=>null)"]) {
    const f = fixture(); runInContext(change, f.vm); await assert.rejects(reply(f.vm), /SOURCE_READ_REFUSED/u, change);
    assert.equal(runInContext("matches.length", f.vm) as unknown, 0, change); assert.equal(runInContext("traps", f.vm) as unknown, 0, change);
  }
});
void test("source-only cache awaits reprove complete actor, node and native order without calling vendor paths", async () => {
  for (const change of ["manager.data[selected.footprintUuid].modifier.extra.labels[0]='drift'", "consistency.docHead[selected.footprintUuid].user.avatar='drift'",
    "const row=nodes.get('row-0');nodes.delete('row-0');nodes.set('row-0',row)", "nodes.get('row-0').list[0].unique='drift'",
    "nodes.get('row-44').last.data='{}'", "project.cache.cache=new Cache"]) {
    const f = fixture(); runInContext(`afterMatch=async()=>{${change};}`, f.vm); await assert.rejects(reply(f.vm), /SOURCE_READ_REFUSED/u, change);
    assert.equal(runInContext("calls", f.vm) as unknown, 0);
  }
});
void test("source-only cache miss, wrong fragment offset and invalid JSON refuse without fallback", async () => {
  for (const change of ["cacheBytes={}", "nodes.get('row-0').last.start++", "nodes.get('row-44').last.data='null'"]) {
    const f = fixture(); runInContext(change, f.vm); await assert.rejects(reply(f.vm)); assert.equal(runInContext("calls", f.vm) as unknown, 0);
  }
});
void test("source-only cache deadline cancels and releases its stalled reader once", async () => {
  const f = fixture(); runInContext("globalThis.deadline=null;globalThis.finishRead=null;afterRead=()=>new Promise(resolve=>{finishRead=resolve;});ReadableStreamDefaultReader.prototype.cancel=async()=>{cancelled++;finishRead();};methods[9]=ReadableStreamDefaultReader.prototype.cancel;setTimeout=(callback,ms)=>{if(ms===8000)deadline=callback;return ms;};clearTimeout=()=>{};", f.vm);
  const pending = reply(f.vm); for (let i = 0; i < 50; i += 1) { await Promise.resolve(); }
  assert.equal(runInContext("typeof finishRead", f.vm) as unknown, "function"); runInContext("deadline()", f.vm);
  await assert.rejects(pending, /SOURCE_READ_DEADLINE/u); assert.equal(runInContext("cancelled", f.vm) as unknown, 1);
  assert.equal(runInContext("released", f.vm) as unknown, 1); assert.equal(runInContext("calls", f.vm) as unknown, 0);
});
