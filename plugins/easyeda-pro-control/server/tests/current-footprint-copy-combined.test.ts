/** Independent capacity arithmetic and original owner refusal boundaries.
 * These fixtures never allocate an EasyEDA process, native Job or writer. */
/* oxlint-disable import/max-dependencies -- This boundary test combines the separate native owner factory, exact wire and full lifecycle capacity model; none supplies another's authority. */
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import process from "node:process";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { runInThisContext } from "node:vm";
import { transform } from "esbuild";
import { currentFootprintCombinedGenerationSchema, planCurrentFootprintCombinedCapacity, requireCurrentFootprintCombinedWriterCapacity } from "../src/current-footprint-copy-combined-capacity.ts";
import { CURRENT_FOOTPRINT_COMBINED_PROFILE as PROFILE, CURRENT_FOOTPRINT_COMBINED_PURPOSE as PURPOSE } from "../src/current-footprint-copy-combined-profile.ts";
import { CURRENT_FOOTPRINT_COPY_MAIN_BACKEND_REQUESTS as CONSTRUCTION } from "../src/current-footprint-copy-main-backend-budget.ts";
import { currentFootprintCopyMainBackendNativeCases } from "../src/current-footprint-copy-main-backend-native.ts";
import type { CurrentFootprintCopyMainRequestRunner } from "../src/current-footprint-copy-main-request-runner.ts";
import { requestCollectorFixture, syntheticRequestPlan, syntheticRequestSource } from "./helpers/footprint-main-request-collector-fixture.ts";
import { CURRENT_FOOTPRINT_COPY_MAIN_REQUEST_REQUESTS as REQUEST } from "../src/current-footprint-copy-main-request-protocol.ts";
import { currentFootprintCombinedStartupWire, currentFootprintCopyExecutionStartupWire } from "../src/current-pcb-worker-startup-wire.ts";
import type { CurrentFootprintCombinedNativeOwner } from "../src/current-pcb-diagnostic-owner.ts";

const readyPreload = fileURLToPath(new URL("helpers/current-footprint-combined-helper-ready.ts", import.meta.url));

void test("combined capacities include construction cleanup IDs without reserving unfinished writer stages", () => {
  assert.equal(CONSTRUCTION.maximumObserve, CONSTRUCTION.observeNormal + CONSTRUCTION.observeCleanup);
  assert.equal(PROFILE.main.normalRequestLimit, 17 + 1 + REQUEST.normal);
  assert.equal(PROFILE.main.cleanupRequestLimit, 3 + 1 + REQUEST.cleanup);
  assert.equal(PROFILE.main.requestLimit, 20 + 1 + REQUEST.total + 1);
  assert.deepEqual([PROFILE.main.normalRequestLimit, PROFILE.main.cleanupRequestLimit, PROFILE.main.requestLimit], [41, 13, 54]);
  const result = planCurrentFootprintCombinedCapacity();
  assert.deepEqual(result.generationRoles, ["forward-writer", "forward-saved-readback", "inverse-writer", "inverse-saved-readback"]);
  assert.equal(result.wholeLifecycleRequestLimit, null); assert.equal(result.wholeLifecycleBytes, null); assert.equal(result.wholeLifecycleMilliseconds, null);
  assert.equal(result.wholeExecutionBudgetReserved, false); assert.equal(result.executionAuthorized, false);
  assert.equal(PROFILE.helperStdout.cleanupReserveBytes, 1024 * 1024);
  assert.ok(PROFILE.helperStdout.cleanupReserveBytes >= PROFILE.helperStdout.pendingReplyBytes + PROFILE.helperStdout.cleanupControlLimit * PROFILE.helperStdout.cleanupReplyBytes);
  assert.equal(PROFILE.helperStdout.wholeWriterAggregateReserved, false);
  assert.equal(Object.isFrozen(result.knownCombinedObservation.main.requests), true); assert.equal(Object.isFrozen(result.unaccountedStages), true);
  assert.throws(() => requireCurrentFootprintCombinedWriterCapacity(), /WHOLE_CAPACITY_INCOMPLETE.*actual-two-document-clock-rpc-joins.*inverse-closed-and-reopened-absence/u);
  const generation = { profile: "private.current-footprint-combined-generation.v1", purpose: PURPOSE, operationId: "footprint-combined-example", bindingSha256: "a".repeat(64) };
  assert.ok(currentFootprintCombinedGenerationSchema.safeParse(generation).success);
  for (const change of [{ purpose: "worker-startup-footprint-copy209" }, { operationId: "footprint-copy-example" }, { executionAuthorized: true }]) {
    assert.equal(currentFootprintCombinedGenerationSchema.safeParse({ ...generation, ...change }).success, false);
  }
});

