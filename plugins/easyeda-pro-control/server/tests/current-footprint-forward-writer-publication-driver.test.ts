/** Real ready driver/callback classes with explicit inert registry/CDP
 * peers. No native owner, application, timer or production grant is created. */
/* oxlint-disable import/max-dependencies -- Exercise the three actual cursors, fixed encoders, native metadata decoders and separate managed journal together. */
import assert from "node:assert/strict";
import { setImmediate as nextTurn } from "node:timers/promises";
import { test } from "node:test";
import type { CurrentFootprintForwardWriterPublicationDriver } from "../src/current-footprint-forward-writer-publication-driver.ts";
import type { CurrentFootprintForwardWriterPublicationBindings } from "../src/current-footprint-forward-writer-publication-origin.ts";
import { validateCurrentFootprintForwardWriterPublicationCommand } from "../src/current-footprint-forward-writer-publication-protocol.ts";
import { currentFootprintForwardWriterPublicationWire } from "../src/current-footprint-forward-writer-publication-wire.ts";
import { CURRENT_PROJECT_SAVE_STRUCTURE_SITES as SITES } from "../src/current-project-save-structure-protocol.ts";
import type {CurrentFootprintForwardWriterStartupCallbackRole as CallbackRole} from "../src/current-footprint-forward-writer-frontier-protocol.ts";
import type {CurrentFootprintForwardWriterPublicationCommand} from "../src/current-footprint-forward-writer-publication-protocol.ts";
import { CURRENT_PCB_209_WORKER_PRODUCER_LOCATIONS as LOCATIONS } from "../src/current-pcb-209-worker-startup-profile.ts";
import { loadSyntheticRegistryModule } from "./helpers/load-synthetic-registry-module.ts";
import { assertCurrentFootprintForwardWriterPublicationChain } from "../src/current-footprint-forward-writer-publication-journal.ts";
import { currentFootprintForwardWriterPublicationRecordSchema } from "../src/current-footprint-forward-writer-publication-contract.ts";
import { sha256Json } from "../src/core.ts";

