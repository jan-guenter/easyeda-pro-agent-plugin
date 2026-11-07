/** Production original-owner methods/queues with real synthetic child streams.
 * The explicit checkpoint seam has no native authority. */
/* oxlint-disable import/max-dependencies -- Join original Core queue, real journal and original lifecycle under an explicit inert checkpoint-only VM seam. */
import { sha256Json } from "../src/core.ts";
import { createCurrentPcb209DiagnosticInstallationPlan } from "../src/current-pcb-diagnostic-installation.ts";
import type { CurrentPcbDiagnosticInstallation } from "../src/current-pcb-diagnostic-installation.ts";
import { readCurrentPcbDiagnosticLifecycles } from "../src/current-pcb-diagnostic-lifecycle-journal.ts";
import type { CurrentPcbComponentSpatialLifecycle, CurrentPcbDiagnosticLifecycleOptions } from "../src/current-pcb-diagnostic-lifecycle.ts";
import { qualifyGeneratedComponentFixtureInitialSql } from "../src/managed-component-fixture-initial-sql.ts";
import { stageManagedComponentFixtureOpeningSource } from "../src/managed-component-fixture-opening-source.ts";
import { managedFixtureInitialSqlFixture } from "./helpers/managed-fixture-initial-sql.ts";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import process from "node:process";
import { test } from "node:test";
import type { TestContext } from "node:test";
import { runInThisContext } from "node:vm";
import { transform } from "esbuild";
import type { CurrentPcbComponentSpatialOwner } from "../src/current-pcb-diagnostic-owner.ts";

async function fixture(context: TestContext, malformed = false, settings?: Readonly<{ prepared: object; installation: CurrentPcbDiagnosticInstallation }>): Promise<Readonly<{ owner: CurrentPcbComponentSpatialOwner; actions: string[]; pollEntered: Promise<true> }>> {
  const url = new URL("../src/current-pcb-diagnostic-owner.ts", import.meta.url); const sourceRequire = createRequire(url);
  const prepared = settings?.prepared ?? Object.freeze({ syntheticCheckpoint: true });
  const source = await readFile(url, "utf8");
  const compiled = await transform(source, { loader: "ts", format: "cjs", target: "node24", logLevel: "silent" });
  const loaded: { exports: Record<string, unknown> } = { exports: {} };
  const evaluate: unknown = runInThisContext(`(function(require,module,exports){${compiled.code}\n})`); assert.ok(typeof evaluate === "function");
  Reflect.apply(evaluate, undefined, [(name: string): unknown => {
    const actual: unknown = sourceRequire(name);
    if (name !== "./managed-component-fixture-generated-open-checkpoint.ts") { return actual; }
    assert.ok(typeof actual === "object" && actual !== null);
    return { ...actual, assertOriginalGeneratedComponentFixtureOpenCheckpoint: (value: unknown): void => { assert.equal(value, prepared); } };
  }, loaded, loaded.exports]);
  const Constructor = loaded.exports["CurrentPcbComponentSpatialOwner"];
  assert.ok(typeof Constructor === "function");
  const script = `const readline=require('node:readline'),input=readline.createInterface({input:process.stdin});let terminated=false;
const send=(q,result)=>process.stdout.write(JSON.stringify({id:q.id,ok:true,result})+'\\n');
input.on('line',line=>{const q=JSON.parse(line);
if(q.action==='launch')send(q,{helperInstance:'b'.repeat(32),jobId:'c'.repeat(32),rootPid:123,rootCreated:'123456789012345'});
else if(q.action==='send')send(q,{written:true});
else if(q.action==='poll')setTimeout(()=>${malformed ? String.raw`process.stdout.write('malformed\n')` : "send(q,{bytes:''})"},50);
else if(q.action==='component-abort'){if(q.confirmAbortOriginalComponentJob!==true)throw Error('confirmation');terminated=true;send(q,{terminationDispatched:true});}
else if(q.action==='termination')send(q,{terminated,originalRootExited:terminated,originalJobEmpty:terminated});
else if(q.action==='release')send(q,{released:true});else throw Error('unexpected '+q.action);});`;
  const child = spawn(process.execPath, ["-e", script], { stdio: ["pipe", "pipe", "pipe"] });
  const actions: string[] = [], pollEntered = Promise.withResolvers<true>(); const originalWrite = child.stdin.write.bind(child.stdin);
  context.mock.method(child.stdin, "write", (...args: Parameters<typeof child.stdin.write>): boolean => {
    const chunk: unknown = args[0]; if (typeof chunk === "string") { const value: unknown = JSON.parse(chunk);
      assert.ok(value !== null && typeof value === "object" && "action" in value); actions.push(String(value.action)); if (value.action === "poll") { pollEntered.resolve(true); } }
    return originalWrite(...args);
  });
  const executable = Object.freeze({ windowsPath: "C:\\Reviewed\\easyeda-pro.exe", sha256: "a".repeat(64) });
  const plan = Object.freeze({ files: Object.freeze([executable]) }); const installation = settings?.installation ?? Object.freeze({ plan });
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Checked production VM constructor, explicit inert checkpoint seam, real retained synthetic child only.
  const owner = Reflect.construct(Constructor, [child, (): Promise<void> => Promise.resolve(), prepared, installation, (): Promise<void> => Promise.resolve()]) as CurrentPcbComponentSpatialOwner;
  owner.start();
  context.after(async () => { if (child.exitCode === null && child.signalCode === null) { const closed = once(child, "close"); child.stdin.end(); await closed; } });
  if (settings === undefined) { await owner.launch({ executable: "C:\\Reviewed\\easyeda-pro.exe", executableSha256: "a".repeat(64), confirmDiagnosticLaunch: true }); }
  return { owner, actions, pollEntered: pollEntered.promise };
}