void test("combined wire has a separate issuer identity and refuses generic programs at its fixed observation bound", () => {
  assert.notEqual(currentFootprintCombinedStartupWire, currentFootprintCopyExecutionStartupWire);
  const command = { method: "Runtime.releaseObjectGroup", sessionId: "worker-session", params: { objectGroup: "easyeda-pro-control-worker-construction-v1" } };
  const first = currentFootprintCombinedStartupWire(command, 847);
  assert.equal(first.command.id, 847); assert.equal(first.request["requestId"], 847);
  assert.equal(Object.isFrozen(first.command), true);
  assert.throws(() => currentFootprintCombinedStartupWire(command, 848));
  assert.throws(() => currentFootprintCombinedStartupWire({ method: "Runtime.evaluate", params: { expression: "Date.now()" } }, 1));
});

async function syntheticOwnerModule(normalOutputBytes?: number): Promise<Readonly<{ loaded: { exports: Record<string, unknown> }; sourceOnly: object }>> {
  const path = new URL("../src/current-pcb-diagnostic-owner.ts", import.meta.url);
  const compiled = await transform(await readFile(path, "utf8"), { loader: "ts", format: "cjs", target: "node24", logLevel: "silent" });
  const actualRequire = createRequire(path), loaded: { exports: Record<string, unknown> } = { exports: {} };
  const sourceOnly = Object.freeze({ syntheticSourceOnly: true });
  const evaluate: unknown = runInThisContext(`(function(require,module,exports){${compiled.code}\n})`); assert.ok(typeof evaluate === "function");
  Reflect.apply(evaluate, undefined, [(name: string): unknown => {
    if (name === "./current-pcb-209-actor-clock-source.ts") { return {
      requireCurrentPcb209ActorClockSourceQualification: (value: unknown): void => { assert.equal(value, sourceOnly); },
    }; }
    const actual: unknown = actualRequire(name);
    if (name !== "./current-footprint-copy-combined-profile.ts" || normalOutputBytes === undefined) { return actual; }
    assert.ok(actual !== null && typeof actual === "object");
    return { ...actual, CURRENT_FOOTPRINT_COMBINED_PROFILE: { ...PROFILE, helperStdout: { ...PROFILE.helperStdout,
      normalBytes: normalOutputBytes, totalBytes: normalOutputBytes + PROFILE.helperStdout.cleanupReserveBytes } } };
  }, loaded, loaded.exports]);
  return { loaded, sourceOnly };
}

