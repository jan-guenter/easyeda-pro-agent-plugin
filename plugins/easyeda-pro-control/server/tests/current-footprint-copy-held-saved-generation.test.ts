/** Maintained staged adapter with the real held runner and synthetic native
 * ownership seams. This proves sequencing/refusal, not Chromium or saved CAD. */
/* oxlint-disable import/max-dependencies -- This focused composition test joins the maintained adapter, real held programs and original synthetic SQL projection in a separate native-owner realm. */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { stripTypeScriptTypes } from "node:module";
import { test } from "node:test";
import { types } from "node:util";
import { createContext, runInContext } from "node:vm";
import { canonicalJson } from "../src/core.ts";
import { compareCompleteClosedSql } from "../src/closed-sql-equality.ts";
import { readerCompletion } from "../src/sqlite-inventory.ts";
import { decodeCurrentFootprintCopyV2NativeResult } from "../src/current-footprint-copy-v2-native-result.ts";
import { CurrentFootprintCopyV2SavedReadRunner } from "../src/current-footprint-copy-v2-saved-read-runner.ts";
import { inventory } from "./helpers/symbol-sql-fixture.ts";
import type { CurrentFootprintCopySavedExecutionNative } from "../src/current-footprint-copy-execution-runtime.ts";
import { currentFootprintCopyV2SavedSqlSource, currentFootprintCopyV2SavedTarget } from "../src/current-footprint-copy-v2-saved-source.ts";
import { CURRENT_FOOTPRINT_SAVED_CACHE_HELD_ENGINE as ENGINE } from "../src/current-footprint-saved-cache-held-profile.ts";
import type { CurrentFootprintSavedCacheHeldCommand } from "../src/current-footprint-saved-cache-held-protocol.ts";
import { CurrentFootprintSavedCacheHeldRunner } from "../src/current-footprint-saved-cache-held-runner.ts";
import type { CurrentFootprintSavedCacheHeldObservation } from "../src/current-footprint-saved-cache-held-runner.ts";
import { createHeldCacheSyntheticPage } from "./helpers/current-footprint-saved-cache-held-fixture.ts";
import { STATE, nativeSavedCache, nativeSavedReply, savedFixture, stateReply } from "./helpers/current-footprint-copy-v2-saved-fixture.ts";

interface Options {
  readonly forwardV2?: boolean;
  readonly actualSavedRead?: boolean;
  readonly changedPairedClock?: boolean;
  readonly copiedFirst?: boolean;
  readonly copiedFresh?: boolean;
  readonly lostRelease?: boolean;
  readonly sourceChanged?: boolean;
  readonly skipGuard?: boolean;
  readonly repeatedGuard?: boolean;
  readonly lostOpen?: boolean;
  readonly pendingFirst?: boolean;
  readonly allocationFailed?: boolean;
  readonly admissionFailed?: boolean;
}
interface Fixture {
  readonly adapter: CurrentFootprintCopySavedExecutionNative;
  readonly input: Awaited<ReturnType<typeof savedFixture>>;
  readonly calls: string[];
  readonly commands: CurrentFootprintSavedCacheHeldCommand[];
  readonly runner: CurrentFootprintSavedCacheHeldRunner;
  readonly page: ReturnType<typeof createHeldCacheSyntheticPage>;
  readonly assertionCount: () => number;
  readonly duplicate: () => unknown;
  readonly forgedGuard: () => Promise<unknown>;
  readonly releaseFirst: () => void;
  readonly firstEntered: Promise<null>;
  readonly substituteRunner: () => void;
  readonly observeForward: () => Promise<unknown>;
  readonly sealForward: () => Promise<object>;
  readonly lookupForward: (token: unknown) => unknown;
}

/** Execute the actual adapter in a private realm with explicit synthetic native
 * seams. The real held runner executes its fixed programs and packet checks. */
