/** Actual FD, byte and SQL capture with explicit synthetic native/plan custody.
 * This does not create an EasyEDA owner or prove cold/reopened runtime state. */
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { copyFile, mkdir, readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { join, win32 } from "node:path";
import { runInThisContext } from "node:vm";
import { transform } from "esbuild";
import type { CurrentSchematicRelevanceSavedReadbackClosedCapture, CurrentSchematicRelevanceSavedReadbackClosedData } from "../../src/current-schematic-relevance-saved-readback-closed-proof.ts";
import { managedSchematicFixtureInitialSqlFixture } from "./managed-schematic-fixture-initial-sql.ts";
import { syntheticSqlRoot } from "./sqlite-inventory-fixture.ts";

export async function fixture(changedBaseline = false): Promise<Readonly<{ capture: CurrentSchematicRelevanceSavedReadbackClosedCapture; source: string;
  requireSnapshot: (value: CurrentSchematicRelevanceSavedReadbackClosedData) => unknown; copyRefused: () => void; changeOriginalPlan: () => void }>> {
  const input = await managedSchematicFixtureInitialSqlFixture(undefined, "relevance");
  const directory = join(syntheticSqlRoot(), `CodexEasyedaFixture_${randomUUID().replaceAll("-", "")}`); await mkdir(directory);
  const path = join(directory, win32.basename(input.rawWindowsPath)); await copyFile(input.syntheticDatabasePath, path);
  const owner = Object.freeze({ explicitSyntheticNativeOwner: true }), prepared = Object.freeze({ explicitOriginalPlanSeam: true }), termination = Object.freeze({ explicitSyntheticNativeClosure: true });
  const target = Object.freeze({ rawWindowsPath: input.rawWindowsPath, sourceSha256: input.inventory.checkpointSha256 });
  const historical = Object.freeze({ snapshot: {}, owner: {}, plan: {} });
  const baselineInput = changedBaseline ? await managedSchematicFixtureInitialSqlFixture("extra-auxiliary", "relevance") : input; const baseline = baselineInput.inventory;
  let originalPlan: object = prepared;
  const url = new URL("../../src/current-schematic-relevance-saved-readback-closed-proof.ts", import.meta.url); const sourceRequire = createRequire(url);
  const compiled = await transform(await readFile(url, "utf8"), { loader: "ts", format: "cjs", target: "node24", logLevel: "silent" });
  const loaded: { exports: Record<string, unknown> } = { exports: {} }; const evaluate: unknown = runInThisContext(`(function(require,module,exports){${compiled.code}\n})`); assert.ok(typeof evaluate === "function");
  Reflect.apply(evaluate, undefined, [(name: string): unknown => {
    const actual: unknown = sourceRequire(name); assert.ok(actual !== null && typeof actual === "object");
    if (name === "./generated-schematic-relevance-saved-readback-plan.ts") { return { ...actual, requireOriginalGeneratedSchematicRelevanceSavedReadbackPlan: (value: unknown): object => { assert.equal(value, prepared); return { closed: historical, data: { target } }; } }; }
    if (name === "./generated-schematic-relevance-display-closed-snapshot.ts") { return { ...actual, requireOriginalGeneratedSchematicRelevanceDisplayClosedSnapshot: (value: unknown, actor: unknown): object => { assert.equal(value, historical.snapshot); assert.equal(actor, historical.owner); return { inventory: baseline }; } }; }
    if (name === "./core.ts") { return { ...actual, normalizeEasyedaProjectPath: (raw: string): string => { assert.equal(raw, input.rawWindowsPath); return path; } }; }
    if (name === "./current-schematic-relevance-saved-readback-owner.ts") { return { ...actual,
      assertOriginalCurrentSchematicRelevanceSavedReadbackOwner: (value: unknown): void => { assert.equal(value, owner); },
      assertOriginalCurrentSchematicRelevanceSavedReadbackTermination: (value: unknown, closed: unknown): void => { assert.equal(value, owner); assert.equal(closed, termination); },
      originalCurrentSchematicRelevanceSavedReadbackTarget: (value: unknown): object => { assert.equal(value, owner); return originalPlan; } }; }
    return actual;
  }, loaded, loaded.exports]);
  const Constructor = loaded.exports["CurrentSchematicRelevanceSavedReadbackClosedCapture"], requireSnapshot = loaded.exports["requireOriginalCurrentSchematicRelevanceSavedReadbackClosedData"];
  assert.ok(typeof Constructor === "function" && typeof requireSnapshot === "function");
  assert.throws(() => Reflect.construct(Constructor, [owner, { ...termination }]));
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Exact production private-field class with explicit synthetic native/plan issuer seams; actual filesystem/SQL code is unchanged.
  const capture = Reflect.construct(Constructor, [owner, termination]) as CurrentSchematicRelevanceSavedReadbackClosedCapture;
  return { capture, source: path, requireSnapshot: (value: CurrentSchematicRelevanceSavedReadbackClosedData): unknown => Reflect.apply(requireSnapshot, undefined, [value, owner]),
    copyRefused: (): void => { assert.throws(() => Reflect.construct(Constructor, [{ ...owner }, termination])); }, changeOriginalPlan: (): void => { originalPlan = { ...prepared }; } };
}
