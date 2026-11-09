/** Source-derived graph and actual local Inspector reflection only. Browser
 * timer metadata is never fabricated or claimed by this inert fixture. */
import assert from "node:assert/strict";
import { Session } from "node:inspector/promises";
import type { Runtime } from "node:inspector/promises";
import { test } from "node:test";
import { createContext, runInContext } from "node:vm";
import { CURRENT_SCHEMATIC_RELEVANCE_MODIFY_CM_CALLEE_SOURCE as SOURCE, qualifyCurrentSchematicRelevanceModifyCmCalleeSource } from "../src/current-schematic-relevance-modify-cm-callee-source.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_MODIFY_TICKET_SOURCE as TICKET } from "../src/current-schematic-relevance-modify-ticket-source.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_MODIFY_STRUCTURE_SOURCE as STRUCTURE } from "../src/current-schematic-relevance-modify-structure-source.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_MODIFY_CM_PROGRAMS as P } from "../src/current-schematic-relevance-modify-cm-programs.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_MODIFY_CM_CALLS as CALLS, CURRENT_SCHEMATIC_RELEVANCE_MODIFY_CM_FLAGS as FLAGS, validateCurrentSchematicRelevanceModifyCmCommand as validate } from "../src/current-schematic-relevance-modify-cm-protocol.ts";
import { INSTALLED_EASYEDA_SOURCE_SKIP_REASON, readConfiguredEasyedaAsset } from "./helpers/installed-easyeda-source.ts";

let sequence = 0;
/** Compile complete pinned classes and original method bodies without calling
 * any application constructor, callback, getter, timer or CM method. */
