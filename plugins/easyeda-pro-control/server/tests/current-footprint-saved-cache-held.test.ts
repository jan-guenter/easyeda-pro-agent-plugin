/** Real fixed held-cache programs with synthetic browser functions/metadata.
 * No native qualification, connected absence or saved-copy proof is claimed.
 */
import assert from "node:assert/strict";
import { test } from "node:test";
import { CURRENT_FOOTPRINT_SAVED_CACHE_HELD_ENGINE as ENGINE, CURRENT_FOOTPRINT_SAVED_CACHE_HELD_LIMITS as LIMITS } from "../src/current-footprint-saved-cache-held-profile.ts";
import { CURRENT_FOOTPRINT_SAVED_CACHE_HELD_CALLS as CALLS } from "../src/current-footprint-saved-cache-held-programs.ts";
import { decodeCurrentFootprintSavedCacheHeldTuple, validateCurrentFootprintSavedCacheHeldEngine,
  validateCurrentFootprintSavedCacheHeldFunction } from "../src/current-footprint-saved-cache-held-metadata.ts";
import { validateCurrentFootprintSavedCacheHeldCommand } from "../src/current-footprint-saved-cache-held-protocol.ts";
import type { CurrentFootprintSavedCacheHeldCommand as Command } from "../src/current-footprint-saved-cache-held-protocol.ts";
import { CurrentFootprintSavedCacheHeldRunner } from "../src/current-footprint-saved-cache-held-runner.ts";
import { createHeldCacheSyntheticPage, heldCacheSyntheticMetadata, heldCacheSyntheticTarget as target } from "./helpers/current-footprint-saved-cache-held-fixture.ts";

/** Bind one synthetic transport to the actual fixed-program page and retain its
 * exact commands. Deliberate callbacks model failures without native authority.
 */
function fixture(options: Parameters<typeof createHeldCacheSyntheticPage>[0] = {}, intercept?: (command: Command, reply: unknown) => unknown): {
  runner: CurrentFootprintSavedCacheHeldRunner; commands: Command[]; page: ReturnType<typeof createHeldCacheSyntheticPage>;
} {
  const commands: Command[] = [], page = createHeldCacheSyntheticPage(options);
  const transport = { assertCurrent: (): Promise<void> => Promise.resolve(), request: async (command: Command): Promise<unknown> => {
    commands.push(command); const reply = await page.run(command); return intercept === undefined ? reply : intercept(command, reply);
  } };
  return { page, commands, runner: new CurrentFootprintSavedCacheHeldRunner(transport,
    { sessionId: "parent", uniqueContextId: "original", ...target }, ENGINE) };
}

/** Refine fixture fields to unknown elements without retaining Array.isArray's
 * any[] inference in adversarial metadata mutations.
 */
function unknownArray(value: unknown): readonly unknown[] {
  assert.ok(Array.isArray(value)); return value.map((entry: unknown): unknown => entry);
}

/** Place a controlled substitution at successive promise-resumption boundaries. */
function afterMicrotasks(remaining: number, work: () => void): void {
  queueMicrotask(() => {
    if (remaining === 0) { work(); } else { afterMicrotasks(remaining - 1, work); }
  });
}

