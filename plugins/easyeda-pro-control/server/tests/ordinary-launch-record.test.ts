/** Actual ordinary coordinator/issuer in a private realm with synthetic I/O.
 * No Windows process, native helper, production token or live record is used.
 */
/* oxlint-disable import/max-dependencies -- The source-realm fixture binds the real shared diagnostic exclusion and journal guard alongside the original coordinator contracts. */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { stripTypeScriptTypes } from "node:module";
import { join } from "node:path";
import { test } from "node:test";
import { createContext, runInContext } from "node:vm";
import { z } from "zod";
import { canonicalJson, isRecord, sha256Json, sha256Text } from "../src/core.ts";
import { assertNoUnresolvedCurrentPcbDiagnosticLaunches, withCurrentPcbDiagnosticLaunchExclusion } from "../src/current-pcb-diagnostic-lifecycle-journal.ts";
import { ORDINARY_LAUNCH_209_PROFILE } from "../src/ordinary-launch-209-profile.ts";
import { ordinaryLaunchRecoveryObservationSchema, recordedOrdinaryLaunchRecoveryObservationSchema } from "../src/ordinary-launch-recovery.ts";
import { OrdinaryLaunchTimings } from "../src/ordinary-launch-timings.ts";
import { isPublicUtilities209Configured } from "../src/sdk-public-utilities-profile.ts";

