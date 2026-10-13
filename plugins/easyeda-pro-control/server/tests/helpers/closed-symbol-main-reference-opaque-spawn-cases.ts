/** Actual managed baseline and stage; exact command interception only. No Windows launch. */
/* oxlint-disable import/max-dependencies -- Compose actual managed stages and original receipts with the fixed synthetic child boundary, not authority stubs. */
import assert from "node:assert/strict";
import childProcess from "node:child_process";
import type { ChildProcess } from "node:child_process";
import { readFile } from "node:fs/promises";
import { syncBuiltinESMExports } from "node:module";
import { join } from "node:path";
import { test } from "node:test";
import { operationPath } from "../../src/artifacts.ts";
import { loadClosedSymbolJournal } from "../../src/closed-symbol-journal.ts";
import { ClosedSymbolMainReferenceStage, assertOriginalMainReference } from "../../src/closed-symbol-main-reference.ts";
import { canonicalJson, isRecord, sha256Json, sha256Text } from "../../src/core.ts";
import { mainReferenceFixture } from "./closed-symbol-main-reference-fixture.ts";

void test("actual stage retains opaque spawn uncertainty as v2 and never issues or retries", async context => {
  const f = await mainReferenceFixture(context);
  const before = canonicalJson(await loadClosedSymbolJournal(f.journal.operationId));
  const preceding = childProcess.spawn;
  let commandCalls = 0;
  const intercepted = ((executable: string, args: string[], options: unknown): ChildProcess => {
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Delegate non-command calls to the preceding fixed synthetic supervisor/SQL child fixture.
    if (!args.includes("-Command")) { return Reflect.apply(preceding, childProcess, [executable, args, options]) as ChildProcess; }
    assert.equal(executable, "/mnt/c/Windows/System32/WindowsPowerShell/v1.0/powershell.exe");
    assert.deepEqual(args.slice(0, 4), ["-NoLogo", "-NoProfile", "-NonInteractive", "-Command"]);
    assert.equal(args.length, 5);
    const command = args[4]; assert.ok(command !== undefined);
    assert.match(command, /private\.main-reference-stdin\.v3/u); assert.ok(command.length <= 30_000);
    commandCalls += 1;
    throw new Error("Synthetic opaque spawn exception; native startup cannot be inferred from this throw.");
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Fixed three-argument test interception preserves every delegated call and returns no fake authority.
  }) as typeof childProcess.spawn;
  const mock = context.mock.method(childProcess, "spawn", intercepted); syncBuiltinESMExports();
  context.after(() => { mock.mock.restore(); syncBuiltinESMExports(); });

  await assert.rejects(f.stage.runOnce(f.input), /Main reference transport failed or is ambiguous; never retry it/u);
  assert.equal(commandCalls, 1);
  const original = f.stage.originalReturn(f.journal.operationId); assert.ok(original !== undefined);
  assert.ok(Object.isFrozen(original));
  assert.throws(() => assertOriginalMainReference(original, f.engine, f.journal.operationId), /not issued/u);
  await assert.rejects(f.stage.runOnce(f.input), /already consumed/u);
  await assert.rejects(new ClosedSymbolMainReferenceStage(f.engine).runOnce(f.input), /already consumed/u);
  assert.strictEqual(f.stage.originalReturn(f.journal.operationId), original); assert.equal(commandCalls, 1);
  assert.equal(canonicalJson(await loadClosedSymbolJournal(f.journal.operationId)), before);

  const directory = operationPath(f.journal.operationId).slice(0, -5);
  const intentBytes = await readFile(join(directory, "10-baseline-main-reference-intent.json"));
  const resultBytes = await readFile(join(directory, "10-baseline-main-reference-result.json"));
  assert.ok(resultBytes.length <= 196_608);
  const intent: unknown = JSON.parse(intentBytes.toString("utf8"));
  const retained: unknown = JSON.parse(resultBytes.toString("utf8"));
  assert.ok(isRecord(intent) && isRecord(intent["request"]) && isRecord(retained));
  // This assertion must fail on the old maintained six-field v1 projection.
  // It is a normal expected-result assertion, not an expected-failure wrapper.
  assert.equal(retained["profile"], "private.main-reference-retained-result.v2");
  const expected = { exitCode: null, signal: null, timedOut: false, transportFailure: "start-failure",
    rawStdoutBase64: "", rawStderrBase64: "", transportState: "unresolved", spawnReturnObserved: false,
    transportCloseObserved: false, observationGuardsComplete: false, containmentRequest: "not-requested",
    windowsJobTerminationProved: false, executionAuthorized: false };
  assert.deepEqual(retained, { profile: "private.main-reference-retained-result.v2", requestSha256: sha256Json(intent["request"]),
    intentSha256: sha256Text(intentBytes.toString("utf8")), returnedEncoding: "base64-streams-v1", returned: expected });
  assert.deepEqual(original, { stdout: "", stderr: "", ...expected });
  assert.equal(commandCalls, 1);
});
