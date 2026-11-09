/** Static code/catalog checks. The small JL function contains no CAD data. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { CURRENT_MAIN_STARTUP_LIBRARY_CHUNKS as CHUNKS, CURRENT_MAIN_STARTUP_LIBRARY_SOURCE as SOURCE } from "../src/current-main-startup-library-catalog.ts";
import { CURRENT_MAIN_STARTUP_LIBRARY_FRAME_EXPRESSION as FRAME } from "../src/current-main-startup-library-programs.ts";
import { assertCurrentMainStartupLibraryInvocationSource, qualifyCurrentMainStartupLibrarySource } from "../src/current-main-startup-library-source.ts";

void test("English catalog pins all chunks and JL captures only bindings present in its actual source scope", () => {
  assert.equal(CHUNKS.length, 332); assert.equal(SOURCE.script.bytes, 293_846); assert.equal(SOURCE.script.utf16, 293_170);
  assert.equal(Math.max(...CHUNKS.map(row => row.bytes)), 11_389); assert.equal(Math.max(...CHUNKS.map(row => row.utf16)), 11_377);
  for (const [index, row] of CHUNKS.entries()) {
    assert.equal(row.index, index); assert.match(row.sha256, /^[a-f\d]{64}$/u); assert.ok(row.start < row.end);
    assert.equal(Object.hasOwn(row, "sql"), false); assert.equal(Object.isFrozen(row), true);
    const previous = CHUNKS[index - 1]; if (previous !== undefined) { assert.ok(previous.end < row.start); }
  }
  const jl = "async function JL(t){return W0?await t.runScripts(wE):await t.runScripts(yE),t}";
  assert.equal(SOURCE.callers.length, 3); assert.equal(SOURCE.sourceRows.JL.start, 2_217_160); assert.equal(FRAME, "[t,W0,yE]");
  assert.doesNotThrow(() => { assertCurrentMainStartupLibraryInvocationSource(jl); });
  assert.throws(() => { assertCurrentMainStartupLibraryInvocationSource(jl.replace("runScripts(yE)", "runScripts(sc)")); });
  assert.throws(() => qualifyCurrentMainStartupLibrarySource(jl));
});
