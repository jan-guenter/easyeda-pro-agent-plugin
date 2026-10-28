/** Maintained saved-generation code with private synthetic native-owner seams.
 * These tests establish sequencing/refusal, not connected launch or durability. */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { stripTypeScriptTypes } from "node:module";
import { test } from "node:test";
import { createContext, runInContext } from "node:vm";
import { createCurrentFootprintCopySavedExecutionNative } from "../src/current-footprint-copy-saved-generation.ts";
import type { CurrentFootprintCopyNativeOwner } from "../src/current-pcb-diagnostic-owner.ts";
import { canonicalJson } from "../src/core.ts";
import type { CurrentFootprintCopySavedExecutionNative } from "../src/current-footprint-copy-execution-runtime.ts";
import { currentFootprintCopyV2SavedTarget } from "../src/current-footprint-copy-v2-saved-source.ts";
// oxlint-disable-next-line import/max-dependencies -- The synthetic owner drives the maintained adapter against a real completed SQL projection and strict cache decoder.
import { captureCurrentPcbStringClockReply } from "../src/current-pcb-string-clock-reply.ts";
import { CURRENT_UPLOAD_QUEUE_PROFILE, validateCurrentUploadQueueReadResult } from "../src/current-upload-queue-read.ts";
import { savedFixture } from "./helpers/current-footprint-copy-v2-saved-fixture.ts";

async function fixture(options: Readonly<{ secondQueuePresent?: boolean; sourceChanged?: boolean; lostOpen?: boolean }> = {}): Promise<{
  adapter: CurrentFootprintCopySavedExecutionNative; input: Awaited<ReturnType<typeof savedFixture>>;
  calls: string[]; forgedGuard: () => Promise<void>;
}> {
  const input = await savedFixture(), target = currentFootprintCopyV2SavedTarget(input.projection);
  const calls: string[] = [], checkpoint = Object.freeze({ source: "/synthetic.eprj2" }), token = Object.freeze({}), writer = Object.freeze({});
  const snapshot = Object.freeze({ checkpoint }), writerBinding = Object.freeze({ jobId: "writer", helperInstance: "writer-helper" });
  const savedBinding = Object.freeze({ jobId: "saved", helperInstance: "saved-helper" });
  let allocated: object | null = null, closed = false, launched = false, queues = 0, released = false;
  const program = stripTypeScriptTypes(await readFile(new URL("../src/current-footprint-copy-saved-generation.ts", import.meta.url), "utf8"))
    .replaceAll(/^import[\s\S]*?;\n/gmu, "").replaceAll(/\bexport (?=(?:async )?(?:function|const|class))/gu, "");
  const scope = createContext({ canonicalJson, currentFootprintCopyV2SavedTarget, captureCurrentPcbStringClockReply,
    validateCurrentUploadQueueReadResult: (value: unknown, expected: unknown): unknown =>
      validateCurrentUploadQueueReadResult(value, structuredClone(expected)), Object, Reflect, Error, Promise, WeakMap, writer,
    assertOriginalCurrentFootprintCopyNativeOwner(owner: object): void { assert.ok(owner === writer || owner === allocated); },
    assertOriginalCurrentFootprintCopyNativeTermination(owner: object, original: object): void { assert.equal(owner, allocated); assert.equal(original, token); assert.ok(closed); },
    originalCurrentFootprintCopyNativeTermination(owner: object): object { assert.equal(owner, allocated); assert.ok(closed); return token; },
    originalCurrentFootprintCopyNativeTarget(owner: object): unknown { assert.ok(owner === writer || owner === allocated); return { target,
      checkpoint, source: checkpoint.source }; },
    requireCurrentFootprintCopyClosedSnapshot(owner: object, after: object): unknown { assert.equal(owner, writer); assert.equal(after, input.after); return snapshot; },
    captureCurrentFootprintCopyClosedSnapshot(owner: object, original: object): Promise<unknown> {
      assert.equal(owner, allocated); assert.equal(original, token); assert.ok(closed); calls.push("final-sql"); return Promise.resolve(input.after);
    },
    verifyCurrentFootprintCopyPosteditPreopenSource(owner: object, after: object): Promise<void> {
      assert.equal(owner, writer); assert.equal(after, input.after); calls.push("postedit-bytes");
      return options.sourceChanged === true ? Promise.reject(new Error("source changed")) : Promise.resolve();
    },
  });
  class NativeOwner {
    public startFootprintCopySavedGeneration(): Promise<void> { assert.equal(allocated, this); calls.push("launch"); launched = true; return Promise.resolve(); }
    public observeFootprintCopyUploadQueue(): Promise<unknown> { assert.equal(this, allocated);
      assert.ok(launched && !closed); queues += 1; calls.push(`queue-${queues}`);
      if (queues === 2 && options.secondQueuePresent === true) { return Promise.reject(new Error("upload cache present")); }
      return Promise.resolve({ profile: CURRENT_UPLOAD_QUEUE_PROFILE, projectUuid: target.projectUuid,
        branchUuid: target.branchUuid, origin: "https://client", projectV6UploadAbsent: true, localProjectV1UploadAbsent: true,
        scope: "point-in-time-inactive-target", startupQualified: false, persistenceVerified: false, writerAuthority: false, executionAuthorized: false });
    }
    public async openFootprintCopySavedProject(projection: unknown, guard: unknown): Promise<unknown> {
      assert.equal(projection, input.projection); calls.push("open-preflight");
      scope["openOwner"] = this; scope["guard"] = guard;
      await runInContext("revalidateCurrentFootprintCopySavedOpenGuard(openOwner,guard)", scope);
      calls.push("open-dispatch"); if (options.lostOpen === true) { throw new Error("open reply lost"); }
      return Object.freeze({ state: Object.freeze({}), transport: Object.freeze({}) });
    }
    public observeApplicationWindow(): Promise<string> { assert.equal(this, allocated); calls.push("window"); return Promise.resolve("1"); }
    public requestNormalClose(hwnd: string): Promise<void> { assert.equal(this, allocated); assert.equal(hwnd, "1"); calls.push("close"); closed = true; return Promise.resolve(); }
    public observeTermination(): Promise<boolean> { assert.equal(this, allocated); calls.push("exit"); return Promise.resolve(closed); }
    public releaseUnlaunched(): Promise<never> { assert.equal(this, allocated); return Promise.reject(new Error("No unlaunched cleanup in this fixture")); }
    public releaseNoProcess(): Promise<never> { assert.equal(this, allocated); return Promise.reject(new Error("No no-process cleanup in this fixture")); }
    public observeFootprintCopyRelease(): "pending" | "released" { assert.equal(this, allocated); return released ? "released" : "pending"; }
    public status(): unknown { return { binding: this === writer ? writerBinding : savedBinding, launchConsumed: launched, noProcessCleanupAvailable: false, released, helperClosed: released }; }
    public releaseClosed(): Promise<void> { assert.equal(this, allocated); assert.ok(closed); calls.push("release"); released = true; return Promise.resolve(); }
  }
  scope["CurrentFootprintCopySavedNativeOwner"] = NativeOwner;
  scope["startCurrentFootprintCopySavedNativeOwner"] = (owner: object, after: object): Promise<NativeOwner> => {
    assert.equal(owner, writer); assert.equal(after, input.after); assert.equal(allocated, null); calls.push("allocate");
    const native = new NativeOwner(); allocated = native; return Promise.resolve(native);
  };
  const loaded: unknown = runInContext(`${program}\ncreateCurrentFootprintCopySavedExecutionNative(writer)`, scope);
  assert.ok(loaded !== null && typeof loaded === "object");
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Maintained code runs in a private realm with the explicit synthetic native-owner seam above.
  const adapter = loaded as CurrentFootprintCopySavedExecutionNative;
  return { adapter, input, calls, forgedGuard: (): Promise<void> => {
    scope["openOwner"] = allocated;
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- The fixed invocation evaluates only the maintained async guard in this synthetic realm.
    return runInContext("revalidateCurrentFootprintCopySavedOpenGuard(openOwner,{profile:'private.current-footprint-copy-saved-open-guard.v1'})", scope) as Promise<void>;
  } };
}