void test("held-cache complete observed rosters accept alias handles but refuse extra fields, script/bound internals and engine drift", () => {
  assert.deepEqual(validateCurrentFootprintSavedCacheHeldEngine(ENGINE), ENGINE);
  const tuple = decodeCurrentFootprintSavedCacheHeldTuple(heldCacheSyntheticMetadata("array"));
  assert.equal(tuple.prototype, "tuple-prototype");
  const original = heldCacheSyntheticMetadata("array");
  const duplicate = unknownArray(original["result"]).map((value, index) => index === 2 ? {
    name: "2", value: { type: "function", className: "Function", description: "function match() { [native code] }", objectId: tuple.constructor },
    writable: true, enumerable: true, configurable: true, isOwn: true,
  } : value);
  assert.throws(() => decodeCurrentFootprintSavedCacheHeldTuple({ ...original, result: duplicate }), /TUPLE_HANDLES/u);
  for (const role of ["constructor", "match", "getter"] as const) {
    const valid = heldCacheSyntheticMetadata(role); validateCurrentFootprintSavedCacheHeldFunction(valid, role);
    assert.throws(() => { validateCurrentFootprintSavedCacheHeldFunction({ ...valid, unknown: true }, role); });
    for (const entry of [{ name: "[[FunctionLocation]]", value: { scriptId: "1", lineNumber: 0, columnNumber: 0 } },
      { name: "[[TargetFunction]]", value: { type: "function", objectId: "bound" } }]) {
      const internals = unknownArray(valid["internalProperties"]);
      assert.throws(() => { validateCurrentFootprintSavedCacheHeldFunction({ ...valid, internalProperties: [...internals, entry] }, role); });
    }
    const fields = unknownArray(valid["result"]);
    assert.throws(() => { validateCurrentFootprintSavedCacheHeldFunction({ ...valid, result: [...fields, fields[0]] }, role); });
    assert.throws(() => { validateCurrentFootprintSavedCacheHeldFunction({ ...valid, internalProperties: [] }, role); });
  }
  assert.throws(() => validateCurrentFootprintSavedCacheHeldEngine({ ...ENGINE, product: "Chrome/other" }));
  assert.throws(() => validateCurrentFootprintSavedCacheHeldEngine({ ...ENGINE, nativeGetterQualified: true }));
});

void test("held-cache runner stages one getter and both namespaces twice on the same tuple with no JSON authority", async () => {
  const f = fixture(); await f.runner.prepare();
  assert.equal(f.page.evaluate("getterCalls"), 1); assert.equal(f.page.evaluate("calls.length"), 0);
  assert.equal(f.page.evaluate("heldTuple.length"), 7);
  const first = await f.runner.observeFirst(); await f.runner.requireOriginal(first, "first");
  assert.equal(f.page.evaluate("getterCalls"), 1); assert.equal(f.page.evaluate("calls.length"), 5);
  await assert.rejects(f.runner.observeFirst(), /OBSERVATION_CONSUMED/u);
  await assert.rejects(f.runner.requireOriginal(structuredClone(first), "first"), /ORIGINAL_PACKET/u);
  const fresh = await f.runner.observeFresh(); await f.runner.requireOriginal(fresh, "fresh");
  const runtimeArguments = (packet: unknown, stage: unknown): Promise<unknown> => {
    // oxlint-disable-next-line typescript/unbound-method -- Reflect.apply supplies the same original runner receiver while exercising deliberately invalid runtime arguments.
    const result: unknown = Reflect.apply(f.runner.requireOriginal, f.runner, [packet, stage]);
    return Promise.resolve(result);
  };
  await assert.rejects(runtimeArguments(undefined, "unknown"), /OBSERVATION_STAGE/u);
  await assert.rejects(runtimeArguments(undefined, "fresh"), /ORIGINAL_PACKET/u);
  await assert.rejects(f.runner.requireOriginal(first, "first"), /ORIGINAL_PACKET/u);
  await assert.rejects(f.runner.observeFresh(), /OBSERVATION_CONSUMED/u);
  assert.equal(f.page.evaluate("getterCalls"), 1); assert.equal(f.page.evaluate("calls.length"), 10);
  assert.deepEqual(structuredClone(f.page.evaluate("calls.filter(v=>v.kind==='match').map(v=>v.args[1].cacheName)")),
    [`project_${target.projectUuid}_v6`, `localProject_${target.projectUuid}_v1`, `project_${target.projectUuid}_v6`, `localProject_${target.projectUuid}_v1`]);
  for (const packet of [first, fresh]) {
    assert.equal(packet.replayTokenIssued, false); assert.equal(packet.executionAuthorized, false);
    assert.equal(packet.nativeQualificationIssued, false); assert.equal(packet.runtimeAdmissionGranted, false);
  }
  await f.runner.release(); await assert.rejects(f.runner.release(), /RELEASE_CONSUMED/u);
  assert.deepEqual(f.commands.map(command => command.heldCachePhase), ["capture", "array-properties", "constructor-properties", "match-properties", "getter-properties",
    "recheck-before-getter", "retain-receiver", "queue-first", "recheck-first", "queue-fresh", "recheck-fresh", "release"]);
  assert.equal(f.runner.retained()["normalRequests"], LIMITS.normal); assert.equal(f.runner.retained()["cleanupRequests"], LIMITS.cleanup);
  assert.equal(f.runner.retained()["released"], true); assert.equal(f.runner.retained()["nativeQualificationIssued"], false);
});