const prop = (name: string, value: unknown, writable = true, enumerable = true, configurable = true): object => ({ name, value, writable, enumerable, configurable, isOwn: true });
const object = (objectId: string): object => ({ type: "object", objectId });
const array = (id: string, length: number): object => ({ result: { type: "object", subtype: "array", className: "Array", description: `Array(${String(length)})`, objectId: id } });
async function fixture(fault: "resume-ack" | "return" | "queue-block" | null = null): Promise<Readonly<{
  driver: CurrentFootprintForwardWriterPublicationDriver; ackQueue:()=>void; callback: (role: CallbackRole) => Promise<void>;
  state: { requests: number; resumes: number; failure: unknown; exited: boolean }; records: ReturnType<typeof currentFootprintForwardWriterPublicationRecordSchema.parse>[];
}>> {
  const origin = Object.freeze({ profile: "private.current-footprint-forward-writer-publication-origin.v1" as const });
  const operation = Object.freeze({ syntheticOperation: true }), owner = Object.freeze({ syntheticOwner: true });
  const queueAck=Promise.withResolvers<undefined>();
  const state = { requests: 0, resumes: 0, failure: null as unknown, exited: false };
  let callbackReceipt: PromiseWithResolvers<null> | null = null, driver: CurrentFootprintForwardWriterPublicationDriver | null = null;
  const records: ReturnType<typeof currentFootprintForwardWriterPublicationRecordSchema.parse>[] = [];
  const append = (kind: string, evidence: Readonly<Record<string, unknown>>): Promise<void> => {
    const record = currentFootprintForwardWriterPublicationRecordSchema.parse({ schema: "easyeda-pro-control.footprint-forward-writer-publication-record.v1", operationId: "footprint-forward-publication-synthetic-case", sequence: records.length,
      previousSha256: records.length === 0 ? null : sha256Json(records.at(-1)), kind, evidence, executionAuthorized: false, saveAuthorized: false });
    assertCurrentFootprintForwardWriterPublicationChain([...records, record]); records.push(record);
    if (kind === "callback-result") { callbackReceipt?.resolve(null); } return Promise.resolve();
  };
  await append("operation-intent", { request: { operationId: "footprint-forward-publication-synthetic-case", parentOperationId: "footprint-forward-writer-synthetic-case", acceptOriginalMutationPublication: true } });
  await append("setup-intent", { bodyLineUpperBound: 2, callbackRunUpperBound: 4, sourceSha256: "a".repeat(64), projectionSha256: "b".repeat(64), copyPlanSha256: "c".repeat(64), maximumBodySha256: "d".repeat(64) });
  const selected = (): CurrentFootprintForwardWriterPublicationDriver => { assert.ok(driver !== null); return driver; };
  const bindings: CurrentFootprintForwardWriterPublicationBindings = Object.freeze({ sourceRecords: 4, actual: Object.freeze({ sessionId: "session27", scriptId: "worker19", uniqueContextId: "context", source: "explicit-inert-source", project: "project", wrapper: "wrapper", callback: "callback" }),
    assertCurrent: (): void => { assert.equal(state.exited, false); }, assertOriginalGenerationExited: (): Promise<void> => { assert.equal(state.exited, true); return Promise.resolve(); },
    fail: (cause?: unknown): void => { state.failure ??= cause ?? new Error("synthetic original frontier failure"); callbackReceipt?.reject(state.failure); },
    journal: append, event: () => selected().nextEvent(), originalPoint: (role: CallbackRole):string => `callback-${role}-12`,
    control: ():Promise<void>=>Promise.resolve(),
    request: async (input: CurrentFootprintForwardWriterPublicationCommand): Promise<unknown> => {
      await Promise.resolve();
      const value = validateCurrentFootprintForwardWriterPublicationCommand(input); selected().requireRequest(value); state.requests += 1;
      if(fault==="queue-block"&&value.lane==="queue"){await queueAck.promise;}
      const wire = currentFootprintForwardWriterPublicationWire(value, state.requests);
      assert.equal(wire.request["action"], "footprint-forward-copy-publication"); assert.equal(wire.request["lane"], value.lane);
      const command = value.command;
      if (command.method === "Debugger.setBreakpoint") { return { breakpointId: `${value.lane}-${"role" in command ? command.role : "unknown"}`, actualLocation: command.params.location }; }
      if (command.method === "Debugger.resume") {
        if(fault==="resume-ack"){throw new Error("original-resume-ack-lost");}state.resumes += 1; queueMicrotask(() => { selected().resumed();  }); return {};
      }
      if (command.method === "Debugger.evaluateOnCallFrame") { return array("role" in command ? command.role : "unknown", 4); }
      if (command.method === "Runtime.getProperties") {
        const id = command.params.objectId;
        if (id === "wrapper") { return { result: [prop("length", { type: "number", value: 0 }, false, false), prop("name", { type: "string", value: "" }, false, false)], internalProperties: [
          { name: "[[FunctionLocation]]", value: { type: "object", subtype: "internal#location", value: { scriptId: "worker19", lineNumber: LOCATIONS.serial.lineNumber, columnNumber: LOCATIONS.serial.columnNumber } } },
          { name: "[[Prototype]]", value: { type: "function", objectId: "function-prototype" } }, { name: "[[Scopes]]", value: { type: "object", subtype: "internal#scopeList", className: "Array", objectId: "serial-scopes", description: "Scopes[2]" } }] }; }
        if (id === "serial-scopes") { return { result: [prop("0", { type: "object", subtype: "internal#scope", className: "Object", description: "Closure (Nd)", objectId: "serial-scope" }), prop("1", { type: "object", subtype: "internal#scope", className: "Object", description: "Global", objectId: "global" })] }; }
        if (id === "promise") { return { result: [], internalProperties: [{ name: "[[Prototype]]", value: { type: "object", className: "Promise", description: "Promise", objectId: "promise-prototype" } }, { name: "[[PromiseState]]", value: { type: "string", value: "fulfilled" } }, { name: "[[PromiseResult]]", value: { type: "undefined" } }] }; }
        if (id === "initialFinally") { return { result: [prop("0", { type: "object", subtype: "promise", className: "Promise", description: "Promise", objectId: "promise" }), prop("1", { type: "object", subtype: "null", value: null }), prop("2", { type: "function", objectId: "callback" }), prop("length", { type: "number", value: 3 })] }; }
        return { result: [...Array.from({ length: 4 }, (_, index) => prop(String(index), object(`value-${String(index)}`))), prop("length", { type: "number", value: 4 })] };
      }
      return { result: { type: "boolean", value: true } };
    },
  });
  const lookup = (a: unknown, b: unknown, c: unknown): CurrentFootprintForwardWriterPublicationBindings => { assert.equal(a, origin); assert.equal(b, owner); assert.equal(c, operation); return bindings; };
  const callbacks = await loadSyntheticRegistryModule(new URL("../src/current-footprint-forward-writer-publication-callbacks.ts", import.meta.url), (name, actual) => name === "./current-footprint-forward-writer-publication-origin.ts" ? { ...actual, requireOriginalCurrentFootprintForwardWriterPublicationOrigin: lookup } : actual);
  const module = await loadSyntheticRegistryModule(new URL("../src/current-footprint-forward-writer-publication-driver.ts", import.meta.url), (name, actual) => { if (name === "./current-footprint-forward-writer-publication-origin.ts") { return { ...actual, requireOriginalCurrentFootprintForwardWriterPublicationOrigin: lookup }; } if (name === "./current-footprint-forward-writer-publication-callbacks.ts") { return callbacks; } return actual; });
  const Constructor = module["CurrentFootprintForwardWriterPublicationDriver"]; assert.ok(typeof Constructor === "function");
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Runtime-checked actual maintained class; only explicit inert registry and CDP peers are substituted.
  driver = Reflect.construct(Constructor, [origin, owner, operation]) as CurrentFootprintForwardWriterPublicationDriver;
  await append("setup-result",{originalCallbackPointsRetained:4,newCallbackArms:0,originalStartupFrontierCompleted:true});
  await append("body-intent",{bodySha256:"e".repeat(64),planSha256:"f".repeat(64),documentUuid:"a".repeat(16),bodyLineCalls:2,headCalls:2,originalTwoStringTupleRetained:true});
  await append("body-result",{originalBodyBound:true,parserResumeAuthorized:false});driver.bindOriginalBody();
  return { driver, state, records, ackQueue:():void=>{
    // oxlint-disable-next-line unicorn/no-useless-undefined -- Settle the exact original synthetic held response.
    queueAck.resolve(undefined);
  },callback: async (role: CallbackRole): Promise<void> => {
    callbackReceipt = Promise.withResolvers<null>(); const site = SITES[role]; selected().paused({ reason: "other", hitBreakpoints: [`callback-${role}-12`], callFrames: [
      { callFrameId: `${role}-17`, location: { scriptId: "worker19", lineNumber: site.lineNumber, columnNumber: site.columnNumber }, functionLocation: { scriptId: "worker19", lineNumber: site.lineNumber, columnNumber: site.columnNumber }, ...(role === "startupReturn" ? { returnValue: fault === "return" ? { type: "number", value: 1 } : { type: "undefined" } } : {}) },
      { callFrameId: "startupCaller42", location: { scriptId: "worker19", lineNumber: SITES.producerSerial.lineNumber, columnNumber: SITES.producerSerial.columnNumber }, functionLocation: { scriptId: "worker19", lineNumber: SITES.producerSerial.lineNumber, columnNumber: SITES.producerSerial.columnNumber } }] }); await callbackReceipt.promise;
  } };
}

