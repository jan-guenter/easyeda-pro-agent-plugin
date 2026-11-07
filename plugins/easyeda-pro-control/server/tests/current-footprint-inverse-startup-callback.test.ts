/** Real observer/decoder with explicit synthetic registry and source packets.
 * No original native callback, bootstrap, parser or frontier grant is issued. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { Script } from "node:vm";
import { z } from "zod";
import { CURRENT_PCB_209_WORKER_PRODUCER_LOCATIONS as LOCATIONS } from "../src/current-pcb-209-worker-startup-profile.ts";
import { CURRENT_PROJECT_SAVE_STRUCTURE_CALLS as CALLS, CURRENT_PROJECT_SAVE_STRUCTURE_SITES as SITES, currentProjectSaveStructureNativeCases } from "../src/current-project-save-structure-protocol.ts";
import { CURRENT_FOOTPRINT_INVERSE_STARTUP_QUEUE_CALL, validateCurrentFootprintInverseStartupQueueCommand } from "../src/current-footprint-inverse-startup-queue-protocol.ts";
import { currentFootprintInverseStartupCallbackBudget, currentFootprintInverseStartupCallbackCases, currentFootprintInverseStartupCallbackNativeFrame, currentFootprintInverseStartupCallbackWire, validateCurrentFootprintInverseStartupCallbackCommand } from "../src/current-footprint-inverse-startup-callback-protocol.ts";
import type { CurrentFootprintInverseStartupCallbackRole as Role } from "../src/current-footprint-inverse-startup-callback-protocol.ts";
import { loadSyntheticRegistryModule } from "./helpers/load-synthetic-registry-module.ts";

const statusSchema=z.strictObject({calls:z.number().int().nonnegative(),outstanding:z.number().int().nonnegative(),active:z.boolean(),failed:z.boolean(),originalFinalizersObserved:z.number().int().nonnegative(),completeQueuedPromiseFulfillmentVerified:z.literal(false),completeProducerFrontierVerified:z.literal(false)});
interface Observer {serviceOriginalHeld:()=>Promise<void>;verifyOriginalQueue:()=>Promise<unknown>;status:()=>z.infer<typeof statusSchema>}

const property = (name: string, value: object, writable = true, enumerable = true, configurable = true): object => ({ name, value, writable, enumerable, configurable, isOwn: true });
const arrayRef = (id: string): object => ({ result: { type: "object", className: "Array", objectId: id } });
const array = (length: number): object => ({ result: [...Array.from({ length }, (_, index) => property(String(index), { type: "object", objectId: `value.${String(index)}` })), property("length", { type: "number", value: length })] });
async function fixture(records: number, fault: "session" | "return" | "promise" | "queue" | null = null): Promise<Readonly<{ observer: Observer; service: (role: Role) => Promise<void>; commands: string[]; copied: () => void }>> {
  const origin = Object.freeze({ profile: "private.current-footprint-inverse-startup-callback-origin.v1" }), owner = Object.freeze({ syntheticOwner: true }), prepared = Object.freeze({ syntheticPrepared: true });
  let delivered = false, selected: Role | null = null; const commands: string[] = [];
  const metadata = { result: [property("length", { type: "number", value: 0 }, false, false), property("name", { type: "string", value: "" }, false, false)], internalProperties: [
    { name: "[[FunctionLocation]]", value: { type: "object", subtype: "internal#location", value: { scriptId: "worker.script", lineNumber: LOCATIONS.serial.lineNumber, columnNumber: LOCATIONS.serial.columnNumber } } },
    { name: "[[Prototype]]", value: { type: "function", objectId: "function.prototype" } },
    { name: "[[Scopes]]", value: { type: "object", subtype: "internal#scopeList", className: "Array", objectId: "serial.scopes", description: "Scopes[2]" } },
  ] };
  const bindings = Object.freeze({ sourceRecordUpperBound: records, actual: { sessionId: "worker.session", scriptId: "worker.script", project: "project", uploadWrapper: "wrapper", uploadCallback: "callback" },
    originalBreakpoints: ["startupEntry", "startupReturn", "initialFinally", "queuedFinally"].map(role => ({ role, id: `bp.${role}` })),
    assertCurrent: (): void => { assert.ok(Object.isFrozen(owner) && Object.isFrozen(origin)); }, fail: (): void => { assert.ok(selected !== null); },
    queueRequest:(input:unknown):Promise<unknown>=>bindings.request(input),
    nextEvent: (): Promise<unknown> => {
      assert.ok(selected !== null); if (delivered) { return Promise.resolve({ method: "Debugger.resumed", sessionId: "worker.session", params: {} }); } delivered = true;
      const site = SITES[selected]; const location = { scriptId: "worker.script", lineNumber: site.lineNumber, columnNumber: site.columnNumber };
      return Promise.resolve({ method: "Debugger.paused", sessionId: fault === "session" ? "foreign" : "worker.session", params: { hitBreakpoints: [`bp.${selected}`], callFrames: [
        { callFrameId: selected, location: { ...location }, functionLocation: { ...location }, ...(selected === "startupReturn" ? { returnValue: fault === "return" ? { type: "number", value: 1 } : { type: "undefined" } } : {}) },
        { callFrameId: "startupCaller", location: { scriptId: "worker.script", lineNumber: SITES.producerSerial.lineNumber, columnNumber: SITES.producerSerial.columnNumber }, functionLocation: { ...location } },
      ] } });
    }, request: (input: unknown): Promise<unknown> => {
      const command = (():ReturnType<typeof validateCurrentFootprintInverseStartupCallbackCommand>|ReturnType<typeof validateCurrentFootprintInverseStartupQueueCommand>=>{try{return validateCurrentFootprintInverseStartupCallbackCommand(input);}catch{return validateCurrentFootprintInverseStartupQueueCommand(input);}})(); commands.push(command.phase);
      if (command.method === "Debugger.evaluateOnCallFrame") { return Promise.resolve(arrayRef(command.role)); }
      if (command.method === "Runtime.getProperties") {
        const id = command.params.objectId; if (id === "wrapper") { return Promise.resolve(metadata); }
        if(id==="original.promise"){return Promise.resolve({result:[],internalProperties:[{name:"[[Prototype]]",value:{type:"object",className:"Promise",description:"Promise",objectId:"promise.prototype"}},{name:"[[PromiseState]]",value:{type:"string",value:fault==="promise"?"pending":"fulfilled"}},{name:"[[PromiseResult]]",value:{type:"undefined"}}]});}
        if(id==="serial.empty"){return Promise.resolve({result:[property("0",fault==="queue"?{type:"object",objectId:"still.pending"}:{type:"object",subtype:"null",value:null}),property("1",{type:"object",subtype:"null",value:null}),property("length",{type:"number",value:2})]});}
        if(id==="initialFinally"||id==="queuedFinally"){return Promise.resolve({result:[property("0",{type:"object",subtype:"promise",className:"Promise",description:"Promise",objectId:"original.promise"}),property("1",{type:"object",subtype:"null",value:null}),property("2",{type:"function",objectId:"callback"}),property("length",{type:"number",value:3})]});}
        if (id === "serial.scopes") { return Promise.resolve({ result: [property("0", { type: "object", subtype: "internal#scope", className: "Object", description: "Closure (Nd)", objectId: "serial.scope" }), property("1", { type: "object", subtype: "internal#scope", className: "Object", description: "Global", objectId: "global" })] }); }
        assert.ok(id === "startupCaller" || id === "startupEntry" || id === "startupReturn" || id === "initialFinally" || id === "queuedFinally"); return Promise.resolve(array(id === "initialFinally" || id === "queuedFinally" ? 3 : 4));
      }
      if(command.phase==="inverse-startup-queue-empty"&&fault==="queue"){return Promise.resolve({result:{type:"boolean",value:false}});}
      if (command.method === "Debugger.resume") { return Promise.resolve({}); }
      assert.equal(command.method, "Runtime.callFunctionOn"); return Promise.resolve({ result: { type: "boolean", value: true } });
    },
  });
  const module = await loadSyntheticRegistryModule(new URL("../src/current-footprint-inverse-startup-callback-observer.ts", import.meta.url), (name, actual) => name === "./current-pcb-diagnostic-owner.ts" ? {
    requireOriginalCurrentFootprintInverseStartupCallbackOrigin: (a: unknown, b: unknown, c: unknown): unknown => { assert.equal(a, origin); assert.equal(b, owner); assert.equal(c, prepared); return bindings; },
  } : actual);
  const Constructor: unknown = module["CurrentFootprintInverseStartupCallbackObserver"]; assert.ok(typeof Constructor === "function");
  const raw: unknown = Reflect.construct(Constructor, [origin, owner, prepared]); assert.ok(raw !== null && typeof raw === "object");
  const serviceMethod: unknown = Reflect.get(raw, "serviceOriginalHeld"), statusMethod: unknown = Reflect.get(raw, "status"); assert.ok(typeof serviceMethod === "function" && typeof statusMethod === "function");
  const status = ():ReturnType<Observer["status"]> => statusSchema.parse(Reflect.apply(statusMethod,raw,[]));
  const verify:unknown=Reflect.get(raw,"verifyOriginalQueue");assert.ok(typeof verify==="function");
  const observer: Observer = { verifyOriginalQueue:():Promise<unknown>=>{const result:unknown=Reflect.apply(verify,raw,[]);assert.ok(result instanceof Promise);return result;}, serviceOriginalHeld: (): Promise<void> => { const result: unknown = Reflect.apply(serviceMethod, raw, []); assert.ok(result instanceof Promise); return result; }, status };
  return { observer, commands, service: (role): Promise<void> => { selected = role; delivered = false; return observer.serviceOriginalHeld(); }, copied: (): void => { Reflect.construct(Constructor, [{ ...origin }, owner, prepared]); } };
}

void test("separate inverse startup collector admits more than seven source rows without a frontier claim", async () => {
  const f = await fixture(9);
  for (let index = 0; index < 9; index += 1) { await f.service("startupEntry"); await f.service("startupReturn"); await f.service(index % 2 === 0 ? "initialFinally" : "queuedFinally"); }
  assert.deepEqual(f.observer.status(), { calls: 9, outstanding: 0, active: false, failed: false, originalFinalizersObserved: 9, completeQueuedPromiseFulfillmentVerified: false, completeProducerFrontierVerified: false });
  assert.equal(f.commands.length, 9 * 18); assert.throws(f.copied);
  assert.deepEqual(await f.observer.verifyOriginalQueue(),{schema:"private.current-footprint-inverse-startup-queue-observation.v1",calls:9,finalizers:9,fulfilledPromiseReferences:9,originalSerialSlotsNull:true,completeProducerFrontierVerified:false});await assert.rejects(f.observer.verifyOriginalQueue());
  await assert.rejects(f.service("startupEntry"));
});
void test("startup context, undefined return, finalizer order and supplied count failures retain refusal", async () => {
  for (const fault of ["session", "return"] as const) { const f = await fixture(1, fault); if (fault === "return") { await f.service("startupEntry"); } await assert.rejects(f.service(fault === "session" ? "startupEntry" : "startupReturn")); assert.equal(f.observer.status().failed, true); }
  const f = await fixture(1); await assert.rejects(f.service("queuedFinally")); assert.equal(f.commands.length, 0);
});
void test("inverse callback codebook excludes every source, packet, history and generic resume phase", () => {
  const cases = currentFootprintInverseStartupCallbackCases(); assert.equal(cases.length, 14); assert.equal(currentFootprintInverseStartupCallbackBudget(512).cdpRequests, 12_800); assert.throws(() => currentFootprintInverseStartupCallbackBudget(513));
  for (const command of cases) { const wire = currentFootprintInverseStartupCallbackWire(command, 79, "original"); const frame = currentFootprintInverseStartupCallbackNativeFrame(Buffer.from(`${JSON.stringify(wire)}\0`), command, "original"); assert.equal(frame["action"], "footprint-inverse-startup-callback"); }
  for (const command of currentProjectSaveStructureNativeCases().filter(value => value.phase === "project-save-structure-source" || value.phase === "project-save-structure-packet" || value.phase === "project-save-structure-resume" && ["bootstrap", "packet", "response"].includes(value.role))) { assert.throws(() => validateCurrentFootprintInverseStartupCallbackCommand(command)); }
});

void test("retained startup Promise state and fresh serial null slots must both pass",async()=>{for(const fault of ["promise","queue"]as const){const f=await fixture(1,fault);await f.service("startupEntry");await f.service("startupReturn");await f.service("initialFinally");await assert.rejects(f.observer.verifyOriginalQueue());assert.equal(f.observer.status().failed,true);}});

void test("fixed drained-queue projection binds the current wrapper and both null slots without invoking accessors",()=>{
 const setup=`let calls=0;const wrapper=()=>{calls++},callback=()=>{calls++};globalThis.PROJECT={uploadStructure:wrapper};const scope={object:{e:callback,t:null,s:null}};`;
 const run=(change:string,program:string):unknown=>new Script(`${setup}${change};(${program}).call(scope,PROJECT,wrapper,callback)`).runInNewContext({},{timeout:1000});
 assert.equal(run("",CURRENT_FOOTPRINT_INVERSE_STARTUP_QUEUE_CALL),true);
 for(const change of ["scope.object.t=Promise.resolve()","scope.object.s=Promise.resolve()","PROJECT.uploadStructure=()=>{}","scope.object.e=()=>{}"]){assert.throws(()=>run(change,CURRENT_FOOTPRINT_INVERSE_STARTUP_QUEUE_CALL));}
 const program=`${setup}Object.defineProperty(scope.object,'t',{get(){calls++;return null;}});try{(${CURRENT_FOOTPRINT_INVERSE_STARTUP_QUEUE_CALL}).call(scope,PROJECT,wrapper,callback)}catch{};calls`;
 assert.equal(new Script(program).runInNewContext({},{timeout:1000}),0);
 assert.throws(()=>new Script(`${setup}(${CALLS.serial}).call(scope,callback)`).runInNewContext({},{timeout:1000}));
});
