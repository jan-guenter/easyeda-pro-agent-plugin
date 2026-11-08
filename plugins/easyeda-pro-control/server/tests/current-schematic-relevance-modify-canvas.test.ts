/** Inert fixed-program/metadata evidence, without a browser-native timer or
 * any original worker, sender, callback delivery or completion authority. */
import assert from "node:assert/strict";
import { Session } from "node:inspector/promises";
import type { Runtime } from "node:inspector/promises";
import { test } from "node:test";
import { createContext, runInContext } from "node:vm";
import { CURRENT_SCHEMATIC_RELEVANCE_MODIFY_CM_CALLEE_SOURCE as SOURCE, qualifyCurrentSchematicRelevanceModifyCmCalleeSource } from "../src/current-schematic-relevance-modify-cm-callee-source.ts";
import { CURRENT_FOOTPRINT_INVERSE_CLOCK_WORKER_CALLEES as BUS } from "../src/current-footprint-inverse-clock-worker-source.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_MODIFY_CANVAS_PROGRAMS as P } from "../src/current-schematic-relevance-modify-canvas-programs.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_MODIFY_CANVAS_CALLS as CALLS, CURRENT_SCHEMATIC_RELEVANCE_MODIFY_CANVAS_FLAGS as FLAGS, validateCurrentSchematicRelevanceModifyCanvasCommand as validate } from "../src/current-schematic-relevance-modify-canvas-protocol.ts";
import { decodeCurrentNativeFunctionMetadata as native } from "../src/current-native-function-metadata.ts";
import { INSTALLED_EASYEDA_SOURCE_SKIP_REASON, readConfiguredEasyedaAsset } from "./helpers/installed-easyeda-source.ts";

let sequence = 0;
/** Compile exact source methods without invoking their application bodies;
 * native collections and reflection stay in one fresh local realm. */
