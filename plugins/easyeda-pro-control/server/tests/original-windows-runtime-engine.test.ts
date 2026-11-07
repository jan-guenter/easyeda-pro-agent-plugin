import assert from "node:assert/strict";
import test from "node:test";
import { createOriginalWindowsRuntimeEngine } from "../src/original-windows-runtime-engine.ts";
import { WindowsControlRuntime } from "../src/windows-runtime.ts";
import { assertWindowsRuntimeValidator, createWindowsRuntimeValidator } from "../src/windows-runtime-validator.ts";
import { INPUT } from "./helpers/windows-closed-session-fixture.ts";

void test("a new ordinary workflow gets its own permanent binding while the earlier validator still rejects replacement", async () => {
  let nativeCalls = 0;
  const upstream = {
    callTool(): Promise<never> { nativeCalls += 1; return Promise.reject(new Error("No native call permitted")); },
    currentAuthenticatedBridgeDispatchBinding(): never { throw new Error("No live binding permitted"); },
    bridgeSessionLifecycle(): never { throw new Error("No live lifecycle permitted"); },
  };
  const options = { upstream, pluginRoot: "/opt/synthetic-control", assetsRoot: "/mnt/c/Synthetic/resources/app/assets", wslDistribution: "SyntheticReview",
    reviewedExecutionScopeSha256: "a".repeat(64) };
  const importer = new WindowsControlRuntime(options), reader = new WindowsControlRuntime(options);
  let selected = importer;
  const earlier = createWindowsRuntimeValidator(() => selected);
  assert.throws(() => earlier.capture(INPUT)); assertWindowsRuntimeValidator(earlier, importer);
  selected = reader;
  assert.throws(() => earlier.capture(INPUT), /runtime owner or methods changed/u);

  const engine = createOriginalWindowsRuntimeEngine(upstream, reader, () => {
    assert.equal(selected, reader, "The original index must still select its exact reader runtime");
  });
  await engine.controlFingerprintPromise;
  const validator = engine.executionAuthorityValidator; assert.ok(validator !== undefined);
  assert.throws(() => validator.capture(INPUT)); assertWindowsRuntimeValidator(validator, reader);
  assert.throws(() => { assertWindowsRuntimeValidator(validator, importer); }, /original issued runtime binding/u);
  selected = importer;
  assert.throws(() => validator.capture(INPUT), /original index/u);
  assert.equal(nativeCalls, 0); assert.equal(importer.status().state, "not-launched"); assert.equal(reader.status().state, "not-launched");
});
