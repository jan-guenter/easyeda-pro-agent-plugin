/** Actual continuation with two test-only issuer import substitutions. These
 * checks exercise lifetime ordering, not native authority or source admission. */
/* oxlint-disable eslint/max-classes-per-file -- Two test-only issuer imports are substituted while the actual coordinator executes without a production injection seam. */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { test } from "node:test";
import { runInThisContext } from "node:vm";
import { transform } from "esbuild";
import { CURRENT_PCB_209_STARTUP_EMPTY_REQUEST_COUNT, captureCurrentPcb209EmptyNativeReply } from "../src/current-pcb-209-worker-startup-empty-session.ts";
import type { CurrentPcb209EmptyNativeCommand, CurrentPcb209EmptyNativeDependency } from "../src/current-pcb-209-worker-startup-empty-session.ts";
import { CURRENT_PCB_209_COMMON_BASELINE_OBJECT_GROUP } from "../src/current-pcb-209-common-baseline-runner.ts";
import type { CurrentPcb209EmptyBaselineSessionInput } from "../src/current-pcb-209-empty-baseline-session.ts";
import { CURRENT_PCB_209_EMPTY_ROOT_OBJECT_GROUP } from "../src/current-pcb-209-empty-root-runner.ts";
// oxlint-disable-next-line import/max-dependencies -- Exercise the actual coordinator, fixed command literals, completed SQL reader and two explicit issuer substitutes together.
import { CURRENT_PCB_209_COMMON_METADATA_FUNCTION } from "../src/current-pcb-209-common-program.ts";
import { fixture } from "./helpers/symbol-sql-fixture.ts";

