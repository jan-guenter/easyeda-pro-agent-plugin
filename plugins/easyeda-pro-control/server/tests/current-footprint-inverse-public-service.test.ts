/* oxlint-disable import/max-dependencies -- One actual-source/Inspector test composes source, graph and native metadata boundaries. */
/** Exact installed SDK service declarations on an inert graph. No real app,
 * SDK deletion, native owner or UI collateral callback is invoked. */
import { createHash } from "node:crypto";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import type { Runtime } from "node:inspector";
import { Session } from "node:inspector/promises";
import { test } from "node:test";
import type { TestContext } from "node:test";
import { createContext, runInContext } from "node:vm";
import { CURRENT_FOOTPRINT_INVERSE_PUBLIC_API_CALLEES as API } from "../src/current-footprint-inverse-public-api-source.ts";
import { CURRENT_FOOTPRINT_INVERSE_PUBLIC_DELETE_FILES as FILES } from "../src/current-footprint-inverse-public-delete-source.ts";
import { CURRENT_FOOTPRINT_INVERSE_PUBLIC_SERVICE_UI_CALLEES as ORDER, CURRENT_FOOTPRINT_INVERSE_PUBLIC_SERVICE_PROGRAMS as P } from "../src/current-footprint-inverse-public-service-programs.ts";
import { decodeCurrentFootprintInversePublicServiceFunction, decodeCurrentFootprintInversePublicServiceScope } from "../src/current-footprint-inverse-public-service-replies.ts";
import { CURRENT_FOOTPRINT_INVERSE_PUBLIC_SERVICE_SOURCE as SOURCE, qualifyCurrentFootprintInversePublicServiceSource } from "../src/current-footprint-inverse-public-service-source.ts";

