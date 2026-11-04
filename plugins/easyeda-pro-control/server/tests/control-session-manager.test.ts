/* oxlint-disable import/max-dependencies -- The actual manager regression owns frozen fixture builds, a private machine profile, child-process proof and exact MCP envelopes. */
import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { createHash } from "node:crypto";
import { chmod, copyFile, lstat, mkdir, readFile, readdir, rename, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { Writable } from "node:stream";
import { setTimeout as wait } from "node:timers/promises";
import { test } from "node:test";
import { pathToFileURL } from "node:url";

import { build } from "esbuild";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { z } from "zod";

import { ForegroundSessionManager, SessionManagerRetirementReservation, createManagerOutputPublisher, managerInputLines, parseSessionManagerRequest, runManagerInput, sessionManagerCallBudgetAvailable, sessionManagerRetirementBudgetAvailable, sessionManagerStartBudgetAvailable } from "../../scripts/control-session-manager.ts";
import { MAXIMUM_REQUEST_BYTES } from "../../scripts/control-session.ts";
import { ForegroundSessionTransport } from "../../scripts/control-session-transport.ts";
import { assertTestIsolation } from "../../scripts/test-isolation.ts";
import { createTestTemporaryDirectory } from "./helpers/temporary-directory.ts";

const pluginRoot = resolve(import.meta.dirname, "../..");
const hash = (value: Uint8Array): string => createHash("sha256").update(value).digest("hex");
/** Require object-shaped emitted JSON so assertions cannot accept null or an
 * array in place of a structured manager or facade result. */
const record = (value: unknown): Record<string, unknown> => {
  assert.ok(value !== null && typeof value === "object" && !Array.isArray(value));
  return z.record(z.string(), z.unknown()).parse(value);
};
let actualBundle: Promise<Uint8Array> | undefined;
let nodeHash: Promise<string> | undefined;

/** Freeze the real facade index behind a synthetic private-profile launcher.
 * This tests manager ownership without admitting external software or live data. */
function bundleActualFacade(): Promise<Uint8Array> {
  actualBundle ??= (async (): Promise<Uint8Array> => {
    // This synthetic frozen launcher skips external-installation readiness and
    // Selects the REAL index with this test's private profile. It enables no
    // Application/upstream startup and never consults a live control directory.
    const source = `import {readFile} from 'node:fs/promises';
import {machineProfileEnvironment} from ${JSON.stringify(join(pluginRoot, "server/src/machine-profile.ts"))};
Object.assign(process.env,machineProfileEnvironment(JSON.parse(await readFile(process.env.EASYEDA_MACHINE_PROFILE,'utf8'))));
await import(${JSON.stringify(join(pluginRoot, "server/src/index.ts"))});`;
    const result = await build({ stdin: { contents: source, resolveDir: pluginRoot, loader: "ts" },
      bundle: true, platform: "node", format: "esm", target: "node24", write: false, logLevel: "silent",
      banner: { js: "import {createRequire as fixtureCreateRequire} from 'node:module';const require=fixtureCreateRequire(import.meta.url);" } });
    const output = result.outputFiles[0]; assert.ok(output);
    return output.contents;
  })();
  return actualBundle;
}

interface Fixture {
  readonly root: string;
  readonly control: string;
  readonly profilePath: string;
}

/** Build a canonical package and owner-only profile inside test isolation,
 * retaining its actual bundle hashes and leaving external installations absent. */
async function fixture(contents?: string): Promise<Fixture> {
  await assertTestIsolation();
  const root = await createTestTemporaryDirectory("easyeda-manager-fixture-");
  const control = join(root, "control"), packageRoot = join(root, "plugin");
  await mkdir(control, { mode: 0o700 });
  await mkdir(join(packageRoot, "server/dist"), { recursive: true });
  await mkdir(join(packageRoot, "server/bin"), { recursive: true });
  await copyFile(join(pluginRoot, ".mcp.json"), join(packageRoot, ".mcp.json"));
  const bytes = contents === undefined ? await bundleActualFacade() : Buffer.from(contents);
  await writeFile(join(packageRoot, "server/dist/server.mjs"), bytes);
  const files = [{ relativePath: "server.mjs", bytes: bytes.length, sha256: hash(bytes) }];
  for (const name of ["upstream-supervisor.mjs", "easyeda-fd-sanitizer"]) {
    const directory = name === "easyeda-fd-sanitizer" ? "bin" : "dist";
    const input = await readFile(join(pluginRoot, "server", directory, name));
    await writeFile(join(packageRoot, "server", directory, name), input);
    files.push({ relativePath: name, bytes: input.length, sha256: hash(input) });
  }
  const manifestText = await readFile(join(pluginRoot, "reviewed-compatibility.json"), "utf8");
  const manifest = record(JSON.parse(manifestText));
  const implementation = record(manifest["facadeImplementation"]);
  manifest["facadeImplementation"] = { ...implementation, bundle: { ...record(implementation["bundle"]), files } };
  await writeFile(join(packageRoot, "reviewed-compatibility.json"), JSON.stringify(manifest));
  nodeHash ??= (async (): Promise<string> => hash(await readFile(process.execPath)))();
  const profilePath = join(control, "machine-profile.json");
  await writeFile(profilePath, JSON.stringify({ schema: "easyeda-pro-control.machine-profile.v1", platform: "linux-x64",
    runtime: { nodeExecutable: process.execPath, nodeVersion: "24.18.0", nodeSha256: await nodeHash },
    upstream: { root: join(root, "absent-upstream"), entrypoint: join(root, "absent-upstream/dist/index.js"), serverVersion: "1.0.0" },
    easyeda: { assetsRoot: join(root, "absent-assets"), pcbBundleVersion: "3.2.absent", publicApiBundleVersion: "0.2.absent" },
    controlDirectory: control }), { mode: 0o600 });
  return { root: packageRoot, control, profilePath };
}

/** Select only this fixture's profile for the awaited operation and restore the
 * prior environment even when initialization, dispatch or publication fails. */
async function selectedProfile<T>(profilePath: string, operation: () => Promise<T>): Promise<T> {
  const previous = process.env["EASYEDA_MACHINE_PROFILE"];
  process.env["EASYEDA_MACHINE_PROFILE"] = profilePath;
  try { return await operation(); }
  finally {
    if (previous === undefined) { delete process.env["EASYEDA_MACHINE_PROFILE"]; }
    else { process.env["EASYEDA_MACHINE_PROFILE"] = previous; }
  }
}

const request = (value: unknown): string => JSON.stringify(value);
const retire = (id: string, generation: number): string => request({ id, action: "retire", generation, confirmRetire: true });
const loaded = (id: string): string => request({ id, tool: "easyeda_control_api", arguments: { request: { action: "loaded-facade" } } });

const sdkModule = (path: string): string => JSON.stringify(pathToFileURL(join(pluginRoot, "node_modules/@modelcontextprotocol/sdk/dist/esm", path)).href);
/** Emit one controlled RPC rejection or contradictory retirement reply from a
 * synthetic peer that closes itself without the manager signalling its child. */
function syntheticPeer(kind: "rpc-rejection" | "bad-retirement"): string {
  return `import {Server} from ${sdkModule("server/index.js")};
import {StdioServerTransport} from ${sdkModule("server/stdio.js")};
import {CallToolRequestSchema,ListToolsRequestSchema,McpError} from ${sdkModule("types.js")};
const server=new Server({name:'synthetic-ambiguous-peer',version:'1.0.0'},{capabilities:{tools:{}}});
server.setRequestHandler(ListToolsRequestSchema,async()=>({tools:['easyeda_control_api','easyeda_control_session'].map(name=>({name,inputSchema:{type:'object'}}))}));
server.setRequestHandler(CallToolRequestSchema,async({params})=>{
 let value;
 if(params.name==='easyeda_control_api'&&params.arguments?.request?.action==='loaded-facade'){
 value={offline:true,result:{schema:'easyeda-pro-control.loaded-facade.v1',pid:process.pid,moduleUrl:import.meta.url,nodeVersion:process.version,admissionGranted:false}};
 }else{
 setTimeout(()=>server.close(),200);
 if(${JSON.stringify(kind)}==='rpc-rejection'){throw new McpError(-32603,'private-peer-error');}
 value={result:{schema:'easyeda-pro-control.session-retirement.v1',state:'retired',activeCalls:0,liveAdmissionOpen:false,leaseReleaseAcknowledged:false,replacementConnectionRequired:true}};
 }
 return {content:[{type:'text',text:JSON.stringify(value)}],structuredContent:value};
});
await server.connect(new StdioServerTransport());`;
}

/** Hold an actual SDK request through its timeout. Only the fixed same-owner
 * cleanup protocol can settle this synthetic native reservation and its records. */
function interruptedForwardPeer(): string {
  return `import {Server} from ${sdkModule("server/index.js")};
import {StdioServerTransport} from ${sdkModule("server/stdio.js")};
import {CallToolRequestSchema,ListToolsRequestSchema} from ${sdkModule("types.js")};
const server=new Server({name:'synthetic-interrupted-forward',version:'1.0.0'},{capabilities:{tools:{}}});
const op='footprint-copy-qualify-timeout',binding='a'.repeat(64),intent='b'.repeat(64),gate=Promise.withResolvers(),calls=[];
let active=0,aborted=false,released=false,settled=false,captures=0;
const result=value=>({content:[{type:'text',text:JSON.stringify(value)}],structuredContent:value});
const refused=()=>({isError:true,content:[{type:'text',text:'synthetic-original-owner-refusal'}]});
server.setRequestHandler(ListToolsRequestSchema,async()=>({tools:['easyeda_control_api','easyeda_control_session','easyeda_control_pcb209_worker_startup'].map(name=>({name,inputSchema:{type:'object'}}))}));
server.setRequestHandler(CallToolRequestSchema,async({params})=>{
 const outer=params.arguments?.request;
 if(params.name==='easyeda_control_api'&&outer?.action==='loaded-facade')return result({offline:true,result:{schema:'easyeda-pro-control.loaded-facade.v1',pid:process.pid,moduleUrl:import.meta.url,nodeVersion:process.version,admissionGranted:false}});
 if(params.name==='easyeda_control_session'){
  calls.push({tool:params.name,action:outer?.action});
  if(outer?.action==='retire'&&(active!==0||!released||!settled))return refused();
  const retired=outer?.action==='retire';
  return result({result:{schema:'easyeda-pro-control.session-retirement.v1',state:retired?'retired':'active',activeCalls:active,liveAdmissionOpen:!retired,leaseReleaseAcknowledged:retired,replacementConnectionRequired:retired}});
 }
 const request=outer?.request;
 calls.push({tool:params.name,action:request?.action,operationId:request?.operationId,binding:request?.expectedBindingSha256});
 if(params.name!=='easyeda_control_pcb209_worker_startup'||outer?.action!=='footprint-forward-prewrite'||request?.operationId!==op)return refused();
 if(request.action==='inspect')return result({result:{operationId:op,bindingSha256:binding,intentSha256:intent,active,captures,aborted,released,settled,calls}});
 if(request.action==='settle-records'){if(active!==0||request.expectedIntentSha256!==intent)return refused();settled=true;return result({result:{operationId:op,settled:true}});}
 if(request.expectedBindingSha256!==binding)return refused();
 if(request.action==='capture-project'){captures++;active++;await gate.promise;active--;return result({result:{operationId:op,lateCapture:true}});}
 if(request.action==='abort-generation'){if(aborted||request.confirmAbortOriginalForwardJob!==true)return refused();aborted=true;gate.resolve();return result({result:{operationId:op,terminationDispatched:true}});}
 if(request.action==='observe-termination')return result({result:{operationId:op,terminated:aborted&&active===0}});
 if(request.action==='release-closed'){if(!aborted||active!==0||released)return refused();released=true;return result({result:{operationId:op,state:'released'}});}
 return refused();
});
// A failed regression still lets this inert peer finish naturally. Passing
// Requires manager-requested EOF before this separate fixture deadline.
setTimeout(()=>{gate.resolve();void server.close();},15000).unref();
await server.connect(new StdioServerTransport());`;
}

/** Poll retained child exit/close evidence and fail if no observation becomes
 * available before the monotonic deadline. */
async function waitForObservedClosure(observed: () => boolean): Promise<void> {
  const deadline = performance.now() + 5000;
  while (!observed()) {
    const remaining = deadline - performance.now();
    assert.ok(remaining > 0, "Original child closure was not observed before the test deadline.");
    await wait(Math.min(10, remaining));
  }
}

/** Deliver explicit byte boundaries without decoding or coercing test input. */
async function* inputChunks(values: readonly Buffer[]): AsyncGenerator<Buffer> { await Promise.resolve(); yield* values; }

void test("manager framing drains one oversized frame, preserves split UTF-8 and rejects closed tails", async () => {
  const exact = Buffer.alloc(MAXIMUM_REQUEST_BYTES, 0x20);
  const chunks = [
    exact, Buffer.from("\n"), exact, Buffer.from("x"), Buffer.alloc(MAXIMUM_REQUEST_BYTES * 3, 0x78), Buffer.from("\n"),
    Buffer.from([0xF0, 0x9F]), Buffer.from([0x8E, 0xB9, 10]), Buffer.from([0xE2]), Buffer.from([0x28, 0xA1, 10]),
    Buffer.from("next\npartial"),
  ];
  const values = await Array.fromAsync(managerInputLines(inputChunks(chunks)));
  assert.deepEqual(values, [exact.toString(), { reason: "request-too-large" }, "🎹", { reason: "invalid-utf8" }, "next", { reason: "incomplete-request-line" }]);
  const oversizedEof = Buffer.alloc(MAXIMUM_REQUEST_BYTES + 1);
  const rejectedEof = await Array.fromAsync(managerInputLines(inputChunks([oversizedEof])));
  assert.deepEqual(rejectedEof, [{ reason: "request-too-large" }]);
  const bom = Buffer.from("\uFEFF{}\n");
  const preservedBom = await Array.fromAsync(managerInputLines(inputChunks([bom])));
  assert.deepEqual(preservedBom, ["\uFEFF{}"]);
});

void test("actual manager input loop rejects oversized and invalid UTF-8 frames then retires its same original child", { timeout: 30_000 }, async () => {
  const outputs: unknown[] = [], selected = await fixture();
  await selectedProfile(selected.profilePath, async () => {
    const manager = new ForegroundSessionManager(async value => { outputs.push(value); await Promise.resolve(); });
    await manager.initialize(selected.root);
    const original = manager.inspect()["facadePid"], sentinel = "private-discarded-input";
    assert.ok(typeof original === "number");
    try {
      const oversized = Buffer.from(sentinel.repeat(Math.ceil((MAXIMUM_REQUEST_BYTES + 1) / sentinel.length)));
      const followups = `${request({ id: "same-owner-after-input-rejection", action: "inspect" })}\n${loaded("same-offline-child")}\n${retire("retire-after-input-rejection", 1)}\n${request({ id: "close-after-input-rejection", action: "shutdown" })}\n`;
      const chunks = [
        oversized.subarray(0, MAXIMUM_REQUEST_BYTES), oversized.subarray(MAXIMUM_REQUEST_BYTES), Buffer.from("\n"),
        Buffer.from([0xC3]), Buffer.from([0x28, 10]), Buffer.from("{malformed}\n"), Buffer.from(followups),
      ];
      const result = await runManagerInput(manager, inputChunks(chunks));
      assert.equal(result, "closed"); assert.equal(manager.inspect()["stage"], "closed");
      const rows = outputs.map(value => record(value));
      const rejected = rows.filter(row => row["error"] === "manager-request-rejected");
      assert.deepEqual(rejected.map(row => record(row["diagnostic"])["reason"]), ["request-too-large", "invalid-utf8", "json-rejected"]);
      assert.ok(rejected.every(row => row["dispatched"] === false && row["originalOwnerRetained"] === true));
      const inspected = record(rows.find(row => row["id"] === "same-owner-after-input-rejection")?.["manager"]);
      assert.equal(inspected["facadePid"], original); assert.equal(inspected["generation"], 1); assert.equal(inspected["stage"], "active");
      const offline = record(record(rows.find(row => row["id"] === "same-offline-child")?.["result"])["structuredContent"]);
      assert.equal(record(offline["result"])["pid"], original);
      const retired = rows.find(row => row["id"] === "retire-after-input-rejection"); assert.equal(retired?.["retired"], true);
      assert.deepEqual(record(retired?.["closure"]), { pid: original, exitObserved: true, closeObserved: true, exitCode: 0, signal: null, stdinEof: true });
      assert.equal(JSON.stringify(outputs).includes(sentinel), false); assert.equal(JSON.stringify(outputs).includes("{malformed}"), false);
      await assert.rejects(lstat(`/proc/${String(original)}`), { code: "ENOENT" });
    } finally {
      // This test retains the same manager object through any assertion failure.
      // Cleanup uses its original retirement path, never a signal or takeover.
      if (manager.inspect()["stage"] === "active") { await manager.handle(retire("inert-input-test-cleanup", 1)); }
      if (manager.inspect()["stage"] === "between-facades") { await manager.handle(request({ id: "inert-input-test-close", action: "shutdown" })); }
    }
  });
});

void test("manager grammar refuses executable hooks, generic retirement and reconstructed replacement authority", () => {
  assert.equal(parseSessionManagerRequest(retire("r", 1)).id, "r");
  for (const value of [
    { id: 1, action: "start", afterGeneration: 1, pluginRoot: "/root/plugin", command: "sh" },
    { id: 1, action: "retire", generation: 1, confirmRetire: true, force: true },
    { id: 1, tool: "easyeda_control_session", arguments: { request: { action: "retire", confirmRetire: true } } },
    { id: 1, action: "start", afterGeneration: 1, pluginRoot: "/root/plugin/../other" },
    { id: 1, shutdown: true },
  ]) { assert.throws(() => parseSessionManagerRequest(request(value))); }
});

void test("actual manager preserves ambiguous capture and permits only same-owner cleanup before real retirement and closure", { timeout: 12_000 }, async () => {
  const outputs: unknown[] = [], selected = await fixture(interruptedForwardPeer());
  const expectedBindingSha256 = "a".repeat(64), operationId = "footprint-copy-qualify-timeout";
  await selectedProfile(selected.profilePath, async () => {
    const manager = new ForegroundSessionManager(async value => { outputs.push(value); await Promise.resolve(); });
    await manager.initialize(selected.root);
    const originalPid = manager.inspect()["facadePid"];
    const output = (): Record<string, unknown> => record(outputs.at(-1));
    const toolResult = (): Record<string, unknown> => record(output()["result"]);
    const observed = (): Record<string, unknown> => record(record(toolResult()["structuredContent"])["result"]);
    const cleanup = (id: string, action: string, extra: object = {}): string => request({ id, action: "cleanup-original", generation: 1,
      interruptedRequestId: "interrupted-capture", request: { action, ...extra } });
    const originalBudgets = manager.inspect()["budgets"];
    await manager.handle(cleanup("unauthorized-active-cleanup", "inspect"));
    assert.equal(output()["error"], "manager-request-rejected"); assert.equal(manager.inspect()["stage"], "active");
    assert.deepEqual(manager.inspect()["budgets"], originalBudgets);
    const rawWindowsPath = String.raw`C:\Disposable\fixture.eprj2`;
    const capture = { id: "interrupted-capture", tool: "easyeda_control_pcb209_worker_startup", timeoutMs: 1000,
      arguments: { request: { action: "footprint-forward-prewrite", request: { action: "capture-project", operationId, expectedBindingSha256,
        target: { rawWindowsPath, projectUuid: hash(Buffer.from(rawWindowsPath)), documentUuid: "c".repeat(32), expectedSourceSha256: "d".repeat(64) },
        confirmDisposableProject: true, acceptNormalOpenEffects: true, acceptDebuggerPauseEffects: true } } } };
    await manager.handle(request(capture));
    assert.equal(output()["error"], "manager-blocked");
    assert.equal(record(output()["diagnostic"])["reason"], "request-timeout");
    assert.equal(manager.inspect()["stage"], "blocked"); assert.equal(manager.inspect()["closure"], null);
    assert.equal(record(manager.inspect()["interruptedRequest"])["outcome"], "unknown");
    assert.equal(record(manager.inspect()["interruptedRequest"])["cleanupAvailable"], true);
    await manager.handle(retire("before-cleanup-refused", 1));
    assert.equal(output()["retirementRefused"], true); assert.equal(manager.inspect()["stage"], "blocked");
    for (const rejected of [
      loaded("blocked-normal"), request({ ...capture, id: "blocked-replay", cleanup: true }),
      request({ id: "blocked-replacement", action: "start", afterGeneration: 1, pluginRoot: selected.root }),
      request({ id: "foreign-request", action: "cleanup-original", generation: 1, interruptedRequestId: "foreign", request: { action: "inspect" } }),
      request({ id: "foreign-generation", action: "cleanup-original", generation: 2, interruptedRequestId: "interrupted-capture", request: { action: "inspect" } }),
      cleanup("foreign-operation", "inspect", { operationId: "footprint-copy-qualify-foreign" }),
      cleanup("foreign-binding", "observe-termination", { expectedBindingSha256: "f".repeat(64) }),
      cleanup("blocked-cleanup-replay", "capture-project"),
    ]) {
      await manager.handle(rejected); assert.equal(manager.inspect()["stage"], "blocked"); assert.equal(manager.inspect()["facadePid"], originalPid);
      assert.equal(output()["retryAllowed"], false);
    }
    await manager.handle(cleanup("no-fabricated-intent", "settle-records"));
    assert.equal(output()["error"], "manager-request-rejected");
    await manager.handle(cleanup("same-original-inspection", "inspect"));
    let inspected = observed();
    assert.equal(inspected["captures"], 1); assert.equal(inspected["active"], 1);
    assert.deepEqual(inspected["calls"], [
      { tool: "easyeda_control_pcb209_worker_startup", action: "capture-project", operationId, binding: expectedBindingSha256 },
      { tool: "easyeda_control_session", action: "retire" }, { tool: "easyeda_control_session", action: "inspect" },
      { tool: "easyeda_control_pcb209_worker_startup", action: "inspect", operationId },
    ]);
    await manager.handle(cleanup("refused-live-release", "release-closed"));
    assert.equal(toolResult()["isError"], true); assert.equal(manager.inspect()["stage"], "blocked");
    await manager.handle(cleanup("abort-original", "abort-generation", { confirmAbortOriginalForwardJob: true }));
    await manager.handle(cleanup("observe-original-exit", "observe-termination"));
    await manager.handle(cleanup("settle-original-records", "settle-records"));
    await manager.handle(cleanup("release-original-helper", "release-closed"));
    await manager.handle(cleanup("still-original", "inspect"));
    inspected = observed();
    assert.equal(inspected["active"], 0); assert.equal(inspected["released"], true); assert.equal(inspected["settled"], true);
    assert.equal(inspected["captures"], 1); assert.equal(manager.inspect()["facadePid"], originalPid);
    assert.equal(record(manager.inspect()["interruptedRequest"])["outcome"], "unknown");
    await manager.handle(retire("retire-after-original-cleanup", 1));
    const retired = output(); assert.equal(retired["retired"], true); assert.equal(retired["replacementAllowed"], true);
    assert.deepEqual(record(retired["closure"]), { pid: originalPid, exitObserved: true, closeObserved: true, exitCode: 0, signal: null, stdinEof: true });
    await assert.rejects(lstat(`/proc/${String(originalPid)}`), { code: "ENOENT" });
    const rows = manager.inspect()["records"]; assert.ok(Array.isArray(rows));
    const raw = await Promise.all(rows.map(row => readFile(String(record(row)["evidenceFile"]), "utf8")));
    assert.match(raw.join("\n"), /request-timeout/u); assert.match(raw.join("\n"), /original-cleanup-result/u);
    await manager.handle(request({ id: "closed-original-manager", action: "shutdown" }));
    assert.equal(manager.inspect()["stage"], "closed");
  });
});

void test("normal and cleanup budgets refuse before dispatch and preserve separate control evidence capacity", () => {
  assert.equal(sessionManagerCallBudgetAvailable(false, 4094, 0), true);
  assert.equal(sessionManagerCallBudgetAvailable(false, 4095, 0), false);
  assert.equal(sessionManagerCallBudgetAvailable(false, 0, 1_073_741_824 - 67_108_864 - 65_536), true);
  assert.equal(sessionManagerCallBudgetAvailable(false, 0, 1_073_741_824 - 67_108_864 - 65_535), false);
  assert.equal(sessionManagerCallBudgetAvailable(true, 126, 0), true);
  assert.equal(sessionManagerCallBudgetAvailable(true, 127, 0), false);
  assert.equal(sessionManagerRetirementBudgetAvailable(120, 0), true);
  assert.equal(sessionManagerRetirementBudgetAvailable(121, 0), false);
  assert.equal(sessionManagerRetirementBudgetAvailable(0, 4_194_304 - 131_072), true);
  assert.equal(sessionManagerRetirementBudgetAvailable(0, 4_194_304 - 131_071), false);
  assert.equal(sessionManagerStartBudgetAvailable(117, 0), true);
  assert.equal(sessionManagerStartBudgetAvailable(118, 0), false);
  assert.equal(sessionManagerStartBudgetAvailable(125, 0), false);
  for (const value of [-1, Number.NaN, Infinity, Number.MAX_SAFE_INTEGER]) {
    assert.equal(sessionManagerCallBudgetAvailable(false, value, 0), false);
    assert.equal(sessionManagerCallBudgetAvailable(false, 0, value), false);
  }
});

void test("cleanup exhaustion preserves one final original retirement with a consumed refusal latch", () => {
  const reservation = new SessionManagerRetirementReservation();
  assert.equal(reservation.reserve(2, 0, 125, 0), "ordinary");
  assert.equal(reservation.finalAttemptConsumed(), false);
  // Forty-two active refusals followed by one original cleanup call fill all
  // Cleanup records. Untouched control capacity still admits final retirement.
  assert.equal(reservation.reserve(2, 0, 128, 0), "final");
  assert.equal(reservation.finalAttemptConsumed(), true);
  assert.throws(() => reservation.reserve(5, 0, 128, 0), /manager-control-budget-exhausted/u);
  assert.throws(() => reservation.reserve(2, 0, 0, 0), /manager-control-budget-exhausted/u);
});

void test("actual manager retains a conflicting startup catalog and explicitly closes only its own unused startup child", { timeout: 45_000 }, async () => {
  const selected = await fixture();
  const conflictOutputs: unknown[] = [], ownerOutputs: unknown[] = [];
  await selectedProfile(selected.profilePath, async () => {
    const retained: ForegroundSessionManager[] = [];
    try {
      const owner = new ForegroundSessionManager(async value => { ownerOutputs.push(value); await Promise.resolve(); });
      retained.push(owner);
      await owner.initialize(selected.root);
      const ownerPid = owner.inspect()["facadePid"];
      const conflict = new ForegroundSessionManager(async value => { conflictOutputs.push(value); await Promise.resolve(); });
      retained.push(conflict);
      await assert.rejects(conflict.initialize(selected.root), /unexpected-facade-catalog/u);
      const blocked = conflict.inspect(), childPid = blocked["facadePid"];
      assert.equal(blocked["generation"], 0); assert.equal(blocked["stage"], "blocked");
      assert.equal(blocked["callerToolDispatchStarted"], false); assert.notEqual(childPid, ownerPid);
      const records = blocked["records"]; assert.ok(Array.isArray(records));
      const catalogRecord = records.map(row => record(row)).find(row => row["kind"] === "startup-catalog"); assert.ok(catalogRecord);
      const catalogText = await readFile(String(catalogRecord["evidenceFile"]), "utf8");
      const catalog = record(JSON.parse(catalogText))["value"];
      const tools = record(catalog)["tools"]; assert.ok(Array.isArray(tools));
      assert.deepEqual(tools.map(tool => record(tool)["name"]), ["easyeda_control_status", "easyeda_control_session"]);
      await conflict.handle(request({ id: "close-unused-startup", action: "cleanup-startup", confirmCloseOriginalStartup: true }));
      const result = record(conflictOutputs.at(-1));
      assert.equal(result["startupClosed"], true); assert.equal(result["replacementAllowed"], false);
      assert.deepEqual(record(result["closure"]), { pid: childPid, exitObserved: true, closeObserved: true,
        exitCode: 0, signal: null, stdinEof: true });
      await assert.rejects(lstat(`/proc/${String(childPid)}`), { code: "ENOENT" });
      const leaseText = await readFile(join(selected.control, "facade.lock"), "utf8");
      assert.equal(record(JSON.parse(leaseText))["pid"], ownerPid);
      const ownerProcess = await lstat(`/proc/${String(ownerPid)}`); assert.ok(ownerProcess.isDirectory());
      await conflict.handle(request({ id: "no-startup-cleanup-replay", action: "cleanup-startup", confirmCloseOriginalStartup: true }));
      await conflict.handle(request({ id: "no-startup-retry", action: "start", afterGeneration: 1, pluginRoot: selected.root }));
      assert.equal(conflict.inspect()["stage"], "blocked"); assert.equal(conflict.inspect()["generation"], 0);
      assert.equal(conflict.inspect()["facadePid"], childPid);
      await conflict.handle(request({ id: "close-conflict-manager", action: "shutdown" }));
      await owner.handle(loaded("admitted-original-call"));
      assert.equal(owner.inspect()["callerToolDispatchStarted"], true);
      await owner.handle(request({ id: "cannot-close-used-owner-as-startup", action: "cleanup-startup", confirmCloseOriginalStartup: true }));
      assert.equal(owner.inspect()["stage"], "active"); assert.equal(owner.inspect()["closure"], null);
      await owner.handle(retire("retire-original-owner", 1));
      assert.equal(record(ownerOutputs.at(-1))["retired"], true);
      await owner.handle(request({ id: "close-original-manager", action: "shutdown" }));
      let failReady = true;
      const publicationOutputs: unknown[] = [];
      const publication = new ForegroundSessionManager(async value => {
        if (record(value)["ready"] === true && failReady) { failReady = false; throw new Error("synthetic-ready-publication-failed"); }
        publicationOutputs.push(value); await Promise.resolve();
      });
      retained.push(publication);
      await assert.rejects(publication.initialize(selected.root), /synthetic-ready-publication-failed/u);
      assert.equal(publication.inspect()["callerToolDispatchStarted"], false);
      await publication.handle(request({ id: "close-unpublished-startup", action: "cleanup-startup", confirmCloseOriginalStartup: true }));
      assert.equal(record(publicationOutputs.at(-1))["startupClosed"], true);
      await publication.handle(request({ id: "close-publication-manager", action: "shutdown" }));
    } finally {
      // Register every isolated owner before fallible initialization/assertions.
      // Only original supported cleanup can finish this fixture on failure.
      for (const [index, manager] of retained.toReversed().entries()) {
        const state = manager.inspect();
        if (state["stage"] === "active") {
          const generation = state["generation"]; assert.ok(typeof generation === "number");
          await manager.handle(retire(`fixture-finally-retire-${String(index)}`, generation));
        } else if (state["stage"] === "blocked" && state["callerToolDispatchStarted"] === false &&
          state["startupCleanupAttempted"] === false && state["facadePid"] !== null && state["closure"] === null) {
          await manager.handle(request({ id: `fixture-finally-startup-${String(index)}`, action: "cleanup-startup", confirmCloseOriginalStartup: true }));
        }
        const current = manager.inspect();
        if (current["stage"] === "between-facades" || current["stage"] === "blocked" && (current["facadePid"] === null || current["closure"] !== null)) {
          await manager.handle(request({ id: `fixture-finally-close-${String(index)}`, action: "shutdown" }));
        }
        assert.equal(manager.inspect()["stage"], "closed");
      }
    }
  });
});

void test("actual manager retains itself across two distinct real isolated facades and admits their exact loaded identities", { timeout: 60_000 }, async () => {
  const first = await fixture(), second = await fixture();
  const outputs: unknown[] = [];
  await selectedProfile(first.profilePath, async () => {
    const manager = new ForegroundSessionManager(async value => { outputs.push(value); await Promise.resolve(); });
    await manager.initialize(first.root);
    const firstReady = record(outputs.at(-1));
    const firstPid = firstReady["facadePid"];
    assert.equal(firstReady["managerPid"], process.pid);
    assert.equal(record(firstReady["loadedFacade"])["pid"], firstPid);
    assert.equal(record(firstReady["loadedFacade"])["moduleUrl"], pathToFileURL(join(first.root, "server/dist/server.mjs")).href);
    await manager.handle(loaded("original-read"));
    const budgetBefore = record(manager.inspect()["budgets"]);
    const cleanupCall = record(JSON.parse(loaded("explicit-cleanup-reserve")));
    await manager.handle(request({ ...cleanupCall, cleanup: true }));
    const budgetAfter = record(manager.inspect()["budgets"]);
    assert.equal(record(budgetAfter["records"])["cleanup"], 2);
    assert.deepEqual(record(budgetAfter["records"])["control"], record(budgetBefore["records"])["control"]);
    await manager.handle(retire("retire-first", 1));
    const retired = record(outputs.at(-1));
    assert.equal(retired["retired"], true);
    assert.deepEqual(record(retired["closure"]), { pid: firstPid, exitObserved: true, closeObserved: true,
      exitCode: 0, signal: null, stdinEof: true });
    await assert.rejects(lstat(`/proc/${String(firstPid)}`), { code: "ENOENT" });
    await assert.rejects(lstat(join(first.control, "facade.lock")), { code: "ENOENT" });
    // Repeated retire and stale start requests do not consume the retained valid
    // Permit or resurrect an old facade. No JSON can authorize initial start.
    await manager.handle(retire("duplicate-retire", 1));
    assert.equal(manager.inspect()["stage"], "between-facades");
    await manager.handle(request({ id: "stale-start", action: "start", afterGeneration: 2, pluginRoot: second.root }));
    assert.equal(manager.inspect()["stage"], "between-facades");
    await manager.handle(request({ id: "replacement", action: "start", afterGeneration: 1, pluginRoot: second.root }));
    const secondReady = record(outputs.at(-1));
    assert.equal(secondReady["ready"], true); assert.equal(secondReady["generation"], 2);
    assert.equal(secondReady["managerPid"], process.pid); assert.notEqual(secondReady["facadePid"], firstPid);
    assert.equal(record(secondReady["loadedFacade"])["moduleUrl"], pathToFileURL(join(second.root, "server/dist/server.mjs")).href);
    const leaseText = await readFile(join(first.control, "facade.lock"), "utf8");
    const lease = record(JSON.parse(leaseText));
    assert.equal(lease["pid"], secondReady["facadePid"]);
    await manager.handle(retire("retire-second", 2));
    await manager.handle(request({ id: "done", action: "shutdown" }));
    assert.equal(manager.inspect()["stage"], "closed");
    const evidence = String(manager.inspect()["evidenceDirectory"]);
    const roster = await readdir(evidence);
    assert.ok(roster.length > 10);
    const proof = await Promise.all(roster.map(async name => {
      const info = await lstat(join(evidence, name));
      assert.equal(info.mode % 512, 0o600);
      const text = await readFile(join(evidence, name), "utf8");
      return record(JSON.parse(text));
    }));
    assert.equal(proof.filter(row => row["kind"] === "original-child-closure").length, 2);
  });
});

void test("actual manager keeps original cleanup calls after semantic errors and a journal preflight refusal", { timeout: 45_000 }, async () => {
  const selected = await fixture();
  const outputs: unknown[] = [];
  await selectedProfile(selected.profilePath, async () => {
    const manager = new ForegroundSessionManager(async value => { outputs.push(value); await Promise.resolve(); });
    await manager.initialize(selected.root);
    const original = manager.inspect()["facadePid"];
    // Use an admitted non-reference callback: SDK argument rejection alone
    // Preserves a source-only facade and cannot require global journal parsing.
    await manager.handle(request({ id: "failed-operation", tool: "easyeda_control_native_release", arguments: { request: {
      action: "release-completed", kind: "project-opening", operationId: "manager-semantic-refusal", confirmReleaseOriginalRuntime: true,
    } } }));
    const errorResult = record(outputs.at(-1))["result"];
    assert.equal(record(errorResult)["isError"], true);
    assert.equal(manager.inspect()["stage"], "active");
    const directory = join(selected.control, "ordinary-launch-v1");
    await mkdir(directory, { mode: 0o700 });
    const journal = join(directory, "easyeda-unreadable.json");
    await writeFile(journal, "{unreadable", { mode: 0o600 });
    const beforeRefusal = record(record(manager.inspect()["budgets"])["records"]);
    await manager.handle(retire("refused", 1));
    assert.equal(record(outputs.at(-1))["retirementRefused"], true);
    assert.equal(manager.inspect()["stage"], "active");
    assert.equal(manager.inspect()["facadePid"], original);
    const afterRefusal = record(record(manager.inspect()["budgets"])["records"]);
    assert.equal(afterRefusal["control"], beforeRefusal["control"]);
    assert.equal(afterRefusal["cleanup"], Number(beforeRefusal["cleanup"]) + 3);
    await manager.handle(loaded("same-owner-cleanup-inspection"));
    const cleanupResult = record(record(outputs.at(-1))["result"]);
    assert.equal(record(cleanupResult["structuredContent"])["offline"], true);
    // Simulate completion through the fixture's independently owned test record,
    // Preserving its original failure bytes outside the scanned journal family.
    await copyFile(journal, join(selected.control, "retained-unreadable-journal.json"));
    // This fixture has no real operation. Retain its failure unchanged outside
    // The journal family so the real server can inspect quiescence again.
    await rename(journal, join(selected.control, "fixture-completion.json"));
    await manager.handle(retire("after-cleanup", 1));
    assert.equal(record(outputs.at(-1))["retired"], true);
    await manager.handle(request({ id: "done", action: "shutdown" }));
  });
});

void test("asynchronous admitted stdout failure blocks publication while retaining the exact unused startup child", { timeout: 45_000 }, async context => {
  const entered = Promise.withResolvers<null>();
  const selected = await fixture();
  await selectedProfile(selected.profilePath, async () => {
    const output = new Writable({ highWaterMark: 2 * 1024 * 1024,
      // oxlint-disable-next-line promise/prefer-await-to-callbacks -- Reproduce the actual Writable completion callback rather than a promise-shaped stand-in.
      write(_chunk, _encoding, callback): void {
        entered.resolve(null);
        // oxlint-disable-next-line promise/prefer-await-to-callbacks -- Fail the admitted write on the next turn, after write() has returned true.
        setImmediate(() => { callback(new Error("private-asynchronous-output-failure")); });
      } });
    const emit = createManagerOutputPublisher(output);
    let fixtureCleanup = false;
    const manager = new ForegroundSessionManager(value => fixtureCleanup ? Promise.resolve() : emit(value));
    // Only the test publisher is bypassed during fixture disposal. The real
    // Failed output remains permanently unavailable; no recovery is implied.
    context.after(async () => {
      fixtureCleanup = true;
      if (manager.inspect()["facadePid"] !== null && record(manager.inspect()["closure"] ?? {})["closeObserved"] !== true) {
        await manager.handle(request({ id: "fixture-close-unused-output-owner", action: "cleanup-startup", confirmCloseOriginalStartup: true }));
      }
      if (manager.inspect()["stage"] !== "closed") { await manager.handle(request({ id: "fixture-close-output-manager", action: "shutdown" })); }
      output.destroy();
    });
    const failed = assert.rejects(manager.initialize(selected.root), /manager-output-unavailable/u);
    await entered.promise;
    const original = manager.inspect();
    // Write admission returned true for this small line before its failure.
    assert.equal(output.writableNeedDrain, false);
    assert.equal(original["stage"], "starting"); assert.equal(original["publicationFault"], false);
    assert.equal(original["callerToolDispatchStarted"], false);
    assert.equal(typeof original["facadePid"], "number");
    await failed;
    const blocked = manager.inspect();
    assert.equal(blocked["stage"], "blocked"); assert.equal(blocked["publicationFault"], true);
    assert.equal(blocked["facadePid"], original["facadePid"]); assert.equal(blocked["generation"], original["generation"]);
    assert.equal(blocked["closure"], null);
    await assert.rejects(emit({ afterFailure: true }), /manager-output-unavailable/u);
    const evidence = String(blocked["evidenceDirectory"]), names = await readdir(evidence);
    const texts = await Promise.all(names.map(name => readFile(join(evidence, name), "utf8")));
    const text = texts.join("");
    assert.match(text, /publication-failed/u); assert.equal(text.includes("private-asynchronous-output-failure"), false);
    fixtureCleanup = true;
    await manager.handle(request({ id: "close-original-unused-output-owner", action: "cleanup-startup", confirmCloseOriginalStartup: true }));
    const closure = record(manager.inspect()["closure"]);
    assert.equal(closure["pid"], original["facadePid"]); assert.equal(closure["stdinEof"], true);
    assert.equal(closure["exitObserved"], true); assert.equal(closure["closeObserved"], true);
    assert.equal(closure["exitCode"], 0); assert.equal(closure["signal"], null);
    await manager.handle(request({ id: "close-original-output-manager", action: "shutdown" }));
  });
});

void test("actual manager blocks retirement through pending result publication and retains proof if publication fails", { timeout: 45_000 }, async () => {
  const selected = await fixture();
  const outputs: unknown[] = [];
  const entered = Promise.withResolvers<null>(), release = Promise.withResolvers<null>();
  await selectedProfile(selected.profilePath, async () => {
    const manager = new ForegroundSessionManager(async value => {
      outputs.push(value);
      if (record(value)["id"] === "held-result") { entered.resolve(null); await release.promise; }
    });
    await manager.initialize(selected.root);
    const pending = manager.handle(loaded("held-result"));
    await entered.promise;
    await assert.rejects(manager.handle(retire("concurrent", 1)), /manager-request-pending/u);
    assert.equal(manager.inspect()["stage"], "active");
    assert.equal(manager.inspect()["requestPending"], true);
    release.resolve(null); await pending;
    await manager.handle(retire("settled", 1));
    await manager.handle(request({ id: "done", action: "shutdown" }));
  });
  await selectedProfile(selected.profilePath, async () => {
    const manager = new ForegroundSessionManager(async value => {
      if (record(value)["retired"] === true) { throw new Error("private-output-failure"); }
      outputs.push(value); await Promise.resolve();
    });
    await manager.initialize(selected.root);
    await manager.handle(retire("retire-publication-failure", 1));
    assert.equal(manager.inspect()["stage"], "blocked");
    const before = manager.inspect()["generation"];
    await manager.handle(request({ id: "forbidden-replacement", action: "start", afterGeneration: 1, pluginRoot: selected.root }));
    assert.equal(manager.inspect()["generation"], before);
    assert.equal(manager.inspect()["stage"], "blocked");
    const evidence = String(manager.inspect()["evidenceDirectory"]);
    const names = await readdir(evidence);
    const texts = await Promise.all(names.map(name => readFile(join(evidence, name), "utf8")));
    const text = texts.join("");
    assert.match(text, /original-child-closure/u); assert.match(text, /publication-failed/u);
    assert.equal(text.includes("private-output-failure"), false);
    assert.equal(record(manager.inspect()["closure"])["exitObserved"], true);
    await manager.handle(request({ id: "close-retired-blocked-manager", action: "shutdown" }));
  });
});

void test("cooperative transport retains its exact child through timeout and observes later exit without signals", { timeout: 10_000 }, async () => {
  const root = await createTestTemporaryDirectory("easyeda-manager-transport-");
  const entrypoint = join(root, "retained-child.mjs");
  await writeFile(entrypoint, "process.stdin.resume();process.stdin.on('end',()=>{setTimeout(()=>process.exitCode=0,300);});");
  await chmod(entrypoint, 0o600);
  const transport = new ForegroundSessionTransport({ command: process.execPath, args: [entrypoint], cwd: root, env: {} }, 50);
  await transport.start();
  const pid = transport.pid;
  await transport.close();
  await assert.rejects(transport.awaitOwnedClosure(), /foreground-child-closure-unproven/u);
  assert.equal(transport.pid, pid); assert.equal(transport.inspectClosure(), null);
  const processInfo = await lstat(`/proc/${String(pid)}`);
  assert.ok(processInfo.isDirectory());
  await waitForObservedClosure(() => transport.inspectClosure() !== null);
  assert.deepEqual(transport.inspectClosure(), { pid, exitObserved: true, closeObserved: true, exitCode: 0, signal: null, stdinEof: true });
});

void test("SDK startup auto-close cannot discard a rejecting closure promise or lose its still-live original child", { timeout: 10_000 }, async () => {
  const root = await createTestTemporaryDirectory("easyeda-manager-startup-");
  const entrypoint = join(root, "malformed-initialize.mjs");
  await writeFile(entrypoint, String.raw`process.stdin.once('data',()=>process.stdout.write('invalid-json\n'));process.stdin.on('end',()=>setTimeout(()=>process.exitCode=0,300));`);
  const transport = new ForegroundSessionTransport({ command: process.execPath, args: [entrypoint], cwd: root, env: {} }, 50);
  const client = new Client({ name: "manager-startup-failure", version: "1.0.0" });
  await assert.rejects(client.connect(transport, { timeout: 100 }));
  assert.equal(transport.hasUnclosedChild(), true);
  await assert.rejects(transport.awaitOwnedClosure(), /foreground-child-closure-unproven/u);
  await waitForObservedClosure(() => transport.inspectClosure() !== null);
  assert.equal(transport.hasUnclosedChild(), false);
  assert.equal(transport.inspectClosure()?.exitCode, 0);
  assert.equal(transport.inspectClosure()?.signal, null);
  await assert.rejects(transport.awaitOwnedClosure(), /foreground-child-transport-failed/u);
  await client.close();
});

void test("actual manager executable keeps its request loop after failed initialization and can close when no child was allocated", { timeout: 10_000 }, async () => {
  const isolation = await assertTestIsolation();
  const completed = Promise.withResolvers<Readonly<{ code: string | number; stdout: string; stderr: string }>>();
  const child = execFile(process.execPath, [join(pluginRoot, "scripts/control-session-manager.ts"), "--plugin-root", join(isolation.directory, "absent-plugin")], {
    env: { PATH: "/usr/bin:/bin", EASYEDA_MACHINE_PROFILE: join(isolation.directory, "unread-profile.json") },
    timeout: 5000, maxBuffer: 65_536, encoding: "utf8",
  },
  // oxlint-disable-next-line promise/prefer-await-to-callbacks -- Retain the owned executable's exact exit status and bounded stdout/stderr from execFile's callback.
  (error, stdout, stderr) => { completed.resolve({ code: error?.code ?? 0, stdout, stderr }); });
  child.stdin?.end(`${request({ id: "inspection-after-startup-failure", action: "inspect" })}\n${request({ id: "close-no-child", action: "shutdown" })}\n`);
  const result = await completed.promise;
  assert.equal(result.code, 0); assert.equal(result.stderr, "");
  const lines = result.stdout.trim().split("\n").map(line => record(JSON.parse(line)));
  assert.equal(lines[0]?.["error"], "manager-initialization-failed");
  assert.equal(lines[1]?.["id"], "inspection-after-startup-failure");
  assert.equal(record(lines[1]?.["manager"])["stage"], "blocked");
  assert.equal(lines[2]?.["closing"], true);
});

void test("rejected RPC and contradictory retirement acknowledgement freeze replacement without retrying", { timeout: 30_000 }, async () => {
  for (const kind of ["rpc-rejection", "bad-retirement"] as const) {
    const selected = await fixture(syntheticPeer(kind));
    const outputs: unknown[] = [];
    await selectedProfile(selected.profilePath, async () => {
      const manager = new ForegroundSessionManager(async value => { outputs.push(value); await Promise.resolve(); });
      await manager.initialize(selected.root);
      const original = manager.inspect()["facadePid"];
      await manager.handle(kind === "rpc-rejection" ? request({ id: "rejected", tool: "easyeda_control_api", arguments: { request: { action: "reject" } } }) : retire("contradictory", 1));
      assert.equal(manager.inspect()["stage"], "blocked");
      await manager.handle(retire("no-repeat", 1));
      await manager.handle(request({ id: "no-replacement", action: "start", afterGeneration: 1, pluginRoot: selected.root }));
      assert.equal(manager.inspect()["generation"], 1);
      assert.equal(manager.inspect()["facadePid"], original);
      const rows = manager.inspect()["records"];
      assert.ok(Array.isArray(rows));
      assert.equal(rows.filter(row => record(row)["kind"] === (kind === "rpc-rejection" ? "call-intent" : "retirement-intent")).length, 1);
      assert.equal(JSON.stringify(outputs).includes("private-peer-error"), false);
      // This synthetic peer closes itself after the one failure. The manager
      // Neither requests closure nor sends a signal to obtain that observation.
      await waitForObservedClosure(() => manager.inspect()["closure"] !== null);
      assert.equal(record(manager.inspect()["closure"])["signal"], null);
      await manager.handle(request({ id: "closed-peer", action: "shutdown" }));
      assert.equal(manager.inspect()["stage"], "closed");
    });
  }
});
