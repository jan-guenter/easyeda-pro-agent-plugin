// oxlint-disable import/max-dependencies -- The source-preserving integration test joins two independent production GET readers to the DEL collector.
/** Source-preserving inert factories exercise the actual readonly collector.
 * Tuple/owner inputs are fixture seams, not authenticated original authority. */
import assert from "node:assert/strict";
import { Session } from "node:inspector/promises";
import type { Runtime } from "node:inspector";
import { test } from "node:test";
import { INSTALLED_EASYEDA_SOURCE_SKIP_REASON, readConfiguredEasyedaAssets } from "./helpers/installed-easyeda-source.ts";
import { collectCurrentFootprintInverseDeleteManager } from "../src/current-footprint-inverse-delete-manager-collector.ts";
import {CURRENT_FOOTPRINT_INVERSE_DELETE_SEND_PROGRAMS as SEND_PROGRAMS} from "../src/current-footprint-inverse-delete-send-programs.ts";
import { CURRENT_FOOTPRINT_INVERSE_DELETE_MANAGER_FLAGS as FLAGS, CURRENT_FOOTPRINT_INVERSE_DELETE_MANAGER_REQUESTS as REQUESTS, currentFootprintInverseDeleteManagerCases, currentFootprintInverseDeleteManagerNativeFrame, currentFootprintInverseDeleteManagerTemplate, currentFootprintInverseDeleteManagerWire, qualifyCurrentFootprintInverseDeleteManagerHelper, validateCurrentFootprintInverseDeleteManagerCommand as validate } from "../src/current-footprint-inverse-delete-manager-protocol.ts";
import type { CurrentFootprintInverseDeleteManagerCommand as Command } from "../src/current-footprint-inverse-delete-manager-protocol.ts";
import { CURRENT_FOOTPRINT_INVERSE_DELETE_MANAGER_PROGRAMS as PROGRAMS } from "../src/current-footprint-inverse-delete-manager-programs.ts";
import { CURRENT_FOOTPRINT_INVERSE_DELETE_MANAGER_SOURCE as DELETE_SOURCE, qualifyCurrentFootprintInverseDeleteManagerSource } from "../src/current-footprint-inverse-delete-manager-source.ts";
import { CURRENT_FOOTPRINT_INVERSE_INITIALIZED_GET_SOURCE as SOURCE, qualifyCurrentFootprintInverseInitializedGetSource } from "../src/current-footprint-inverse-initialized-get-source.ts";
import { collectCurrentFootprintInverseGetForwarding } from "../src/current-footprint-inverse-get-forwarding-collector.ts";
import { collectCurrentFootprintInverseGetManager } from "../src/current-footprint-inverse-get-manager-collector.ts";

