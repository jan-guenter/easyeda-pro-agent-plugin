/** Historical frame-read and current captured-tuple formats stay distinct. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { currentSelectedFileMainSqlStartupDiagnosticSchema as historical } from "../src/current-selected-file-main-sql-startup-diagnostic.ts";
import { currentSelectedFileMainSqlStartupDiagnosticV2Schema as live, currentSelectedFileMainSqlStartupDiagnosticRecordSchema as record } from "../src/current-selected-file-main-sql-startup-diagnostic-v2.ts";

const v1 = { profile: "private.selected-file-main-sql-startup-diagnostic.v1", site: "run", refusal: "profile-not-recognized", originalPhase: "sql-fence-startup-select",
  frameState: "captured", diagnosticRequests: 2, summary: { slotKinds: ["object", "string", "array", "object", "object"], pathKind: "not-applicable", sqlKind: "delete" },
  sourceQualified: true, originalFailureRetained: true, predicateBranchVerified: false, resumeAuthorized: false, executionAuthorized: false, saveAuthorized: false };
const v2 = { ...v1, profile: "private.selected-file-main-sql-startup-diagnostic.v2", frameOrigin: "captured-original-tuple", diagnosticRequests: 1 };

void test("historical v1 requires its original two captured requests while live v2 requires one property request", () => {
  assert.deepEqual(historical.parse(v1), v1); assert.deepEqual(live.parse(v2), v2);
  assert.deepEqual(record.parse(v1), v1); assert.deepEqual(record.parse(v2), v2);
  assert.throws(() => historical.parse({ ...v1, diagnosticRequests: 1 }));
  assert.throws(() => live.parse({ ...v2, diagnosticRequests: 2 }));
  assert.throws(() => record.parse({ ...v1, diagnosticRequests: 1 }));
  assert.throws(() => record.parse({ ...v2, diagnosticRequests: 2 }));
});

void test("tuple refusal stays explicit and mixed, unknown, contradictory or authority-bearing fields refuse", () => {
  assert.equal(live.parse({ ...v2, frameState: "tuple-refused", diagnosticRequests: 0, summary: null }).frameState, "tuple-refused");
  assert.equal(live.parse({ ...v2, frameState: "properties-refused", summary: null }).frameState, "properties-refused");
  for (const changed of [
    { ...v1, frameOrigin: "captured-original-tuple" }, { ...v2, frameOrigin: "evaluated-frame" },
    { ...v2, frameState: "frame-refused", summary: null }, { ...v2, frameState: "not-read" },
    { ...v2, frameState: "tuple-refused", summary: null }, { ...v2, diagnosticRequests: 0 },
    { ...v2, summary: { ...v2.summary, slotKinds: ["object"] } }, { ...v2, sql: "private SQL" },
    { ...v2, executionAuthorized: true }, { ...v2, sourceQualified: false }, { ...v2, site: "unknown" },
  ]) { assert.throws(() => record.parse(changed)); }
  const { frameOrigin: omitted, ...withoutOrigin } = v2; assert.equal(omitted, "captured-original-tuple");
  assert.throws(() => live.parse(withoutOrigin));
});