async function fixture(options: Options = {}): Promise<Fixture> {
  const input = await savedFixture(), target = currentFootprintCopyV2SavedTarget(input.projection);
  const calls: string[] = [], commands: CurrentFootprintSavedCacheHeldCommand[] = [], page = createHeldCacheSyntheticPage();
  const checkpoint = Object.freeze({ source: "/synthetic-held.eprj2" }), snapshot = Object.freeze({ checkpoint });
  const data = currentFootprintCopyV2SavedSqlSource(input.projection).source, metadata = input.copy.destinationMetadata;
  const [firstTime, secondTime] = data.documentClocks;
  const paired = Object.freeze({ serializedCreateResult: JSON.stringify({ success: true, result: {
    uuid: input.projection.targetUuid, project_uuid: input.copy.source.projectUuid, title: metadata.title.toLowerCase(), display_title: metadata.title,
    docType: 4, creator: {}, createTime: firstTime, modifier: {}, description: metadata.description, updateTime: secondTime,
    custom_tags: JSON.stringify(metadata.tags), owner: { uuid: input.copy.ownerUuid }, source: "", version: String(secondTime), path: input.copy.source.projectUuid, ticket: input.copy.metadataTicket,
  } }), clocks: { samples: [{ ordinal: 1, documentUuid: input.projection.targetUuid, updateTime: firstTime + (options.changedPairedClock === true ? 1 : 0) },
    { ordinal: 2, documentUuid: input.projection.targetUuid, updateTime: secondTime }] } });
  const token = Object.freeze({}), writer = Object.freeze({});
  const pairedModule = Object.freeze({ requireOriginalCurrentFootprintForwardSavedContinuation(packet: object, owner: object): object {
    assert.equal(options.forwardV2, true); assert.equal(packet, paired); assert.equal(owner, writer); return Object.freeze({ copyPlan: input.copy, paired });
  } });
  const writerBinding = Object.freeze({ jobId: "writer", helperInstance: "writer-helper" });
  const savedBinding = Object.freeze({ jobId: "held-saved", helperInstance: "held-saved-helper" });
  const first = Promise.withResolvers<null>(), firstEntered = Promise.withResolvers<null>();
  let allocated: object | null = null, assertions = 0, closed = false, finalInventory: typeof input.after | null = null, launched = false, released = false;
  const runner = new CurrentFootprintSavedCacheHeldRunner({
    assertCurrent: (): Promise<void> => { assert.ok(!closed); assertions += 1; return Promise.resolve(); },
    request: async (command): Promise<unknown> => {
      commands.push(command); calls.push(command.heldCachePhase); const reply = await page.run(command);
      if (command.heldCachePhase === "release" && options.lostRelease === true) { throw new Error("release reply lost"); }
      return reply;
    },
  }, { sessionId: "original-parent", uniqueContextId: "original-context", projectUuid: target.projectUuid, branchUuid: target.branchUuid }, ENGINE);
  let retainedRunner = runner;
  let program = stripTypeScriptTypes(await readFile(new URL("../src/current-footprint-copy-held-saved-generation.ts", import.meta.url), "utf8"))
    .replaceAll(/^import[\s\S]*?;\n/gmu, "").replaceAll(/\bexport (?=(?:async )?(?:function|const|class))/gu, "");
  const lazyAnchor = 'await import("./current-footprint-forward-paired-scheduler.ts")';
  assert.equal(program.split(lazyAnchor).length, 2); program = program.replace(lazyAnchor, "await Promise.resolve(syntheticPairedModuleForTest)");
  const scope = createContext({ canonicalJson, compareCompleteClosedSql, readerCompletion, types, currentFootprintCopyV2SavedTarget, currentFootprintCopyV2SavedSqlSource, decodeCurrentFootprintCopyV2NativeResult,
    CurrentFootprintSavedCacheHeldRunner, CurrentFootprintCopyV2SavedReadRunner, syntheticPairedModuleForTest: pairedModule,
    Object, Reflect, Error, Promise, WeakMap, WeakSet, paired, writer,
    requireOriginalCurrentFootprintForwardSavedContinuation(packet: object, owner: object): object { assert.equal(options.forwardV2, true); assert.equal(packet, paired); assert.equal(owner, writer); return Object.freeze({ copyPlan: input.copy, paired }); },
    assertOriginalCurrentFootprintCopyNativeOwner(owner: object): void { assert.ok(owner === allocated || options.forwardV2 !== true && owner === writer); },
    assertOriginalCurrentFootprintForwardExecutionNativeOwner(owner: object): void { assert.equal(options.forwardV2, true); assert.equal(owner, writer); },
    requireOriginalCurrentFootprintForwardSavedProjection(owner: object, projection: object, after: object): void { assert.equal(options.forwardV2, true); assert.equal(owner, writer); assert.equal(projection, input.projection); assert.equal(after, input.after); },
    requireOriginalCurrentFootprintForwardHeldSavedOwner(owner: object, predecessor: object, after: object): void { assert.equal(options.forwardV2, true); assert.equal(owner, allocated); assert.equal(predecessor, writer); assert.equal(after, input.after); },
    assertOriginalCurrentFootprintCopyHeldSavedNativeOwner(owner: object): void { assert.equal(owner, allocated); },
    assertOriginalCurrentFootprintCopyNativeTermination(owner: object, original: object): void {
      assert.equal(owner, allocated); assert.equal(original, token); assert.ok(closed);
    },
    originalCurrentFootprintCopyNativeTermination(owner: object): object { assert.equal(owner, allocated); assert.ok(closed); return token; },
    originalCurrentFootprintCopyNativeTarget(owner: object): unknown {
      assert.ok(owner === allocated || options.forwardV2 !== true && owner === writer); return { target, checkpoint, source: checkpoint.source };
    },
    originalCurrentFootprintForwardExecutionNativeTarget(owner: object): unknown {
      assert.equal(options.forwardV2, true); assert.equal(owner, writer); return { target, checkpoint, source: checkpoint.source };
    },
    currentFootprintForwardHeldSavedAllocationOutcome(owner: object): unknown {
      assert.equal(options.forwardV2, true); assert.equal(owner, writer); return allocated === null ? { status: "no-resource", owner: null } : { status: "retained", owner: allocated };
    },
    requireCurrentFootprintForwardExecutionClosedSnapshot(owner: object, after: object): unknown {
      assert.equal(options.forwardV2, true); assert.equal(owner, writer); assert.equal(after, input.after); return snapshot;
    },
    verifyCurrentFootprintForwardExecutionPosteditPreopenSource(owner: object, after: object): Promise<unknown> {
      assert.equal(options.forwardV2, true); assert.equal(owner, writer); assert.equal(after, input.after); calls.push("forward-postedit-bytes");
      return options.sourceChanged === true ? Promise.reject(new Error("postedit source changed")) : Promise.resolve(Object.freeze({ profile: "private.current-footprint-forward-execution-preopen-source.v1", sourceMatchesClosedPostedit: true }));
    },
    currentFootprintCopyHeldSavedAllocationOutcome(owner: object): unknown {
      assert.equal(owner, writer); return allocated === null ? { status: "no-resource", owner: null } : { status: "retained", owner: allocated };
    },
    requireCurrentFootprintCopyClosedSnapshot(owner: object, after: object): unknown {
      if (owner === allocated) { assert.equal(after, finalInventory); assert.ok(closed); return snapshot; }
      assert.notEqual(options.forwardV2, true); assert.equal(owner, writer); assert.equal(after, input.after); return snapshot;
    },
    async captureCurrentFootprintCopyClosedSnapshot(owner: object, original: object): Promise<unknown> {
      assert.equal(owner, allocated); assert.equal(original, token); assert.ok(closed); calls.push("final-sql");
      finalInventory = options.actualSavedRead === true ? await inventory(input.path) : input.after; return finalInventory;
    },
    verifyCurrentFootprintCopyPosteditPreopenSource(owner: object, after: object): Promise<unknown> {
      assert.equal(owner, writer); assert.equal(after, input.after); calls.push("postedit-bytes");
      return options.sourceChanged === true ? Promise.reject(new Error("postedit source changed")) : Promise.resolve(Object.freeze({ sourceMatchesClosedPostedit: true }));
    },
  });
  class NativeOwner {
    public startFootprintCopyHeldSavedGeneration(): Promise<void> {
      assert.equal(allocated, this); calls.push("launch"); launched = true; return Promise.resolve();
    }
    public retainedFootprintCopyHeldSavedCache(): CurrentFootprintSavedCacheHeldRunner { assert.equal(this, allocated); return retainedRunner; }
    public requireOriginalFootprintCopyHeldSavedCache(original: CurrentFootprintSavedCacheHeldRunner): void {
      assert.equal(this, allocated); assert.equal(original, retainedRunner);
    }
    public prepareFootprintCopyHeldSavedCache(): Promise<void> { assert.equal(this, allocated); return retainedRunner.prepare(); }
    public async observeFirstFootprintCopyHeldSavedCache(): Promise<CurrentFootprintSavedCacheHeldObservation> {
      assert.equal(this, allocated); const packet = await retainedRunner.observeFirst(); firstEntered.resolve(null);
      if (options.pendingFirst === true) { await first.promise; }
      return options.copiedFirst === true ? structuredClone(packet) : packet;
    }
    public async observeFreshFootprintCopyHeldSavedCache(): Promise<CurrentFootprintSavedCacheHeldObservation> {
      assert.equal(this, allocated); const packet = await retainedRunner.observeFresh(); return options.copiedFresh === true ? structuredClone(packet) : packet;
    }
    public releaseFootprintCopyHeldSavedCache(): Promise<void> { assert.equal(this, allocated); return retainedRunner.release(); }
    public async openFootprintCopyHeldSavedProject(projection: unknown, guard: unknown): Promise<unknown> {
      assert.equal(projection, input.projection); calls.push("open-preflight"); scope["openOwner"] = this; scope["guard"] = guard;
      if (options.skipGuard !== true) { await runInContext("revalidateCurrentFootprintCopyHeldSavedOpenGuard(openOwner,guard)", scope); }
      if (options.repeatedGuard === true) { await runInContext("revalidateCurrentFootprintCopyHeldSavedOpenGuard(openOwner,guard)", scope); }
      calls.push("open-dispatch"); if (options.lostOpen === true) { throw new Error("open reply lost"); }
      if (options.actualSavedRead === true) {
        const cache = nativeSavedCache(input, true);
        const transport = Object.freeze({
          assertOriginalState: (state: unknown): Promise<void> => { assert.equal(state, STATE); assert.ok(!closed); return Promise.resolve(); },
          observeState: (): Promise<unknown> => { assert.ok(!closed); return Promise.resolve(stateReply()); },
          readSource: (): Promise<unknown> => { assert.ok(!closed); calls.push("saved-source"); return nativeSavedReply(cache); },
        });
        return Object.freeze({ state: STATE, transport });
      }
      return Object.freeze({ state: Object.freeze({}), transport: Object.freeze({}) });
    }
    public observeApplicationWindow(): Promise<string> { assert.equal(this, allocated); calls.push("window"); return Promise.resolve("1"); }
    public async requestNormalClose(hwnd: string): Promise<void> {
      assert.equal(this, allocated); assert.equal(hwnd, "1");
      const retained = runner.retained();
      if (retained["normalRequests"] !== 0 && retained["releaseAttempted"] === false && retained["pendingCallbacks"] === 0) {
        await runner.release();
      }
      calls.push("close"); closed = true;
    }
    public observeTermination(): Promise<boolean> { assert.equal(this, allocated); calls.push("exit"); return Promise.resolve(closed); }
    public releaseUnlaunched(): Promise<void> {
      assert.equal(this, allocated); assert.equal(launched, false); calls.push("release-unlaunched"); closed = true; released = true; return Promise.resolve();
    }
    public releaseNoProcess(): Promise<void> { assert.equal(this, allocated); throw new Error("synthetic no-process route not used"); }
    public observeFootprintCopyRelease(): "pending" | "released" { assert.equal(this, allocated); return released ? "released" : "pending"; }
    public status(): unknown { return { binding: this === writer ? writerBinding : savedBinding, launchConsumed: launched,
      noProcessCleanupAvailable: false, released, helperClosed: released }; }
    public releaseClosed(): Promise<void> { assert.equal(this, allocated); assert.ok(closed); calls.push("release-native"); released = true; return Promise.resolve(); }
  }
  scope["CurrentFootprintCopyHeldSavedNativeOwner"] = NativeOwner;
  const allocate = (owner: object, after: object): Promise<NativeOwner> => {
    assert.equal(owner, writer); assert.equal(after, input.after); assert.equal(allocated, null); calls.push("allocate");
    if (options.admissionFailed === true) { return Promise.reject(new Error("helper admission failed")); }
    const native = new NativeOwner(); allocated = native;
    return options.allocationFailed === true ? Promise.reject(new Error("allocated owner startup failed")) : Promise.resolve(native);
  };
  scope["startCurrentFootprintCopyHeldSavedNativeOwner"] = (owner: object, after: object): Promise<NativeOwner> => { assert.notEqual(options.forwardV2, true); return allocate(owner, after); };
  scope["startCurrentFootprintForwardHeldSavedNativeOwner"] = (owner: object, after: object): Promise<NativeOwner> => { assert.equal(options.forwardV2, true); return allocate(owner, after); };
  const factory = options.forwardV2 === true ? "createCurrentFootprintForwardHeldSavedExecutionNative" : "createCurrentFootprintCopyHeldSavedExecutionNative";
  const argumentsText = options.forwardV2 === true ? "writer,paired" : "writer";
  const candidate: unknown = runInContext(`${program}\n${factory}(${argumentsText})`, scope);
  const loaded: unknown = types.isPromise(candidate) ? await candidate : candidate;
  assert.ok(loaded !== null && typeof loaded === "object");
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- The maintained module is evaluated with explicitly synthetic native seams in this private test realm.
  const adapter = loaded as CurrentFootprintCopySavedExecutionNative;
  const invoke = (expression: string): unknown => runInContext(expression, scope);
  scope["originalForwardBinding"] = adapter;
  return { adapter, input, calls, commands, runner, page, assertionCount: (): number => assertions,
    observeForward: (): Promise<unknown> => { const result: unknown = invoke("observeCurrentFootprintForwardHeldSavedSource(originalForwardBinding)"); assert.ok(types.isPromise(result)); return result; },
    sealForward: async (): Promise<object> => { const result: unknown = invoke("sealCurrentFootprintForwardSavedCheckpoint(originalForwardBinding)"); assert.ok(types.isPromise(result)); const savedCheckpoint: unknown = await result; assert.ok(savedCheckpoint !== null && typeof savedCheckpoint === "object"); return savedCheckpoint; },
    lookupForward: (savedCheckpoint: unknown): unknown => { scope["forwardCheckpoint"] = savedCheckpoint; return invoke("requireOriginalCurrentFootprintForwardSavedCheckpoint(forwardCheckpoint)"); },
    duplicate: (): unknown => runInContext(`${factory}(${argumentsText})`, scope),
    forgedGuard: (): Promise<unknown> => { scope["openOwner"] = allocated;
      return Promise.resolve(runInContext("revalidateCurrentFootprintCopyHeldSavedOpenGuard(openOwner,{profile:'private.current-footprint-copy-held-saved-open-guard.v1'})", scope)); },
    releaseFirst: (): void => { first.resolve(null); }, firstEntered: firstEntered.promise,
    substituteRunner: (): void => { retainedRunner = new CurrentFootprintSavedCacheHeldRunner({ assertCurrent: (): Promise<void> => Promise.resolve(),
      request: (): Promise<unknown> => Promise.resolve({}) }, { sessionId: "other", uniqueContextId: "other", projectUuid: target.projectUuid, branchUuid: target.branchUuid }, ENGINE); } };
}