function fixture(source: string): Readonly<{ context: ReturnType<typeof createContext>; name: string }> {
  qualifyCurrentSchematicRelevanceModifyCmCalleeSource(source); sequence += 1;
  const name = `Canvas inert ${String(sequence)}`; const context = createContext({}, { name });
  const method = (role: keyof typeof SOURCE.roles): string => { const r = SOURCE.roles[role]; return source.slice(r.start, r.end); };
  const bus = (key: string): string => { const r = BUS.find(item => item.key === key); assert.ok(r !== undefined); return source.slice(r.start, r.end); };
  runInContext(`let hooks=0;const forbidden=()=>{hooks++;throw Error("hook")},Mb=(${bus("Mb")}),KP=(${bus("KP")}),JP=(${bus("JP")});class Canvas{${method("sheetPublishCanvas")}}class Sheet extends Canvas{${method("sheetOnDataChange")}}class Order{${method("orderGetOrderNum")}}
const page="page",id="text",ticket=11,client="client",unique="unique",body="body",old={client:"old",ticket:10,dataType:"TEXT"},last={client,ticket,dataType:"TEXT",data:body,pend:true,unique},node={last,list:[old],num:7},doc=new Map([[id,node]]),docs=new Map([[page,doc]]),peer=new Map([[NaN,NaN]]),order=Object.assign(Object.create(Order.prototype),{wDocData:docs}),cm={wDocData:docs,orderTree:order},bc={},workerBus=Object.assign(Object.create(JP.prototype),{uuid:"bus",bc,subscribed:{}}),project={uuid:"project",consistencyManager:cm,workerBus,publishTask:new Set},sheet=Object.assign(Object.create(Sheet.prototype),{projectManager:project,client:"worker",data:{[page]:{ticket:10,[Symbol("peer")]:"kept"}},watchIds:{[page]:1},cacheCanvas:new Map,cacheRevoke:new Map,canvasTimer:null,revokeTimer:null});project.sheet=sheet;
const debug=function debug(){forbidden()},consoleObject={debug};globalThis.console=consoleObject;globalThis.setTimeout=function setTimeout(){forbidden()};globalThis.clearTimeout=function clearTimeout(){forbidden()};
const I11=[Object.getOwnPropertyDescriptor,Object.getPrototypeOf,Object.hasOwn,Object.getOwnPropertyNames,Object.getOwnPropertySymbols,Array.isArray,Function.prototype.apply,Object.prototype,Array.prototype,Function.prototype,globalThis],qualified=[],add=o=>{if(o===null||typeof o!=="object"&&typeof o!=="function"||qualified.includes(o))return;qualified.push(o);add(Object.getPrototypeOf(o));};
const native=[Map,Map.prototype,Set,Set.prototype,Map.prototype.get,Map.prototype.has,Map.prototype.forEach,Object.getOwnPropertyDescriptor(Map.prototype,"size").get,Map.prototype.set,Set.prototype.has,Set.prototype.add,Set.prototype.forEach,Object.getOwnPropertyDescriptor(Set.prototype,"size").get,Array.prototype.forEach,Array.prototype.includes,Object.isExtensible,setTimeout,clearTimeout],projectTuple=[project,workerBus],state=[cm,sheet,...Array(16).fill(null)],previous=[cm,node,old,null,null,null,null,project],remote=[cm,ticket,client,page,id,body,"TEXT","SCH_PAGE",undefined,undefined,true,undefined,unique,undefined,undefined,undefined,null,null],onChange=[project,page,id,body,"TEXT",client,ticket,10,true,undefined,false,unique,undefined,"TEXT"],dataFrame=[sheet,page,id,body,"TEXT",client,ticket,true,undefined,unique,false,"TEXT"],canvasFrame=[sheet,page,client,ticket,id,body,"TEXT",true,undefined,unique,false,"TEXT"];
const ve=Object.fromEntries(["DOCHEAD","EDIT_HEAD","SCH","SCH_PAGE","PCB","PANEL","PANEL_LIB","SYMBOL","FOOTPRINT","DEVICE","BLOB","INSTANCE","CONFIG","BOARD","FONT","VARIANT","COMPONENT_GROUP","COMPONENT_GROUP_DATA","SIMULATION"].map(k=>[k,k])),De={META:"META",DELETE_DOC:"DELETE_DOC"},docHead={[page]:{docType:"SCH_PAGE"}};state[6]=docHead;
const bodyRoots=[consoleObject,Symbol,Array.prototype],bodyParts=[debug,Symbol.iterator,Array.prototype.values,Array.prototype[Symbol.iterator]],arrayIterator=[].values(),bodyParents=[Object.getPrototypeOf(arrayIterator),Object.getPrototypeOf(Object.getPrototypeOf(arrayIterator))];
for(const o of[ve,De,docHead,docHead[page],globalThis,project,workerBus,bc,cm,order,docs,doc,node,last,old,node.list,sheet,sheet.data,sheet.data[page],sheet.watchIds,sheet.cacheCanvas,sheet.cacheRevoke,project.publishTask,peer,consoleObject,debug,Promise,Symbol,Map,Set])add(o);for(const f of native)add(f);for(const f of bodyParts)add(f);for(const p of bodyParents)add(p);
let roots=(${P.roots}).call(I11,projectTuple,state,previous,remote,onChange,qualified);const selected=(${P.selected}).call(I11,roots,remote,native,qualified);roots=(${P.complete}).call(I11,roots,selected,qualified);const functions=(${P.functions}).call(I11,roots,qualified),constructors=(${P.nativeRoots}).call(I11);for(const f of functions)add(f);for(const c of constructors)add(c);const prototype=(${P.nativePrototype}).call(I11,constructors,qualified);for(const p of prototype)add(p);const parts=(${P.nativeParts}).call(I11,constructors,prototype,native,bodyRoots,bodyParts,qualified);for(const f of parts)add(f);const iterator=(${P.mapIterator}).call(I11,roots,parts,native,qualified);for(const p of iterator)add(p);const parents=(${P.iteratorParents}).call(I11,iterator,bodyParents,qualified);for(const p of parents)add(p);const iteratorFunctions=(${P.iteratorFunctions}).call(I11,parents,parts,qualified);for(const f of iteratorFunctions)add(f);
const collections=[docs,doc,sheet.cacheCanvas,sheet.cacheRevoke,project.publishTask,peer],collectionSnapshot=(${P.collectionSnapshot}).call(I11,collections,native,qualified),beforeQualified=qualified.slice(),beforeSnapshot=(${P.snapshot}).call(I11,beforeQualified);`, context);
  return { context, name };
}
/** Execute a reviewed helper with actual reflection, never a canned true reply. */
function run(context: ReturnType<typeof createContext>, program: string, args: string): unknown { try { return runInContext(`(${program}).call(I11,${args})`, context); } catch (error) { const role = Object.entries(P).find(([, value]) => value === program)?.[0] ?? "unknown"; throw new Error(`Canvas fixture ${role}`, { cause: error }); } }