const sourcePath = new URL("../src/current-pcb-209-worker-startup-empty-session.ts", import.meta.url);
const actualRequire = createRequire(sourcePath);
const textCommand = { commonPhase: "metadata", method: "Runtime.callFunctionOn", params: {
  objectId: "scope", functionDeclaration: CURRENT_PCB_209_COMMON_METADATA_FUNCTION, returnByValue: true,
  arguments: [{ objectId: "wrapper" }], throwOnSideEffect: true, silent: true, awaitPromise: false,
  generatePreview: false, userGesture: false,
} } as const;
async function setup(loss: "none" | "after-reply" | "final" | "checkpoint" = "none"): Promise<{
  call: (name: string, ...args: unknown[]) => Promise<unknown>;
  state: { native: number; owners: number; identityReads: number; current: boolean; releases: number };
  replaceOwnerMethod: () => void;
}> {
  const base = await fixture();
  const before = base.before, state = { native: 0, owners: 0, identityReads: 0, current: true, releases: 0 };
  const model = Object.freeze({ sessionId: "parent", scriptId: "pcb", uniqueContextId: "pcb-context" });
  const packet = Object.freeze({ openingObservation: { projectUuid: "a".repeat(32), branchUuid: "b".repeat(32), documentUuid: "c".repeat(16) } });
  const proof = Object.freeze({ model, before });
  const dependency: CurrentPcb209EmptyNativeDependency = Object.freeze({ parentTargetId: "parent", parentSessionId: "parent",
    assertOriginalOwner: (): Promise<void> => { state.owners += 1; assert.ok(state.current, "owner lost"); return Promise.resolve(); },
    assertOriginalTermination: (): Promise<void> => Promise.resolve(), subscribe: (): (() => void) => (): void => undefined,
    request: (command: CurrentPcb209EmptyNativeCommand): Promise<unknown> => {
      state.native += 1; assert.equal(command.sessionId, model.sessionId);
      if (command.method === "Runtime.releaseObjectGroup") { state.releases += 1; return Promise.resolve({}); }
      assert.equal(command.method, "Runtime.callFunctionOn");
      if (loss === "after-reply") { state.current = false; }
      return Promise.resolve({ result: { type: "string", value: "x".repeat(100_000) } });
    },
  });
  class Pcb {
    readonly #proof = proof;
    #assertions = 0;
    public assertOriginalDependencyCurrent(input: unknown, owner: unknown): typeof proof {
      this.#assertions += 1;
      assert.equal(input, packet); assert.equal(owner, dependency); assert.ok(state.current, "owner lost");
      return loss === "checkpoint" && this.#assertions > 1 ? Object.freeze({ model, before: structuredClone(before) }) : this.#proof;
    }
    public requireOriginalDependency(input: unknown, owner: unknown): Promise<typeof proof> {
      state.identityReads += 1;
      if (loss === "final" && state.identityReads === 2) { state.current = false; }
      return Promise.resolve(this.assertOriginalDependencyCurrent(input, owner));
    }
  }
  const baselinePacket = Object.freeze({ synthetic: true });
  class Baseline {
    readonly #input: CurrentPcb209EmptyBaselineSessionInput;
    public constructor(input: CurrentPcb209EmptyBaselineSessionInput) {
      this.#input = input; assert.equal(input.before, before); assert.equal(input.scriptId, model.scriptId);
      assert.equal(input.uniqueContextId, model.uniqueContextId); assert.deepEqual(input.identity, packet.openingObservation);
    }
    public async observeAndJoin(): Promise<typeof baselinePacket> {
      try { const result: unknown = await this.#input.transport.request(textCommand); assert.notEqual(result, null); this.#input.transport.assertCurrent(); }
      finally {
        await this.#input.transport.request({ method: "Runtime.releaseObjectGroup", rootPhase: "release", params: { objectGroup: CURRENT_PCB_209_EMPTY_ROOT_OBJECT_GROUP } });
        await this.#input.transport.request({ method: "Runtime.releaseObjectGroup", commonPhase: "release", params: { objectGroup: CURRENT_PCB_209_COMMON_BASELINE_OBJECT_GROUP } });
      }
      return baselinePacket;
    }
    public requireOriginal(input: unknown): void { assert.equal(input, baselinePacket); this.#input.transport.assertCurrent(); }
    public status(): Readonly<Record<string, unknown>> { return Object.freeze({ synthetic: true, scriptId: this.#input.scriptId }); }
  }
  const transformed = await transform(await readFile(sourcePath, "utf8"), { loader: "ts", format: "cjs", target: "node24" });
  const program = transformed.code;
  const loaded: { exports: Record<string, unknown> } = { exports: {} };
  const load = (name: string): unknown => {
    if (name === "./current-pcb-209-worker-startup-pcb-session.ts") { return { CurrentPcb209WorkerStartupPcbSession: Pcb }; }
    if (name === "./current-pcb-209-empty-baseline-session.ts") { return { CurrentPcb209EmptyBaselineSession: Baseline, CURRENT_PCB_209_EMPTY_BASELINE_REQUEST_COUNT: 3099 }; }
    return actualRequire(name) as unknown;
  };
  const evaluate: unknown = runInThisContext(`(function(require,module,exports){${program}\n})`); assert.ok(typeof evaluate === "function");
  Reflect.apply(evaluate, undefined, [load, loaded, loaded.exports]);
  const Constructor = loaded.exports["CurrentPcb209WorkerStartupEmptySession"]; assert.ok(typeof Constructor === "function");
  const pcb = new Pcb(), session: unknown = Reflect.construct(Constructor, [{ pcb, packet, dependency }]);
  assert.ok(session !== null && typeof session === "object");
  return { state, replaceOwnerMethod: (): void => { Object.defineProperty(pcb, "requireOriginalDependency", { value: (): Promise<unknown> => Promise.resolve(model) }); },
    call: async (name, ...args): Promise<unknown> => {
      const method: unknown = Reflect.get(session, name); assert.ok(typeof method === "function");
      const result: unknown = Reflect.apply(method, session, args); return await result;
    } };
}
void test("private continuation retains issuers and binds derived model to the same native dependency", async () => {
  const value = await setup();
  const packet = await value.call("observeAndJoin");
  assert.equal(value.state.native, 3); assert.equal(value.state.owners, 2); assert.equal(value.state.identityReads, 2);
  assert.ok(packet !== null && typeof packet === "object" && "completeLiveBaselineVerified" in packet);
  assert.equal(packet.completeLiveBaselineVerified, false);
  await value.call("requireOriginal", packet);
  await assert.rejects(value.call("requireOriginal", structuredClone(packet)), /ORIGINAL_PACKET/u);
  await assert.rejects(value.call("observeAndJoin"), /CONSUMED/u);
});
void test("lost owner preserves original cleanup without publishing or reviving a baseline", async () => {
  for (const loss of ["after-reply", "final"] as const) {
    const value = await setup(loss); await assert.rejects(value.call("observeAndJoin"), /owner lost/u);
    assert.equal(value.state.releases, 2); value.state.current = true;
    await assert.rejects(value.call("observeAndJoin"), /CONSUMED/u);
    const status = await value.call("status"); assert.ok(status !== null && typeof status === "object" && "packetRetained" in status);
    assert.equal(status.packetRetained, false);
  }
});
void test("replaced original method refuses before reader or native dispatch", async () => {
  const value = await setup(); value.replaceOwnerMethod();
  await assert.rejects(value.call("observeAndJoin"), /ORIGINAL_METHODS/u);
  assert.equal(value.state.native, 0); assert.equal(value.state.identityReads, 0);
});
void test("replacement of the PCB session's original completed SQL reader refuses before native dispatch", async () => {
  const value = await setup("checkpoint");
  await assert.rejects(value.call("observeAndJoin"), /ORIGINAL_CHECKPOINT/u);
  assert.equal(value.state.native, 0); assert.equal(value.state.identityReads, 0);
});
void test("large common replies retain exact text before owner checks and reject hooks", () => {
  const raw = { result: { type: "string", value: "x".repeat(524_288) } };
  const value = captureCurrentPcb209EmptyNativeReply(textCommand, raw); raw.result.value = "changed";
  assert.deepEqual(value, { result: { type: "string", value: "x".repeat(524_288) } });
  assert.throws(() => captureCurrentPcb209EmptyNativeReply(textCommand, { result: { type: "string", value: "x".repeat(524_289) } }), /TEXT_REPLY/u);
  let hooks = 0;
  assert.throws(() => captureCurrentPcb209EmptyNativeReply(textCommand, { get result(): never { hooks += 1; throw new Error("hook"); } }), /INPUT_DATA/u);
  assert.equal(hooks, 0); assert.equal(CURRENT_PCB_209_STARTUP_EMPTY_REQUEST_COUNT, 3101);
});