type Bag = Record<string, unknown>;
function bag(value: unknown): Bag { assert.ok(isRecord(value)); return value; }
async function fixture(options: Readonly<{ injected?: boolean; holdPublication?: boolean; failPublication?: boolean; wrongTermination?: boolean;
  holdRelease?: boolean; failRelease?: boolean; failIndexClear?: boolean; failReleaseRecord?: "release-intent.json" | "released.json" }> = {}): Promise<{
  launch: () => Promise<unknown>; observe: () => Promise<unknown>; recorded: (wrongRuntime?: boolean, wrongLaunch?: boolean) => Promise<unknown>;
  original: (value: unknown) => unknown; release: () => void; drift: (kind: "status" | "observer" | "launch" | "record" | "format") => void;
  releaseClosed: (override?: Bag, historical?: boolean) => Promise<unknown>; finishRelease: () => void; inspect: () => Promise<unknown>;
  state: { terminated: boolean; publishing: boolean; observerCalls: number; hashes: number; statusCalls: number;
    releaseCalls: number; releaseSettled: boolean; indexClears: number; projectOwned: boolean };
}> {
  const facadeSha256 = "a".repeat(64), id = "ordinary-synthetic-record", jobId = "b".repeat(32);
  const originalLaunch = { jobId, helperInstance: "c".repeat(32), root: { pid: 42, role: "easyeda-main", startIdentity: `win32:123456789012345:job:${jobId}` } };
  let currentLaunch = originalLaunch;
  const barrier = Promise.withResolvers<boolean>(), records = new Map<string, string>(), releaseBarrier = Promise.withResolvers<boolean>();
  const state = { terminated: false, publishing: false, observerCalls: 0, hashes: 0, statusCalls: 0,
    releaseCalls: 0, releaseSettled: false, indexClears: 0, projectOwned: false };
  let released = false;
  class SyntheticRuntime {
    private readonly observations = state;
    public launch(): Promise<typeof originalLaunch> { assert.equal(this.observations, state); return Promise.resolve(originalLaunch); }
    public observeExistingApplication(): Promise<{ running: false }> { assert.equal(this.observations, state); return Promise.resolve({ running: false }); }
    public observeLaunchTermination(): Promise<Bag> {
      assert.equal(this.observations, state); state.observerCalls += 1;
      return Promise.resolve({ jobId: options.wrongTermination === true ? "f".repeat(32) : jobId,
        helperInstance: originalLaunch.helperInstance, terminated: state.terminated });
    }
    public status(): Bag { assert.equal(this.observations, state); state.statusCalls += 1;
      return { state: released ? "released" : "owned", launch: released ? null : currentLaunch }; }
    public async release(): Promise<void> {
      assert.equal(this.observations, state); state.releaseCalls += 1; released = true;
      assert.ok(records.has("release-intent.json")); assert.equal(state.indexClears, 0);
      if (options.holdRelease === true) { await releaseBarrier.promise; }
      if (options.failRelease === true) { throw new Error("Synthetic helper closure failure"); }
      state.releaseSettled = true;
    }
  }
  const root = "/synthetic/control", runtime = new SyntheticRuntime();
  const program = stripTypeScriptTypes(await readFile(new URL("../src/ordinary-launch.ts", import.meta.url), "utf8"))
    .replaceAll(/^import[\s\S]*?;\n/gmu, "").replaceAll(/\bexport (?=(?:async )?(?:class|function|const))/gu, "");
  const context = createContext({ z, Object, Reflect, Buffer, join, canonicalJson, sha256Json, sha256Text, OrdinaryLaunchTimings,
    ORDINARY_LAUNCH_209_PROFILE, isPublicUtilities209Configured,
    // Keep the original generation206 fixture independent of ambient machine selectors.
    process: { env: Object.freeze({ EASYEDA_PCB_BUNDLE_VERSION: "3.2.193.682ed44e", EASYEDA_PUBLIC_API_BUNDLE_VERSION: "0.3.50.ab46409c" }) },
    assertNoUnresolvedCurrentPcbDiagnosticLaunches, withCurrentPcbDiagnosticLaunchExclusion,
    ordinaryLaunchRecoveryObservationSchema, recordedOrdinaryLaunchRecoveryObservationSchema, WindowsControlRuntime: SyntheticRuntime,
    observeOrdinaryLaunchRecovery: (): never => { throw new Error("Unexpected recovery"); },
    controlDataDirectory: (): string => root,
    controlRootCapability: (): Promise<Bag> => Promise.resolve({ openDirectory: (): Promise<Bag> => Promise.resolve({ handle: {
      fd: 999, sync: (): Promise<void> => Promise.resolve(), close: (): Promise<void> => Promise.resolve(),
    } }) }),
    mkdir: (): Promise<void> => Promise.resolve(),
    testVerify: (): Promise<string> => Promise.resolve(facadeSha256),
    testInventory: (): Promise<Bag[]> => {
      if (records.size === 0) { return Promise.resolve([]); }
      const value: Bag = { operationId: id };
      for (const [name, text] of records) { value[name === "release-intent.json" ? "releaseIntent" : name.slice(0, -5)] = JSON.parse(text) as unknown; }
      return Promise.resolve([value]);
    },
    testPublish: async (operationId: string, name: string, value: unknown): Promise<void> => {
      assert.equal(operationId, id); assert.equal(records.has(name), false);
      if (name === options.failReleaseRecord) { throw new Error("Synthetic release publication failure"); }
      if (name === "terminated.json") {
        state.publishing = true;
        if (options.holdPublication === true) { await barrier.promise; }
        if (options.failPublication === true) { throw new Error("Synthetic publication failure"); }
      }
      records.set(name, `${JSON.stringify(value)}\n`);
    },
    testHash: (path: string, expected: string, bytes: number): Promise<void> => {
      state.hashes += 1; assert.equal(path, `${root}/ordinary-launch-v1/${id}/terminated.json`);
      const text = records.get("terminated.json"); assert.ok(text !== undefined);
      assert.equal(Buffer.byteLength(text), bytes, "Synthetic exact record bytes changed");
      assert.equal(sha256Text(text), expected, "Synthetic exact record hash changed"); return Promise.resolve();
    },
    testRuntime: runtime, testLaunch: originalLaunch, testInjected: options.injected === true,
    testOptions: { assetsRoot: "/synthetic/assets", pluginRoot: "/synthetic/plugin", assertAllowed: (): Promise<void> => Promise.resolve(),
      allocateRuntime: (): SyntheticRuntime => runtime,
      assertReleaseAllowed: (): void => { assert.equal(state.projectOwned, false, "Synthetic project still owns runtime"); },
      completeRuntimeRelease: (): void => { assert.equal(state.releaseSettled, true); assert.equal(state.projectOwned, false);
        if (options.failIndexClear === true) { throw new Error("Synthetic allocation clear failure"); } state.indexClears += 1; } },
  });
  // Boundary substitution exists only in this private source realm. The real
  // Module's lexical map and publication/installation implementations are intact.
  const api = bag(runInContext(`${program}
inventory=testInventory;publish=testPublish;hashPinnedFile=testHash;verifyInstalledProfile=testVerify;
const coordinator=new OrdinaryLaunchCoordinator(testOptions,testInjected?{verifyInstallation:testVerify}:{});
({launch:()=>coordinator.run({action:'launch',operationId:'${id}',confirmLaunch:true,acceptExistingProfileEffects:true}),
observe:()=>coordinator.run({action:'observe-termination',operationId:'${id}'}),
inspect:()=>coordinator.run({action:'inspect',operationId:'${id}'}),
releaseClosed:async(override={},historical=false)=>{const seen=await coordinator.run({action:'inspect',operationId:'${id}'});
return (historical?new OrdinaryLaunchCoordinator(testOptions):coordinator).run({action:'release-closed',operationId:'${id}',
expectedLaunchedSha256:seen.launchedSha256,expectedTerminationSha256:seen.terminationSha256??'0'.repeat(64),confirmReleaseClosed:true,...override});},
recorded:(wrongRuntime,wrongLaunch)=>assertOriginalRecordedOrdinaryTermination(wrongRuntime?{}:testRuntime,wrongLaunch?{...testLaunch,root:{...testLaunch.root,pid:99}}:testLaunch),
original:value=>assertOriginalOrdinaryTerminationRecord(value,testRuntime,testLaunch)});`, context));
  const invoke = (name: string, args: unknown[] = []): unknown => { const method = api[name]; assert.ok(typeof method === "function");
    return Reflect.apply(method, undefined, args) as unknown; };
  return { state, launch: async (): Promise<unknown> => await invoke("launch"), observe: async (): Promise<unknown> => await invoke("observe"),
    inspect: async (): Promise<unknown> => await invoke("inspect"),
    releaseClosed: async (override = {}, historical = false): Promise<unknown> => await invoke("releaseClosed", [override, historical]),
    finishRelease: (): void => { releaseBarrier.resolve(true); },
    recorded: async (wrongRuntime = false, wrongLaunch = false): Promise<unknown> => await invoke("recorded", [wrongRuntime, wrongLaunch]),
    original: (value): unknown => invoke("original", [value]), release: (): void => { barrier.resolve(true); },
    drift: (kind): void => {
      if (kind === "observer") { runtime.observeLaunchTermination = (): never => { throw new Error("Changed observer must not run"); }; }
      else if (kind === "status") { runtime.status = (): never => { throw new Error("Changed status must not run"); }; }
      else if (kind === "launch") { currentLaunch = { ...originalLaunch, root: { ...originalLaunch.root, pid: 43 } }; }
      else {
        const text = records.get("terminated.json"); assert.ok(text !== undefined);
        if (kind === "format") { records.set("terminated.json", `${text}\n`); }
        else { const value = bag(JSON.parse(text) as unknown); value["jobId"] = "f".repeat(32); records.set("terminated.json", JSON.stringify(value)); }
      }
    } };
}