void test("ready publication retains the original four points, callback receipts and serial Promise joins",async()=>{
 const f=await fixture();await f.callback("startupEntry");await f.callback("startupReturn");await f.callback("initialFinally");
 const result=await f.driver.finish();assert.equal(result.publicationQuiescent,true);assert.equal(f.state.requests,23);assert.equal(f.state.resumes,3);
 assert.equal(f.records.filter(row=>row.kind==="callback-result").length,3);assert.equal(f.state.failure,null);
 await assert.rejects(f.driver.finish());assert.equal(f.state.requests,23);await assert.rejects(f.driver.endAfterOriginalExit());f.state.exited=true;await f.driver.endAfterOriginalExit();
});
void test("zero original ready runs still require the real null serial slots proof",async()=>{
 const f=await fixture();const result=await f.driver.finish();assert.equal(result.publicationQuiescent,true);assert.equal(f.state.requests,3);
 const queue=f.records.find(row=>row.kind==="queue-result");assert.equal(queue?.evidence["calls"],0);assert.equal(queue?.evidence["fulfilledPromiseReferences"],0);
 f.state.exited=true;await f.driver.endAfterOriginalExit();
});
void test("lost callback resume acknowledgement cannot issue another resume or queue receipt",async()=>{
 const f=await fixture("resume-ack");await assert.rejects(f.callback("startupEntry"),/original-resume-ack-lost/u);await nextTurn();
 assert.equal(f.state.resumes,0);const requests=f.state.requests;await assert.rejects(f.driver.finish());assert.equal(f.state.requests,requests);
 assert.equal(f.records.some(row=>row.kind==="queue-intent"),false);f.state.exited=true;await f.driver.endAfterOriginalExit();
});
void test("substituted callback return remains held and cannot manufacture serial completion",async()=>{
 const f=await fixture("return");await f.callback("startupEntry");await assert.rejects(f.callback("startupReturn"),error=>error===f.state.failure);
 assert.equal(f.state.resumes,1);const requests=f.state.requests;await assert.rejects(f.driver.finish());assert.equal(f.state.requests,requests);f.state.exited=true;await f.driver.endAfterOriginalExit();
});

void test("original exit joins the same pending publication finish before component release",async()=>{
 const f=await fixture("queue-block");const finish=f.driver.finish();await nextTurn();assert.equal(f.state.requests,1);
 f.state.exited=true;let ended=false;const ending=(async():Promise<void>=>{await f.driver.endAfterOriginalExit();ended=true;})();await nextTurn();assert.equal(ended,false);
 f.ackQueue();await assert.rejects(finish);await ending;assert.equal(ended,true);assert.equal(f.records.some(row=>row.kind==="publication-result"),false);
});