/** Exercise the full existing closed owner/SQL/release contract after a refusal. */
async function close(f: Fixture): Promise<void> {
  await f.adapter.close(); await assert.rejects(f.adapter.close(), /CLOSE_CONSUMED/u);
  const exit = await f.adapter.termination(); assert.ok(exit.status === "terminated");
  await f.adapter.requireTermination(exit.original); await f.adapter.snapshot(exit.original); await f.adapter.release(exit.original);
  assert.equal(await f.adapter.observeRelease(exit.original), "released");
}

void test("held saved adapter retains one tuple until the separately timed guard and releases before exact bytes and sole open", async () => {
  const f = await fixture(); assert.equal(f.calls.length, 0); assert.equal(f.adapter.startOutcome(), "not-started");
  assert.throws(f.duplicate, /WRITER_CONSUMED/u); await f.adapter.start(f.input.projection, f.input.after);
  const witness = await f.adapter.excludeReplay(); assert.equal(f.assertionCount(), 19);
  await f.adapter.requireReplayExclusion(witness); await f.adapter.requireReplayExclusion(witness); assert.equal(f.assertionCount(), 19);
  assert.equal(f.page.evaluate("getterCalls"), 1); assert.equal(f.commands.at(-1)?.heldCachePhase, "recheck-first");
  await f.adapter.open(f.input.projection, f.input.after, witness); assert.equal(f.assertionCount(), 26);
  assert.ok(f.calls.indexOf("open-preflight") < f.calls.indexOf("queue-fresh"));
  assert.ok(f.calls.indexOf("recheck-fresh") < f.calls.indexOf("release"));
  assert.ok(f.calls.indexOf("release") < f.calls.indexOf("postedit-bytes"));
  assert.ok(f.calls.indexOf("postedit-bytes") < f.calls.indexOf("open-dispatch"));
  assert.equal(f.page.evaluate("getterCalls"), 1); assert.equal(f.runner.retained()["released"], true);
  assert.equal(f.runner.retained()["nativeQualificationIssued"], false); assert.equal(f.runner.retained()["replayTokenIssued"], false);
  await close(f); assert.equal(f.calls.filter(call => call === "open-dispatch").length, 1);
});