void test("ordinary termination issues an original token only after native exit, durable publication and completed coordinator state", async () => {
  const f = await fixture({ holdPublication: true }); await f.launch();
  await assert.rejects(f.recorded(), /no original published record/u); await f.observe();
  await assert.rejects(f.recorded(), /no original published record/u); f.state.terminated = true;
  const pending = f.observe();
  for (let index = 0; index < 100 && !f.state.publishing; index += 1) { await Promise.resolve(); }
  assert.equal(f.state.publishing, true); await assert.rejects(f.recorded(), /no original published record/u);
  f.release(); await pending;
  const value = await f.recorded(); assert.equal(f.original(value), value); assert.equal(await f.recorded(), value);
  assert.equal(bag(value)["terminationRecordPublished"], true); assert.equal(bag(value)["designExecutionAuthorized"], false);
  assert.equal(Object.isFrozen(value), true); assert.equal(Object.isFrozen(bag(value)["launch"]), true);
  assert.throws(() => f.original(structuredClone(value)), /original recorded runtime/u);
  await assert.rejects(f.recorded(true), /no original published record/u); await assert.rejects(f.recorded(false, true), /complete launch/u);
  await f.observe(); assert.equal(await f.recorded(), value); assert.equal(f.state.observerCalls, 2);
  assert.equal(f.state.hashes, 3);
});

