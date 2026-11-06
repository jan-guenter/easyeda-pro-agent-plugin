/* oxlint-disable import/max-dependencies -- The original capture's independent native-only seam, fixed generated SQL fixture and actual FD/artifact pipeline are verified together. */
/** Complete actual Linux FD/byte/SQL pipeline with an explicit original-native
 * closure seam. No Windows owner, app, worker, Save or native exit is supplied. */
import assert from "node:assert/strict";
import { createHash, randomUUID } from "node:crypto";
import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { join, win32 } from "node:path";
import { test } from "node:test";
import { runInThisContext } from "node:vm";
import { transform } from "esbuild";
import type { CurrentPcbViaWriteClosedCapture, CurrentPcbViaWriteClosedSnapshot } from "../src/current-pcb-via-write-closed-snapshot.ts";
import { qualifyGeneratedFixtureInitialSql } from "../src/managed-fixture-initial-sql.ts";
import { managedFixtureInitialSqlFixture } from "./helpers/managed-fixture-initial-sql.ts";
import { syntheticSqlRoot } from "./helpers/sqlite-inventory-fixture.ts";

async function fixture(): Promise<Readonly<{ capture: CurrentPcbViaWriteClosedCapture; source: string;
  requireSnapshot: (value: CurrentPcbViaWriteClosedSnapshot) => unknown; copyRefused: () => void }>> {
  const input = await managedFixtureInitialSqlFixture(), qualification = await qualifyGeneratedFixtureInitialSql(input);
  const directory = join(syntheticSqlRoot(), `CodexEasyedaFixture_${randomUUID().replaceAll("-", "")}`); await mkdir(directory);
  const path = join(directory, win32.basename(input.rawWindowsPath)); await copyFile(input.syntheticDatabasePath, path);
  const owner = Object.freeze({ explicitSyntheticNativeOwner: true }), prepared = Object.freeze({ qualification: qualification.qualification }), termination = Object.freeze({ explicitSyntheticNativeClosure: true }); const plan = Object.freeze({ explicitOriginalPlanSeam: true });
  const url = new URL("../src/current-pcb-via-write-closed-snapshot.ts", import.meta.url); const sourceRequire = createRequire(url);
  const compiled = await transform(await readFile(url, "utf8"), { loader: "ts", format: "cjs", target: "node24", logLevel: "silent" });
  const loaded: { exports: Record<string, unknown> } = { exports: {} }; const evaluate: unknown = runInThisContext(`(function(require,module,exports){${compiled.code}\n})`); assert.ok(typeof evaluate === "function");
  Reflect.apply(evaluate, undefined, [(name: string): unknown => {
    const actual: unknown = sourceRequire(name); assert.ok(actual !== null && typeof actual === "object");
    if (name === "./current-pcb-via-write-plan.ts") { return { ...actual, requireOriginalCurrentPcbViaWritePlan: (value: unknown): object => { assert.equal(value,plan);return {prepared}; } }; }
    if (name === "./core.ts") { return { ...actual, normalizeEasyedaProjectPath: (raw: string): string => { assert.equal(raw, input.rawWindowsPath); return path; } }; }
    if (name === "./current-pcb-via-write-owner.ts") { return { ...actual,
      assertOriginalCurrentPcbViaWriteOwner: (value: unknown): void => { assert.equal(value, owner); },
      assertOriginalCurrentPcbViaWriteTermination: (value: unknown, closed: unknown): void => { assert.equal(value, owner); assert.equal(closed, termination); },
      originalCurrentPcbViaWriteTarget: (value: unknown): object => { assert.equal(value, owner); return prepared; } }; }
    return actual;
  }, loaded, loaded.exports]);
  const Constructor = loaded.exports["CurrentPcbViaWriteClosedCapture"], requireSnapshot = loaded.exports["requireOriginalCurrentPcbViaWriteClosedSnapshot"];
  assert.ok(typeof Constructor === "function" && typeof requireSnapshot === "function");
  assert.throws(() => Reflect.construct(Constructor, [owner, termination, {...plan}]));
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Exact production private-field class with explicit synthetic native-only issuer seam; actual filesystem/SQL code is unchanged.
  const capture = Reflect.construct(Constructor, [owner, termination, plan]) as CurrentPcbViaWriteClosedCapture;
  return { capture, source: path, requireSnapshot: (value: CurrentPcbViaWriteClosedSnapshot): unknown => Reflect.apply(requireSnapshot, undefined, [value, owner, plan]),
    copyRefused: (): void => { assert.throws(() => Reflect.construct(Constructor, [{ ...owner }, termination, plan])); } };
}
void test("original Via closed capture retains complete bytes/SQL/raw history and only its issued snapshot after all FD closes", async () => {
  const f = await fixture(); f.copyRefused(); const snapshot = await f.capture.capture();
  assert.equal(snapshot.completeSqlInventoryCaptured, true); assert.equal(snapshot.persistenceVerified, false); assert.equal(snapshot.completeSqlEffectsAccepted, false);
  assert.equal(f.capture.isReleaseAcknowledged(), true); await f.capture.settleRelease(); assert.notEqual(f.requireSnapshot(snapshot), undefined);
  assert.throws(() => { f.requireSnapshot(structuredClone(snapshot)); }, /ORIGINAL_SNAPSHOT/u); assert.throws(() => f.capture.capture(), /COPY_CANNOT_REPEAT/u);
  assert.equal(createHash("sha256").update(await readFile(f.source)).digest("hex"), snapshot.sourceSha256);
  const report = snapshot.report;
  for (const name of ["snapshot", "sql", "rawHistory"]) {
    const attachment = report[name]; assert.ok(attachment !== null && typeof attachment === "object" && "path" in attachment && "sha256" in attachment && typeof attachment.path === "string");
    const bytes = await readFile(attachment.path); assert.equal(createHash("sha256").update(bytes).digest("hex"), attachment.sha256);
    if (name === "rawHistory") { assert.match(bytes.toString("utf8"), /PCB/u); assert.match(bytes.toString("utf8"), /PCB1/u); }
  }
});
void test("a closed sidecar refuses the entire original copy while acknowledging every partly acquired descriptor", async () => {
  const f = await fixture(); await writeFile(`${f.source}-wal`, "synthetic sidecar"); await assert.rejects(f.capture.capture(), /SOURCE_OR_ROSTER_CHANGED/u);
  assert.equal(f.capture.isReleaseAcknowledged(), true); await f.capture.settleRelease(); assert.equal(f.capture.status()["settled"], true);
  assert.deepEqual(f.capture.status()["attachments"], []); assert.throws(() => f.capture.capture(), /COPY_CANNOT_REPEAT/u);
});