function fixture(source: string, uniqueCase = 0): Readonly<{ context: ReturnType<typeof createContext>; name: string }> {
  qualifyCurrentSchematicRelevanceModifyCmCalleeSource(source);
  sequence += 1; const name = `CM inert ${String(sequence)}`; const context = createContext({}, { name });
  const method = (role: keyof typeof SOURCE.roles): string => { const row = SOURCE.roles[role]; return source.slice(row.start, row.end); };
  runInContext(`let calls=0;const forbidden=()=>{calls++;throw Error("unexpected application hook");};class zy{};var Vc=${method("cmBaseConstructor")},ja=${method("jaConstructor")},At=${method("nodeConstructor")};${method("ticketCompare")}
const sheetPrototype=(class{${method("sheetOnDataChange")}${method("sheetPublishCanvas")}}).prototype,orderPrototype=(class{${method("orderHas")}${method("orderGetOrderNum")}}).prototype,ticketPrototype=(class{${TICKET.localPublishTicket.source}${TICKET.canWsPublish.source}}).prototype;
const page="page",id="text",ticket=11,client="ui-client",unique="ui-unique",body="new text body",last={client:"old-client",ticket:10,dataType:"TEXT",data:"old text body"},peer={last:{client:"peer-client",ticket:2,dataType:"TEXT"},[Symbol("unknown")]:"retained"},node={last,num:1},documentMap=new Map([[id,node],["peer",peer]]),docs=new Map([[page,documentMap]]),uniqueIds={},docHead={[page]:{docType:"SCH_PAGE"}},docMaxTicket={[page]:10};
const cm=Object.assign(Object.create(ja.prototype),{maxTicket:10,unique:"worker-unique",client:"worker-client",wDocData:docs,caseInsensitiveTypes:new Set(["NET","RULE_SELECTOR"]),uniqueIds,docHead,docMaxTicket,cbArr:[],cacheType:[],needDocIdDoctype:["SCH_PAGE"],padNetsByComponent:new Map});
const order=Object.assign(Object.create(orderPrototype),{wDocData:docs,numSets:{[page]:{orderLists:{},maxNum:{}}}});cm.orderTree=order;cm.padNetsByComponent.set(NaN,NaN);if(${String(uniqueCase)}===1)uniqueIds[unique]={};if(${String(uniqueCase)}===2)uniqueIds[unique]={[page]:new Set};if(${String(uniqueCase)}===3)uniqueIds[unique]={[page]:new Set([id])};
const project=Object.assign(Object.create(ticketPrototype),{consistencyManager:cm,publishTask:new Set,publishTimer:null}),sheet=Object.assign(Object.create(sheetPrototype),{projectManager:project,client:"worker-client",data:{[page]:{ticket:10}},watchIds:{[page]:1},cacheCanvas:new Map,cacheRevoke:new Map,canvasTimer:null,revokeTimer:null});project.sheet=sheet;
const onChange=(${source.slice(STRUCTURE.onChange.start, STRUCTURE.onChange.end)});cm.cbArr[0]=onChange;
const bc={name:"fixture-channel"},bus={bc},projectTuple=[project,bus],change=[id,ticket,"TEXT",body],pend=[change],row={type:"SCH_PAGE",pend},cache={[page]:row},message=[cache,client,unique,page],event={},read=[event,{type:"PUBLISH",uuid:"fixture-bus",topic:"/pro-mgr/worker/batchPendData",message}],eventFrame=[bus,event],batch=[project,message];project.workerBus=bus;globalThis.PROJECT=project;
const timers={setTimeout(callback){forbidden();},clearTimeout(){forbidden();}};globalThis.setTimeout=timers.setTimeout;globalThis.clearTimeout=timers.clearTimeout;
const I11=[Object.getOwnPropertyDescriptor,Object.getPrototypeOf,Object.hasOwn,Object.getOwnPropertyNames,Object.getOwnPropertySymbols,Array.isArray,Function.prototype.apply,Object.prototype,Array.prototype,Function.prototype,globalThis],qualified=[];
const add=o=>{if(o===null||typeof o!=="object"&&typeof o!=="function"||qualified.includes(o))return;qualified.push(o);add(Object.getPrototypeOf(o));};
for(const o of[globalThis,Object.prototype,Array.prototype,Function.prototype,project,bus,bc,event,read,read[1],message,cache,row,pend,change,cm,sheet,project.publishTask,docs,documentMap,node,last,peer,cm.caseInsensitiveTypes,uniqueIds,docHead,docHead[page],docMaxTicket,cm.cbArr,cm.cacheType,cm.needDocIdDoctype,cm.padNetsByComponent,uniqueIds[unique],uniqueIds[unique]?.[page],order,order.numSets,order.numSets[page],sheet.data,sheet.data[page],sheet.watchIds,sheet.cacheCanvas,sheet.cacheRevoke,Map,Map.prototype,Set,Set.prototype,Object])add(o);
const roots=(${P.batch}).call(I11,projectTuple,batch,eventFrame,read,qualified),constructors=(${P.nativeRoots}).call(I11),native=(${P.native}).call(I11,constructors,qualified),state=(${P.state}).call(I11,projectTuple,roots,qualified),functions=(${P.functions}).call(I11,projectTuple,state,qualified);for(const fn of functions)add(fn);for(const fn of native)add(fn);
const selected=(${P.selected}).call(I11,state,native,read,qualified),details=(${P.selectedDetails}).call(I11,selected,state,read,qualified),deltaRoots=(${P.deltaRoots}).call(I11,projectTuple,state,selected,details,qualified),seed=(${P.collections}).call(I11,state,qualified,native),collections=(${P.documentMaps}).call(I11,state,seed,native,qualified),collectionSnapshot=(${P.collectionSnapshot}).call(I11,collections,native,qualified),snapshot=(${P.snapshot}).call(I11,qualified);
const frame=[cm,ticket,client,page,id,body,"TEXT","SCH_PAGE",undefined,undefined,true,undefined,unique,undefined,undefined,undefined,At,EE],caller=[project,message];`, context);
  return { context, name };
}
/** Execute the exact reviewed recipe in its own realm with genuine reflection
 * and native ordered Maps/Sets; no boolean helper response is substituted. */
function run(context: ReturnType<typeof createContext>, program: string, argumentsExpression: string): unknown { try { return runInContext(`(${program}).call(I11,${argumentsExpression})`, context); } catch (error) { const role = Object.entries(P).find(([, value]) => value === program)?.[0] ?? "unknown"; throw new Error(`CM fixture ${role}`, { cause: error }); } }

