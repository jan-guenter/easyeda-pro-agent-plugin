import assert from "node:assert/strict";
import { access } from "node:fs/promises";
import { join } from "node:path";
import { test } from "node:test";
import { fixture } from "./closed-symbol-coordinator-fixture.ts";
import { ClosedSymbolCoordinator } from "../../src/closed-symbol-coordinator.ts";
import { operationPath } from "../../src/artifacts.ts";

for (const bytes of [262_143, 262_144]) {
  void test(`coordinator fingerprint ${bytes} JSON bytes includes trailing newline in its artifact limit`, async (context) => {
    const f = await fixture(context), fingerprint = structuredClone(f.identity);
    fingerprint["syntheticPadding"] = "";
    const length = Buffer.byteLength(JSON.stringify(fingerprint));
    assert.ok(length < bytes);
    fingerprint["syntheticPadding"] = "x".repeat(bytes - length);
    assert.equal(Buffer.byteLength(JSON.stringify(fingerprint)), bytes);
    const create = (): ClosedSymbolCoordinator => new ClosedSymbolCoordinator(f.engine, f.upstream, f.runtime, f.ui, f.machine, fingerprint);
    if (bytes === 262_144) { assert.throws(create, /artifact bound/u); }
    else { assert.doesNotThrow(create); }
    assert.equal(f.events.includes("launch"), false);
  });
}

void test("coordinator retains oversized window observation but refuses before its auxiliary publication or close", async (context) => {
  const f = await fixture(context);
  f.state.windows = [{ handle: "12345", pid: 100, owner: "0", className: "Chrome_WidgetWin_1", minimized: false, title: "x".repeat(262_144) }];
  await assert.rejects(f.stage.recordBaseline(f.plan), /owned-window artifact exceeds/u);
  const retained = f.stage.retained();
  const operationId = retained["operationId"];
  assert.ok(typeof operationId === "string");
  assert.ok(retained["windowObservation"] !== undefined); assert.equal(retained["windowArtifact"], undefined);
  const artifact = join(operationPath(operationId).slice(0, -5), "00-baseline-owned-window.json");
  await assert.rejects(access(artifact), { code: "ENOENT" });
  assert.equal(f.events.filter((event) => event === "launch").length, 1);
  assert.equal(f.events.filter((event) => event === "normal-close").length, 0);
});
