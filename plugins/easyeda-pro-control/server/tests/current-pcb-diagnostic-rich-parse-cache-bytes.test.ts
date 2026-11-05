/** Managed records exceed the memo's byte budget before its entry budget. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { sha256Json } from "../src/core.ts";
import { publishCurrentPcbDiagnosticLifecycleRecord, readCurrentPcbDiagnosticLifecycles,
  reserveCurrentPcbDiagnosticLifecycle } from "../src/current-pcb-diagnostic-lifecycle-journal.ts";

void test("rich parse byte saturation declines large records without churning earlier residents", async context => {
  for (let index = 0; index < 40; index += 1) {
    const createdAt = "2026-11-05T00:00:00.000Z", operationId = `diagnostic-rich-bytes-${String(index).padStart(2, "0")}`;
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
    await publishCurrentPcbDiagnosticLifecycleRecord(operationId, "browser-result.json", {
      schema: "easyeda-pro-control.pcb-diagnostic-observation-result.v1", operationId, createdAt,
      intentSha256: sha256Json(observation), stage: "browser", executionAuthorized: false, result: { payload: "x".repeat(120 * 1024) },
    });
  }
  const originalParse = JSON.parse, parsed: string[] = [];
  context.mock.method(JSON, "parse", (input: string): unknown => { parsed.push(input); return originalParse(input) as unknown; });
  const operations = await readCurrentPcbDiagnosticLifecycles();
  assert.equal(operations.length, 40); assert.equal(parsed.length, 160);
  parsed.length = 0; await readCurrentPcbDiagnosticLifecycles();
  const declined = [...parsed]; assert.ok(declined.length > 0 && declined.length < 40);
  assert.ok(declined.every(input => input.includes('"payload":') && !input.includes("diagnostic-rich-bytes-00")));
  parsed.length = 0; await readCurrentPcbDiagnosticLifecycles(); assert.deepEqual(parsed, declined);
});