void test("constructor seams cannot mint combined factory authority, request leases or original-Job abort", async context => {
  const { loaded, sourceOnly } = await syntheticOwnerModule();
  const Owner = loaded.exports["CurrentFootprintCombinedNativeOwner"], assertOriginal = loaded.exports["assertOriginalCurrentFootprintCombinedNativeOwner"];
  assert.ok(typeof Owner === "function" && typeof assertOriginal === "function");
  const child = spawn(process.execPath, ["--import", readyPreload, fileURLToPath(new URL("helpers/current-pcb-diagnostic-helper-fixture.ts", import.meta.url)), "normal"], { stdio: ["pipe", "pipe", "pipe"] });
  const actions: string[] = [], originalWrite = child.stdin.write.bind(child.stdin);
  context.mock.method(child.stdin, "write", (...args: Parameters<typeof child.stdin.write>) => {
    if (typeof args[0] === "string") { const line: unknown = JSON.parse(args[0]); assert.ok(line !== null && typeof line === "object" && "action" in line); actions.push(String(line["action"])); }
    return originalWrite(...args);
  });
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- The evaluated maintained constructor receives a real inert child; only the source qualification input is replaced.
  const owner = Reflect.construct(Owner, [child, (): Promise<void> => Promise.resolve(), sourceOnly, null, undefined, undefined, "a".repeat(32)]) as CurrentFootprintCombinedNativeOwner;
  owner.start();
  context.after(async () => { if (!owner.status().helperClosed) { const closed = once(child, "close"); child.stdin.end(); await closed; } });
  await owner.waitFootprintCombinedReady();
  await owner.launch({ executable: "C:\\Reviewed\\easyeda-pro.exe", executableSha256: "a".repeat(64), confirmDiagnosticLaunch: true });
  assert.equal(owner.status().profile, PURPOSE);
  assert.throws(() => Reflect.apply(assertOriginal, undefined, [owner]), /COMBINED_ORIGINAL_OWNER/u);
  assert.throws(() => owner.combinedMainCapability(), /COMBINED_MAIN_CAPTURE_REQUIRED/u);
  assert.throws(() => owner.reserveFootprintCombinedAbort(), /COMBINED_ORIGINAL_ABORT_OWNER/u);
  await assert.rejects(owner.dispatchFootprintCombinedAbort({ profile: "private.current-footprint-combined-abort-reservation.v1", executionAuthorized: false }, true), /COMBINED_ORIGINAL_ABORT_RESERVATION/u);
  await assert.rejects(owner.abortFootprintCombined(true), /COMBINED_ORIGINAL_ABORT_OWNER/u);
  await assert.rejects(owner.terminateFootprintMain(true), /MAIN_ORIGINAL_CLEANUP_OWNER/u);
  assert.equal(owner.status().combinedAbortAttempted, false);
  assert.equal(actions.includes("combined-abort"), false); assert.equal(actions.includes("main-terminate"), false);
  const hwnd = await owner.observeApplicationWindow(); assert.ok(hwnd !== null); await owner.requestNormalClose(hwnd);
  assert.equal(await owner.observeTermination(), true); await owner.releaseClosed();
});

void test("one combined native queue lets the original main reproof complete while the renderer waits", { timeout: 5000 }, async context => {
  const { loaded, sourceOnly } = await syntheticOwnerModule(), Owner = loaded.exports["CurrentFootprintCombinedNativeOwner"];
  assert.ok(typeof Owner === "function");
  const child = spawn(process.execPath, ["--import", readyPreload, "-e", `
const readline=require('node:readline');const lines=readline.createInterface({input:process.stdin});let pending=null,ready=false;
lines.on('line',line=>{const q=JSON.parse(line);let result;
if(q.action==='launch')result={helperInstance:'b'.repeat(32),jobId:'c'.repeat(32),rootPid:123,rootCreated:'123456789012345'};
else if(q.action==='main-attach')result={attached:true};
else if(q.action==='main-reprove'){ready=true;result={current:true};}
else if(q.action==='send'){pending=q.requestId;result={written:true};}
else if(q.action==='poll'){const bytes=ready&&pending!==null?Buffer.from(JSON.stringify({id:pending,result:{product:'synthetic',protocolVersion:'1.3'}})+'\\0').toString('base64'):'';if(bytes)pending=null;result={bytes};}
else if(q.action==='termination')result={terminated:true,originalRootExited:true,originalJobEmpty:true};
else if(q.action==='release')result={released:true};else throw Error('unexpected synthetic action');
process.stdout.write(JSON.stringify({id:q.id,ok:true,result})+'\\n');});
`], { stdio: ["pipe", "pipe", "pipe"] });
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- The maintained constructor has real child pipes and an inert source token; this test cannot acquire private factory authority.
  const owner = Reflect.construct(Owner, [child, (): Promise<void> => Promise.resolve(), sourceOnly, null, undefined, undefined, "a".repeat(32)]) as CurrentFootprintCombinedNativeOwner;
  owner.start();
  context.after(async () => { if (!owner.status().helperClosed) { const closed = once(child, "close"); child.stdin.end(); await closed; } });
  const actions: string[] = [], firstPoll = Promise.withResolvers<null>(), originalWrite = child.stdin.write.bind(child.stdin);
  context.mock.method(child.stdin, "write", (...args: Parameters<typeof child.stdin.write>) => {
    if (typeof args[0] === "string") { const line: unknown = JSON.parse(args[0]); assert.ok(line !== null && typeof line === "object" && "action" in line);
      actions.push(String(line["action"])); if (line["action"] === "poll") { firstPoll.resolve(null); } }
    return originalWrite(...args);
  });
  await owner.waitFootprintCombinedReady();
  await owner.launch({ executable: "C:\\Reviewed\\easyeda-pro.exe", executableSha256: "a".repeat(64), confirmDiagnosticLaunch: true });
  await owner.attachFootprintMain();
  const renderer = owner.getVersion(); await firstPoll.promise;
  assert.equal(owner.status().busy, true);
  await owner.reproveFootprintMain();
  assert.deepEqual(await renderer, { product: "synthetic", protocolVersion: "1.3" });
  assert.ok(actions.indexOf("main-reprove") > actions.indexOf("send"));
  assert.equal(owner.status().busy, false); assert.equal(owner.status().mainNativeFailure, null);
  assert.equal(await owner.observeTermination(), true); await owner.releaseClosed();
});

