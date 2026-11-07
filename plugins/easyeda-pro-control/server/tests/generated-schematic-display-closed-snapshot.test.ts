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
import type { GeneratedSchematicDisplayClosedCapture, GeneratedSchematicDisplayClosedSnapshot } from "../src/generated-schematic-display-closed-snapshot.ts";
import { qualifyGeneratedSchematicFixtureInitialSql } from "../src/managed-schematic-fixture-initial-sql.ts";
import { managedSchematicFixtureInitialSqlFixture } from "./helpers/managed-schematic-fixture-initial-sql.ts";
import { syntheticSqlRoot } from "./helpers/sqlite-inventory-fixture.ts";

async function fixture(): Promise<Readonly<{ capture: GeneratedSchematicDisplayClosedCapture; source: string;
  requireSnapshot: (value: GeneratedSchematicDisplayClosedSnapshot) => unknown; copyRefused: () => void }>> {
  const input = await managedSchematicFixtureInitialSqlFixture(), qualification = await qualifyGeneratedSchematicFixtureInitialSql(input);
  const directory = join(syntheticSqlRoot(), `CodexEasyedaFixture_${randomUUID().replaceAll("-", "")}`); await mkdir(directory);
  const path = join(directory, win32.basename(input.rawWindowsPath)); await copyFile(input.syntheticDatabasePath, path);
  const owner = Object.freeze({ explicitSyntheticNativeOwner: true }), prepared = Object.freeze({ qualification: qualification.qualification }), termination = Object.freeze({ explicitSyntheticNativeClosure: true });
  const url = new URL("../src/generated-schematic-display-closed-snapshot.ts", import.meta.url); const sourceRequire = createRequire(url);
  const compiled = await transform(await readFile(url, "utf8"), { loader: "ts", format: "cjs", target: "node24", logLevel: "silent" });
  const loaded: { exports: Record<string, unknown> } = { exports: {} }; const evaluate: unknown = runInThisContext(`(function(require,module,exports){${compiled.code}\n})`); assert.ok(typeof evaluate === "function");
  Reflect.apply(evaluate, undefined, [(name: string): unknown => {
    const actual: unknown = sourceRequire(name); assert.ok(actual !== null && typeof actual === "object");
    if (name === "./core.ts") { return { ...actual, normalizeEasyedaProjectPath: (raw: string): string => { assert.equal(raw, input.rawWindowsPath); return path; } }; }
    if (name === "./current-schematic-display-write-owner.ts") { return { ...actual,
      assertOriginalCurrentSchematicDisplayWriteOwner: (value: unknown): void => { assert.equal(value, owner); },
      assertOriginalCurrentSchematicDisplayWriteTermination: (value: unknown, closed: unknown): void => { assert.equal(value, owner); assert.equal(closed, termination); },
      originalCurrentSchematicDisplayWriteTarget: (value: unknown): object => { assert.equal(value, owner); return prepared; } }; }
    return actual;
  }, loaded, loaded.exports]);
  const Constructor = loaded.exports["GeneratedSchematicDisplayClosedCapture"], requireSnapshot = loaded.exports["requireOriginalGeneratedSchematicDisplayClosedSnapshot"];
  assert.ok(typeof Constructor === "function" && typeof requireSnapshot === "function");
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Exact production private-field class with explicit synthetic native-only issuer seam; actual filesystem/SQL code is unchanged.
  const capture = Reflect.construct(Constructor, [owner, termination]) as GeneratedSchematicDisplayClosedCapture;
  return { capture, source: path, requireSnapshot: (value: GeneratedSchematicDisplayClosedSnapshot): unknown => Reflect.apply(requireSnapshot, undefined, [value, owner]),
    copyRefused: (): void => { assert.throws(() => Reflect.construct(Constructor, [{ ...owner }, termination])); } };
}
void test("original SCH closed capture retains complete bytes/SQL/raw history and only its issued snapshot after all FD closes", async () => {
  const f = await fixture(); f.copyRefused(); const snapshot = await f.capture.capture();
  assert.equal(snapshot.completeSqlInventoryCaptured, true); assert.equal(snapshot.persistenceVerified, false); assert.equal(snapshot.completeSqlEffectsAccepted, false);
  assert.equal(f.capture.isReleaseAcknowledged(), true); await f.capture.settleRelease(); assert.notEqual(f.requireSnapshot(snapshot), undefined);
  assert.throws(() => { f.requireSnapshot(structuredClone(snapshot)); }, /ORIGINAL_SNAPSHOT/u); assert.throws(() => f.capture.capture(), /COPY_CANNOT_REPEAT/u);
  assert.equal(createHash("sha256").update(await readFile(f.source)).digest("hex"), snapshot.sourceSha256);
  const report = snapshot.report;
  for (const name of ["snapshot", "sql", "rawHistory"]) {
    const attachment = report[name]; assert.ok(attachment !== null && typeof attachment === "object" && "path" in attachment && "sha256" in attachment && typeof attachment.path === "string");
    const bytes = await readFile(attachment.path); assert.equal(createHash("sha256").update(bytes).digest("hex"), attachment.sha256);
    if (name === "rawHistory") { assert.match(bytes.toString("utf8"), /SCH_PAGE/u); assert.match(bytes.toString("utf8"), /Disposable schematic fixture/u); }
  }
});
void test("a closed sidecar refuses the entire original copy while acknowledging every partly acquired descriptor", async () => {
  const f = await fixture(); await writeFile(`${f.source}-wal`, "synthetic sidecar"); await assert.rejects(f.capture.capture(), /SOURCE_OR_ROSTER_CHANGED/u);
  assert.equal(f.capture.isReleaseAcknowledged(), true); await f.capture.settleRelease(); assert.equal(f.capture.status()["settled"], true);
  assert.deepEqual(f.capture.status()["attachments"], []); assert.throws(() => f.capture.capture(), /COPY_CANNOT_REPEAT/u);
});