void test("source-derived CM graph preserves full peers, ordered collections and exact remoteChange formals", async context => {
  const source = await readConfiguredEasyedaAsset(SOURCE.relativePath); if (source === null) { context.skip(INSTALLED_EASYEDA_SOURCE_SKIP_REASON); return; }
  for (const uniqueCase of [1, 2, 3]) {
    const variant: ReturnType<typeof createContext> = fixture(source, uniqueCase).context;
    assert.equal(run(variant, P.beforeProof, "projectTuple,state,functions,native,deltaRoots,read,qualified"), true);
    assert.equal(run(variant, P.branch, "state,native,deltaRoots,details,read,qualified"), true);
    assert.equal(run(variant, P.collectionSame, "collectionSnapshot,collections,native,qualified"), true);
  }
  const selectedSet: ReturnType<typeof createContext> = fixture(source, 2).context;
  runInContext('uniqueIds[unique][page][Symbol("peer")]=true', selectedSet);
  assert.throws(() => run(selectedSet, P.branch, "state,native,deltaRoots,details,read,qualified"));
  assert.equal(runInContext("calls", selectedSet), 0);
  const { context: realm } = fixture(source);
  assert.equal(run(realm, P.beforeProof, "projectTuple,state,functions,native,deltaRoots,read,qualified"), true);
  assert.equal(run(realm, P.branch, "state,native,deltaRoots,details,read,qualified"), true);
  assert.equal(run(realm, P.collectionSame, "collectionSnapshot,collections,native,qualified"), true);
  assert.equal(run(realm, P.same, "snapshot,qualified"), true);
  const noIterator: ReturnType<typeof createContext> = fixture(source).context;
  runInContext('Object.defineProperty(Array.prototype,Symbol.iterator,{get:forbidden,configurable:true})', noIterator);
  assert.equal(run(noIterator, P.beforeProof, "projectTuple,state,functions,native,deltaRoots,read,qualified"), true);
  assert.equal(run(noIterator, P.branch, "state,native,deltaRoots,details,read,qualified"), true);
  assert.equal(runInContext("calls", noIterator), 0);
  const entry: unknown = run(realm, P.entry, "frame,caller,batch,state,read,qualified"); assert.ok(Array.isArray(entry)); assert.equal(entry.length, 2);
  assert.equal(runInContext("frame[12]===unique&&frame[13]===undefined&&functions.length===19&&native.length===18", realm), true);
  runInContext('caller[1]=[...message]', realm); assert.throws(() => run(realm, P.entry, "frame,caller,batch,state,read,qualified")); runInContext('caller[1]=message', realm);
  runInContext('frame[12]=undefined;frame[13]=unique', realm); assert.throws(() => run(realm, P.entry, "frame,caller,batch,state,read,qualified"));
  runInContext('documentMap.delete("text");documentMap.set("text",node)', realm); assert.throws(() => run(realm, P.collectionSame, "collectionSnapshot,collections,native,qualified"));
  runInContext('peer[Object.getOwnPropertySymbols(peer)[0]]="changed"', realm); assert.throws(() => run(realm, P.same, "snapshot,qualified")); assert.equal(runInContext("calls", realm), 0);
  for (const mutation of ['Object.preventExtensions(row)', 'Object.defineProperty(Object.prototype,"length",{set:forbidden,configurable:true})', 'Object.defineProperty(Object.prototype,"list",{get:forbidden,configurable:true})', 'node.list=undefined', 'cm.needDocIdDoctype.includes=forbidden', 'Object.defineProperty(cm.needDocIdDoctype,"0",{get:forbidden,configurable:true})', 'uniqueIds[unique]=undefined', 'last.firstTicket=NaN', '(function(){const p={firstTicket:3};add(p);Object.setPrototypeOf(last,p)})()', 'Object.defineProperty(sheet,"client",{get:forbidden,configurable:true})']) {
    const changed: ReturnType<typeof createContext> = fixture(source).context; runInContext(mutation, changed);
    if (mutation.includes("length") || mutation.includes("Extensions")) { assert.throws(() => run(changed, P.beforeProof, "projectTuple,state,functions,native,deltaRoots,read,qualified")); } else { assert.throws(() => run(changed, P.branch, "state,native,deltaRoots,details,read,qualified")); }
    assert.equal(runInContext("calls", changed), 0);
  }
});