void test("combined normal stdout exhaustion preserves original termination and helper release", async context => {
  // Only the normal byte threshold is shortened. Real callback, line parser,
  // Logical cleanup transition and independent reserve remain unchanged.
  const { loaded, sourceOnly } = await syntheticOwnerModule(640), Owner = loaded.exports["CurrentFootprintCombinedNativeOwner"];
  assert.ok(typeof Owner === "function");
  const child = spawn(process.execPath, ["--import", readyPreload, "-e", `
const readline=require('node:readline');const lines=readline.createInterface({input:process.stdin});let pending=null;
lines.on('line',line=>{const q=JSON.parse(line);let result;
if(q.action==='launch')result={helperInstance:'b'.repeat(32),jobId:'c'.repeat(32),rootPid:123,rootCreated:'123456789012345'};
else if(q.action==='send'){pending=q.requestId;result={written:true};}
else if(q.action==='poll'){result={bytes:Buffer.from(JSON.stringify({id:pending,result:{product:'synthetic',protocolVersion:'1.3'}})+'\\0').toString('base64')};pending=null;}
else if(q.action==='termination')result={terminated:true,originalRootExited:true,originalJobEmpty:true};
else if(q.action==='release')result={released:true};else throw Error('unexpected synthetic action');
process.stdout.write(JSON.stringify({id:q.id,ok:true,result})+'\\n');});
`], { stdio: ["pipe", "pipe", "pipe"] });
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- The maintained owner receives real inert child pipes and only the source/normal-limit fixtures are replaced.
  const owner = Reflect.construct(Owner, [child, (): Promise<void> => Promise.resolve(), sourceOnly, null, undefined, undefined, "a".repeat(32)]) as CurrentFootprintCombinedNativeOwner;
  owner.start();
  context.after(async () => { if (!owner.status().helperClosed) { const closed = once(child, "close"); child.stdin.end(); await closed; } });
  await owner.waitFootprintCombinedReady();
  await owner.launch({ executable: "C:\\Reviewed\\easyeda-pro.exe", executableSha256: "a".repeat(64), confirmDiagnosticLaunch: true });
  await assert.rejects(owner.getVersion(), /COMBINED_HELPER_NORMAL_BOUND/u);
  assert.equal(owner.status().combinedOutputCleanupOnly, true); assert.equal(owner.status().failure, null);
  assert.equal(child.stdin.writableEnded, false);
  await assert.rejects(owner.observeApplicationWindow(), /COMBINED_CLEANUP_ONLY/u);
  assert.equal(await owner.observeTermination(), true); await owner.releaseClosed();
  assert.equal(child.exitCode, 0); assert.equal(child.signalCode, null);
});

