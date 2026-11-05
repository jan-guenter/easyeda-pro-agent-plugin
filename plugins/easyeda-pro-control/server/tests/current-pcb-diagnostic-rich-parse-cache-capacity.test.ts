/** More managed records than the private memo's entry cap, without native work. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { publishCurrentPcbDiagnosticLifecycleRecord, readCurrentPcbDiagnosticLifecycles,
  reserveCurrentPcbDiagnosticLifecycle } from "../src/current-pcb-diagnostic-lifecycle-journal.ts";

void test("a full rich parse memo preserves resident entries and repeatedly parses declined entries", async context => {
  for (let index = 0; index < 513; index += 1) {
    const operationId = `diagnostic-rich-capacity-${String(index).padStart(3, "0")}`;
    await reserveCurrentPcbDiagnosticLifecycle(operationId);
    await publishCurrentPcbDiagnosticLifecycleRecord(operationId, "intent.json", {
      schema: "easyeda-pro-control.pcb-diagnostic-launch-intent.v1", operationId, createdAt: "2026-11-05T00:00:00.000Z",
      facadeSha256: "a".repeat(64), installationSha256: "b".repeat(64), confirmValidationOnly: true,
      confirmDiagnosticLaunch: true, acceptExistingProfileEffects: true,
    });
  }
  const originalParse = JSON.parse, parsed: string[] = [];
  context.mock.method(JSON, "parse", (input: string): unknown => { parsed.push(input); return originalParse(input) as unknown; });
  const operations = await readCurrentPcbDiagnosticLifecycles();
  assert.equal(operations.length, 513); assert.equal(parsed.length, 513);
  parsed.length = 0;
  await readCurrentPcbDiagnosticLifecycles(); assert.equal(parsed.length, 1);
  assert.match(parsed[0] ?? "", /diagnostic-rich-capacity-512/u);
  parsed.length = 0;
  await readCurrentPcbDiagnosticLifecycles(); assert.equal(parsed.length, 1);
  assert.match(parsed[0] ?? "", /diagnostic-rich-capacity-512/u);
});
