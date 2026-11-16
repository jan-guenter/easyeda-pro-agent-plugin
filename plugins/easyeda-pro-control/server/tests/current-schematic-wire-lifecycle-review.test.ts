/** Actual production methods with substituted prerequisites, plus the real
 * installed-source constructor. These checks grant no native owner or effect. */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { stripTypeScriptTypes } from "node:module";
import { test } from "node:test";
import { types } from "node:util";
import { runInThisContext } from "node:vm";
import { CurrentSchematicWireClassicRpcDriver } from "../src/current-schematic-wire-classic-rpc-driver.ts";
import type { CurrentSchematicWireClassicRpcDriverCommand } from "../src/current-schematic-wire-classic-rpc-driver.ts";
import { captureCurrentPcbStringClockReply as capture } from "../src/current-pcb-string-clock-reply.ts";
import { CURRENT_SCHEMATIC_WIRE_CLASSIC_RPC_SOURCE as SOURCE } from "../src/current-schematic-wire-classic-rpc-source.ts";
import { INSTALLED_EASYEDA_SOURCE_SKIP_REASON, readConfiguredEasyedaAsset } from "./helpers/installed-easyeda-source.ts";

async function tick(): Promise<void> {
  const task = Promise.withResolvers<null>(); setImmediate(() => { task.resolve(null); }); await task.promise;
}
function invoke(value: object, name: string, args: readonly unknown[] = []): unknown {
  const method: unknown = Reflect.get(value, name); assert.equal(typeof method, "function");
  assert.ok(typeof method === "function"); return Reflect.apply(method, value, args);
}
function pending(value: unknown): Promise<unknown> { assert.ok(value instanceof Promise); return value; }
async function fixture(filename: string, spans: readonly (readonly [string, string])[], setup: string, bindings: object): Promise<object> {
  const source = await readFile(new URL(`../src/${filename}`, import.meta.url), "utf8");
  const methods = spans.map(([begin, end]) => {
    assert.equal(source.split(begin).length, 2); const start = source.indexOf(begin), stop = source.indexOf(end, start);
    assert.ok(stop > start); return source.slice(start, stop);
  });
  const factory: unknown = runInThisContext(stripTypeScriptTypes(`(function(bindings){
    const need=bindings.need,types=bindings.types,capture=bindings.capture,eventSchema={parse:value=>value};
    async function settled(task){try{await task;}catch{}}
    return class Fixture { ${setup}\n${methods.join("\n")} };
  })`));
  const inputs = { need: (condition: boolean): void => { assert.ok(condition); }, types, capture, ...bindings };
  assert.ok(typeof factory === "function"); const constructor: unknown = Reflect.apply(factory, undefined, [inputs]);
  assert.ok(typeof constructor === "function"); const result: unknown = Reflect.construct(constructor, []);
  assert.ok(result !== null && typeof result === "object"); return result;
}