void test("copied and foreign witnesses, forged guards and replaced native-held runners cannot authorize an open", async () => {
  const f = await fixture(), foreign = await fixture();
  await f.adapter.start(f.input.projection, f.input.after); await foreign.adapter.start(foreign.input.projection, foreign.input.after);
  const other = await foreign.adapter.excludeReplay(), witness = await f.adapter.excludeReplay();
  for (const copied of [structuredClone(witness), other]) {
    await assert.rejects(Promise.resolve().then(() => f.adapter.requireReplayExclusion(copied)), /ORIGINAL_REPLAY/u);
  }
  await assert.rejects(f.forgedGuard(), /ORIGINAL_OPEN_GUARD/u);
  f.substituteRunner(); await assert.rejects(f.adapter.open(f.input.projection, f.input.after, witness));
  assert.equal(f.calls.includes("open-preflight"), false); assert.equal(f.commands.some(command => command.heldCachePhase === "queue-fresh"), false);
  await close(foreign);
});

void test("native stage wrappers must return the actual first and fresh runner packets", async () => {
  for (const options of [{ copiedFirst: true }, { copiedFresh: true }]) {
    const f = await fixture(options); await f.adapter.start(f.input.projection, f.input.after);
    if (options.copiedFirst === true) { await assert.rejects(f.adapter.excludeReplay(), /ORIGINAL_PACKET/u); }
    else { const witness = await f.adapter.excludeReplay(); await assert.rejects(f.adapter.open(f.input.projection, f.input.after, witness), /ORIGINAL_PACKET/u); }
    assert.equal(f.calls.includes("open-dispatch"), false); assert.equal(f.calls.includes("postedit-bytes"), false); await close(f);
  }
});