void test("saved generation allocates before launch and brackets its sole open with two cache probes and exact bytes", async () => {
  const f = await fixture(); assert.deepEqual(f.calls, []);
  await f.adapter.start(f.input.projection, f.input.after); assert.deepEqual(f.calls, ["allocate", "launch"]);
  const replay = await f.adapter.excludeReplay(); await f.adapter.requireReplayExclusion(replay);
  await assert.rejects(Promise.resolve().then(() => f.adapter.requireReplayExclusion(structuredClone(replay))), /ORIGINAL_REPLAY/u);
  await assert.rejects(f.forgedGuard(), /ORIGINAL_OPEN_GUARD/u);
  await f.adapter.open(f.input.projection, f.input.after, replay);
  assert.deepEqual(f.calls, ["allocate", "launch", "queue-1", "open-preflight", "queue-2", "postedit-bytes", "open-dispatch"]);
  await assert.rejects(f.adapter.open(f.input.projection, f.input.after, replay), /ORIGINAL_REPLAY/u);
  await f.adapter.close(); const exit = await f.adapter.termination(); assert.equal(exit.status, "terminated");
  assert.ok(exit.status === "terminated"); await f.adapter.requireTermination(exit.original);
  await f.adapter.snapshot(exit.original); await f.adapter.release(exit.original);
  assert.equal(await f.adapter.observeRelease(exit.original), "released");
  assert.deepEqual(f.calls.slice(-5), ["window", "close", "exit", "final-sql", "release"]);
});

void test("saved generation blocks opening on the second cache probe or changed post-edit bytes and still closes once", async () => {
  for (const options of [{ secondQueuePresent: true }, { sourceChanged: true }, { lostOpen: true }]) {
    const f = await fixture(options); await f.adapter.start(f.input.projection, f.input.after);
    const replay = await f.adapter.excludeReplay();
    await assert.rejects(f.adapter.open(f.input.projection, f.input.after, replay), /upload cache present|source changed|open reply lost/u);
    assert.equal(f.calls.includes("open-dispatch"), "lostOpen" in options);
    await assert.rejects(f.adapter.open(f.input.projection, f.input.after, replay), /ORIGINAL_REPLAY/u);
    await f.adapter.close(); await assert.rejects(f.adapter.close(), /CLOSE_CONSUMED/u);
    assert.equal(f.calls.filter(value => value === "close").length, 1);
    const exit = await f.adapter.termination(); assert.ok(exit.status === "terminated");
    await f.adapter.release(exit.original); assert.equal(await f.adapter.observeRelease(exit.original), "released");
  }
});

void test("saved native allocation refuses data-only owners before any launch or file access", () => {
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Deliberate JSON/prototype forgery against the actual production factory boundary.
  const fake = Object.freeze({}) as CurrentFootprintCopyNativeOwner;
  assert.throws(() => createCurrentFootprintCopySavedExecutionNative(fake), /FOOTPRINT_ORIGINAL_OWNER/u);
});