void test("Component-only original abort waits for pending native poll and settles the original busy renderer call without replay", async context => {
  const f = await fixture(context); const original = f.owner.getTargets(), refused = assert.rejects(original);
  await f.pollEntered; assert.equal(f.owner.status().busy, true);
  const token = f.owner.reserveComponentSpatialAbort();
  assert.throws(() => f.owner.reserveComponentSpatialAbort(), /ABORT_OWNER/u);
  await assert.rejects(f.owner.dispatchComponentSpatialAbort({ ...token }, true), /ABORT_RESERVATION/u);
  const abort = f.owner.dispatchComponentSpatialAbort(token, true);
  await assert.rejects(f.owner.dispatchComponentSpatialAbort(token, true), /ABORT_RESERVATION/u);
  await abort; await refused; assert.equal(f.owner.status().busy, false);
  assert.deepEqual(f.actions, ["launch", "send", "poll", "component-abort"]);
  await assert.rejects(f.owner.getTargets()); assert.equal(f.actions.filter(action => action === "send").length, 1);
  assert.equal(f.owner.status().lastTerminationObservation, null); assert.equal(await f.owner.observeTermination(), true);
  await f.owner.releaseClosed(); assert.equal(f.owner.status().released, true); assert.equal(f.owner.status().helperClosed, true);
});
void test("malformed original helper transport stays fail-closed and cannot acquire an abort retry", async context => {
  const f = await fixture(context, true), refused = assert.rejects(f.owner.getTargets()); await f.pollEntered; await refused;
  assert.throws(() => f.owner.reserveComponentSpatialAbort(), /HELPER_FRAMING/u); assert.equal(f.actions.includes("component-abort"), false);
  assert.equal(f.owner.status().released, false);
});

