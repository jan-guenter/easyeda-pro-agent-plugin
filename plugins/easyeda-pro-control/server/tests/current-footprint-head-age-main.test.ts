/** Real local V8 functions and finite synthetic Windows comparisons only.
 * No original EasyEDA inspector, native Job, source or writer is admitted. */
import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { Session } from "node:inspector/promises";
import process from "node:process";
import { test } from "node:test";
import { promisify } from "node:util";
import { CURRENT_FOOTPRINT_HEAD_AGE_DATE_METHODS, captureCurrentFootprintHeadAgeReply, decodeCurrentFootprintHeadAgeNativeMethod } from "../src/current-footprint-head-age-main.ts";
import { compareCurrentFootprintHeadAgeObservation } from "../src/current-footprint-head-age-observation.ts";
import type { CurrentFootprintHeadAgeNativeBinding } from "../src/current-footprint-head-age-observation.ts";
import type { CurrentFootprintHeadAgeSqlHead } from "../src/current-footprint-head-age-sql.ts";
import { footprintHeadAgeMainFixture } from "./helpers/footprint-head-age-main-fixture.ts";

void test("all ten actual local V8 Date methods match the fixed native zero-scope profile", async () => {
  const session = new Session(); session.connect();
  try {
    for (const name of CURRENT_FOOTPRINT_HEAD_AGE_DATE_METHODS) {
      const result = await session.post("Runtime.evaluate", { expression: `Date.prototype.${name}` }); assert.ok(result.result.objectId !== undefined);
      const properties = await session.post("Runtime.getProperties", { objectId: result.result.objectId, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false });
      decodeCurrentFootprintHeadAgeNativeMethod(properties, name);
      assert.throws(() =>{  decodeCurrentFootprintHeadAgeNativeMethod(properties, name === "getTime" ? "getDate" : "getTime"); });
    }
  } finally { session.disconnect(); }
});

// oxlint-disable-next-line typescript/strict-void-return -- Node returns a ChildProcess while promisify consumes its completion callback.
const execute = promisify(execFile);
const binding: CurrentFootprintHeadAgeNativeBinding = Object.freeze({ helperInstance: "a".repeat(32), jobId: "b".repeat(32), rootPid: 123, rootCreated: "123456789012345" });
const epochTicks = 621_355_968_000_000_000n;
/** Create explicit synthetic UTC/QPC samples with a positive one-microsecond
 * collection interval and the supplied Windows-sign local offset. */
function clock(ms: number, phase: "before" | "after", offset: number): unknown {
  const ticks = epochTicks + BigInt(ms) * 10_000n; const qpc = BigInt(ms) * 1000n;
  return { schema: "easyeda-pro-control.footprint-head-age-clock.v1", phase, sequence: phase === "before" ? 1 : 2, binding,
    clock: { tzAbsent: true, reason: null, sample: { schema: "easyeda-pro-control.windows-clock-sample.v1", utcBeforeTicks: String(ticks), utcAfterTicks: String(ticks + 10n),
      qpcBefore: String(qpc), qpcAfter: String(qpc + 1n), qpcFrequency: "1000000", highResolution: true, localOffsetMinutes: offset, zoneRulesSha256: "c".repeat(64) } } };
}
void test("the exact parser and two full scans join to a finite synthetic window without minting provenance", () => {
  const literal = "2020-01-15 12:34:56", main = footprintHeadAgeMainFixture(literal);
  assert.equal(main.controls.scanBefore.offsets.length, 1681); assert.equal(main.controls.scanAfter.offsets.length, 1681);
  assert.equal(main.parsedBeforeMs, main.parsedAfterMs);
  const head: CurrentFootprintHeadAgeSqlHead = { profile: "private.current-footprint-head-age-sql.v1", projectUuid: "d".repeat(64), branchUuid: "e".repeat(32), ownerUuid: "f".repeat(32), historyUuid: "a".repeat(32), createdAtLiteral: literal,
    checkpointSha256: "b".repeat(64), logicalSha256: "c".repeat(64), lockState: "unlocked", ageVerified: false, executionAuthorized: false };
  const offset = main.controls.controlsBefore.clockBefore.offsetMinutes, windowsOffset = offset === 0 ? 0 : -offset;
  const before = clock(main.scope.referenceUtcMs - 5, "before", windowsOffset); const after = clock(main.controls.controlsAfter.clockAfter.epochMs + 5, "after", windowsOffset);
  const result = compareCurrentFootprintHeadAgeObservation("footprint-head-age-synthetic-01", head, binding, main, before, after);
  assert.ok(result.minimumObservedAgeMs >= 61_000); assert.equal(result.nativeDateProvenanceVerified, false); assert.equal(result.appClockDirectlyObserved, false);
  assert.equal(result.executionAuthorized, false); assert.equal(result.preselectedWriterIntervalProven, false);
  const altered = structuredClone(main); assert.throws(() => compareCurrentFootprintHeadAgeObservation("synthetic", head, { ...binding, rootPid: 456 }, altered, before, after));
});
void test("seasonal offsets preserve actual vendor rl interpretation rather than relabeling it as UTC creation time", async () => {
  const fixture = new URL("helpers/footprint-head-age-main-fixture.ts", import.meta.url).href;
  const code = `import {footprintHeadAgeMainFixture} from ${JSON.stringify(fixture)};const current=new Date().getTimezoneOffset();const literal=current===-60?'2020-07-15 12:34:56':'2020-01-15 12:34:56';const m=footprintHeadAgeMainFixture(literal);console.log(JSON.stringify({historical:m.controls.controlsBefore.sql[0].offsetMinutes,current:m.controls.controlsBefore.clockBefore.offsetMinutes,parsed:m.parsedBeforeMs,wall:Date.parse(literal.replace(' ','T')+'Z')}));`;
  const child = await execute(process.execPath, ["--input-type=module", "-e", code], { env: { ...process.env, TZ: "Europe/Berlin" }, timeout: 10_000, maxBuffer: 65_536 });
  const value: unknown = JSON.parse(child.stdout); assert.ok(value !== null && typeof value === "object" && "historical" in value && "current" in value && "parsed" in value && "wall" in value);
  assert.equal(typeof value.historical, "number"); assert.equal(typeof value.current, "number"); assert.equal(typeof value.parsed, "number"); assert.equal(typeof value.wall, "number");
  assert.notEqual(value.historical, value.current);
  assert.equal(Number(value.parsed) - Number(value.wall), (Number(value.historical) - Number(value.current)) * 60_000);
});
void test("the scan-specific copier accepts its exact array bound while refusing hooks, aliases and oversized data", () => {
  const input = { offsets: Array.from({ length: 1681 }, () => -60) }, result = captureCurrentFootprintHeadAgeReply(input);
  assert.deepEqual(result.value, input); assert.ok(Object.isFrozen(result.value));
  let called = 0;
  assert.throws(() => captureCurrentFootprintHeadAgeReply({ get data(): number { called += 1; return 1; } })); assert.equal(called, 0);
  assert.throws(() => captureCurrentFootprintHeadAgeReply(new Proxy({}, { ownKeys(): never { throw new Error("must not invoke"); } })));
  assert.throws(() => captureCurrentFootprintHeadAgeReply({ offsets: Array.from({ length: 2049 }, () => 0) }));
  const shared = {}; assert.throws(() => captureCurrentFootprintHeadAgeReply({ first: shared, second: shared }));
});
