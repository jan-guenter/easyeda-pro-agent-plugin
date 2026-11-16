/* oxlint-disable import/max-dependencies -- Compare the actual source constructors, exact point inventories, receipt guards and independent cleanup methods in one retained regression file. */
/** Actual production methods with substituted prerequisites, plus the real
 * installed-source constructor. These checks grant no native owner or effect. */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { stripTypeScriptTypes } from "node:module";
import { test } from "node:test";
import { types } from "node:util";
import { z } from "zod";
import { consumeCurrentSchematicWireServiceRequestReceipt as consumeRequest, retainCurrentSchematicWireServiceRequest as retainRequest } from "../src/current-schematic-wire-service-request-receipt.ts";
import { CURRENT_SCHEMATIC_WIRE_CLASSIC_RPC_SHARED_CALLS as SHARED_CALLS, CURRENT_SCHEMATIC_WIRE_CLASSIC_RPC_SHARED_FLAGS as SHARED_FLAGS } from "../src/current-schematic-wire-classic-rpc-shared-protocol.ts";
import { CurrentSchematicWireParserDriver } from "../src/current-schematic-wire-parser-driver.ts";
import type { CurrentSchematicWireParserDriverCommand } from "../src/current-schematic-wire-parser-driver.ts";
import { CURRENT_SCHEMATIC_WIRE_SERVICE_INVOCATION_KINDS as SERVICE_KINDS, CURRENT_SCHEMATIC_WIRE_SERVICE_INVOCATION_POINTS as SERVICE_POINTS } from "../src/current-schematic-wire-service-invocation-source.ts";
import { CURRENT_SCHEMATIC_WIRE_TREE_RUNTIME_KINDS as TREE_KINDS, currentSchematicWireTreeRuntimePoints as treePoints } from "../src/current-schematic-wire-tree-runtime-source.ts";
import { CURRENT_SCHEMATIC_WIRE_UI_RUNTIME_KINDS as UI_KINDS, CURRENT_SCHEMATIC_WIRE_UI_RUNTIME_POINTS as UI_POINTS } from "../src/current-schematic-wire-ui-runtime-source.ts";
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
    const KINDS=bindings.kinds,POINTS=bindings.points,points=bindings.pointsFor,allocated=bindings.allocated,allocation=bindings.allocated,empty=bindings.empty;
    const validate=value=>value,validateFt=value=>value,validated=value=>value,LIMIT=bindings.limit,FT_LIMIT=bindings.limit,CALLBACK=bindings.callback;
    const ftLocation=bindings.ftLocation,FT_CONDITION="fixture condition",source={parse:value=>value};
    const FLAGS={objectGroup:"fixture.group"},reader=value=>value,methods=bindings.methods;
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