void test("original Component lifecycle abort publishes its exact interrupted prefix and retains separate termination/release", async context => {
  const root = process.env["EASYEDA_CONTROL_DATA_DIR"]; assert.ok(root !== undefined && root.includes("easyeda-test-control-"));
  const input = await managedFixtureInitialSqlFixture(undefined, "component-circular-smt-pad"), qualified = await qualifyGeneratedComponentFixtureInitialSql(input);
  const source = stageManagedComponentFixtureOpeningSource({ qualification: qualified.qualification, archive: input.archive });
  const options: CurrentPcbDiagnosticLifecycleOptions = { pluginRoot: "/mnt/c/Reviewed/Plugin", assetsRoot: "/mnt/c/Reviewed/EasyEDA/resources/app/assets", powershellSha256: "a".repeat(64), powershellBytes: 1,
    generatedComponentSource: source, assertLocalAllowed: (): void => {
      // Isolated synthetic runtime.
    }, assertAllowed: (): Promise<void> => Promise.resolve(), assertOtherLaunchesSettled: (): Promise<void> => Promise.resolve() };
  const installation: CurrentPcbDiagnosticInstallation = { ...createCurrentPcb209DiagnosticInstallationPlan(options), facadeSha256: "a".repeat(64) };
  const prepared = Object.freeze({ qualification: qualified.qualification, syntheticCheckpoint: true });
  const f = await fixture(context, false, { prepared, installation });
  const url = new URL("../src/current-pcb-diagnostic-lifecycle.ts", import.meta.url); const sourceRequire = createRequire(url);
  const compiled = await transform(await readFile(url, "utf8"), { loader: "ts", format: "cjs", target: "node24", logLevel: "silent" });
  const loaded: { exports: Record<string, unknown> } = { exports: {} };
  const evaluate: unknown = runInThisContext(`(function(require,module,exports){${compiled.code}\n})`); assert.ok(typeof evaluate === "function");
  Reflect.apply(evaluate, undefined, [(name: string): unknown => {
    const actual: unknown = sourceRequire(name);
    if (name !== "./managed-component-fixture-generated-open-checkpoint.ts") { return actual; }
    assert.ok(typeof actual === "object" && actual !== null);
    return { ...actual, prepareGeneratedComponentFixtureOpenCheckpoint: (value: unknown): Promise<object> => {
      assert.ok(value !== null && typeof value === "object" && "qualification" in value); assert.equal(value.qualification, qualified.qualification); return Promise.resolve(prepared);
    } };
  }, loaded, loaded.exports]);
  const Constructor = loaded.exports["CurrentPcbComponentSpatialLifecycle"]; assert.ok(typeof Constructor === "function");
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Actual production VM constructor; only initial closed-data preparation is inert, native transport is the original synthetic child above.
  const lifecycle = Reflect.construct(Constructor, [options, { verifyInstallation: (): Promise<CurrentPcbDiagnosticInstallation> => Promise.resolve(installation), allocateOwner: (): Promise<CurrentPcbComponentSpatialOwner> => Promise.resolve(f.owner) }]) as CurrentPcbComponentSpatialLifecycle;
  const operationId = "pcb209-spatial-component-abort-original";
  await lifecycle.run({ action: "launch", operationId, confirmValidationOnly: true, confirmDiagnosticLaunch: true, acceptExistingProfileEffects: true });
  const operations = await readCurrentPcbDiagnosticLifecycles(); const operation = operations.find(value => value.operationId === operationId); assert.ok(operation?.records["binding.json"] !== undefined);
  const expectedBindingSha256 = sha256Json(operation.records["binding.json"]);
  const normal = lifecycle.run({ action: "browser-observation", operationId, expectedBindingSha256 }), refused = assert.rejects(normal);
  await f.pollEntered;
  const result = await lifecycle.run({ action: "abort-component", operationId, expectedBindingSha256, confirmAbortOriginalComponentJob: true });
  await refused; assert.equal(result["terminationDispatched"], true); assert.equal(result["terminationProved"], false); assert.equal(result["persistenceVerified"], false);
  assert.equal(lifecycle.hasActiveReservation(), true); assert.equal(f.owner.status().released, false);
  await assert.rejects(lifecycle.run({ action: "abort-component", operationId, expectedBindingSha256, confirmAbortOriginalComponentJob: true }), /CONSUMED/u);
  await assert.rejects(lifecycle.run({ action: "normal-close", operationId, expectedBindingSha256, hwnd: "123", confirmNormalClose: true }), /GENERATION_ABORTED/u);
  const after = await readCurrentPcbDiagnosticLifecycles(); const afterAbort = after.find(value => value.operationId === operationId); assert.ok(afterAbort !== undefined);
  assert.equal(afterAbort.records["browser-result.json"], undefined); assert.equal(afterAbort.records["terminated.json"], undefined);
  assert.equal(afterAbort.records["component-abort-intent.json"]?.previousRecordsSha256, sha256Json(operation.records["binding.json"] === undefined ? {} : { ...operation.records, "browser-intent.json": afterAbort.records["browser-intent.json"] }));
  const termination = await lifecycle.run({ action: "observe-termination", operationId, expectedBindingSha256 }); assert.equal(termination["state"], "terminated");
  await lifecycle.run({ action: "release-closed", operationId, expectedBindingSha256 }); assert.equal(lifecycle.hasActiveReservation(), false); assert.equal(f.owner.status().helperClosed, true);
  assert.equal(f.actions.filter(action => action === "component-abort").length, 1);
});