void test("a separately consumed original runner cannot keep its pending witness usable", async () => {
  const f = await fixture(); await f.adapter.start(f.input.projection, f.input.after); const witness = await f.adapter.excludeReplay();
  await f.runner.release();
  await assert.rejects(Promise.resolve().then(() => f.adapter.requireReplayExclusion(witness)), /ORIGINAL_REPLAY_STAGE/u);
  await assert.rejects(f.adapter.open(f.input.projection, f.input.after, witness), /ORIGINAL_REPLAY_STAGE/u);
  assert.equal(f.calls.includes("open-preflight"), false); await close(f);
  assert.equal(f.commands.filter(command => command.heldCachePhase === "release").length, 1);
});

void test("failed original group release and changed source prevent open and never repeat the consumed guard", async () => {
  for (const options of [{ lostRelease: true }, { sourceChanged: true }, { repeatedGuard: true }, { lostOpen: true }]) {
    const f = await fixture(options); await f.adapter.start(f.input.projection, f.input.after); const witness = await f.adapter.excludeReplay();
    await assert.rejects(f.adapter.open(f.input.projection, f.input.after, witness), /release reply lost|postedit source changed|STAGE_CONSUMED|open reply lost/u);
    assert.equal(f.calls.includes("open-dispatch"), options.lostOpen === true);
    if (options.lostRelease === true) { assert.equal(f.calls.includes("postedit-bytes"), false); }
    await assert.rejects(f.adapter.open(f.input.projection, f.input.after, witness), /STAGE_CONSUMED/u);
    assert.equal(f.commands.filter(command => command.heldCachePhase === "release").length, 1); await close(f);
  }
});