for (const removalFails of [false, true]) {
  void test(`Wire direct arm removes acknowledged breakpoints after refusal / cleanup failure ${String(removalFails)}`, async context => {
    const bus = await readConfiguredEasyedaAsset(SOURCE[2].relativePath), source = await readConfiguredEasyedaAsset(SOURCE[0].relativePath);
    if (source === null || bus === null) { context.skip(INSTALLED_EASYEDA_SOURCE_SKIP_REASON); return; }
    const cleanup = new Error("known removal failed"), original = new Error("second allocation failed");
    const commands: CurrentSchematicWireClassicRpcDriverCommand[] = []; let allocations = 0, exited = false;
    const driver = new CurrentSchematicWireClassicRpcDriver({ sessionId: "123.session", scriptId: "123.sch", busScriptId: "123.bus", holder: "123.holder", native: "123.native", variant: 0, source: { scriptSource: source }, busSource: { scriptSource: bus } }, {
      request: (command): Promise<unknown> => {
        commands.push(command);
        if (command.method === "Debugger.setBreakpoint") {
          allocations += 1; if (allocations === 2) { return Promise.reject(original); }
          return Promise.resolve({ breakpointId: "123.known", actualLocation: command.params.location });
        }
        if (command.method === "Debugger.removeBreakpoint" && removalFails) { return Promise.reject(cleanup); }
        return Promise.resolve({});
      },
      assertCurrent: (): void => { assert.equal(exited, false); },
      assertOriginalExit: (): void => { assert.equal(exited, true); },
      fail: (): void => {
        // The original error is retained by the driver.
      },
    });
    context.after(async () => { exited = true; await driver.retireAfterOriginalExit(); });
    const arm = driver.arm(); assert.equal(driver.arm(), arm);
    await assert.rejects(arm, error => { assert.equal(error, original); return true; });
    assert.deepEqual(commands.map(command => command.method), ["Debugger.setBreakpoint", "Debugger.setBreakpoint", "Debugger.removeBreakpoint", "Runtime.releaseObjectGroup"]);
    assert.equal(driver.inspect().allocationUncertain, true); assert.equal(driver.inspect().objectGroupReleased, true);
    assert.equal(driver.retained().firstFailure?.cause, original);
    assert.equal(driver.retained().notificationFailure?.cause, removalFails ? cleanup : undefined);
    exited = true; await driver.retireAfterOriginalExit(); assert.equal(commands.length, 4);
  });
}

for (const eventFirst of [true, false]) {
  void test(`Wire cross-driver resume waits for the original ACK and resumed event / event first ${String(eventFirst)}`, async context => {
    const first = Promise.withResolvers<unknown>(), second = Promise.withResolvers<unknown>();
    const routed: string[] = [], sent: unknown[] = [];
    const value = await fixture("current-schematic-wire-parser-rpc-coordinator.ts", [
      [" #fail(cause:unknown):void", " #send(owner:Owner"],
      [" async #write(attempt:Attempt)", " public observe(input:unknown)"],
      [" public observe(input:unknown)", " /** Qualify the current three original registrations"],
    ], `
      #resume=null;#sourceOwner=null;#failure=null;#notificationFailure=null;
      #registrationCursor=null;#fault={reject(){}};#points=new Map();#closing=false;
      #events=[];#registrationProgram=null;#input={sessionId:"123.session"};
      #transport=bindings.transport;
      #parser={observe(){bindings.routed.push("parser");return true;}};
      #rpc={observe(){bindings.routed.push("rpc");return true;}};
      #current(cleanup=false){if(!cleanup&&this.#failure!==null)throw this.#failure.cause;}
      send(owner){return this.#write({owner,command:{phase:"wire-rpc-driver-resume",method:"Debugger.resume",params:{}}});}
    `, {
      types, routed, need: (condition: boolean): void => { assert.ok(condition); },
      transport: { request: (command: unknown): Promise<unknown> => { sent.push(command); return sent.length === 1 ? first.promise : second.promise; }, fail: (): void => {
        // Retain the coordinator's own failure.
      } },
    });
    const one = pending(invoke(value, "send", ["parser"]));
    if (eventFirst) { assert.equal(invoke(value, "observe", [{ sessionId: "123.session", method: "Debugger.resumed", params: {} }]), true); }
    else { first.resolve({ first: true }); await one; }
    const two = pending(invoke(value, "send", ["rpc"])); let secondSettled = false;
    const observed = (async (): Promise<boolean> => { try { await two; return true; } catch { return false; } finally { secondSettled = true; } })();
    context.after(async () => { first.resolve({}); second.resolve({}); await Promise.allSettled([one, two]); await observed; });
    await tick(); assert.equal(sent.length, 1); assert.equal(secondSettled, false);
    if (eventFirst) { first.resolve({ first: true }); await one; }
    else { assert.equal(invoke(value, "observe", [{ sessionId: "123.session", method: "Debugger.resumed", params: {} }]), true); }
    await tick(); assert.equal(sent.length, 2);
    assert.equal(invoke(value, "observe", [{ sessionId: "123.session", method: "Debugger.resumed", params: {} }]), true);
    second.resolve({ second: true }); await two; assert.equal(await observed, true); assert.deepEqual(routed, ["parser", "rpc"]);
  });
}