function checkedCall(session: Session, params: Runtime.CallFunctionOnParameterType): Promise<Runtime.CallFunctionOnReturnType> { const checked = { ...params, throwOnSideEffect: true }; return session.post("Runtime.callFunctionOn", checked); }
let installedSources: Promise<Readonly<{ api: string; ui: string }>> | null = null;
function serviceSources(): Promise<Readonly<{ api: string; ui: string }>> { installedSources ??= (async (): Promise<Readonly<{ api: string; ui: string }>> => { const api = await readFile(`/mnt/c/Program Files/EasyEDA-Pro/resources/app/assets/${FILES.api.relativePath}`, "utf8"), ui = await readFile(`/mnt/c/Program Files/EasyEDA-Pro/resources/app/assets/${FILES.ui.relativePath}`, "utf8"); return Object.freeze({ api, ui }); })(); return installedSources; }
async function sourceAvailable(context: TestContext): Promise<boolean> { try { await serviceSources(); return true; } catch (error) { if (error !== null && typeof error === "object" && "code" in error && error.code === "ENOENT") { context.skip("installed source unavailable"); return false; } throw error; } }
async function serviceFixture(): Promise<ReturnType<typeof createContext>> {
  const { api, ui } = await serviceSources();
  qualifyCurrentFootprintInversePublicServiceSource("api", api); qualifyCurrentFootprintInversePublicServiceSource("ui", ui);
  const classes = API.filter(row => ["p4", "xae", "qh"].includes(row.key)).map(row => `const ${row.key}=(${api.slice(row.start, row.end)});`).join("");
  const source = (key: keyof typeof SOURCE): string => { const row = SOURCE[key]; return ui.slice("descriptionStart" in row ? row.descriptionStart : row.start, row.end); };
  const context = createContext({ crypto: globalThis.crypto });
  try { runInContext(`const _ae="rpc",dd=(table,key)=>table[key]??=([]),WI=()=>{throw "unexpected task removal"};${classes}
const pubMethod=${JSON.stringify(ui.slice(SOURCE.publicUiDelete.start, SOURCE.publicUiDelete.end))};globalThis.M8=class{${ui.slice(SOURCE.publicUiDelete.start, SOURCE.publicUiDelete.end)}};globalThis.Wo={SystematicUuid:"0819f05c4eef4c71ace90d822a990e87"};globalThis.Ze=class{static ${source("facadeDelete")}};globalThis.F2={${source("projectDelete")}};
${ORDER.filter(key=>!["publicUiDelete","projectDelete","facadeDelete"].includes(key)).map(key=>source(key)).join(";")};
globalThis.bus=new xae(true);bus.uuid="inert-bus";bus.rpcService("extensionApi.LIB_Footprint.delete",M8.delete);globalThis.callback=bus.pulled["extensionApi.LIB_Footprint.delete"][0].callback;
globalThis.w={currentProject:{projectId:"selected"},extensionApiMessageBus2:bus};globalThis._EXTAPI_ROOT_={lib_Footprint:{}};globalThis._MSG_BUS2_EXTAPI_=bus;globalThis.original=[_EXTAPI_ROOT_,_EXTAPI_ROOT_.lib_Footprint,()=>{},w,w.currentProject,bus,()=>{},()=>true];globalThis.callees=Array(18).fill(()=>{});callees[4]=qh;callees[17]=()=>true;
globalThis.stage="maps";globalThis.maps=(${P.queues}).call(original,callees);globalThis.stage="queue";globalThis.queue=(${P.queue}).call(maps,original,callees);globalThis.stage="task";globalThis.task=(${P.task}).call(queue,original,callees,maps);globalThis.scope={object:{t:M8.delete,e:"extensionApi.LIB_Footprint.delete",i:callback}};globalThis.stage="handler";globalThis.handler=(${P.scope}).call(scope,original,callees,maps,queue,task);globalThis.moduleScope={object:{M8,Wo,Ze,F2,w,${ORDER.filter(key=>!["publicUiDelete","projectDelete","facadeDelete"].includes(key)).map(key=>SOURCE[key].name).join(",")}}};globalThis.stage="uiRoots";globalThis.uiRoots=(${P.uiRoots}).call(moduleScope,original,handler);globalThis.qualified=[];for(const root of uiRoots){for(let value=root;value!==null;value=Object.getPrototypeOf(value))if(!qualified.includes(value))qualified.push(value);}globalThis.stage="selected";globalThis.selected=(${P.uiCallees}).call(moduleScope,original,handler,uiRoots,qualified);`, context); } catch (error) { throw new Error(`inert service stage ${String(Reflect.get(context,"stage"))}: ${String(error)}`, { cause: error }); }
  return context;
}
void test("exact queued SDK service retains original task/callback/handler and source-specific collateral callees", async testContext => {
  if (!await sourceAvailable(testContext)) { return; }
  const context = await serviceFixture(); assert.equal(runInContext(`(${P.same}).call(selected)`, context), true);
  const descriptions: unknown = runInContext("selected.slice(0,16).map(fn=>Function.prototype.toString.call(fn))", context); assert.ok(Array.isArray(descriptions));
  for (const [index, key] of ORDER.entries()) { const text: unknown = descriptions[index]; assert.equal(typeof text, "string"); const row = SOURCE[key]; assert.equal(Buffer.byteLength(String(text)), row.bytes); assert.equal(createHash("sha256").update(String(text)).digest("hex"), row.sha256); }
  runInContext("moduleScope.object.yw=async()=>true", context); assert.throws(() => runInContext(`(${P.same}).call(selected)`, context));
});
void test("foreign service scope, queued work and accessor replacements refuse before any delete", async testContext => {
  if (!await sourceAvailable(testContext)) { return; }
  for (const mutation of ["scope.object.t=async()=>true", "scope.object.i=()=>{}", "scope.object.e='foreign'", "maps[1]['extensionApi.LIB_Footprint.delete']=[{}]", "queue.push(queue[0])"]) {
    const context = await serviceFixture(); runInContext(mutation, context);
    assert.throws(() => runInContext(`(${P.queue}).call(maps,original,callees);(${P.scopeSame}).call(scope,original,callees,maps,queue,task,handler);`, context));
  }
  const context = await serviceFixture(); runInContext("globalThis.traps=0;Object.defineProperty(task[0],'callback',{get(){traps++;throw Error('hook')}})", context);
  assert.throws(() => runInContext(`(${P.task}).call(queue,original,callees,maps)`, context)); assert.equal(runInContext("traps", context), 0);
});
void test("actual Inspector service scope exposes exact named closure and an object wrapper without lexical this", async testContext => {
  if (!await sourceAvailable(testContext)) { return; }
  assert.equal(process.versions.node, "24.18.0"); const context = await serviceFixture(); const session = new Session(); session.connect(); const key = "__inertInverseService";
  try {
    Object.defineProperty(globalThis, key, { value: Reflect.get(context, "callback"), configurable: true });
    const evaluated = await session.post("Runtime.evaluate", { expression: `globalThis[${JSON.stringify(key)}]`, objectGroup: "inert-inverse-service" }); const objectId = evaluated.result.objectId; assert.ok(typeof objectId === "string");
    const metadata = await session.post("Runtime.getProperties", { objectId, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false }); const scopes = metadata.internalProperties?.find(row=>row.name==="[[Scopes]]")?.value?.objectId; assert.ok(typeof scopes === "string");
    const list = await session.post("Runtime.getProperties", { objectId: scopes, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false }); const first = list.result[0]?.value;
    assert.equal(decodeCurrentFootprintInversePublicServiceScope(list),first?.objectId); assert.equal(first?.description,"Closure (rpcService)"); assert.ok(typeof first.objectId === "string");
    const bindings = await session.post("Runtime.getProperties", { objectId:first.objectId, ownProperties:true,accessorPropertiesOnly:false,generatePreview:false }); assert.deepEqual(bindings.result.map(row=>row.name),["t","e","i"]);
    const scopeCall = { objectId:first.objectId,functionDeclaration:'function(){return Reflect.ownKeys(Object.getOwnPropertyDescriptor(this,"object").value);}',returnByValue:true,silent:true }; const wrapper = await checkedCall(session, scopeCall); assert.deepEqual(wrapper.result.value,["t","e","i"]);
  } finally { Reflect.deleteProperty(globalThis,key); await session.post("Runtime.releaseObjectGroup",{objectGroup:"inert-inverse-service"}); session.disconnect(); }
});

