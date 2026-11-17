/** Deterministic generated role/custody regression; no helper/native owner. */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { currentProjectSaveProducerNativeCases } from "../src/current-project-save-producer-protocol.ts";
import { currentProjectSaveProducerGuardCases } from "../src/current-project-save-producer-guard-protocol.ts";
import { currentFootprintForwardWriterNativeOutputs, currentFootprintForwardWriterNativePins } from "../src/current-footprint-forward-writer-native-source.ts";
import { captureCurrentFootprintForwardWriterNativeGraph } from "../src/current-footprint-forward-writer-native-graph.ts";
import { CURRENT_FOOTPRINT_FORWARD_WRITER_NATIVE_GRAPH as GRAPH } from "../src/current-footprint-forward-writer-native-pins.ts";
import { CURRENT_FOOTPRINT_FORWARD_WRITER_NATIVE_GRAPH_LIMITS as LIMITS } from "../src/current-footprint-forward-writer-native-limits.ts";

void test("six exact generated roles fit distinct startup/sync limits and keep original cleanup plus fixed producer routes", async () => {
  const baseline = await readFile(new URL("../../scripts/native-baseline/shared-owner.ps1.txt", import.meta.url), "utf8");
  const outputs = currentFootprintForwardWriterNativeOutputs(baseline);
  assert.deepEqual(outputs.map(({ source: _source, ...row }) => row), GRAPH.files);
  assert.equal(outputs.reduce((sum, row) => sum + row.bytes, 0), GRAPH.aggregateBytes);
  assert.ok(GRAPH.aggregateBytes <= LIMITS.aggregate);
  assert.ok(outputs.filter(row => row.role !== "driver").reduce((sum, row) => sum + row.bytes, 4) <= LIMITS.compiled);
  assert.equal(currentFootprintForwardWriterNativePins(outputs), await readFile(new URL("../src/current-footprint-forward-writer-native-pins.ts", import.meta.url), "utf8"));
  const driver = outputs[0]?.source ?? "", producer = outputs[3]?.source ?? "";
  for (const action of ["combined-abort", "release-no-process", "main-close-detach", "footprint-forward-producer-observe"]) { assert.ok(driver.includes(`        '${action}' {`)); }
  assert.equal(driver.includes("        'capture-window' {"), false);
  assert.equal(driver.includes("        'string-clock' {"), false);
  assert.equal(new Set<string>([...currentProjectSaveProducerNativeCases(), ...currentProjectSaveProducerGuardCases("script")].map(command => command.method)).has("Debugger.resume"), false);
  assert.ok(producer.includes("forwardWriterProducerEnrolled"));
  const core = outputs[1]?.source ?? "", startup = outputs[4]?.source ?? "";
  assert.ok(startup.includes("EasyedaSelectedFileMainSqlFenceProtocol"));
  assert.ok(startup.includes("stockMainStage!=10&&stockMainStage!=13"));
  assert.ok(core.includes('phase=="sql-fence-startup-user-read-owner"'));
  assert.ok(core.includes("mainRequest-(forwardWriterBirth?stockMainRequests:0)"));
  assert.equal(outputs[5]?.source.includes("ForwardWriterHistoryMessage"), true);
  assert.equal(outputs[5]?.source.includes("forwardWriterHistoryStep<ordinal*13"), true);
  const graph = await captureCurrentFootprintForwardWriterNativeGraph("archlinux", "a".repeat(32));
  await graph.verify(); assert.ok(Buffer.from(graph.bootstrap, "utf16le").toString("base64").length <= 16_000);
  assert.ok(graph.bootstrap.includes("-WorkerStartupFootprintForwardWriter209"));
  assert.ok(graph.bootstrap.includes("$forwardWriterStartupBytes=$b4"));
  assert.ok(graph.bootstrap.includes("$forwardWriterSyncBytes=$b5"));
  await assert.rejects(captureCurrentFootprintForwardWriterNativeGraph("archlinux", "foreign"));
});
