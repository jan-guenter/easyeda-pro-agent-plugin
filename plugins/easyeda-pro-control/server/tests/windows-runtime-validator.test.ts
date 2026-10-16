import assert from "node:assert/strict";
import { test } from "node:test";
import { WindowsControlRuntime } from "../src/windows-runtime.ts";
import { assertWindowsRuntimeValidator, createWindowsRuntimeValidator } from "../src/windows-runtime-validator.ts";
import { INPUT } from "./helpers/windows-closed-session-fixture.ts";

void test("index runtime validator construction stays lazy and never accepts an unissued lookalike", () => {
  let reads = 0;
  const validator = createWindowsRuntimeValidator(() => { reads += 1; throw new Error("synthetic owner not allocated"); });
  assert.equal(reads, 0); assert.equal(Object.isFrozen(validator), true);
  assert.throws(() => validator.capture(INPUT), /owner not allocated/u); assert.equal(reads, 1);
});

void test("original forwarding binding checks selected runtime and method identities without creating native authority", (context) => {
  const runtime = new WindowsControlRuntime({ upstream: { callTool: (): Promise<never> => Promise.reject(new Error("No live call permitted")),
    currentAuthenticatedBridgeDispatchBinding: (): never => { throw new Error("No live binding permitted"); },
    bridgeSessionLifecycle: (): never => { throw new Error("No live lifecycle permitted"); } },
    pluginRoot: "/opt/synthetic-control", assetsRoot: "/mnt/c/Synthetic/resources/app/assets", wslDistribution: "SyntheticReview",
    reviewedExecutionScopeSha256: "a".repeat(64) });
  const validator = createWindowsRuntimeValidator(() => runtime);
  assert.throws(() => { assertWindowsRuntimeValidator(validator, runtime); }, /original issued runtime binding/u);
  // Dispatch attempts bind only the selected JavaScript receiver; the actual
  // Runtime still refuses because no native process or authority was created.
  assert.throws(() => validator.capture(INPUT));
  assertWindowsRuntimeValidator(validator, runtime);
  assert.throws(() => { assertWindowsRuntimeValidator({ ...validator }, runtime); }, /original issued runtime binding/u);
  context.mock.method(runtime, "capture", () => { throw new Error("Replacement must never run"); });
  assert.throws(() => { assertWindowsRuntimeValidator(validator, runtime); }, /methods changed/u);
  assert.throws(() => validator.capture(INPUT), /methods changed/u);
  assert.equal(runtime.status().state, "not-launched");
});