void test("explicit ordinary release waits for original helper closure before clearing its allocation and invalidates its issuer", async () => {
  const f = await fixture({ holdRelease: true }); await f.launch(); f.state.terminated = true; const observed = bag(await f.observe());
  assert.match(String(observed["terminationSha256"]), /^[a-f0-9]{64}$/u);
  const token = await f.recorded(); assert.equal(f.state.releaseCalls, 0); assert.equal(f.state.indexClears, 0);
  const pending = f.releaseClosed();
  for (let index = 0; index < 1000 && f.state.releaseCalls === 0; index += 1) { await Promise.resolve(); }
  assert.equal(f.state.releaseCalls, 1); assert.equal(f.state.indexClears, 0); assert.equal(f.state.releaseSettled, false);
  f.finishRelease(); const result = bag(await pending);
  assert.equal(result["state"], "released"); assert.equal(result["indexAllocationReleased"], true); assert.equal(f.state.indexClears, 1);
  assert.throws(() => f.original(token), /original recorded runtime/u); await assert.rejects(f.recorded(), /no original published record/u);
  await assert.rejects(f.releaseClosed(), /consumed/u); assert.equal(f.state.releaseCalls, 1);
});

void test("ordinary release refuses running, historical, mismatched and project-owned requests before helper dispatch", async () => {
  const running = await fixture(); await running.launch(); await assert.rejects(running.releaseClosed(), /recorded original/u);
  assert.equal(running.state.releaseCalls, 0);
  const f = await fixture(); await f.launch(); f.state.terminated = true; await f.observe();
  await assert.rejects(f.releaseClosed({}, true), /current original coordinator/u);
  for (const override of [{ expectedLaunchedSha256: "0".repeat(64) }, { expectedTerminationSha256: "0".repeat(64) },
    { confirmReleaseClosed: false }, { pid: 42 }, { termination: {} }]) { await assert.rejects(f.releaseClosed(override)); }
  f.state.projectOwned = true; await assert.rejects(f.releaseClosed(), /project still owns/u);
  assert.equal(f.state.releaseCalls, 0); assert.equal(f.state.indexClears, 0);
});

void test("ordinary release uncertainty preserves consumed intent and allocation without replay", async () => {
  for (const options of [{ failRelease: true }, { failReleaseRecord: "release-intent.json" }, { failReleaseRecord: "released.json" }, { failIndexClear: true }] as const) {
    const f = await fixture(options); await f.launch(); f.state.terminated = true; await f.observe();
    await assert.rejects(f.releaseClosed(), /closure failure|publication failure|allocation clear failure/u);
    assert.equal(f.state.indexClears, 0);
    const inspected = bag(await f.inspect()); assert.equal(bag(inspected["release"])["attemptConsumed"], true);
    const calls = f.state.releaseCalls; await assert.rejects(f.releaseClosed(), /uncertain|consumed/u); assert.equal(f.state.releaseCalls, calls);
    await assert.rejects(f.recorded(), /incomplete or changed|prior launch/u);
  }
});

void test("ordinary termination never issues from injected coordinators, failed publication or another native Job", async () => {
  for (const options of [{ injected: true }, { failPublication: true }, { wrongTermination: true }]) {
    const f = await fixture(options); await f.launch(); f.state.terminated = true;
    await (options.injected === true ? f.observe() : assert.rejects(f.observe(), /publication failure|another launch/u));
    await assert.rejects(f.recorded(), /no original published record/u); assert.equal(f.state.hashes, 0);
  }
});

void test("ordinary original termination requires unchanged observer/status methods, full launch and exact persisted bytes", async () => {
  for (const kind of ["observer", "status", "launch", "record", "format"] as const) {
    const f = await fixture(); await f.launch(); f.state.terminated = true; await f.observe();
    const value = await f.recorded(); const calls = f.state.statusCalls; f.drift(kind);
    await assert.rejects(f.recorded(), /changed|prior launch/u);
    if (kind === "status" || kind === "observer") { assert.equal(f.state.statusCalls, calls); }
    if (kind === "record" || kind === "format") { assert.equal(f.original(value), value, "Sync identity alone is not persisted-record revalidation"); }
  }
  const before = await fixture(); await before.launch(); before.state.terminated = true; before.drift("observer");
  await assert.rejects(before.observe(), /observer changed/u); assert.equal(before.state.observerCalls, 0);
  await assert.rejects(before.recorded(), /no original published record/u);
});