void test("composed original allocator accepts last normal ID 50 with 41 normal charges and closes at 54", async context => {
  const f = requestCollectorFixture(), path = new URL("../src/current-footprint-copy-main-request-runner.ts", import.meta.url);
  const code = await transform(await readFile(path, "utf8"), { loader: "ts", format: "cjs", target: "node24", logLevel: "silent" });
  const collectorModule: { exports: Record<string, unknown> } = { exports: {} }, originalRequire = createRequire(path);
  const evaluate: unknown = runInThisContext(`(function(require,module,exports){${code.code}\n})`); assert.ok(typeof evaluate === "function");
  Reflect.apply(evaluate, undefined, [(name: string): unknown => {
    if (name === "./current-footprint-copy-main-request-origin.ts") { return { requireCurrentFootprintCopyMainRequestOrigin: f.require }; }
    if (name === "./current-footprint-copy-main-request-source.ts") { return { requireCurrentFootprintCopyMainRequestSource: (token: unknown): void => { assert.equal(token, syntheticRequestSource); } }; }
    return originalRequire(name) as unknown;
  }, collectorModule, collectorModule.exports]);
  const Collector = collectorModule.exports["CurrentFootprintCopyMainRequestRunner"]; assert.ok(typeof Collector === "function");
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- The real collector runs under the explicitly synthetic source/origin fixture, never a genuine native lease.
  const collector = Reflect.construct(Collector, [f.token, syntheticRequestPlan]) as CurrentFootprintCopyMainRequestRunner;
  await collector.arm(); collector.consumeBeforeInvocation(); f.state.invoked = true; await collector.collect(); await collector.cleanup();
  const cases = currentFootprintCopyMainBackendNativeCases();
  const command = (phase: string): typeof cases[number] => { const result = cases.find(value => value.phase === phase); assert.ok(result !== undefined); return result; };
  // Use the maximum 20-command initial-pause construction path, then the one
  // Original retained-array reproof before the collector's actual command log.
  const construction = ["runtime-enable", "debugger-enable", "registration-arm", "run-waiting", "source", "resume", "frame", "capture",
    ...Array.from({ length: 9 }, () => "properties"), "require", "remove", "resume"].map(phase => command(phase));
  assert.equal(construction.length, CONSTRUCTION.maximumObserve);
  const schedule = [...construction, command("require"), ...f.commands, command("release")];
  assert.equal(schedule.length, PROFILE.main.requestLimit);
  const { loaded, sourceOnly } = await syntheticOwnerModule(), Owner = loaded.exports["CurrentFootprintCombinedNativeOwner"]; assert.ok(typeof Owner === "function");
  const child = spawn(process.execPath, ["--import", readyPreload, "-e", `
const readline=require('node:readline');const lines=readline.createInterface({input:process.stdin});
lines.on('line',line=>{const q=JSON.parse(line);let result;
if(q.action==='launch')result={helperInstance:'b'.repeat(32),jobId:'c'.repeat(32),rootPid:123,rootCreated:'123456789012345'};
else if(q.action==='main-attach')result={attached:true};
else if(q.action==='main-send'||q.action==='main-request-send')result={written:true};
else if(q.action==='termination')result={terminated:true,originalRootExited:true,originalJobEmpty:true};
else if(q.action==='release')result={released:true};else throw Error('unexpected synthetic action');
process.stdout.write(JSON.stringify({id:q.id,ok:true,result})+'\\n');});
`], { stdio: ["pipe", "pipe", "pipe"] });
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- The maintained owner has real inert child pipes; constructor seams cannot issue production authority.
  const owner = Reflect.construct(Owner, [child, (): Promise<void> => Promise.resolve(), sourceOnly, null, undefined, undefined, "a".repeat(32)]) as CurrentFootprintCombinedNativeOwner;
  owner.start();
  context.after(async () => { if (!owner.status().helperClosed) { const closed = once(child, "close"); child.stdin.end(); await closed; } });
  await owner.waitFootprintCombinedReady();
  await owner.launch({ executable: "C:\\Reviewed\\easyeda-pro.exe", executableSha256: "a".repeat(64), confirmDiagnosticLaunch: true }); await owner.attachFootprintMain();
  // Exercise the real owner preflight before any CDP request. Insufficient
  // Completion capacity must preserve its entire existing observation role.
  assert.throws(() => { owner.assertFootprintMainCompletionCapacity(1); }, /FOOTPRINT_MAIN_COMPLETION_CAPACITY_HEADROOM/u);
  await assert.rejects(owner.beginFootprintMainCompletion(1), /FOOTPRINT_MAIN_COMPLETION_CAPACITY_HEADROOM/u);
  let cleanup = 0, lastNormalId = 0, normal = 0;
  for (const [index, request] of schedule.entries()) {
    const id = index + 1;
    if (["Debugger.removeBreakpoint", "Debugger.resume", "Runtime.releaseObjectGroup"].includes(request.method)) { cleanup += 1; }
    else { normal += 1; lastNormalId = id; }
    await owner.sendFootprintMain(request, id);
  }
  assert.deepEqual({ normal, cleanup, lastNormalId, total: schedule.length }, { normal: 41, cleanup: 13, lastNormalId: 50, total: 54 });
  await assert.rejects(owner.sendFootprintMain(command("require"), 55), /MAIN_REQUEST_BUDGET/u);
  await assert.rejects(owner.sendFootprintMain(command("release"), 55), /MAIN_REQUEST_BUDGET/u);
  assert.equal(await owner.observeTermination(), true); await owner.releaseClosed();
});