void test("a missing native guard cannot promote a native return into a completed saved open", async () => {
  const f = await fixture({ skipGuard: true }); await f.adapter.start(f.input.projection, f.input.after); const witness = await f.adapter.excludeReplay();
  await assert.rejects(f.adapter.open(f.input.projection, f.input.after, witness), /STAGE_CONSUMED/u);
  assert.equal(f.commands.some(command => command.heldCachePhase === "queue-fresh"), false);
  await assert.rejects(f.adapter.excludeReplay(), /STAGE_CONSUMED/u); await close(f);
});

void test("a late first-stage completion after original close cannot issue a witness or reopen the generation", async () => {
  const f = await fixture({ pendingFirst: true }); await f.adapter.start(f.input.projection, f.input.after);
  const exclusion = f.adapter.excludeReplay(); await f.firstEntered; await f.adapter.close(); f.releaseFirst();
  await assert.rejects(exclusion, /STAGE_CONSUMED/u); await assert.rejects(f.adapter.excludeReplay(), /STAGE_CONSUMED/u);
  assert.equal(f.calls.includes("open-preflight"), false); assert.equal(f.commands.some(command => command.heldCachePhase === "queue-fresh"), false);
  const exit = await f.adapter.termination(); assert.ok(exit.status === "terminated"); await f.adapter.release(exit.original);
});

