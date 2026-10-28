/** Synthetic original-owner failure paths. No native execution mount, CAD
 * copy, complete positive lifecycle or connected durability is claimed. */
import assert from "node:assert/strict";
import process from "node:process";
import { test } from "node:test";
import type { CurrentFootprintCopyExecutionNative } from "../src/current-footprint-copy-execution-runtime.ts";

function fixture(options: Readonly<{ lostClose?: boolean; lostRelease?: boolean; pendingRelease?: boolean }> = {}): Readonly<{
  native: CurrentFootprintCopyExecutionNative;
  counts: { assert: number; create: number; close: number; snapshot: number; release: number; observeRelease: number };
}> {
  const counts = { assert: 0, create: 0, close: 0, snapshot: 0, release: 0, observeRelease: 0 };
  const terminated = Object.freeze({});
  const native: CurrentFootprintCopyExecutionNative = Object.freeze({
    generation: Object.freeze({ profile: "private.current-footprint-copy-execution-generation.v1",
      purpose: "worker-startup-footprint-copy209", operationId: "footprint-copy-synthetic", bindingSha256: "a".repeat(64) }),
    nativeGeneration: Object.freeze({}),
    assertOwned: (): void => { counts.assert += 1; },
    qualify: () => Promise.reject(new Error("qualification unavailable")),
    requireQualification: () => Promise.reject(new Error("no original qualification")),
    publish: () => Promise.resolve(),
    create: () => { counts.create += 1; return Promise.reject(new Error("create must not execute")); },
    close: () => { counts.close += 1; return options.lostClose === true ? Promise.reject(new Error("close reply lost")) : Promise.resolve({ closed: false }); },
    termination: () => Promise.resolve({ status: "terminated", original: terminated } as const),
    requireTermination: (original: object) => { assert.equal(original, terminated); return Promise.resolve(); },
    snapshot: (original: object) => { assert.equal(original, terminated); counts.snapshot += 1; return Promise.reject(new Error("snapshot unavailable")); },
    verifyClockClosure: () => Promise.reject(new Error("no original clocks")),
    release: (original: object) => {
      assert.equal(original, terminated); counts.release += 1;
      return options.lostRelease === true ? Promise.reject(new Error("release reply lost")) : Promise.resolve();
    },
    observeRelease: (original: object): Promise<"pending" | "released"> => {
      assert.equal(original, terminated); counts.observeRelease += 1;
      return Promise.resolve(options.pendingRelease === true && counts.observeRelease === 1 ? "pending" : "released");
    },
    verification: () => { throw new Error("verification must not allocate"); },
  });
  return { native, counts };
}

void test("private copy coordinator preserves cleanup after rejected work", async context => {
  // Capture a deterministic monotonic clock before the module binds it. The
  // Test isolation preload gives this file its own process and control roots.
  let now = 0n;
  context.mock.method(process.hrtime, "bigint", (): bigint => now);
  const { CurrentFootprintCopyExecutionCoordinator: Coordinator, CurrentFootprintCopyExecutionOwner: Owner } =
    await import("../src/current-footprint-copy-execution-runtime.ts");

  await context.test("copied owner and accessor contract never acquire authority", () => {
    const { native, counts } = fixture(); const owner = new Owner(native);
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Deliberately forge the public prototype without original private fields/registry membership.
    const forged = Object.create(Owner.prototype) as InstanceType<typeof Owner>;
    assert.throws(() => new Coordinator(forged), /ORIGINAL_OWNER/u);
    const runner = new Coordinator(owner); assert.equal(runner.status().nativeExecutionMounted, false);
    assert.throws(() => new Coordinator(owner), /ORIGINAL_OWNER/u);
    let getters = 0;
    const accessor = Object.freeze({ ...native, get assertOwned(): () => void { getters += 1; throw new Error("getter called"); } });
    assert.throws(() => new Owner(accessor), /ORIGINAL_FIELDS/u); assert.equal(getters, 0);
    assert.equal(counts.create, 0); assert.equal(counts.close, 0);
  });

  await context.test("failed closed SQL reader still offers original release", async () => {
    const { native, counts } = fixture(); const runner = new Coordinator(new Owner(native));
    await assert.rejects(runner.advance({ expectedPhase: "prepare" }), /qualification unavailable/u);
    await runner.advance({ expectedPhase: "close-writer" });
    await assert.rejects(runner.advance({ expectedPhase: "observe-writer-exit" }), /snapshot unavailable/u);
    assert.equal(runner.status().phase, "release-writer"); assert.equal(runner.status().writerGenerationClosed, true);
    assert.equal(runner.status().writerReleased, false); assert.equal(runner.status().cleanupPending, true);
    await runner.advance({ expectedPhase: "release-writer" });
    assert.equal(runner.status().phase, "failed-closed"); assert.equal(runner.status().writerReleased, true);
    assert.equal(runner.status().cleanupPending, false); assert.equal(counts.create, 0); assert.equal(counts.snapshot, 1);
    assert.equal(counts.close, 1); assert.equal(counts.release, 1);
  });

  await context.test("lost close and release acknowledgments never repeat commands", async () => {
    const { native, counts } = fixture({ lostClose: true, lostRelease: true, pendingRelease: true });
    const runner = new Coordinator(new Owner(native));
    await assert.rejects(runner.advance({ expectedPhase: "prepare" }), /qualification unavailable/u);
    await assert.rejects(runner.advance({ expectedPhase: "close-writer" }), /close reply lost/u);
    await assert.rejects(runner.advance({ expectedPhase: "close-writer" }), /PHASE_CONSUMED/u);
    await assert.rejects(runner.advance({ expectedPhase: "observe-writer-exit" }), /snapshot unavailable/u);
    await assert.rejects(runner.advance({ expectedPhase: "release-writer" }), (error: unknown): boolean =>
      error instanceof AggregateError && error.errors.some((item: unknown) => item instanceof Error && item.message === "release reply lost"));
    assert.equal(runner.status().phase, "release-writer"); assert.equal(runner.status().writerReleased, false);
    await runner.advance({ expectedPhase: "release-writer" });
    assert.equal(runner.status().phase, "release-writer"); assert.equal(runner.status().cleanupPending, true);
    await runner.advance({ expectedPhase: "release-writer" });
    assert.equal(runner.status().phase, "failed-closed"); assert.equal(counts.release, 1);
    assert.equal(counts.observeRelease, 2); assert.equal(counts.close, 1); assert.equal(counts.create, 0);
    assert.equal(runner.status().failureCount, 4);
  });

  await context.test("expired work deadline still permits close, exit and release", async () => {
    const { native, counts } = fixture(); const runner = new Coordinator(new Owner(native));
    now = 3_600_001_000_000n;
    await assert.rejects(runner.advance({ expectedPhase: "prepare" }), /LIFETIME/u);
    assert.equal(runner.status().phase, "close-writer");
    await runner.advance({ expectedPhase: "close-writer" });
    await assert.rejects(runner.advance({ expectedPhase: "observe-writer-exit" }), /snapshot unavailable/u);
    await runner.advance({ expectedPhase: "release-writer" });
    assert.equal(runner.status().phase, "failed-closed"); assert.equal(counts.create, 0);
    assert.equal(counts.close, 1); assert.equal(counts.release, 1); now = 0n;
  });
});