for (const coordinator of ["rpc", "service"] as const) {
for (const owners of coordinator === "rpc" ? [["parser", "rpc"]] : [["parser", "rpc"], ["service", "uiRuntime"], ["treeRuntime", "title"]]) {
for (const eventFirst of [true, false]) {
  void test(`Wire ${coordinator} ${owners.join(" to ")} resume waits for the original ACK and resumed event / event first ${String(eventFirst)}`, async context => {
    const first = Promise.withResolvers<unknown>(), second = Promise.withResolvers<unknown>();
    const routed: string[] = [], sent: unknown[] = [];
    const value = await fixture(`current-schematic-wire-parser-${coordinator}-coordinator.ts`, [
      [" #fail(cause:unknown):void", " #send(owner:Owner"],
      [" async #write(attempt:Attempt)", " public observe(input:unknown)"],
      [" public observe(input:unknown)", " /** Qualify the current three original registrations"],
    ], `
      #resume=null;#sourceOwner=null;#failure=null;#notificationFailure=null;
      #registrationCursor=null;#providerCursor=null;#treeBeforeCursor=null;#fault={reject(){}};#points=new Map();#closing=false;
      #eventObserver={captureObject(event){return{event,original:event};},requireOriginal(){}};#eventRecords=[];
      #title={observeFtCondition(){return false;},observe(){bindings.routed.push("title");return true;}};
      #service={observe(){bindings.routed.push("service");return true;}};#uiRuntime={observe(){bindings.routed.push("uiRuntime");return true;}};
      #treeRuntime={observe(){bindings.routed.push("treeRuntime");return true;}};#treeBeforeProgram=null;#providerProgram=null;
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
    const [firstOwner, secondOwner] = owners; assert.ok(firstOwner !== undefined && secondOwner !== undefined);
    const one = pending(invoke(value, "send", [firstOwner]));
    if (eventFirst) { assert.equal(invoke(value, "observe", [{ sessionId: "123.session", method: "Debugger.resumed", params: {} }]), true); }
    else { first.resolve({ first: true }); await one; }
    const two = pending(invoke(value, "send", [secondOwner])); let secondSettled = false;
    const observed = (async (): Promise<boolean> => { try { await two; return true; } catch { return false; } finally { secondSettled = true; } })();
    context.after(async () => { first.resolve({}); second.resolve({}); await Promise.allSettled([one, two]); await observed; });
    await tick(); assert.equal(sent.length, 1); assert.equal(secondSettled, false);
    if (eventFirst) { first.resolve({ first: true }); await one; }
    else { assert.equal(invoke(value, "observe", [{ sessionId: "123.session", method: "Debugger.resumed", params: {} }]), true); }
    await tick(); assert.equal(sent.length, 2);
    assert.equal(invoke(value, "observe", [{ sessionId: "123.session", method: "Debugger.resumed", params: {} }]), true);
    second.resolve({ second: true }); await two; assert.equal(await observed, true); assert.deepEqual(routed, [firstOwner, secondOwner]);
  });
}

}
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

for (const unavailable of [false, true]) {
  void test(`Wire actual parser arm-only retirement joins and retains cleanup / unavailable ${String(unavailable)}`, async context => {
    const source = await readConfiguredEasyedaAsset(SOURCE[0].relativePath);
    if (source === null) { context.skip(INSTALLED_EASYEDA_SOURCE_SKIP_REASON); return; }
    const commands: CurrentSchematicWireParserDriverCommand[] = [], release = Promise.withResolvers<unknown>();
    const cleanup = new Error("original parser transport closed"); let count = 0, exited = false;
    const driver = new CurrentSchematicWireParserDriver({ sessionId: "123.session", scriptId: "123.sch", holder: "123.holder", native: "123.native", variant: 0, source: { scriptSource: source } }, {
      request: (command): Promise<unknown> => {
        commands.push(command);
        if (command.method === "Debugger.setBreakpoint") { count += 1; return Promise.resolve({ breakpointId: `123.point${String(count)}`, actualLocation: command.params.location }); }
        if (unavailable) { return Promise.reject(cleanup); }
        return command.method === "Runtime.releaseObjectGroup" ? release.promise : Promise.resolve({});
      },
      assertCurrent: (): void => { assert.equal(exited, false); },
      assertOriginalExit: (): void => { assert.equal(exited, true); },
      fail: (): void => {
        // Keep the original failure in the actual driver.
      },
    });
    context.after(async () => { release.resolve({}); exited = true; await driver.retireAfterOriginalExit(); });
    await driver.arm(); assert.equal(count, 12); assert.throws(() => driver.retireAfterOriginalExit());
    exited = true; const retirement = driver.retireAfterOriginalExit(); assert.equal(driver.retireAfterOriginalExit(), retirement);
    let done = false; const observed = (async (): Promise<void> => { await retirement; done = true; })();
    await tick(); assert.equal(commands.filter(command => command.method === "Debugger.removeBreakpoint").length, 12);
    assert.equal(done, unavailable); release.resolve({}); await observed;
    assert.equal(commands.filter(command => command.method === "Runtime.releaseObjectGroup").length, 1);
    assert.equal(driver.inspect().objectGroupReleased, !unavailable); assert.equal(driver.inspect().allocationUncertain, false);
    assert.equal(driver.retained().notificationFailure?.cause, unavailable ? cleanup : undefined);
    const cleanupAttempts = driver.retained().attempts.filter(attempt => attempt.cleanup);
    assert.equal(cleanupAttempts.length, 13);
    assert.equal(cleanupAttempts.filter(attempt => attempt.cause === cleanup).length, unavailable ? 13 : 0);
    await driver.retireAfterOriginalExit(); assert.equal(commands.length, 25); assert.throws(() => driver.run());
  });
}

const allocationLocation = z.strictObject({ scriptId: z.string(), lineNumber: z.number(), columnNumber: z.number() });
const allocationReply = z.strictObject({ breakpointId: z.string(), actualLocation: allocationLocation });
function locationOf(params: unknown): unknown {
  assert.ok(params !== null && typeof params === "object"); const value: unknown = Reflect.get(params, "location"); return value;
}
const lifecycleCases = [
  { name: "service", filename: "current-schematic-wire-service-driver.ts", count: 17, kinds: SERVICE_KINDS, points: SERVICE_POINTS,
    cleanupBegin: " #removeOnce():Promise<void>", cleanupEnd: " public run():Promise<", group: true },
  { name: "tree", filename: "current-schematic-wire-tree-runtime-driver.ts", count: 10, kinds: TREE_KINDS, points: null,
    cleanupBegin: " #removeOnce():Promise<void>", cleanupEnd: " async #compareAliases()", group: false },
  { name: "ui", filename: "current-schematic-wire-ui-runtime-driver.ts", count: 13, kinds: UI_KINDS, points: UI_POINTS,
    cleanupBegin: " #removeOnce():Promise<void>", cleanupEnd: " async #compareAliases()", group: false },
] as const;

/** Actual arm/remove/retire methods; registration/preflight custody and request
 * transport are substituted. This exercises no Inspector or native owner. */
function lifecycleFixture(row: typeof lifecycleCases[number], request: (command: unknown) => Promise<unknown>, exited: () => boolean): Promise<object> {
  return fixture(row.filename, [
    [" async #write(attempt:Attempt)", " public observe(input:unknown)"],
    [row.cleanupBegin, row.cleanupEnd],
    [" public retireAfterOriginalExit():Promise<void>", " public requireLiveComparison("],
  ], `
    #armTask=null;#runTask=null;#finishTask=null;#removeTask=null;#releaseTask=null;#cleanupTask=null;#retirementTask=null;
    #tail=Promise.resolve();#functionTail=Promise.resolve();#settlements=[];#attempts=[];#points=[];#sourceCall=null;#normal=0;#cleanup=0;#sources=0;
    #input={variant:0,scriptId:"123.sch",busScriptId:"123.bus"};#root={};#before={role:"objectContent"};
    #armed=false;#closing=false;#settled=false;#packet=null;#finishSettled=false;#allocationUncertain=false;
    #releaseAttempted=false;#released=false;#failure=null;#notificationFailure=null;#transport=bindings.transport;
    #current(cleanup=false){if(!cleanup){need(!this.#closing&&this.#failure===null);need(!bindings.exited());}}
    #fail(cause){this.#failure??=Object.freeze({cause});}
    holdTasks(run,finish){this.#runTask=run;this.#finishTask=finish;}
    snapshot(){return{points:this.#points,attempts:this.#attempts,notification:this.#notificationFailure,
      failure:this.#failure,uncertain:this.#allocationUncertain,released:this.#released};}
  `, {
    request, exited, kinds: row.kinds, points: row.points, pointsFor: treePoints,
    allocated: allocationReply,
    limit: { normal: 1000, runtime: 1000, cleanup: 1000 }, empty: z.strictObject({}), transport: { request, assertOriginalExit: (): void => { assert.equal(exited(), true); } },
  });
}

for (const row of lifecycleCases) {
  for (const armFailure of [false, true]) {
    for (const unavailable of [false, true]) {
      void test(`Wire substituted ${row.name} arm/retirement cleanup / arm failure ${String(armFailure)} / unavailable ${String(unavailable)}`, async context => {
        const cleanup = new Error("original cleanup refused"), original = new Error("second original allocation failed");
        const commands: unknown[] = []; let allocations = 0, exited = false;
        const value = await lifecycleFixture(row, (command: unknown): Promise<unknown> => {
          commands.push(command); assert.ok(command !== null && typeof command === "object");
          const method: unknown = Reflect.get(command, "method"), params: unknown = Reflect.get(command, "params");
          if (method === "Debugger.setBreakpoint") {
            allocations += 1; if (armFailure && allocations === 2) { return Promise.reject(original); }
            assert.ok(params !== null && typeof params === "object");
            return Promise.resolve({ breakpointId: `123.point${String(allocations)}`, actualLocation: locationOf(params) });
          }
          if (unavailable) { return Promise.reject(cleanup); }
          return Promise.resolve({});
        }, () => exited);
        context.after(async () => { exited = true; await pending(invoke(value, "retireAfterOriginalExit")); });
        const arm = pending(invoke(value, "arm")); assert.equal(invoke(value, "arm"), arm);
        if (armFailure) {
          await assert.rejects(arm, error => { assert.equal(error, original); return true; });
          if (row.group) { assert.equal(commands.length, 4); }
        } else { await arm; assert.equal(allocations, row.count); }
        exited = true; const retirement = pending(invoke(value, "retireAfterOriginalExit")); assert.equal(invoke(value, "retireAfterOriginalExit"), retirement);
        await retirement; const state = invoke(value, "snapshot"); assert.ok(state !== null && typeof state === "object");
        const attempts: unknown = Reflect.get(state, "attempts"), points: unknown = Reflect.get(state, "points");
        assert.ok(Array.isArray(points) && Array.isArray(attempts)); const expected = armFailure ? 1 : row.count;
        assert.equal(points.length, expected);
        for (const point of points) {
          assert.ok(point !== null && typeof point === "object");
          assert.equal(Reflect.get(point, "removeAttempted"), true); assert.equal(Reflect.get(point, "removed"), !unavailable);
        }
        const expectedCleanup = expected + Number(row.group);
        assert.equal(commands.length, allocations + expectedCleanup); assert.equal(Reflect.get(state, "uncertain"), armFailure);
        const notification: unknown = Reflect.get(state, "notification");
        if (unavailable) { assert.ok(notification !== null && typeof notification === "object"); assert.equal(Reflect.get(notification, "cause"), cleanup); }
        else { assert.equal(notification, null); }
        assert.equal(Reflect.get(state, "released"), row.group && !unavailable);
        const before = commands.length; await pending(invoke(value, "retireAfterOriginalExit")); assert.equal(commands.length, before);
        if (armFailure) { const failure: unknown = Reflect.get(state, "failure"); assert.ok(failure !== null && typeof failure === "object"); assert.equal(Reflect.get(failure, "cause"), original); }
      });
    }
  }
}

for (const row of lifecycleCases) {
  void test(`Wire substituted ${row.name} retirement waits for original arm ACK before cleanup`, async context => {
    const allocation = Promise.withResolvers<unknown>(), commands: unknown[] = []; let allocations = 0, exited = false;
    const value = await lifecycleFixture(row, (command: unknown): Promise<unknown> => {
      commands.push(command); assert.ok(command !== null && typeof command === "object");
      const method: unknown = Reflect.get(command, "method"), params: unknown = Reflect.get(command, "params");
      if (method !== "Debugger.setBreakpoint") { return Promise.resolve({}); }
      allocations += 1;
      if (allocations === 2) { return allocation.promise; }
      assert.ok(params !== null && typeof params === "object");
      return Promise.resolve({ breakpointId: "123.first", actualLocation: locationOf(params) });
    }, () => exited);
    const arm = pending(invoke(value, "arm")); const armOutcome = Promise.allSettled([arm]);
    context.after(async () => { allocation.resolve({}); exited = true; await armOutcome; await pending(invoke(value, "retireAfterOriginalExit")); });
    await tick(); assert.equal(commands.length, 2); exited = true;
    const retired = pending(invoke(value, "retireAfterOriginalExit")); await tick(); assert.equal(commands.length, 2);
    const second = commands[1]; assert.ok(second !== null && typeof second === "object");
    const params: unknown = Reflect.get(second, "params"); assert.ok(params !== null && typeof params === "object");
    allocation.resolve({ breakpointId: "123.late", actualLocation: locationOf(params) });
    await retired; const outcome = await armOutcome; assert.equal(outcome[0]?.status, "rejected");
    assert.equal(commands.length, 4 + Number(row.group));
    const state = invoke(value, "snapshot"); assert.ok(state !== null && typeof state === "object"); assert.equal(Reflect.get(state, "uncertain"), false);
    const points: unknown = Reflect.get(state, "points"); assert.ok(Array.isArray(points)); assert.equal(points.length, 2);
    assert.deepEqual(points.map(point => { const id: unknown = Reflect.get(point, "id"); return id; }), ["123.first", "123.late"]);
    assert.ok(points.every(point => Reflect.get(point, "removed") === true));
  });

  void test(`Wire substituted ${row.name} retirement joins run, finish and removal`, async context => {
    const finish = Promise.withResolvers<unknown>(), removal = Promise.withResolvers<unknown>(), run = Promise.withResolvers<unknown>();
    const commands: unknown[] = []; let allocations = 0, exited = false, removals = 0;
    const value = await lifecycleFixture(row, (command: unknown): Promise<unknown> => {
      commands.push(command); assert.ok(command !== null && typeof command === "object");
      const method: unknown = Reflect.get(command, "method"), params: unknown = Reflect.get(command, "params");
      if (method === "Debugger.setBreakpoint") {
        allocations += 1; assert.ok(params !== null && typeof params === "object");
        return Promise.resolve({ breakpointId: `123.point${String(allocations)}`, actualLocation: locationOf(params) });
      }
      if (method === "Debugger.removeBreakpoint") { removals += 1; if (removals === 1) { return removal.promise; } }
      return Promise.resolve({});
    }, () => exited);
    context.after(async () => { run.resolve(null); finish.resolve(null); removal.resolve({}); exited = true; await pending(invoke(value, "retireAfterOriginalExit")); });
    await pending(invoke(value, "arm")); invoke(value, "holdTasks", [run.promise, finish.promise]); exited = true;
    const retired = pending(invoke(value, "retireAfterOriginalExit")); let done = false;
    const observed = (async (): Promise<void> => { await retired; done = true; })();
    await tick(); assert.equal(removals, 0); run.resolve(null); await tick(); assert.equal(removals, 0);
    finish.resolve(null); await tick(); assert.equal(removals, 1); assert.equal(done, false);
    removal.resolve({}); await observed; assert.equal(removals, row.count); assert.equal(commands.length, row.count * 2 + Number(row.group));
  });
}

/** Real receipt capture/consume and driver live/retirement methods, with only
 * successful prior request/settlement custody substituted by explicit records. */
function receiptOwner(resume: Promise<unknown>, exited: () => boolean): Promise<object> {
  const program = SHARED_CALLS.request.program;
  const raw = { result: { type: "object", subtype: "array", className: "Array", objectId: "123.request", description: "Array(3)" } };
  const fields = {
    result: [
      ...[0, 1, 2].map(index => ({ name: String(index), value: { type: "undefined" }, writable: true, configurable: true, enumerable: true, isOwn: true })),
      { name: "length", value: { type: "number", value: 3 }, writable: true, configurable: false, enumerable: false, isOwn: true },
    ],
    internalProperties: [{ name: "[[Prototype]]", value: { type: "object", subtype: "array", objectId: "123.arrayPrototype" } }],
  };
  const command = { phase: "classic-rpc-call", role: "request", method: "Runtime.callFunctionOn",
    params: { ...SHARED_FLAGS, objectId: "123.frame", functionDeclaration: program, arguments: ["123.native", "123.holder", "123.entry"].map(objectId => ({ objectId })), returnByValue: false, awaitPromise: false, userGesture: false } };
  const attempts = [
    { command: { phase: "wire-rpc-driver-origin-call", role: "closing", params: { arguments: [{}, {}, { objectId: "123.entry" }] } } },
    { command, raw, pending: Promise.resolve(raw) },
    { command: { method: "Debugger.getScriptSource" }, raw: { scriptSource: `(${program})` } },
    { command: { phase: "classic-rpc-properties", params: { objectId: "123.request" } }, raw: fields },
    { command: { method: "Debugger.resume" }, pending: resume },
  ];
  const transport = { request: (): Promise<unknown> => { throw new Error("no new receipt dispatch"); },
    assertCurrent: (): void => { assert.equal(exited(), false); }, assertOriginalExit: (): void => { assert.equal(exited(), true); },
    fail: (): void => {
      // Retained successful settlement is supplied only for this guard fixture.
    } };
  return fixture("current-schematic-wire-classic-rpc-driver.ts", [
    [" #current(cleanup=false):void", " #fail(cause:unknown):void"],
    [" public retireAfterOriginalExit():Promise<void>", " /** Internal receipt/root proof"],
    [" public requireLiveServiceRequest():void", " public requireLiveComparison("],
    [" public inspect():Readonly<", " public retained():Readonly<"],
  ], `
    #transport=bindings.transport;#methods=bindings.methods(bindings.transport);#armed=true;#settled=false;#failure=null;#closing=false;
    #packet=null;#finishTask=null;#finishSettled=false;#retirementTask=null;#armTask=null;#runTask=null;#joinTask=null;
    #cleanupTask=null;#removeTask=null;#releaseTask=null;#tail=Promise.resolve();#functionTail=Promise.resolve();#settlements=[];
    #attempts=bindings.attempts;#received=0;#resumes=0;#normal=0;#cleanup=0;#released=false;#allocationUncertain=false;
    #fail(cause){this.#failure??=Object.freeze({cause});}
    retained(){return{attempts:this.#attempts};}
    settle(){this.#settled=true;this.#packet={};}
  `, { transport, attempts, methods: (value: object): readonly unknown[] => ["request", "assertCurrent", "assertOriginalExit", "fail"].map(key => { const method: unknown = Reflect.get(value, key); return method; }) });
}

for (const mode of ["live", "before-capture", "during-resume", "before-consume"] as const) {
  void test(`Wire receipt live guard with substituted prior custody / ${mode}`, { timeout: 5000 }, async context => {
    const resume = Promise.withResolvers<unknown>(); let exited = false;
    const owner = await receiptOwner(resume.promise, () => exited);
    context.after(async () => { resume.resolve({}); exited = true; await pending(invoke(owner, "retireAfterOriginalExit")); });
    if (mode === "before-capture") {
      resume.resolve({}); invoke(owner, "settle"); exited = true; await pending(invoke(owner, "retireAfterOriginalExit"));
      await assert.rejects(pending(Reflect.apply(retainRequest, undefined, [owner]))); return;
    }
    const captureTask = pending(Reflect.apply(retainRequest, undefined, [owner]));
    if (mode === "during-resume") {
      invoke(owner, "settle"); exited = true;
      const rejected = assert.rejects(captureTask);
      const retired = pending(invoke(owner, "retireAfterOriginalExit")); resume.resolve({}); await retired;
      await rejected; return;
    }
    resume.resolve({}); const receipt = await captureTask; assert.ok(receipt !== null && typeof receipt === "object");
    if (mode === "live") {
      assert.equal(Reflect.apply(consumeRequest, undefined, [receipt, owner]), receipt);
      assert.throws(() => { Reflect.apply(consumeRequest, undefined, [receipt, owner]); }); return;
    }
    invoke(owner, "settle"); exited = true; await pending(invoke(owner, "retireAfterOriginalExit"));
    const state = invoke(owner, "inspect"); assert.ok(state !== null && typeof state === "object");
    assert.equal(Reflect.get(state, "armed"), true); assert.equal(Reflect.get(state, "failed"), false);
    assert.equal(Reflect.get(state, "objectGroupReleased"), false); assert.equal(Object.hasOwn(state, "closing"), false);
    assert.throws(() => { Reflect.apply(consumeRequest, undefined, [receipt, owner]); });
    const source = await readFile(new URL("../src/current-schematic-wire-service-invocation-root.ts", import.meta.url), "utf8");
    const begin = "export function requireCurrentSchematicWireServiceInvocationRoot", index = source.indexOf(begin); assert.ok(index > 0);
    const root = {}; const issued = new WeakMap<object, object>([[root, { rpc: owner }]]);
    const factory: unknown = runInThisContext(stripTypeScriptTypes(`(function(issued){
      const need=value=>{if(!value)throw new Error("root guard");};
      ${source.slice(index).replace("export function", "function")}
      return requireCurrentSchematicWireServiceInvocationRoot;
    })`));
    assert.ok(typeof factory === "function"); const requireRoot: unknown = Reflect.apply(factory, undefined, [issued]);
    assert.ok(typeof requireRoot === "function"); assert.throws(() => { Reflect.apply(requireRoot, undefined, [root]); });
  });
}

void test("Wire actual unarmed parser retirement dispatches no cleanup", async context => {
  const source = await readConfiguredEasyedaAsset(SOURCE[0].relativePath);
  if (source === null) { context.skip(INSTALLED_EASYEDA_SOURCE_SKIP_REASON); return; }
  let exited = false; const commands: CurrentSchematicWireParserDriverCommand[] = [];
  const driver = new CurrentSchematicWireParserDriver({ sessionId: "123.session", scriptId: "123.sch", holder: "123.holder", native: "123.native", variant: 0, source: { scriptSource: source } }, {
    request: (command): Promise<unknown> => { commands.push(command); return Promise.reject(new Error("unexpected unowned group cleanup")); },
    assertCurrent: (): void => { assert.equal(exited, false); },
    assertOriginalExit: (): void => { assert.equal(exited, true); },
    fail: (): void => {
      // No arm or group allocation belongs to this driver.
    },
  });
  exited = true; await driver.retireAfterOriginalExit(); assert.equal(commands.length, 0);
  assert.equal(driver.retained().attempts.length, 0); assert.equal(driver.inspect().objectGroupReleased, false);
});

for (const row of lifecycleCases) {
  void test(`Wire substituted unarmed ${row.name} retirement dispatches no cleanup`, async () => {
    const commands: unknown[] = [];
    const value = await lifecycleFixture(row, (command: unknown): Promise<unknown> => { commands.push(command); return Promise.reject(new Error("no owned allocation")); }, () => true);
    await pending(invoke(value, "retireAfterOriginalExit")); assert.equal(commands.length, 0);
  });
}

for (const kind of ["parser", "rpc"] as const) {
  for (const unavailable of [false, true]) {
    void test(`Wire actual ${kind} retains and removes its original late allocation ACK / unavailable ${String(unavailable)}`, async context => {
      const bus = await readConfiguredEasyedaAsset(SOURCE[2].relativePath), source = await readConfiguredEasyedaAsset(SOURCE[0].relativePath);
      if (source === null || bus === null) { context.skip(INSTALLED_EASYEDA_SOURCE_SKIP_REASON); return; }
      const allocation = Promise.withResolvers<unknown>(), commands: (CurrentSchematicWireParserDriverCommand | CurrentSchematicWireClassicRpcDriverCommand)[] = [];
      const cleanup = new Error("original closed transport"); let exited = false;
      const transport = {
        request: (command: CurrentSchematicWireParserDriverCommand | CurrentSchematicWireClassicRpcDriverCommand): Promise<unknown> => {
          commands.push(command); if (command.method === "Debugger.setBreakpoint") { return allocation.promise; }
          return unavailable ? Promise.reject(cleanup) : Promise.resolve({});
        },
        assertCurrent: (): void => { assert.equal(exited, false); }, assertOriginalExit: (): void => { assert.equal(exited, true); },
        fail: (): void => {
          // The original lifecycle failure remains retained.
        },
      };
      const input = { sessionId: "123.session", scriptId: "123.sch", holder: "123.holder", native: "123.native", variant: 0 as const, source: { scriptSource: source }, busScriptId: "123.bus", busSource: { scriptSource: bus } };
      const driver = kind === "parser" ? new CurrentSchematicWireParserDriver(input, transport) : new CurrentSchematicWireClassicRpcDriver(input, transport);
      const arm = driver.arm(), armOutcome = Promise.allSettled([arm]);
      context.after(async () => { allocation.resolve({}); exited = true; await armOutcome; await driver.retireAfterOriginalExit(); });
      await tick(); assert.equal(commands.length, 1); exited = true;
      const retired = driver.retireAfterOriginalExit(); await tick(); assert.equal(commands.length, 1);
      const command = commands[0]; assert.ok(command?.method === "Debugger.setBreakpoint");
      allocation.resolve({ breakpointId: "123.late", actualLocation: command.params.location });
      await retired; const outcome = await armOutcome; assert.equal(outcome[0]?.status, "rejected");
      assert.deepEqual(commands.map(row => row.method), ["Debugger.setBreakpoint", "Debugger.removeBreakpoint", "Runtime.releaseObjectGroup"]);
      assert.equal(driver.inspect().allocationUncertain, false); assert.equal(driver.inspect().objectGroupReleased, !unavailable);
      const attempts = driver.retained().attempts; assert.equal(attempts[0]?.pending, allocation.promise);
      assert.equal(attempts.filter(row => row.cleanup && row.cause === cleanup).length, unavailable ? 2 : 0);
      assert.equal(driver.retained().notificationFailure?.cause, unavailable ? cleanup : undefined);
      await driver.retireAfterOriginalExit(); assert.equal(commands.length, 3);
    });
  }
}

for (const coordinator of ["rpc", "service"] as const) {
  void test(`Wire ${coordinator} coordinator retains original late ACK routing before child reproof`, async () => {
    const allocation = Promise.withResolvers<unknown>(), sent: unknown[] = []; let closing = false;
    const value = await fixture(`current-schematic-wire-parser-${coordinator}-coordinator.ts`, [[" async #write(attempt:Attempt)", " public observe(input:unknown)"]], `
      #resume=null;#sourceOwner=null;#points=new Map();#transport=bindings.transport;
      #current(cleanup=false){if(!cleanup)need(!bindings.closing());}#fail(){}
      send(command){return this.#write({owner:"parser",command});}snapshot(){return this.#points;}
    `, {
      allocated: allocationReply, closing: (): boolean => closing,
      transport: { request: (command: unknown): Promise<unknown> => { sent.push(command); return sent.length === 1 ? allocation.promise : Promise.resolve({}); } },
    });
    const command = { phase: "wire-parser-driver-arm", method: "Debugger.setBreakpoint", params: { location: { scriptId: "123.sch", lineNumber: 0, columnNumber: 1 } } };
    const task = pending(invoke(value, "send", [command])); closing = true;
    const ack = { breakpointId: "123.late", actualLocation: command.params.location }; allocation.resolve(ack);
    assert.equal(await task, ack);
    const points = invoke(value, "snapshot"); assert.ok(points instanceof Map); assert.equal(points.get("123.late"), "parser");
    await pending(invoke(value, "send", [{ method: "Debugger.removeBreakpoint", params: { breakpointId: "123.late" } }]));
    assert.equal(points.size, 0); assert.equal(sent.length, 2);
  });
}

function titleLifecycleFixture(request: (command: unknown) => Promise<unknown>, exited: () => boolean): Promise<object> {
  return fixture("current-schematic-wire-title-driver.ts", [
    [" #send(input:Command", " /** Separate fixed continuation"],
    [" async #armFtReturn():Promise<void>", " #ftProperties("],
    [" #removeFt():Promise<void>", " public prepare(root:"],
    [" public arm():Promise<void>", " public observeFtCondition("],
    [" #remove():Promise<void>", " public run():Promise<"],
    [" public retireAfterOriginalExit():Promise<void>", " public retained():Readonly<"],
  ], `
    #input={variant:0,scriptId:"123.sch"};#before={};#preparing=false;#prepared=0;#preparedSources=0;#normal=0;#cleanup=0;#sources=0;
    #points=[];#attempts=[];#source=null;#functions=Promise.resolve();#prepareTask=null;#ftPrepareTask=null;#armTask=null;#runTask=null;#finishTask=null;#removeTask=null;#ftRemoveTask=null;#retireTask=null;
    #tail=Promise.resolve();#settled=false;#packet=null;#armed=false;#closing=false;#uncertain=false;#failure=null;#notificationFailure=null;
    #ftEnabled=true;#ftArray="123.array";#ftPoint=null;#ftRemoveAttempted=false;#ftRemoved=false;#ftNormal=0;#ftCleanup=0;#ftSources=0;#completed=4;#cell="123.cell";
    #transport=bindings.transport;#current(cleanup=false){if(!cleanup){need(!this.#closing&&this.#failure===null);need(!bindings.exited());}}
    #fail(cause){this.#failure??=Object.freeze({cause});}async #currentFtArray(){}
    armFt(){return this.#armFtReturn();}holdTasks(prepare,ft,run,finish){this.#prepareTask=prepare;this.#ftPrepareTask=ft;this.#runTask=run;this.#finishTask=finish;}
    snapshot(){return{points:this.#points,ft:this.#ftPoint,ftRemoved:this.#ftRemoved,attempts:this.#attempts,notification:this.#notificationFailure,uncertain:this.#uncertain};}
  `, { request, exited, kinds: ["entry", "schematic", "flat", "step", "returned"], pointsFor: (): object => ({ entry: 1, schematic: 2, flat: 3, step: 4, returned: 5 }), callback: [{ lineNumber: 0 }],
    ftLocation: (): object => ({ scriptId: "123.sch", lineNumber: 0, columnNumber: 6 }), allocated: allocationReply, empty: z.strictObject({}), limit: { normal: 1000, runtime: 1000, cleanup: 1000 },
    transport: { request, assertOriginalExit: (): void => { assert.equal(exited(), true); } },
  });
}

for (const mode of ["armed", "title-late", "ft-late", "unavailable", "unarmed"] as const) {
  void test(`Wire title retirement drains every owned title and FT breakpoint / ${mode}`, async context => {
    const commands: unknown[] = [], late = Promise.withResolvers<unknown>(); let count = 0, exited = false;
    const ftFailure = new Error("FT cleanup failed"), titleFailure = new Error("title cleanup failed");
    const request = (command: unknown): Promise<unknown> => {
      commands.push(command); assert.ok(command !== null && typeof command === "object");
      const method: unknown = Reflect.get(command, "method"), params: unknown = Reflect.get(command, "params"), phase: unknown = Reflect.get(command, "phase");
      if (method === "Debugger.setBreakpoint") {
        count += 1; if (mode === "title-late" || mode === "ft-late" && phase === "wire-title-ft-arm") { return late.promise; }
        return Promise.resolve({ breakpointId: `123.point${String(count)}`, actualLocation: locationOf(params) });
      }
      if (mode === "unavailable") { return Promise.reject(phase === "wire-title-ft-remove" ? ftFailure : titleFailure); }
      return Promise.resolve({});
    };
    const value = await titleLifecycleFixture(request, () => exited);
    const tasks: Promise<unknown>[] = [];
    context.after(async () => { late.resolve({}); exited = true; await Promise.allSettled(tasks); await pending(invoke(value, "retireAfterOriginalExit")); });
    if (mode === "unarmed") { exited = true; await pending(invoke(value, "retireAfterOriginalExit")); } else {
      const arm = pending(invoke(value, "arm")); tasks.push(arm); const observed = Promise.allSettled([arm]);
      if (mode !== "title-late") { await arm; const ft = pending(invoke(value, "armFt")); tasks.push(ft); if (mode !== "ft-late") { await ft; } }
      await tick(); exited = true; const retired = pending(invoke(value, "retireAfterOriginalExit"));
      if (mode === "title-late" || mode === "ft-late") {
        const command = commands.at(-1); assert.ok(command !== null && typeof command === "object");
        late.resolve({ breakpointId: "123.late", actualLocation: locationOf(Reflect.get(command, "params")) });
      }
      await retired; await observed;
    }
    const state = invoke(value, "snapshot"); assert.ok(state !== null && typeof state === "object");
    const points: unknown = Reflect.get(state, "points"); assert.ok(Array.isArray(points));
    const expected = { armed: [5, 12], "title-late": [1, 2], "ft-late": [5, 12], unavailable: [5, 12], unarmed: [0, 0] }[mode];
    assert.equal(points.length, expected[0]);
    assert.ok(points.every(point => Reflect.get(point, "attempted") === true && Reflect.get(point, "removed") === (mode !== "unavailable")));
    assert.equal(Reflect.get(state, "ftRemoved"), !["unavailable", "unarmed", "title-late"].includes(mode));
    assert.equal(commands.length, expected[1]);
    if (mode === "unavailable") {
      const notification: unknown = Reflect.get(state, "notification"); assert.ok(notification !== null && typeof notification === "object");
      const aggregate: unknown = Reflect.get(notification, "cause"); assert.ok(aggregate instanceof AggregateError);
      assert.deepEqual(aggregate.errors, [titleFailure, ftFailure]);
      const attempts: unknown = Reflect.get(state, "attempts"); assert.ok(Array.isArray(attempts));
      assert.equal(attempts.filter(attempt => Reflect.get(attempt, "cause") === titleFailure).length, 5);
    }
    const before = commands.length; await pending(invoke(value, "retireAfterOriginalExit")); assert.equal(commands.length, before);
  });
}

void test("Wire title retirement waits for original preparation, arm, run, finish and removal", async context => {
  const finish = Promise.withResolvers<unknown>(), ftPrepare = Promise.withResolvers<unknown>(), prepare = Promise.withResolvers<unknown>(), removal = Promise.withResolvers<unknown>(), run = Promise.withResolvers<unknown>();
  let allocations = 0, exited = false, removals = 0;
  const value = await titleLifecycleFixture((command: unknown): Promise<unknown> => {
    assert.ok(command !== null && typeof command === "object");
    if (Reflect.get(command, "method") === "Debugger.setBreakpoint") { allocations += 1; return Promise.resolve({ breakpointId: `123.point${String(allocations)}`, actualLocation: locationOf(Reflect.get(command, "params")) }); }
    removals += 1; return removals === 1 ? removal.promise : Promise.resolve({});
  }, () => exited);
  context.after(async () => { prepare.resolve(null); ftPrepare.resolve(null); run.resolve(null); finish.resolve(null); removal.resolve({}); exited = true; await pending(invoke(value, "retireAfterOriginalExit")); });
  await pending(invoke(value, "arm")); await pending(invoke(value, "armFt"));
  invoke(value, "holdTasks", [prepare.promise, ftPrepare.promise, run.promise, finish.promise]); exited = true;
  const retired = pending(invoke(value, "retireAfterOriginalExit")); let done = false;
  const observed = (async (): Promise<void> => { await retired; done = true; })();
  await tick(); assert.equal(removals, 0); prepare.resolve(null); await tick(); assert.equal(removals, 0);
  ftPrepare.resolve(null); await tick(); assert.equal(removals, 0); run.resolve(null); await tick(); assert.equal(removals, 0);
  finish.resolve(null); await tick(); assert.equal(removals, 1); assert.equal(done, false);
  removal.resolve({}); await observed; assert.equal(removals, 6);
});

for (const row of lifecycleCases) {
  for (const mode of ["malformed", "mismatch", "duplicate"] as const) {
    void test(`Wire ${row.name} uncertain ${mode} original allocation retains only known cleanup custody`, async context => {
      const allocation = Promise.withResolvers<unknown>(), commands: unknown[] = []; let allocations = 0, exited = false;
      const value = await lifecycleFixture(row, (command: unknown): Promise<unknown> => {
        commands.push(command); assert.ok(command !== null && typeof command === "object");
        if (Reflect.get(command, "method") !== "Debugger.setBreakpoint") { return Promise.resolve({}); }
        allocations += 1; if (allocations === 2) { return allocation.promise; }
        return Promise.resolve({ breakpointId: "123.first", actualLocation: locationOf(Reflect.get(command, "params")) });
      }, () => exited);
      const arm = pending(invoke(value, "arm")), outcome = Promise.allSettled([arm]);
      context.after(async () => { allocation.resolve({}); exited = true; await outcome; await pending(invoke(value, "retireAfterOriginalExit")); });
      await tick(); exited = true; const retired = pending(invoke(value, "retireAfterOriginalExit"));
      const second = commands[1]; assert.ok(second !== null && typeof second === "object");
      const actualLocation: unknown = locationOf(Reflect.get(second, "params")); assert.ok(actualLocation !== null && typeof actualLocation === "object");
      const columnNumber: unknown = Reflect.get(actualLocation, "columnNumber"), lineNumber: unknown = Reflect.get(actualLocation, "lineNumber");
      const replies = {
        malformed: { breakpointId: "123.unknown" },
        mismatch: { breakpointId: "123.mismatch", actualLocation: { scriptId: "123.foreign", lineNumber, columnNumber } },
        duplicate: { breakpointId: "123.first", actualLocation },
      };
      allocation.resolve(replies[mode]); await retired; const result = await outcome; assert.equal(result[0]?.status, "rejected");
      const state = invoke(value, "snapshot"); assert.ok(state !== null && typeof state === "object"); assert.equal(Reflect.get(state, "uncertain"), true);
      const points: unknown = Reflect.get(state, "points"); assert.ok(Array.isArray(points)); assert.equal(points.length, mode === "mismatch" ? 2 : 1);
      assert.ok(points.every(point => Reflect.get(point, "removed") === true));
      assert.equal(commands.length, 2 + points.length + Number(row.group));
    });
  }
}
