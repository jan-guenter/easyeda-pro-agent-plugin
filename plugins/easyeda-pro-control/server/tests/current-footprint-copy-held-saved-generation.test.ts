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
import type { CurrentFootprintCopySavedExecutionNative } from "../src/current-footprint-copy-execution-runtime.ts";
import { currentFootprintCopyV2SavedTarget } from "../src/current-footprint-copy-v2-saved-source.ts";
import { CURRENT_FOOTPRINT_SAVED_CACHE_HELD_ENGINE as ENGINE } from "../src/current-footprint-saved-cache-held-profile.ts";
import type { CurrentFootprintSavedCacheHeldCommand } from "../src/current-footprint-saved-cache-held-protocol.ts";
import { CurrentFootprintSavedCacheHeldRunner } from "../src/current-footprint-saved-cache-held-runner.ts";
import type { CurrentFootprintSavedCacheHeldObservation } from "../src/current-footprint-saved-cache-held-runner.ts";
import { createHeldCacheSyntheticPage } from "./helpers/current-footprint-saved-cache-held-fixture.ts";
import { savedFixture } from "./helpers/current-footprint-copy-v2-saved-fixture.ts";

interface Options {
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
}

/** Execute the actual adapter in a private realm with explicit synthetic native
 * seams. The real held runner executes its fixed programs and packet checks. */
async function fixture(options: Options = {}): Promise<Fixture> {
  const input = await savedFixture(), target = currentFootprintCopyV2SavedTarget(input.projection);
  const calls: string[] = [], commands: CurrentFootprintSavedCacheHeldCommand[] = [], page = createHeldCacheSyntheticPage();
  const checkpoint = Object.freeze({ source: "/synthetic-held.eprj2" }), snapshot = Object.freeze({ checkpoint });
  const token = Object.freeze({}), writer = Object.freeze({});
  const writerBinding = Object.freeze({ jobId: "writer", helperInstance: "writer-helper" });
  const savedBinding = Object.freeze({ jobId: "held-saved", helperInstance: "held-saved-helper" });
  const first = Promise.withResolvers<null>(), firstEntered = Promise.withResolvers<null>();
  let allocated: object | null = null, assertions = 0, closed = false, launched = false, released = false;
  const runner = new CurrentFootprintSavedCacheHeldRunner({
    assertCurrent: (): Promise<void> => { assert.ok(!closed); assertions += 1; return Promise.resolve(); },
    request: async (command): Promise<unknown> => {
      commands.push(command); calls.push(command.heldCachePhase); const reply = await page.run(command);
      if (command.heldCachePhase === "release" && options.lostRelease === true) { throw new Error("release reply lost"); }
      return reply;
    },
  }, { sessionId: "original-parent", uniqueContextId: "original-context", projectUuid: target.projectUuid, branchUuid: target.branchUuid }, ENGINE);
  let retainedRunner = runner;
  const program = stripTypeScriptTypes(await readFile(new URL("../src/current-footprint-copy-held-saved-generation.ts", import.meta.url), "utf8"))
    .replaceAll(/^import[\s\S]*?;\n/gmu, "").replaceAll(/\bexport (?=(?:async )?(?:function|const|class))/gu, "");
  const scope = createContext({ canonicalJson, types, currentFootprintCopyV2SavedTarget, CurrentFootprintSavedCacheHeldRunner,
    Object, Reflect, Error, Promise, WeakMap, WeakSet, writer,
    assertOriginalCurrentFootprintCopyNativeOwner(owner: object): void { assert.ok(owner === writer || owner === allocated); },
    assertOriginalCurrentFootprintCopyHeldSavedNativeOwner(owner: object): void { assert.equal(owner, allocated); },
    assertOriginalCurrentFootprintCopyNativeTermination(owner: object, original: object): void {
      assert.equal(owner, allocated); assert.equal(original, token); assert.ok(closed);
    },
    originalCurrentFootprintCopyNativeTermination(owner: object): object { assert.equal(owner, allocated); assert.ok(closed); return token; },
    originalCurrentFootprintCopyNativeTarget(owner: object): unknown {
      assert.ok(owner === writer || owner === allocated); return { target, checkpoint, source: checkpoint.source };
    },
    currentFootprintCopyHeldSavedAllocationOutcome(owner: object): unknown {
      assert.equal(owner, writer); return allocated === null ? { status: "no-resource", owner: null } : { status: "retained", owner: allocated };
    },
    requireCurrentFootprintCopyClosedSnapshot(owner: object, after: object): unknown {
      assert.equal(owner, writer); assert.equal(after, input.after); return snapshot;
    },
    captureCurrentFootprintCopyClosedSnapshot(owner: object, original: object): Promise<unknown> {
      assert.equal(owner, allocated); assert.equal(original, token); assert.ok(closed); calls.push("final-sql"); return Promise.resolve(input.after);
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
  scope["startCurrentFootprintCopyHeldSavedNativeOwner"] = (owner: object, after: object): Promise<NativeOwner> => {
    assert.equal(owner, writer); assert.equal(after, input.after); assert.equal(allocated, null); calls.push("allocate");
    if (options.admissionFailed === true) { return Promise.reject(new Error("helper admission failed")); }
    const native = new NativeOwner(); allocated = native;
    return options.allocationFailed === true ? Promise.reject(new Error("allocated owner startup failed")) : Promise.resolve(native);
  };
  const loaded: unknown = runInContext(`${program}\ncreateCurrentFootprintCopyHeldSavedExecutionNative(writer)`, scope);
  assert.ok(loaded !== null && typeof loaded === "object");
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- The maintained module is evaluated with explicitly synthetic native seams in this private test realm.
  const adapter = loaded as CurrentFootprintCopySavedExecutionNative;
  return { adapter, input, calls, commands, runner, page, assertionCount: (): number => assertions,
    duplicate: (): unknown => runInContext("createCurrentFootprintCopyHeldSavedExecutionNative(writer)", scope),
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