void test("actual local Inspector runs the readonly native collection seal with its side-effect guard intact", async context => {
  const source = await readConfiguredEasyedaAsset(SOURCE.relativePath); if (source === null) { context.skip(INSTALLED_EASYEDA_SOURCE_SKIP_REASON); return; }
  const session = new Session(); session.connect();
  const contexts: { id: number; name: string }[] = []; session.on("Runtime.executionContextCreated", event => { contexts.push({ id: event.params.context.id, name: event.params.context.name }); });
  try {
    await session.post("Runtime.enable");
    const f = fixture(source); const actual = contexts.find(value => value.name === f.name); assert.ok(actual !== undefined);
    const ids: string[] = [];
    for (const expression of ["I11", "collections", "native", "qualified", "projectTuple", "state", "functions", "deltaRoots", "read", "details"]) {
      const params: Runtime.EvaluateParameterType & Readonly<{ throwOnSideEffect: true }> = { expression, contextId: actual.id, returnByValue: false, throwOnSideEffect: true };
      const raw: unknown = await session.post("Runtime.evaluate", params);
      assert.ok(raw !== null && typeof raw === "object"); const result: unknown = Reflect.get(raw, "result"); assert.ok(result !== null && typeof result === "object"); const id: unknown = Reflect.get(result, "objectId"); assert.equal(typeof id, "string"); if (typeof id !== "string") { throw new TypeError("original fixture object"); } ids.push(id);
    }
    for (const [program, indices, returnByValue] of [[P.collectionSnapshot, [1, 2, 3], false], [P.beforeProof, [4, 5, 6, 2, 7, 8, 3], true], [P.branch, [5, 2, 7, 9, 8, 3], true]] as const) {
      const params: Runtime.CallFunctionOnParameterType & Readonly<{ throwOnSideEffect: true }> = { objectId: ids[0], functionDeclaration: program, arguments: indices.map(index => ({ objectId: ids[index] })), returnByValue, silent: true, generatePreview: false, awaitPromise: false, userGesture: false, throwOnSideEffect: true };
      const reply: unknown = await session.post("Runtime.callFunctionOn", params);
      assert.ok(reply !== null && typeof reply === "object" && !Object.hasOwn(reply, "exceptionDetails"));
      if (returnByValue) { const result: unknown = Reflect.get(reply, "result"); assert.ok(result !== null && typeof result === "object"); assert.equal(Reflect.get(result, "value"), true); }
    }
    assert.equal(runInContext("calls", f.context), 0);
  } finally { session.disconnect(); }
});

void test("CM vocabulary fixes every byte, argument count, result mode and frame role without a resume", () => {
  for (const [role, program, count, returnByValue] of CALLS) {
    assert.ok(Buffer.byteLength(JSON.stringify(program)) < 16_384);
    const command = { phase: "modify-cm-call", role, method: "Runtime.callFunctionOn", params: { ...FLAGS, objectId: "original-i11", functionDeclaration: program, arguments: Array.from({ length: count }, (_, i) => ({ objectId: `original-${String(i)}` })), returnByValue, awaitPromise: false, userGesture: false } };
    validate(command); assert.throws(() => validate({ ...command, params: { ...command.params, functionDeclaration: "function(){return true;}" } }));
    assert.throws(() => validate({ ...command, params: { ...command.params, throwOnSideEffect: false } }));
  }
  assert.throws(() => validate({ phase: "modify-cm-frame", role: "caller", method: "Debugger.evaluateOnCallFrame", params: { ...FLAGS, callFrameId: "original-frame", expression: P.frame, returnByValue: false, includeCommandLineAPI: false } }));
  assert.throws(() => validate({ phase: "modify-cm-call", role: "entry", method: "Debugger.resume", params: {} }));
});