void test("actual uninvoked service and UI handler metadata matches exact source locations", async testContext => {
  if (!await sourceAvailable(testContext)) { return; }
  const session = new Session(); session.connect(); const key = "__inertInverseServiceMethod";
  try {
    for (const role of ["rpcServiceCallback", "publicUiDelete"] as const) {
      const row = SOURCE[role]; const texts = await serviceSources(); const full = texts[row.file];
      const text = full.slice("descriptionStart" in row ? row.descriptionStart : row.start, row.end);
      const prefix = role === "rpcServiceCallback" ? "let i=(" : "class M8{static ";
      const offset = role === "rpcServiceCallback" ? 0 : text.indexOf("(");
      const source = "\n".repeat(row.lineNumber) + " ".repeat(row.columnNumber - offset - prefix.length) + prefix + text + (role === "rpcServiceCallback" ? ");i" : "};M8.delete");
      const fn: unknown = runInContext(source, createContext({})); Object.defineProperty(globalThis, key, { value: fn, configurable: true });
      const evaluated = await session.post("Runtime.evaluate", { expression: `globalThis[${JSON.stringify(key)}]`, objectGroup: "inert-inverse-service-metadata" }); const objectId = evaluated.result.objectId; assert.ok(typeof objectId === "string");
      const metadata = await session.post("Runtime.getProperties", { objectId, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false });
      const decoded = decodeCurrentFootprintInversePublicServiceFunction(metadata, role); assert.equal(typeof decoded.scopes,"string");
      assert.throws(() => decodeCurrentFootprintInversePublicServiceFunction(metadata, role, "foreign-script"));
    }
  } finally { Reflect.deleteProperty(globalThis,key); await session.post("Runtime.releaseObjectGroup",{objectGroup:"inert-inverse-service-metadata"}); session.disconnect(); }
});

void test("closed service codebook preserves all fixed bytes and never admits SDK or resume", async () => {
  const module = await import("../src/current-footprint-inverse-public-service-protocol.ts");
  const cases = module.currentFootprintInversePublicServiceCases(); assert.equal(cases.length,46);
  assert.equal(new Set(cases.map(command=>module.currentFootprintInversePublicServiceKey(command))).size,46);
  assert.equal(Array.from({length:47},(_,index)=>module.currentFootprintInversePublicServiceOrder(index)).length,47);
  for (const command of cases) {
    const row=module.currentFootprintInversePublicServiceTemplate(command); let text=row.template;
    if(command.phase==="inverse-public-service-call"){text=text.replace(JSON.stringify(`__inverse_service_program_${command.role}__`),JSON.stringify(command.params.functionDeclaration));}
    for(const name of row.names){text=text.replace(JSON.stringify(`__inverse_service_${name}__`),JSON.stringify("original_ref"));}
    assert.deepEqual(JSON.parse(text),{method:command.method,params:command.params});
  }
  const programs=Object.entries(module.CURRENT_FOOTPRINT_INVERSE_PUBLIC_SERVICE_CALLS).map(([name,row])=>["program",name,"",JSON.stringify(row.program)]);
  const rows=cases.map(command=>{const row=module.currentFootprintInversePublicServiceTemplate(command);return[row.key,row.method,row.names.join(","),row.template];});
  assert.ok(Buffer.byteLength([...programs,...rows].map(row=>row.join("\t")).join("\0"))<=65_536);
  for(const phase of ["inverse-public-service-sdk","inverse-public-service-resume","inverse-public-service-delete"]){assert.throws(()=>module.validateCurrentFootprintInversePublicServiceCommand({phase,method:"Runtime.callFunctionOn",params:{}}));}
  const call=cases.find(command=>command.phase==="inverse-public-service-call");assert.ok(call!==undefined&&call.phase==="inverse-public-service-call");
  assert.throws(()=>module.validateCurrentFootprintInversePublicServiceCommand({...call,params:{...call.params,functionDeclaration:`${call.params.functionDeclaration} `}}));
  assert.throws(()=>module.validateCurrentFootprintInversePublicServiceCommand({...call,params:{...call.params,throwOnSideEffect:false}}));
});