void test("allocation failure retains original cleanup while admission refusal produces no native closure evidence", async () => {
  for (const options of [{ allocationFailed: true }, { admissionFailed: true }]) {
    const f = await fixture(options); await assert.rejects(f.adapter.start(f.input.projection, f.input.after), /startup failed|admission failed/u);
    assert.equal(f.adapter.startOutcome(), options.allocationFailed === true ? "retained" : "no-resource");
    await assert.rejects(f.adapter.start(f.input.projection, f.input.after), /START_CONSUMED/u);
    if (options.allocationFailed === true) { await close(f); assert.ok(f.calls.includes("release-unlaunched")); }
    else { await assert.rejects(f.adapter.close(), /NATIVE_OWNER_NOT_ALLOCATED/u); assert.equal(f.calls.includes("release-unlaunched"), false); }
  }
});

void test("v2 predecessor uses its distinct original snapshot/factory/raw-byte checks through actual held runner and complete cleanup", async () => {
  const f = await fixture({ forwardV2: true });
  await f.adapter.start(f.input.projection, f.input.after); const witness = await f.adapter.excludeReplay();
  await f.adapter.open(f.input.projection, f.input.after, witness);
  assert.equal(f.calls.includes("postedit-bytes"), false); assert.equal(f.calls.filter(call => call === "forward-postedit-bytes").length, 1);
  assert.ok(f.calls.indexOf("release") < f.calls.indexOf("forward-postedit-bytes"));
  assert.ok(f.calls.indexOf("forward-postedit-bytes") < f.calls.indexOf("open-dispatch"));
  await close(f); assert.equal(f.calls.filter(call => call === "open-dispatch").length, 1); await assert.rejects(Promise.resolve().then(f.duplicate), /WRITER_CONSUMED/u);
});
void test("v2 changed postedit bytes retain original cleanup and cannot dispatch or repeat navigation", async () => {
  const f = await fixture({ forwardV2: true, sourceChanged: true });
  await f.adapter.start(f.input.projection, f.input.after); const witness = await f.adapter.excludeReplay();
  await assert.rejects(f.adapter.open(f.input.projection, f.input.after, witness), /source changed/u);
  assert.equal(f.calls.includes("open-dispatch"), false);
  await assert.rejects(f.adapter.open(f.input.projection, f.input.after, witness));
  await close(f); assert.equal(f.calls.includes("open-dispatch"), false);
});

