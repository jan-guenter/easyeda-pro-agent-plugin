/** Actual managed rich reader with inert JSON fixtures, never a native owner. */
import assert from "node:assert/strict";
import { chmod, opendir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { test } from "node:test";
import { controlDataDirectory } from "../src/artifacts.ts";
import { sha256Json } from "../src/core.ts";
import { assertNoUnresolvedCurrentPcbDiagnosticLaunches, publishCurrentPcbDiagnosticLifecycleRecord,
  readCurrentPcbDiagnosticLifecycles, reserveCurrentPcbDiagnosticLifecycle } from "../src/current-pcb-diagnostic-lifecycle-journal.ts";

void test("rich parse reuse retains fresh bytes, independent records, predecessor checks and refusal order", async context => {
  const createdAt = "2026-11-05T00:00:00.000Z", operationId = "diagnostic-rich-parse";
  await reserveCurrentPcbDiagnosticLifecycle(operationId);
  const intent = { schema: "easyeda-pro-control.pcb-diagnostic-launch-intent.v1" as const, operationId, createdAt,
    facadeSha256: "a".repeat(64), installationSha256: "b".repeat(64), confirmValidationOnly: true as const,
    confirmDiagnosticLaunch: true as const, acceptExistingProfileEffects: true as const };
  await publishCurrentPcbDiagnosticLifecycleRecord(operationId, "intent.json", intent);
  const binding = { schema: "easyeda-pro-control.pcb-diagnostic-launch-binding.v1" as const, operationId, createdAt,
    intentSha256: sha256Json(intent), binding: { helperInstance: "c".repeat(32), jobId: "d".repeat(32), rootPid: 123,
      rootCreated: "123456789012345" }, launchAcknowledged: true };
  await publishCurrentPcbDiagnosticLifecycleRecord(operationId, "binding.json", binding);
  const observation = { schema: "easyeda-pro-control.pcb-diagnostic-observation-intent.v1" as const, operationId, createdAt,
    bindingSha256: sha256Json(binding), stage: "browser" as const };
  await publishCurrentPcbDiagnosticLifecycleRecord(operationId, "browser-intent.json", observation);
  const result = { schema: "easyeda-pro-control.pcb-diagnostic-observation-result.v1" as const, operationId, createdAt,
    intentSha256: sha256Json(observation), stage: "browser" as const, executionAuthorized: false as const,
    result: { nested: { marker: "original" }, edge: 0, payload: "stable-payload" } };
  await publishCurrentPcbDiagnosticLifecycleRecord(operationId, "browser-result.json", result);
  const directory = join(controlDataDirectory(), "pcb-diagnostic-lifecycle-v1", operationId);
  const resultPath = join(directory, "browser-result.json");
  const resultBytes = Buffer.from(`${JSON.stringify(result).replace('"edge":0', '"edge":-0')}\n`);
  await writeFile(resultPath, resultBytes);
  const originalParse = JSON.parse, parsed: string[] = [];
  context.mock.method(JSON, "parse", (input: string): unknown => { parsed.push(input); return originalParse(input) as unknown; });
  const cold = await readCurrentPcbDiagnosticLifecycles(); assert.equal(parsed.length, 4);
  const coldResult = cold[0]?.records["browser-result.json"]; assert.ok(coldResult !== undefined);
  const nested = coldResult.result["nested"]; assert.ok(typeof nested === "object" && nested !== null);
  Reflect.set(nested, "marker", "changed cold result");
  const coldBinding = cold[0]?.records["binding.json"]; assert.ok(coldBinding !== undefined);
  Reflect.set(coldBinding.binding, "rootPid", 456);
  parsed.length = 0;
  const warm = await readCurrentPcbDiagnosticLifecycles(); assert.equal(parsed.length, 0);
  assert.deepEqual(warm[0]?.records["browser-result.json"]?.result["nested"], { marker: "original" });
  assert.equal(warm[0]?.records["binding.json"]?.binding.rootPid, 123);
  assert.ok(Object.is(warm[0]?.records["browser-result.json"]?.result["edge"], -0));
  const warmNested = warm[0]?.records["browser-result.json"]?.result["nested"];
  assert.ok(typeof warmNested === "object" && warmNested !== null); Reflect.set(warmNested, "marker", "changed warm result");
  const independent = await readCurrentPcbDiagnosticLifecycles();
  assert.deepEqual(independent[0]?.records["browser-result.json"]?.result["nested"], { marker: "original" });

  const first = Buffer.from(resultBytes); first[0] = 0x5B;
  await writeFile(resultPath, first); await assert.rejects(readCurrentPcbDiagnosticLifecycles(), SyntaxError);
  await writeFile(resultPath, resultBytes); await readCurrentPcbDiagnosticLifecycles();
  const middle = Buffer.from(resultBytes), offset = middle.indexOf("stable-payload"); assert.ok(offset > 0); middle[offset] = 0x78;
  await writeFile(resultPath, middle); parsed.length = 0;
  const changed = await readCurrentPcbDiagnosticLifecycles();
  assert.equal(changed[0]?.records["browser-result.json"]?.result["payload"], "xtable-payload");
  assert.equal(parsed.length, 1);
  const last = Buffer.from(resultBytes); last[last.length - 1] = 0x20;
  await writeFile(resultPath, last); parsed.length = 0;
  await readCurrentPcbDiagnosticLifecycles(); assert.equal(parsed.length, 1);
  await writeFile(resultPath, resultBytes); await readCurrentPcbDiagnosticLifecycles();

  await writeFile(resultPath, JSON.stringify({ ...result, intentSha256: "f".repeat(64) }));
  await assert.rejects(readCurrentPcbDiagnosticLifecycles(), /OBSERVATION_RESULT_CHAIN/u);
  parsed.length = 0;
  await assert.rejects(readCurrentPcbDiagnosticLifecycles(), /OBSERVATION_RESULT_CHAIN/u); assert.equal(parsed.length, 0);
  await writeFile(resultPath, resultBytes); await readCurrentPcbDiagnosticLifecycles();
  await assert.rejects(assertNoUnresolvedCurrentPcbDiagnosticLaunches(), /UNRESOLVED_LAUNCH/u);
  await chmod(resultPath, 0o644);
  await assert.rejects(readCurrentPcbDiagnosticLifecycles(), /RECORD_AUTHORITY/u); await chmod(resultPath, 0o600);

  // Preserve the actual unsorted record traversal. A first malformed JSON record
  // Must still refuse before a later record's descriptor-authority failure.
  const names: string[] = []; const handle = await opendir(directory);
  for await (const entry of handle) { names.push(entry.name); }
  const earlier = names[0], later = names[1]; assert.ok(earlier !== undefined && later !== undefined);
  const earlierPath = join(directory, earlier), laterPath = join(directory, later);
  const earlierBytes = await readFile(earlierPath);
  await writeFile(earlierPath, "{"); await chmod(laterPath, 0o644);
  await assert.rejects(readCurrentPcbDiagnosticLifecycles(), SyntaxError);
  await writeFile(earlierPath, earlierBytes);
  await assert.rejects(readCurrentPcbDiagnosticLifecycles(), /RECORD_AUTHORITY/u); await chmod(laterPath, 0o600);
  await readCurrentPcbDiagnosticLifecycles();
});
