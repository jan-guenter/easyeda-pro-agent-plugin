import assert from "node:assert/strict";
import { test } from "node:test";
import { assertUpstreamReplySettled, extractToolPayload, sha256Text } from "../src/core.ts";
import { CURRENT_OPEN_NATIVE_CODES, CURRENT_OPEN_NATIVE_STAGES, currentOpenNativeFailureCategory, describeCurrentOpenFailure } from "../src/current-disposable-open-diagnostics.ts";
import { buildCurrentDisposableOpenProgram } from "../src/current-disposable-open.ts";

const CONTEXT = { phase: "open-project", hostStage: "tracked-dispatch" } as const;

void test("native opening stages and codes are fixed, complete and refuse private suffixes", () => {
  const rawWindowsPath = String.raw`C:\Disposable\Diagnostic.eprj2`;
  const program = buildCurrentDisposableOpenProgram({ rawWindowsPath, projectUuid: sha256Text(rawWindowsPath),
    branchUuid: "b".repeat(32), documentUuid: "d".repeat(16), expectedSourceSha256: "e".repeat(64) }, "open-project");
  const emittedStages = new Set(["cleanup", ...[...program.matchAll(/\bstage='([a-z-]+)'/gu)].map((match) => match[1])]);
  assert.deepEqual([...emittedStages].toSorted((a, b) => String(a).localeCompare(String(b))), CURRENT_OPEN_NATIVE_STAGES.toSorted((a, b) => a.localeCompare(b)));
  const emittedCodes = new Set([...program.matchAll(/\bbad\('([A-Z]+)'\)/gu)].map((match) => match[1]));
  for (const code of ["GUARD", "EXCEPTION", "TIMEOUT"]) { emittedCodes.add(code); }
  assert.deepEqual([...emittedCodes].toSorted((a, b) => String(a).localeCompare(String(b))), CURRENT_OPEN_NATIVE_CODES.toSorted((a, b) => a.localeCompare(b)));
  for (const stage of CURRENT_OPEN_NATIVE_STAGES) {
    for (const code of CURRENT_OPEN_NATIVE_CODES) {
      const message = `CURRENT_DISPOSABLE_OPEN_FAILED:${stage}:${code}`;
      assert.equal(currentOpenNativeFailureCategory(message), `native-current-disposable-open:${stage}:${code}`);
      assert.equal(currentOpenNativeFailureCategory(`${message}:PRIVATE`), null);
    }
  }
  for (const message of ["CURRENT_DISPOSABLE_OPEN_FAILED:private:TIMEOUT", "CURRENT_DISPOSABLE_OPEN_FAILED:open-project:PRIVATE", "PRIVATE", "x".repeat(513)]) {
    assert.equal(describeCurrentOpenFailure(new Error(message), CONTEXT).category, "unknown");
  }
  let getters = 0;
  const hostile = Object.defineProperty({}, "message", { get: () => { getters += 1; return "PRIVATE"; } });
  assert.equal(describeCurrentOpenFailure(hostile, CONTEXT).category, "unknown");
  assert.equal(getters, 0);
});

void test("bounded opener diagnostics survive actual nested/text upstream wrappers and preserve timeout quarantine", () => {
  for (const code of ["GUARD", "TIMEOUT"] as const) {
    const result = { ok: false, error: { code: "EASYEDA_API_ERROR", message: `CURRENT_DISPOSABLE_OPEN_FAILED:open-project:${code}`, private: "PRIVATE_PATH_AND_SOURCE" } };
    for (const reply of [{ structuredContent: { result } }, { content: [{ type: "text", text: JSON.stringify({ result }) }] }]) {
      let failure: unknown;
      try { assertUpstreamReplySettled(reply); extractToolPayload(reply); } catch (error) { failure = error; }
      assert.ok(failure instanceof Error);
      if (code === "TIMEOUT") { assert.match(failure.message, /execution-unsettled/u); }
      else { assert.doesNotThrow(() => { assertUpstreamReplySettled(reply); }); }
      const diagnostic = describeCurrentOpenFailure(failure, CONTEXT);
      assert.equal(diagnostic.category, code === "TIMEOUT" ? "native-timeout" : "native-guard");
      assert.equal(diagnostic.nativeStage, "open-project"); assert.equal(diagnostic.nativeCode, code);
      assert.equal(JSON.stringify(diagnostic).includes("PRIVATE"), false);
    }
  }
  const suffixed = { structuredContent: { ok: false, error: "CURRENT_DISPOSABLE_OPEN_FAILED:open-project:TIMEOUT:PRIVATE" } };
  assert.doesNotThrow(() => { assertUpstreamReplySettled(suffixed); });
  assert.throws(() => extractToolPayload(suffixed), /unclassified-upstream-failure/u);
});