void test("Wire requested tree, title and FT preparation completes before any child arm", async context => {
  const ft = Promise.withResolvers<null>(), title = Promise.withResolvers<null>(), tree = Promise.withResolvers<null>();
  const calls: string[] = [];
  const value = await fixture("current-schematic-wire-parser-service-coordinator.ts", [[" public arm():Promise<void>", " public runUiProviders()"]], `
    #armTask=null;#treeBeforeTask=bindings.tree.promise;#titleBefore=bindings.title.promise;#titleFtBefore=bindings.ft.promise;
    #parser={arm:async()=>{bindings.calls.push("parser");}};#rpc={arm:async()=>{bindings.calls.push("rpc");}};
    #service={arm:async()=>{bindings.calls.push("service");}};#uiRuntime={arm:async()=>{bindings.calls.push("ui");}};
    #treeRuntime={arm:async()=>{bindings.calls.push("tree");}};#title={arm:async()=>{bindings.calls.push("title");}};
    #current(){}#fail(error){throw error;}async prepareServices(){}async prepareProviders(){}
  `, { tree, title, ft, calls });
  const arm = pending(invoke(value, "arm")); assert.equal(invoke(value, "arm"), arm);
  context.after(async () => { tree.resolve(null); title.resolve(null); ft.resolve(null); await Promise.allSettled([arm]); });
  await tick(); assert.deepEqual(calls, []); tree.resolve(null);
  await tick(); assert.deepEqual(calls, []); title.resolve(null);
  await tick(); assert.deepEqual(calls, []); ft.resolve(null);
  await arm; assert.deepEqual(calls, ["parser", "rpc", "service", "ui", "tree", "title"]);
});

void test("Wire title cleanup attempts both groups and retains primary and every cleanup failure", async () => {
  const ft = new Error("FT cleanup failure"), notification = new Error("failure notification"), original = new Error("original title failure"), title = new Error("title cleanup failure");
  const calls: string[] = [];
  const value = await fixture("current-schematic-wire-title-driver.ts", [[" public run():Promise<CurrentSchematicWireTitleData>", " public requireLiveComparison("]], `
    #runTask=null;#failure=null;#notificationFailure={cause:bindings.notification};#settled=false;
    #done={promise:Promise.resolve()};#tail=Promise.resolve();#completed=0;#pauses=0;#resumes=0;#resumeEvents=0;#sources=0;
    #points=[];#packet=null;#prepared=0;#normal=0;#cleanup=0;#current(){}
    async arm(){throw bindings.original;}#fail(error){this.#failure??={cause:error};}
    async #removeFt(){bindings.calls.push("ft");throw bindings.ft;}
    async #remove(){bindings.calls.push("title");throw bindings.title;}
    snapshot(){return{primary:this.#failure.cause,notification:this.#notificationFailure.cause,settled:this.#settled};}
  `, { original, ft, title, notification, calls });
  const run = pending(invoke(value, "run")); assert.equal(invoke(value, "run"), run);
  await assert.rejects(run, error => { assert.equal(error, original); return true; });
  assert.deepEqual(calls, ["ft", "title"]); const snapshot = invoke(value, "snapshot");
  assert.ok(snapshot !== null && typeof snapshot === "object"); assert.equal(Reflect.get(snapshot, "primary"), original);
  const cleanup: unknown = Reflect.get(snapshot, "notification"); assert.ok(cleanup instanceof AggregateError);
  assert.deepEqual(cleanup.errors, [notification, ft, title]); assert.equal(Reflect.get(snapshot, "settled"), true);
});
