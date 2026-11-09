/** Byte parity connects the Windows managed regression to the actual sender
 * emitter. The independent Windows step compiles and executes these bytes. */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { currentSchematicWireNativeBudgetRegressionSource } from "./helpers/current-schematic-wire-native-budget-fixture.ts";

void test("committed native Wire budget regression contains the exact current sender logic", async () => {
  const actual = await readFile(new URL("../../scripts/schematic-wire-budget-regression.cs", import.meta.url), "utf8");
  assert.equal(actual, currentSchematicWireNativeBudgetRegressionSource());
});