interface Piece { readonly start: number; readonly end: number; readonly prefix: string; readonly suffix: string }
function overlay(source: string, pieces: readonly Piece[], intro: string, tail: string): string {
  // Split by UTF16 code unit: source positions must not collapse astral text.
  let out = intro + source.split("").map(value => value === "\r" || value === "\n" ? value : " ").join("").slice(intro.length);
  for (const piece of pieces.toSorted((a, b) => a.start - b.start)) { out = out.slice(0, piece.start - piece.prefix.length) + piece.prefix + source.slice(piece.start, piece.end) + piece.suffix + out.slice(piece.end + piece.suffix.length); }
  return out + tail;
}
void test("fresh DEL preparation qualifies both original RPC profiles without executing a body or a spent GET guard", async context => {
  assert.equal(process.versions.node, "24.18.0");
  const sources = await readConfiguredEasyedaAssets(["pro-mgr/3.2.185.bf63a159/js/pro-mgr.js", "pro-ui/3.2.198.2800f583/js/ui.js"]);
  if (sources === null) { context.skip(INSTALLED_EASYEDA_SOURCE_SKIP_REASON); return; }
  const [manager, ui] = sources; assert.ok(manager !== undefined && ui !== undefined);
  qualifyCurrentFootprintInverseDeleteManagerSource(manager); qualifyCurrentFootprintInverseInitializedGetSource(ui, "ui");
  const session = new Session(); session.connect(); const parsed: string[] = []; session.on("Debugger.scriptParsed", message => { parsed.push(message.params.scriptId); }); await session.post("Runtime.enable"); await session.post("Debugger.enable");
  const reference = async (expression: string): Promise<string> => { const raw = await session.post("Runtime.evaluate", { expression }); assert.equal(raw.exceptionDetails, undefined); assert.ok(raw.result.objectId !== undefined); return raw.result.objectId; };
  const evaluate = async (expression: string): Promise<unknown> => { const raw = await session.post("Runtime.evaluate", { expression, returnByValue: true }); assert.equal(raw.exceptionDetails, undefined); return raw.result.value; };
  const compile = async (expression: string, sourceURL: string): Promise<string> => { const raw = await session.post("Runtime.compileScript", { expression, sourceURL, persistScript: true }); assert.ok(raw.scriptId !== undefined, JSON.stringify(raw.exceptionDetails)); const run = await session.post("Runtime.runScript", { scriptId: raw.scriptId }); assert.equal(run.exceptionDetails, undefined); return raw.scriptId; };
  try {
    const uiId = await compile(overlay(ui, [{ start: 1_643_706, end: 1_661_621, prefix: "", suffix: ";" }], "(()=>{let KU;const xe=cb=>{const m={exports:{}};cb({},m);return()=>m.exports;};", ";globalThis.deleteManagerUiCtor=KU().MessageBus;})()"), "inert-del-manager-ui.js");
    for (const profile of ["ui", "manager"] as const) {
      const factory = { start: 798, end: 18_561, prefix: "", suffix: ";" };
      const pieces: Piece[] = [factory, { start: 1_701_619, end: 1_702_368, prefix: ";", suffix: ";" },
        { start: SOURCE.managerProjectGetData.start, end: SOURCE.managerProjectGetData.end, prefix: ";var V0=class{constructor(t){this.project=t}", suffix: "" },
        { start: DELETE_SOURCE.method.start, end: DELETE_SOURCE.method.end, prefix: "", suffix: "};" },
        ...(["managerApplyArguments", "managerProjectLookup", "managerRegisterService"] as const).map(role => ({ start: SOURCE[role].start, end: SOURCE[role].end, prefix: ";", suffix: ";" })),
        { start: SOURCE.managerRegisterGetCallback1.start, end: SOURCE.managerRegisterGetCallback1.end, prefix: ';Ee={messageBus:globalThis.deleteManagerFixture.bus};V("/PrjDB/footprint/getData",', suffix: ");" },
        { start: DELETE_SOURCE.handler.start, end: DELETE_SOURCE.handler.end, prefix: ';V("/PrjDB/footprint/delete",', suffix: ");" }];
      let source = overlay(manager, pieces, "(()=>{let Li,Ee;const J={footprint:{delete:'/mgr/projectWorker/footprint/delete'}},El=cb=>{const m={exports:{}};cb({},m);return()=>m.exports;};", ';let transportCalls=0,spentCalls=0;const project={uuid:"a".repeat(64),isReady:true,workerBus:{rpcCall(){transportCalls++;throw Error("no transport")}}};project.footprint=new V0(project);el.tool=new el;el.tool.map.set(project.uuid,project);Object.assign(globalThis.deleteManagerFixture,{project,asyncPrototype:Object.getPrototypeOf(async()=>{}),registry:el.tool,transportCalls:()=>transportCalls,spent:()=>{spentCalls++;throw Error("spent GET guard called")},spentCalls:()=>spentCalls});})();');
      const setup = `;const ctor=${profile === "ui" ? "globalThis.deleteManagerUiCtor" : "Li().MessageBus"},bus=new ctor,guard=()=>true;globalThis.deleteManagerFixture={bus,selected:[bus,Object.getPrototypeOf(bus),null,guard],functions:[ctor,bus.rpcCall,function retainedLoGetter(){throw Error("retained getter must not execute")},guard],native:[Object,Array,Function,Symbol,Promise,Date,ArrayBuffer,typeof SharedArrayBuffer==='undefined'?null:SharedArrayBuffer,Blob,FormData,Uint8ClampedArray,null,String,Number,WeakRef,JSON,setTimeout,clearTimeout,console,guard],receipt:[Object.getOwnPropertyDescriptor,Object.getPrototypeOf,Object.hasOwn,Object.getOwnPropertyNames,Object.getOwnPropertySymbols,Array.isArray,Function.prototype.apply,Object.prototype,Array.prototype,Function.prototype,globalThis]};`;
      const insert = factory.end + 1; source = source.slice(0, insert) + setup + source.slice(insert + setup.length);
      const managerId = await compile(source, `inert-del-manager-${profile}.js`); const receipt = await reference("deleteManagerFixture.receipt"); const selected = await reference("deleteManagerFixture.selected"); const functions = await reference("deleteManagerFixture.functions"); const native = await reference("deleteManagerFixture.native"); const rpc = await reference("deleteManagerFixture.bus.rpcCall"); const asyncPrototype = await reference("deleteManagerFixture.asyncPrototype");
      let helperCount = 0;
      const request = async (command: Command): Promise<unknown> => { const row = validate(command); if (row.method === "Runtime.getProperties") { return session.post(row.method, row.params); } assert.equal(row.method, "Runtime.callFunctionOn"); if (row.method !== "Runtime.callFunctionOn") { throw new Error("helper source reads belong to the original controller"); } const params: Runtime.CallFunctionOnParameterType = { ...row.params, arguments: row.params.arguments.map(value => ({ ...value })) }; const before = parsed.length; const raw = await session.post(row.method, params); assert.equal(raw.exceptionDetails, undefined, row.role); const helperIds = parsed.slice(before); assert.equal(helperIds.length, 1); const helperId = helperIds[0]; assert.ok(helperId !== undefined); qualifyCurrentFootprintInverseDeleteManagerHelper(await session.post("Debugger.getScriptSource", { scriptId: helperId }), row.params.functionDeclaration); helperCount += 1; return raw; };
      // These two production readers establish comparison handles, not owner
      // Authority. Their guards are deliberately poisoned before DEL prep.
      type InertCommand = Parameters<Parameters<typeof collectCurrentFootprintInverseGetForwarding>[0]["request"]>[0] | Parameters<Parameters<typeof collectCurrentFootprintInverseGetManager>[0]["request"]>[0];
      const inertRequest = async (command: InertCommand): Promise<unknown> => { if (command.method === "Runtime.getProperties") { return session.post(command.method, command.params); } assert.equal(command.method, "Runtime.callFunctionOn"); if (command.method !== "Runtime.callFunctionOn") { throw new Error("unexpected source read"); } const params: Runtime.CallFunctionOnParameterType = { ...command.params, arguments: command.params.arguments.map(value => ({ ...value })) }; const raw = await session.post("Runtime.callFunctionOn", params); assert.equal(raw.exceptionDetails, undefined); return raw; };
      const forwarding = await collectCurrentFootprintInverseGetForwarding({ receipt, selected, functions, native, rpc, profile, uiScriptId: uiId, managerScriptId: managerId, current: (): void => { assert.ok(managerId.length > 0); }, request: inertRequest });
      const target = { projectUuid: "a".repeat(64), branchUuid: "b".repeat(32), documentUuid: "c".repeat(16) };
      const graph = await collectCurrentFootprintInverseGetManager({ receipt, managerModule: forwarding.managerModule, asyncPrototype, managerScriptId: managerId, target, current: (): void => { assert.ok(managerId.length > 0); }, request: inertRequest });
      for (const id of [selected, functions, native, forwarding.module, forwarding.roots, forwarding.queue, forwarding.task, forwarding.taskMembers, forwarding.methods, forwarding.reply, forwarding.handler, forwarding.body, forwarding.managerModule, graph.registry, graph.map, graph.native, graph.nativePrototype, graph.methods, graph.selected, graph.project, graph.footprint, graph.getData]) { const raw = await session.post("Runtime.callFunctionOn", { objectId: id, functionDeclaration: "function(){this[this.length-1]=deleteManagerFixture.spent;return true}", returnByValue: true }); assert.equal(raw.result.value, true); }
      await evaluate('deleteManagerFixture.bus.rpcTicket=7;deleteManagerFixture.entry=[deleteManagerFixture.bus,"/PrjDB/footprint/delete",["c".repeat(16),"a".repeat(64)],300000,2]');
      const entry = await reference("deleteManagerFixture.entry"); const commands: Command[] = [];
      const prepared = await collectCurrentFootprintInverseDeleteManager({ receipt, selected, functions, native, rpc, entry, profile, uiScriptId: uiId, managerScriptId: managerId, asyncPrototype, target, forwarding, manager: graph, current: (): void => { assert.equal(profile === "ui" || profile === "manager", true); }, request: command => { commands.push(command); return request(command); } });
      context.diagnostic(`${profile}: ${String(prepared.calls)} projections, ${String(prepared.properties)} property packets`);
      // These fresh method guards retain original tuple values after the ticket advances.
      // Preparation guards remain unused.
      const freshCall=async(program:string,refs:readonly string[],byValue=false):Promise<string|true>=>{const params:Runtime.CallFunctionOnParameterType={...FLAGS,objectId:receipt,functionDeclaration:program,arguments:refs.map(objectId=>({objectId})),returnByValue:byValue};const before=parsed.length;const raw=await session.post("Runtime.callFunctionOn",params);assert.equal(raw.exceptionDetails,undefined);const ids=parsed.slice(before);assert.equal(ids.length,1);const id=ids[0];assert.ok(id!==undefined);const helperSource=await session.post("Debugger.getScriptSource",{scriptId:id});assert.equal(helperSource.scriptSource,`(${program})`);if(byValue){assert.equal(raw.result.value,true);return true;}assert.ok(raw.result.objectId!==undefined);return raw.result.objectId;};
      const freshData=await freshCall(SEND_PROGRAMS.managerData,[prepared.selected,prepared.project,prepared.footprint,prepared.method,prepared.registry,prepared.map,prepared.mapMethods,graph.nativePrototype]);
      const freshLinks=await freshCall(SEND_PROGRAMS.managerLinks,[prepared.managerModule,prepared.handler,prepared.body,prepared.callbackScope,prepared.handlerScope,prepared.bodyScope,prepared.originalLookupScope,prepared.methodScope]);
      const freshTopics=await freshCall(SEND_PROGRAMS.managerTopics,[prepared.topics,prepared.topicGroup,prepared.registrySelfScope]);
      const heldCallback=await reference('[null,()=>true,null,null]');assert.equal(typeof freshData,"string");assert.equal(typeof freshLinks,"string");assert.equal(typeof freshTopics,"string");if(typeof freshData!=="string"||typeof freshLinks!=="string"||typeof freshTopics!=="string"){throw new TypeError("method fixture handles");}
      await evaluate('deleteManagerFixture.project.guardZero=-0');const prepareProgram=profile==="ui"?SEND_PROGRAMS.prepareUi:SEND_PROGRAMS.prepareManager;
      const freshParams:Runtime.CallFunctionOnParameterType={...FLAGS,objectId:receipt,functionDeclaration:prepareProgram,arguments:[{objectId:freshData},{objectId:freshLinks},{objectId:freshTopics},{objectId:heldCallback},{value:target}],returnByValue:false};const fresh=await session.post("Runtime.callFunctionOn",freshParams);assert.equal(fresh.exceptionDetails,undefined);assert.ok(fresh.result.objectId!==undefined);const freshId=fresh.result.objectId;
      const check=():Promise<Runtime.CallFunctionOnReturnType>=>session.post("Runtime.callFunctionOn",{...FLAGS,objectId:freshId,functionDeclaration:'function(){return this[8]();}',returnByValue:true});const initialCheck=await check();assert.equal(initialCheck.result.value,true);
      await evaluate('deleteManagerFixture.project.guardZero=0');const driftCheck=await check();assert.ok(driftCheck.exceptionDetails!==undefined);await evaluate('deleteManagerFixture.project.guardZero=-0');const restoredCheck=await check();assert.equal(restoredCheck.result.value,true);await evaluate('delete deleteManagerFixture.project.guardZero');
      assert.equal(prepared.calls, REQUESTS.calls); assert.equal(prepared.properties, REQUESTS.properties); assert.equal(helperCount, REQUESTS.helpers); assert.equal(prepared.calls, commands.filter(row => row.method === "Runtime.callFunctionOn").length); assert.equal(prepared.properties, commands.filter(row => row.method === "Runtime.getProperties").length);
      assert.match(prepared.replyTopic, /^_MSG_BUS_RPC_-\/PrjDB\/footprint\/delete-[a-f\d]{32}-7$/u);
      assert.deepEqual([prepared.applicationMethodInvoked, prepared.outerRpcResumed, prepared.nativeForwardingProved, prepared.workerJobIssued, prepared.deletionReady], [false, false, false, false, false]);
      assert.deepEqual(await evaluate("[deleteManagerFixture.spentCalls(),deleteManagerFixture.transportCalls(),deleteManagerFixture.bus.rpcTicket,Object.keys(deleteManagerFixture.bus.pulled).length,Object.keys(deleteManagerFixture.bus.pushed).length]"), [0, 0, 7, 0, 0]);
      const reprove = (): Promise<Runtime.CallFunctionOnReturnType> => { const params: Runtime.CallFunctionOnParameterType = { ...FLAGS, objectId: receipt, functionDeclaration: PROGRAMS.before, arguments: [prepared.reply, prepared.lookupScope, prepared.method, prepared.innerTopic].map(objectId => ({ objectId })), returnByValue: true }; return session.post("Runtime.callFunctionOn", params); };
      const initialReproof = await reprove(); assert.equal(initialReproof.result.value, true);
      for (const mutation of [
        ['deleteManagerFixture.bus.extra=1', 'delete deleteManagerFixture.bus.extra'],
        ['deleteManagerFixture.project[Symbol.for("del-unknown")]=1', 'delete deleteManagerFixture.project[Symbol.for("del-unknown")]'],
        ['deleteManagerFixture.bus.rpcTicket=8', 'deleteManagerFixture.bus.rpcTicket=7'],
        ['deleteManagerFixture.project.isReady=false', 'deleteManagerFixture.project.isReady=true'],
        ['deleteManagerFixture.project.footprint.deleteData=()=>{}', 'delete deleteManagerFixture.project.footprint.deleteData'],
        ['deleteManagerFixture.registry.map.set(deleteManagerFixture.project.uuid,{...deleteManagerFixture.project})', 'deleteManagerFixture.registry.map.set(deleteManagerFixture.project.uuid,deleteManagerFixture.project)'],
        ['deleteManagerFixture.traps=0;Object.defineProperty(deleteManagerFixture.project,"isReady",{get(){deleteManagerFixture.traps++;return true},enumerable:true,configurable:true})', 'Object.defineProperty(deleteManagerFixture.project,"isReady",{value:true,writable:true,enumerable:true,configurable:true})'],
      ]) { assert.ok(mutation[0] !== undefined && mutation[1] !== undefined); await evaluate(`${mutation[0]};void 0`); const refused = await reprove(); assert.ok(refused.exceptionDetails !== undefined); await evaluate(`${mutation[1]};void 0`); const restored = await reprove(); assert.equal(restored.result.value, true); }
      assert.equal(await evaluate("deleteManagerFixture.traps"), 0);
      await evaluate('deleteManagerFixture.oldSubscriptions=deleteManagerFixture.bus.subscribed;deleteManagerFixture.proxyTraps=0;deleteManagerFixture.bus.subscribed=new Proxy(deleteManagerFixture.oldSubscriptions,{getOwnPropertyDescriptor(){deleteManagerFixture.proxyTraps++;throw Error("proxy")},getPrototypeOf(){deleteManagerFixture.proxyTraps++;throw Error("proxy")},ownKeys(){deleteManagerFixture.proxyTraps++;throw Error("proxy")}});void 0');
      await assert.rejects(collectCurrentFootprintInverseDeleteManager({ receipt, selected, functions, native, rpc, entry, profile, uiScriptId: uiId, managerScriptId: managerId, asyncPrototype, target, forwarding, manager: graph, current: (): void => { assert.ok(managerId.length > 0); }, request }), /INVERSE_LOOKUP_PREENTRY_REPLY/u);
      assert.equal(await evaluate("deleteManagerFixture.proxyTraps"), 0);
      await evaluate("deleteManagerFixture.bus.subscribed=deleteManagerFixture.oldSubscriptions");
      // A private receipt cycle must refuse synchronously. Restoring the exact
      // Guard proves neither failed nor successful memo entries survive a call.
      const cycleParams: Runtime.CallFunctionOnParameterType = { objectId: prepared.roots, functionDeclaration: "function(module){deleteManagerFixture.savedRootGuard=this[5];this[5]=module[13];return true}", arguments: [{ objectId: prepared.module }], returnByValue: true };
      const cycleSet = await session.post("Runtime.callFunctionOn", cycleParams); assert.equal(cycleSet.result.value, true);
      const cyclic = await reprove(); assert.ok(cyclic.exceptionDetails !== undefined);
      const restoreParams: Runtime.CallFunctionOnParameterType = { objectId: prepared.roots, functionDeclaration: "function(){this[5]=deleteManagerFixture.savedRootGuard;return true}", returnByValue: true };
      const cycleRestored = await session.post("Runtime.callFunctionOn", restoreParams); assert.equal(cycleRestored.result.value, true);
      const afterCycle = await reprove(); assert.equal(afterCycle.result.value, true);
      const directParams: Runtime.CallFunctionOnParameterType = { ...FLAGS, objectId: prepared.method, functionDeclaration: "function(){return this[2]();}", returnByValue: true };
      const directFirst = await session.post("Runtime.callFunctionOn", directParams); assert.equal(directFirst.result.value, true);
      await evaluate("deleteManagerFixture.project.isReady=false;void 0");
      const directDrift = await session.post("Runtime.callFunctionOn", directParams); assert.ok(directDrift.exceptionDetails !== undefined);
      await evaluate("deleteManagerFixture.project.isReady=true;void 0");
      const directRestored = await session.post("Runtime.callFunctionOn", directParams); assert.equal(directRestored.result.value, true);
      await session.post("Runtime.releaseObjectGroup", { objectGroup: FLAGS.objectGroup });
    }
  } finally { await session.post("Debugger.disable"); session.disconnect(); Reflect.deleteProperty(globalThis, "deleteManagerFixture"); Reflect.deleteProperty(globalThis, "deleteManagerUiCtor"); }
});

