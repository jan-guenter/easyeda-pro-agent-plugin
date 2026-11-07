/** The new cold graph cannot replace a released graph role or loader. */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { currentFootprintForwardNativeOutputs as releasedOutputs } from "../src/current-footprint-forward-native-graph-source.ts";
import { currentFootprintForwardColdNativeOutputs as coldOutputs } from "../src/current-footprint-forward-cold-native-graph-source.ts";
import { CURRENT_FOOTPRINT_FORWARD_NATIVE_GRAPH as RELEASED } from "../src/current-footprint-forward-native-graph-pins.ts";
import { CURRENT_FOOTPRINT_FORWARD_COLD_NATIVE_GRAPH as COLD } from "../src/current-footprint-forward-cold-native-graph-pins.ts";
import { captureCurrentFootprintForwardNativeGraph as releasedCapture } from "../src/current-footprint-forward-native-graph.ts";
import { captureCurrentFootprintForwardColdNativeGraph as coldCapture } from "../src/current-footprint-forward-cold-native-graph.ts";

void test("released outputs stay byte-exact and cold roles/pins use independent paths", async () => {
  const helper = await readFile(new URL("../../scripts/pcb-diagnostic-owner.ps1", import.meta.url), "utf8");
  const cold = coldOutputs(helper), old = releasedOutputs(helper);
  assert.deepEqual(old.map(row => row.sha256), ["3be2c39e827bc554b193c4d01df50a1289a357c8044b3ef2545523c341fac7ea",
    "7c940543bf2ede0ea1c026d7804f3ab97dad36d71320894fe026fbeb52984656", "f70a5207436f132f780ebbffddae05cf5c05019d4ef10d204c9eec517d595368"]);
  for (const [rows, pin] of [[old, RELEASED], [cold, COLD]] as const) {
    assert.deepEqual(rows.map(({ source: _source, ...value }) => value), pin.files);
    for (const row of rows) { assert.equal(await readFile(new URL(`../../${row.relativePath}`, import.meta.url), "utf8"), row.source); }
  }
  assert.ok(cold.every(row => row.relativePath.startsWith("scripts/footprint-forward-cold-execution/")));
  assert.ok(old.every(row => !row.relativePath.includes("cold")));
  const actual = await coldCapture("Synthetic", "a".repeat(32)), historical = await releasedCapture("Synthetic", "b".repeat(32));
  await actual.verify(); await historical.verify();
  assert.ok(actual.bootstrap.includes(COLD.files[2]?.sha256 ?? "missing-cold-pin"));
  assert.ok(!actual.bootstrap.includes(RELEASED.files[2]?.sha256 ?? "missing-released-pin"));
  assert.ok(historical.bootstrap.includes(RELEASED.files[2]?.sha256 ?? "missing-released-pin"));
});