void test("canvas recipes keep ticket and cache/Promise deltas separate and preserve every old peer", async context => {
  const source = await readConfiguredEasyedaAsset(SOURCE.relativePath); if (source === null) { context.skip(INSTALLED_EASYEDA_SOURCE_SKIP_REASON); return; }
  const { context: realm } = fixture(source);
  assert.equal(run(realm, P.enums, "[ve,De],state,remote,qualified"), true);
  assert.equal(run(realm, P.proof, "roots,functions,parts,constructors,parents,iteratorFunctions,native,qualified"), true);
  assert.equal(run(realm, P.branch, "roots,native,parts,onChange,qualified"), true);
  assert.equal(run(realm, P.dataEntry, "dataFrame,roots,remote,onChange,onChange,qualified"), true);
  runInContext("const foreignCaller=onChange.slice();foreignCaller[0]={}", realm); assert.throws(() => run(realm, P.dataEntry, "dataFrame,roots,remote,onChange,foreignCaller,qualified"));
  runInContext("sheet.data[page].ticket=ticket", realm); assert.throws(() => run(realm, P.same, "beforeSnapshot,beforeQualified"));
  assert.equal(run(realm, P.ticketDelta, "beforeSnapshot,beforeQualified,roots,onChange"), true);
  assert.equal(run(realm, P.entry, "canvasFrame,dataFrame,roots,remote,onChange,qualified"), true);
  runInContext(`const entryQualified=qualified.slice(),entrySnapshot=(${P.snapshot}).call(I11,entryQualified);let resolver;const promise=new Promise(r=>{resolver=r}),rows=[[id,ticket,body,"TEXT",client,true,unique,false,7]],constructedFrame=[sheet,resolver,promise];sheet.cacheCanvas.set(page,rows);`, realm);
  assert.throws(() => run(realm, P.constructed, "constructedFrame,roots,forbidden,native,onChange,qualified"));
  const created: unknown = run(realm, P.constructed, "constructedFrame,roots,resolver,native,onChange,qualified"); assert.ok(Array.isArray(created)); assert.equal(created.length, 3);
  assert.equal(run(realm, P.cacheDelta, "collectionSnapshot,collections,native,roots,[resolver,promise,rows],onChange,qualified"), true);
  runInContext("add(resolver);add(promise);add(rows);add(rows[0]);", realm);
  const names: unknown = runInContext("Object.getOwnPropertySymbols(promise).map(value=>value.description)", realm);
  assert.ok(Array.isArray(names)); assert.equal(names.length, 2); assert.equal(names[0], "async_id_symbol"); assert.equal(names[1], "trigger_async_id_symbol");
  assert.throws(() => run(realm, P.constructedProof, "[resolver,promise,rows],[rows[0]],roots,parts,onChange,qualified"));
  assert.equal(run(realm, P.same, "entrySnapshot,entryQualified"), true);
  runInContext('sheet.data[page][Object.getOwnPropertySymbols(sheet.data[page])[0]]="changed"', realm); assert.throws(() => run(realm, P.ticketDelta, "beforeSnapshot,beforeQualified,roots,onChange"));
  runInContext('peer.set("extra",1)', realm); assert.throws(() => run(realm, P.cacheDelta, "collectionSnapshot,collections,native,roots,[resolver,promise,rows],onChange,qualified")); assert.equal(runInContext("hooks", realm), 0);
  const overridden: ReturnType<typeof createContext> = fixture(source).context; runInContext('sheet.cacheCanvas[Symbol.iterator]=forbidden', overridden); assert.throws(() => run(overridden, P.branch, "roots,native,parts,onChange,qualified")); assert.equal(runInContext("hooks", overridden), 0);
  const enums: ReturnType<typeof createContext> = fixture(source).context; runInContext('Object.defineProperty(ve,"BLOB",{get:forbidden,configurable:true})', enums); assert.throws(() => run(enums, P.enums, "[ve,De],state,remote,qualified")); assert.equal(runInContext("hooks", enums), 0);
  for (const mutation of ['Object.defineProperty(Array.prototype,"0",{set:forbidden,configurable:true})', 'Object.defineProperty(bodyParents[0],"return",{get:forbidden,configurable:true})']) { const changed: ReturnType<typeof createContext> = fixture(source).context; runInContext(mutation, changed); assert.throws(() => run(changed, P.proof, "roots,functions,parts,constructors,parents,iteratorFunctions,native,qualified")); assert.equal(runInContext("hooks", changed), 0); }
});