void test("unreviewed getter metadata refuses before invocation and automatically consumes original cleanup once", async () => {
  const f = fixture({}, (command, reply) => command.heldCachePhase === "getter-properties" ? { result: [], internalProperties: [] } : reply);
  await assert.rejects(f.runner.prepare()); assert.equal(f.page.evaluate("getterCalls"), 0);
  assert.equal(f.commands.at(-1)?.heldCachePhase, "release"); assert.equal(f.runner.retained()["released"], true);
  await assert.rejects(f.runner.prepare(), /PREPARE_CONSUMED/u); await assert.rejects(f.runner.observeFirst(), /OBSERVATION_CONSUMED/u);
  await assert.rejects(f.runner.release(), /RELEASE_CONSUMED/u); assert.equal(f.commands.length, 6);
  for (const result of [false, {}]) {
    let requests = 0;
    const malformed: unknown = Reflect.construct(CurrentFootprintSavedCacheHeldRunner, [{
      assertCurrent: (): Promise<unknown> => Promise.resolve(result),
      request: (): Promise<unknown> => { requests += 1; return Promise.resolve({}); },
    }, { sessionId: "parent", uniqueContextId: "original", ...target }, ENGINE]);
    assert.ok(malformed instanceof CurrentFootprintSavedCacheHeldRunner);
    await assert.rejects(malformed.prepare(), /ASSERTION_RESULT/u); assert.equal(requests, 0);
    assert.equal(malformed.retained()["executionAuthorized"], false);
  }
});

void test("held-cache wrong receiver, descriptor drift and upload presence stop without another getter or namespace retry", async () => {
  const wrong = fixture({ wrongReceiver: true }); await assert.rejects(wrong.runner.prepare(), /SAVED_CACHE_HELD_IDENTITY/u);
  assert.equal(wrong.page.evaluate("getterCalls"), 1); assert.equal(wrong.page.evaluate("calls.length"), 0);
  for (const options of [{ afterNative: "if(index===2)Object.defineProperty(globalThis,'caches',{get(){throw Error('REPLACED_GETTER');},enumerable:true,configurable:true});" }, { presentAt: 2 }]) {
    const f = fixture(options); await f.runner.prepare(); await assert.rejects(f.runner.observeFirst());
    assert.equal(f.page.evaluate("getterCalls"), 1); assert.equal(f.page.evaluate("calls.length"), 2);
    await assert.rejects(f.runner.observeFirst(), /OBSERVATION_CONSUMED/u); await assert.rejects(f.runner.observeFresh(), /OBSERVATION_CONSUMED/u);
    assert.equal(f.commands.filter(command => command.heldCachePhase === "release").length, 1);
    assert.equal(f.runner.retained()["replayTokenIssued"], false);
  }
});