void test("v2 saved checkpoint needs its own original read, independent complete SQL and acknowledged helper release", async () => {
  const f = await fixture({ forwardV2: true, actualSavedRead: true });
  await f.adapter.start(f.input.projection, f.input.after); const witness = await f.adapter.excludeReplay();
  await f.adapter.open(f.input.projection, f.input.after, witness); await assert.rejects(f.sealForward(), /CHECKPOINT_REQUIRED/u);
  const packet = await f.observeForward(); assert.ok(packet !== null && typeof packet === "object");
  assert.equal(Reflect.get(packet, "persistenceVerified"), false); assert.equal(f.calls.filter(value => value === "saved-source").length, 2);
  await assert.rejects(f.observeForward(), /READ_CONSUMED/u); await assert.rejects(f.sealForward(), /CHECKPOINT_REQUIRED/u);
  await close(f); const checkpoint = await f.sealForward(); const data = f.lookupForward(checkpoint);
  assert.ok(data !== null && typeof data === "object"); assert.equal(Reflect.get(data, "savedRead"), packet);
  assert.notEqual(Reflect.get(data, "inventory"), f.input.after); assert.equal(Reflect.get(data, "writerAfter"), f.input.after);
  assert.throws(() => f.lookupForward({ ...checkpoint }), /ORIGINAL_FORWARD_CHECKPOINT/u);
  await assert.rejects(f.sealForward(), /CHECKPOINT_REQUIRED/u);
});

void test("v2 saved selection joins actual paired create clocks to full SQL before allocating any saved helper", async () => {
  const f = await fixture({ forwardV2: true, changedPairedClock: true });
  await assert.rejects(f.adapter.start(f.input.projection, f.input.after), /ORIGINAL_CREATED_SQL_TARGET/u);
  assert.equal(f.calls.includes("allocate"), false); assert.equal(f.adapter.startOutcome(), "no-resource");
});
