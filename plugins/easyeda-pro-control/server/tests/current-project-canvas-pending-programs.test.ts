/** Fixed inert selectors against original-worker-shaped data. These cases do
 * not issue an operation owner or call a compressor/application method. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { createContext, runInContext } from "node:vm";
import { CURRENT_PROJECT_CANVAS_PENDING_CAPTURE as CAPTURE } from "../src/current-project-canvas-pending-programs.ts";

const guards = String.raw`const seen=[],parents=[],accessors=[];const bad=()=>{throw Error("PENDING_RELATION");};
const own=(o,k)=>{const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,"value"))bad();seen.push([o,k,d]);return d.value;};
const text=(v,n)=>{if(typeof v!=="string"||v.length<1||v.length>n||!v.isWellFormed())bad();return v;};
const integer=(v,a,b)=>{if(!Number.isSafeInteger(v)||Object.is(v,-0)||v<a||v>b)bad();return v;};
const array=(v,n)=>{if(!Array.isArray(v)||Object.getPrototypeOf(v)!==Array.prototype||own(v,"length")!==n||Reflect.ownKeys(v).length!==n+1)bad();for(let i=0;i<n;i++)own(v,String(i));};
const verify=()=>{for(const[o,k,d]of seen){const v=Object.getOwnPropertyDescriptor(o,k);if(!v||!Object.hasOwn(v,"value")||!Object.is(v.value,d.value))bad();}for(const[o,p]of parents)if(Object.getPrototypeOf(o)!==p)bad();for(const[o,k,d]of accessors){const v=Object.getOwnPropertyDescriptor(o,k);if(!v||Object.hasOwn(v,"value")||v.get!==d.get||v.set!==d.set)bad();}reprovePendingMissing();};`;
const program = `function(snapshot,stage){${guards}${CAPTURE}const result=snapshot===null?capturePending(r,arg,"document","PCB","VIA"):snapshot;reprovePending(result,r,arg,stage);verify();return result;}`;
function fixture(): ReturnType<typeof createContext> {
  const context = createContext({});
  runInContext(`globalThis.calls=0;globalThis.PRO_EDITOR_VERSION="3.2.185";globalThis.arg={uuid:"canvas",uniqueId:"compiler"};
globalThis.node={ticket:7,client:"producer",dataType:"VIA",data:'{"centerX":1}',unique:"compiler",pend:true};
globalThis.link={last:node};globalThis.selected={document:new Set(["primitive"])};
globalThis.r={uniqueIds:{compiler:selected},wDocData:new Map([["document",new Map([["primitive",link]])]]),maxTicket:11,docHead:{document:{docType:"PCB",version:"prior-version"}}};
globalThis.read=${program};globalThis.snapshot=read(null,"entry");`, context);
  return context;
}
void test("captures actual pending ticket and maximum independently and admits only the source compression transition", () => {
  const context = fixture();
  assert.equal(runInContext("snapshot.ticket", context), 7); assert.equal(runInContext("snapshot.maximumTicket", context), 11);
  assert.equal(runInContext("snapshot.workerEditVersion", context), "3.2.185"); assert.equal(runInContext("snapshot.priorVersion", context), "prior-version");
  runInContext(`r.maxTicket++;read(snapshot,"allocated");selected.document.clear();delete selected.document;delete node.unique;delete node.pend;r.docHead.document={docType:"PCB",version:"new-version"};read(snapshot,"compressed");`, context);
  assert.equal(runInContext("calls", context), 0);
});
void test("refuses extra pending keys, changed original nodes, foreign cache data and getter-backed state without application calls", () => {
  for (const alteration of [
    "selected.document.add('foreign')", "selected.foreign=new Set(['peer'])", "r.wDocData=new Map(r.wDocData)",
    "r.wDocData.get('document').set('primitive',{...link,last:{...node}})", "node.ticket++", "node.client='foreign'", "node.data='foreign'",
    "node.unique='foreign'", "node.pend=false", "node.hId='cached-history'", "r.maxTicket++", "PRO_EDITOR_VERSION='foreign'",
    "r.docHead.document.version='foreign'", "Object.defineProperty(node,'data',{get(){calls++;throw Error('getter');}})",
    "Object.defineProperty(selected,'document',{get(){calls++;throw Error('getter');}})",
    "selected.document.has=()=>{calls++;return true;}",
  ]) {
    const context = fixture(); runInContext(alteration, context);
    assert.throws(() => runInContext('read(snapshot,"entry")', context), /PENDING_RELATION/u, alteration); assert.equal(runInContext("calls", context), 0);
  }
});
void test("compression requires both exact deletions and a cleared original Set; no transition may be inferred from body text", () => {
  for (const alteration of [
    "r.maxTicket++", "r.maxTicket++;delete node.unique;delete node.pend;delete selected.document",
    "r.maxTicket++;selected.document.clear();delete selected.document;delete node.unique",
    "r.maxTicket++;selected.document.clear();delete selected.document;delete node.unique;delete node.pend;node.data='foreign'",
    "r.maxTicket++;selected.document.clear();delete selected.document;delete node.unique;delete node.pend;selected.foreign=new Set()",
  ]) {
    const context = fixture(); runInContext(alteration, context);
    assert.throws(() => runInContext('read(snapshot,"compressed")', context), /PENDING_RELATION/u, alteration); assert.equal(runInContext("calls", context), 0);
  }
});
void test("missing worker version remains observed absence, and inherited application state is rejected", () => {
  for (const alteration of ["delete PRO_EDITOR_VERSION", "delete r.docHead.document.version"]) {
    const context = fixture(); runInContext(`${alteration};snapshot=read(null,"entry");read(snapshot,"entry");`, context);
    assert.equal(runInContext("calls", context), 0);
  }
  const context = fixture(); runInContext('delete r.docHead.document.version;Object.setPrototypeOf(r.docHead.document,{version:"inherited"});', context);
  assert.throws(() => runInContext('read(null,"entry")', context)); assert.equal(runInContext("calls", context), 0);
});