void test("held realm phases reject direct replay, prototype replacement and changed tuple fields before downstream RPC", async () => {
  const f = fixture(); await f.runner.prepare();
  const args = `${JSON.stringify(target.projectUuid)},${JSON.stringify(target.branchUuid)}`;
  f.page.evaluate(`globalThis.first=(${CALLS.first}).call(heldTuple,${args});`);
  await Promise.resolve(f.page.evaluate("first"));
  const repeated = Promise.resolve(f.page.evaluate(`(${CALLS.first}).call(heldTuple,${args})`));
  await assert.rejects(repeated, /SAVED_CACHE_HELD_IDENTITY/u);
  const otherScope = `${JSON.stringify(target.projectUuid)},${JSON.stringify("c".repeat(32))}`;
  const foreignFresh = Promise.resolve(f.page.evaluate(`(${CALLS.fresh}).call(heldTuple,${otherScope})`));
  await assert.rejects(foreignFresh, /SAVED_CACHE_HELD_IDENTITY/u);
  assert.equal(f.page.evaluate("calls.length"), 5); await f.runner.release();
  for (const mutation of ["CacheStorage.prototype.match=function replacement(){}", "heldTuple[4]='{}'", "Object.defineProperty(heldTuple,'0',{writable:false})", "heldTuple.extra=1",
    "Object.defineProperty(originalStorage,'match',{get(){getterCalls+=1000;throw Error('own shadow invoked');}})"]) {
    const page = fixture(); await page.runner.prepare(); page.page.evaluate(mutation);
    await assert.rejects(page.runner.observeFirst()); assert.equal(page.page.evaluate("calls.length"), 0); assert.equal(page.page.evaluate("getterCalls"), 1);
  }
});

void test("held-cache lost cleanup acknowledgment remains consumed and never permits more normal work", async () => {
  const f = fixture({}, (command, reply) => {
    if (command.heldCachePhase === "release") { throw new Error("synthetic cleanup acknowledgment lost"); }
    return reply;
  });
  await f.runner.prepare(); await assert.rejects(f.runner.release(), /acknowledgment lost/u);
  assert.equal(f.runner.retained()["released"], false); assert.equal(f.runner.retained()["releaseAttempted"], true);
  await assert.rejects(f.runner.release(), /RELEASE_CONSUMED/u); await assert.rejects(f.runner.observeFirst(), /OBSERVATION_CONSUMED/u);
  assert.equal(f.commands.filter(command => command.heldCachePhase === "release").length, 1);
});

void test("transport replacement after a metadata reply refuses before getter invocation or replacement dispatch", async () => {
  const commands: Command[] = [], page = createHeldCacheSyntheticPage(); let replacements = 0;
  const replacement = (): Promise<unknown> => { replacements += 1; return Promise.resolve({}); };
  const transport = { assertCurrent: (): Promise<void> => Promise.resolve(), request: async (command: Command): Promise<unknown> => {
    commands.push(command); const reply = await page.run(command);
    if (command.heldCachePhase === "getter-properties") { transport.request = replacement; }
    return reply;
  } };
  const runner = new CurrentFootprintSavedCacheHeldRunner(transport, { sessionId: "parent", uniqueContextId: "original", ...target }, ENGINE);
  await assert.rejects(runner.prepare(), /TRANSPORT_CHANGED/u); assert.equal(page.evaluate("getterCalls"), 0);
  assert.equal(replacements, 0); assert.equal(commands.length, 5); assert.equal(runner.retained()["released"], false);
  assert.equal(runner.retained()["releaseAttempted"], true); await assert.rejects(runner.observeFirst(), /OBSERVATION_CONSUMED/u);
});

void test("release during an original owner callback prevents later native dispatch when that callback settles", async () => {
  const gate = Promise.withResolvers<null>(); let calls = 0;
  const runner = new CurrentFootprintSavedCacheHeldRunner({ assertCurrent: async (): Promise<void> => { await gate.promise; },
    request: (): Promise<unknown> => { calls += 1; return Promise.resolve({}); } },
  { sessionId: "parent", uniqueContextId: "original", ...target }, ENGINE);
  const preparing = runner.prepare(); assert.equal(runner.retained()["pendingCallbacks"], 1);
  await assert.rejects(runner.release(), /ORIGINAL_CALLBACK_PENDING/u); gate.resolve(null);
  await assert.rejects(preparing, /NORMAL_LIFETIME_ENDED/u); assert.equal(calls, 0);
  assert.equal(runner.retained()["pendingCallbacks"], 0); assert.equal(runner.retained()["released"], false);
  await assert.rejects(runner.release(), /RELEASE_CONSUMED/u);
});