void test("local Inspector qualifies native Promise/iterator functions and executes guarded recipes", async context => {
  const source = await readConfiguredEasyedaAsset(SOURCE.relativePath); if (source === null) { context.skip(INSTALLED_EASYEDA_SOURCE_SKIP_REASON); return; }
  const session = new Session(); session.connect(); const contexts: { id: number; name: string }[] = [];
  session.on("Runtime.executionContextCreated", event => { contexts.push({ id: event.params.context.id, name: event.params.context.name }); });
  try {
    await session.post("Runtime.enable"); const f = fixture(source); const actual = contexts.find(item => item.name === f.name); assert.ok(actual !== undefined);
    for (const [expression, name, arity] of [["parts[1]", "resolve", 1], ["parts[2]", "then", 2], ["parts[3]", "get [Symbol.species]", 0], ["parts[4]", "push", 1], ["parts[5]", "clear", 0], ["parts[6]", "delete", 1], ["parts[7]", "entries", 0], ["iteratorFunctions[0]", "next", 0], ["iteratorFunctions[1]", "[Symbol.iterator]", 0]] as const) { const r = await session.post("Runtime.evaluate", { expression, contextId: actual.id }); assert.ok(r.result.objectId !== undefined); native(await session.post("Runtime.getProperties", { objectId: r.result.objectId, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false }), { name, arity, constructor: false }); }
    const ids: string[] = []; for (const expression of ["I11", "roots", "functions", "parts", "constructors", "parents", "iteratorFunctions", "native", "qualified", "onChange"]) { const r = await session.post("Runtime.evaluate", { expression, contextId: actual.id }); assert.ok(r.result.objectId !== undefined); ids.push(r.result.objectId); }
    for (const [program, indices] of [[P.proof, [1, 2, 3, 4, 5, 6, 7, 8]], [P.branch, [1, 7, 3, 9, 8]]] as const) { const params: Runtime.CallFunctionOnParameterType & Readonly<{ throwOnSideEffect: true }> = { objectId: ids[0], functionDeclaration: program, arguments: indices.map(index => ({ objectId: ids[index] })), returnByValue: true, throwOnSideEffect: true }; const r = await session.post("Runtime.callFunctionOn", params); assert.equal(r.exceptionDetails, undefined); assert.equal(r.result.value, true); }
    assert.equal(runInContext("hooks", f.context), 0);
  } finally { session.disconnect(); }
});

void test("canvas rows fix passive bytes, argument counts, result modes and actual-frame expressions", () => {
  for (const [role, program, count, byValue] of CALLS) { assert.ok(Buffer.byteLength(JSON.stringify(program)) < 16_384); const command = { phase: "modify-canvas-call", role, method: "Runtime.callFunctionOn", params: { ...FLAGS, objectId: "original-i11", functionDeclaration: program, arguments: Array.from({ length: count }, (_, index) => ({ objectId: `original-${String(index)}` })), returnByValue: byValue, awaitPromise: false, userGesture: false } }; validate(command); assert.throws(() => validate({ ...command, params: { ...command.params, throwOnSideEffect: false } })); assert.throws(() => validate({ ...command, params: { ...command.params, functionDeclaration: "function(){return true;}" } })); }
  assert.throws(() => validate({ phase: "modify-canvas-call", role: "entry", method: "Debugger.resume", params: {} }));
});