void test("DEL preparation wire has exact fixed programs and no continuation, sender or caller code", () => {
  assert.equal(currentFootprintInverseDeleteManagerCases().length, 27);
  for (const command of currentFootprintInverseDeleteManagerCases()) {
    const row = currentFootprintInverseDeleteManagerTemplate(command); let text = row.template;
    if (command.method === "Runtime.callFunctionOn") { text = text.replace(JSON.stringify(`__delete_manager_program_${command.role}__`), JSON.stringify(command.params.functionDeclaration)); }
    const domains = new Map([["projectUuid", "a".repeat(64)], ["branchUuid", "b".repeat(32)], ["documentUuid", "c".repeat(16)]]);
    for (const name of row.names) { text = text.replace(JSON.stringify(`__delete_manager_${name}__`), JSON.stringify(domains.get(name) ?? "original_ref")); }
    assert.deepEqual(JSON.parse(text), { method: command.method, params: command.params });
    const bytes = Buffer.from(`${JSON.stringify(currentFootprintInverseDeleteManagerWire(command, 79, "original_ui"))}\0`);
    assert.equal(currentFootprintInverseDeleteManagerNativeFrame(bytes, command, "original_ui")["action"], "footprint-inverse-delete-manager");
    assert.throws(() => currentFootprintInverseDeleteManagerNativeFrame(bytes, command, "foreign_ui"));
  }
  for (const method of ["Debugger.resume", "Runtime.evaluate", "Runtime.awaitPromise"]) { assert.throws(() => validate({ phase: "inverse-delete-manager-call", role: "outer", method, params: {} })); }
  const command = currentFootprintInverseDeleteManagerCases()[0]; assert.ok(command?.method === "Runtime.callFunctionOn");
  assert.throws(() => validate({ ...command, params: { ...command.params, functionDeclaration: "function(){return true}" } }));
  assert.throws(() => validate({ ...command, params: { ...command.params, throwOnSideEffect: false } }));
});