void test("held-cache callbacks see their pending reservation before any original assertion or request starts", async () => {
  const page = createHeldCacheSyntheticPage(), reservations: unknown[] = [];
  const holder: { runner: CurrentFootprintSavedCacheHeldRunner | null } = { runner: null };
  const transport = { assertCurrent: (): Promise<void> => {
    assert.ok(holder.runner !== null); reservations.push(holder.runner.retained()["pendingCallbacks"]); return Promise.resolve();
  }, request: (command: Command): Promise<unknown> => {
    assert.ok(holder.runner !== null); reservations.push(holder.runner.retained()["pendingCallbacks"]); return page.run(command);
  } };
  const runner = new CurrentFootprintSavedCacheHeldRunner(transport, { sessionId: "parent", uniqueContextId: "original", ...target }, ENGINE);
  holder.runner = runner;
  await runner.prepare(); await runner.observeFirst(); await runner.observeFresh(); await runner.release();
  assert.ok(reservations.length > 12); assert.equal(reservations.every(value => value === 1), true);
});

void test("microtask transport substitution cannot dispatch the replacement between owner reproof and exchange", async () => {
  for (let delay = 0; delay < 16; delay += 1) {
    const page = createHeldCacheSyntheticPage(); let replacements = 0, scheduled = false;
    const replacement = (): Promise<unknown> => { replacements += 1; return Promise.resolve({}); };
    const transport = { assertCurrent: (): Promise<void> => {
      if (!scheduled) { scheduled = true; afterMicrotasks(delay, () => { transport.request = replacement; }); }
      return Promise.resolve();
    }, request: (command: Command): Promise<unknown> => page.run(command) };
    const runner = new CurrentFootprintSavedCacheHeldRunner(transport, { sessionId: "parent", uniqueContextId: "original", ...target }, ENGINE);
    await assert.rejects(runner.prepare(), /TRANSPORT_CHANGED/u); assert.equal(replacements, 0);
    assert.equal(page.evaluate("getterCalls"), 0); assert.equal(runner.retained()["executionAuthorized"], false);
  }
});

void test("held cache inner deadline prevents delayed match continuation and keeps the stage consumed", async () => {
  const f = fixture({ pendingAt: 2 }); await f.runner.prepare(); const reading = f.runner.observeFirst();
  for (let i = 0; i < 40; i += 1) { await Promise.resolve(); }
  assert.equal(f.page.evaluate("calls.length"), 2); f.page.expire(); await assert.rejects(reading, /CURRENT_UPLOAD_QUEUE_READ_REFUSED:TIMEOUT/u);
  f.page.evaluate("releasePending()"); for (let i = 0; i < 20; i += 1) { await Promise.resolve(); }
  assert.equal(f.page.evaluate("calls.length"), 2); assert.equal(f.page.evaluate("getterCalls"), 1);
  await assert.rejects(f.runner.observeFresh(), /OBSERVATION_CONSUMED/u);
});

void test("held-cache closed commands reject caller code, qualification flags, altered groups and widened cache selectors", async () => {
  const f = fixture(); await f.runner.prepare(); await f.runner.observeFirst(); await f.runner.observeFresh(); await f.runner.release();
  for (const command of f.commands) {
    validateCurrentFootprintSavedCacheHeldCommand(command);
    assert.throws(() => validateCurrentFootprintSavedCacheHeldCommand({ ...command, nativeGetterQualified: true }));
    assert.throws(() => validateCurrentFootprintSavedCacheHeldCommand({ ...command, params: { ...command.params, expression: "caller()" } }));
    assert.throws(() => validateCurrentFootprintSavedCacheHeldCommand({ ...command, params: { ...command.params, objectGroup: "foreign" } }));
    if (command.method === "Runtime.callFunctionOn") {
      assert.throws(() => validateCurrentFootprintSavedCacheHeldCommand({ ...command, params: { ...command.params, functionDeclaration: "function(){return true;}" } }));
    }
    if (command.heldCachePhase === "queue-first" || command.heldCachePhase === "queue-fresh") {
      assert.throws(() => validateCurrentFootprintSavedCacheHeldCommand({ ...command, params: { ...command.params, arguments: [{ value: target.projectUuid }, { value: `${target.branchUuid}\n` }] } }));
    }
  }
});
