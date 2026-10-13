/** Synthetic managed-journal race, not native actor or dispatch evidence. */
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import fsPromises, { readFile, writeFile } from "node:fs/promises";
import { syncBuiltinESMExports } from "node:module";
import { test } from "node:test";
import { FAMILY, appendClosedSymbolEvent, createClosedSymbolJournal, loadClosedSymbolJournal } from "../src/closed-symbol-journal.ts";
import { newOperationId } from "../src/core.ts";
import { validateActorProjection } from "../src/symbol-dual-actor.ts";

for (const late of [false, true]) {
void test(`phase reread rejects malformed UTF-8 substituted ${late ? "after" : "before"} generic raw verification`, async (context) => {
  const digest = "c".repeat(64), project = "a".repeat(64), target = "b".repeat(32);
  const journal = await createClosedSymbolJournal(newOperationId(), {
    profile: FAMILY, projectUuid: project, branchUuid: "d".repeat(32), ownerUuid: "e".repeat(32), targetUuid: target,
    activeUuid: "f".repeat(32), projectPath: "/synthetic/unopened.eprj2",
    operation: { id: "utf8-synthetic", action: "library.symbol.modify", libraryUuid: project, target: { uuid: target }, patch: { name: "Synthetic" } },
    marker: { namespaceNonce: "1".repeat(64), keyNonce: "2".repeat(64), bodyNonce: "3".repeat(64) },
    nativePinsSha256: digest, facadeSha256: digest, expectedFingerprintSha256: digest,
  });
  const actor = validateActorProjection({ uuid: "e".repeat(32), username: "Synthetic replacement \uFFFD", nickname: "Synthetic" });
  await appendClosedSymbolEvent(journal, { step: "baseline-launch", kind: "intent", generation: null, requestSha256: digest,
    data: { syntheticOnly: true, startupActor: actor } });
  const descriptor = journal.artifacts[0]; assert.ok(descriptor !== undefined);
  const original = await readFile(descriptor.path);
  const altered = Buffer.from(original);
  const index = original.indexOf(Buffer.from("\uFFFD")); assert.ok(index !== -1);
  altered.set([0xF0, 0x9F, 0x92], index);
  assert.equal(altered.length, original.length);
  assert.equal(altered.toString("utf8"), original.toString("utf8"));
  assert.notEqual(createHash("sha256").update(altered).digest("hex"), descriptor.sha256);
  const originalOpen = fsPromises.open;
  let changed = false, phaseOpens = 0;
  if (!late) { await writeFile(descriptor.path, altered); changed = true; }
  const spy = context.mock.method(fsPromises, "open", async (...args: Parameters<typeof originalOpen>) => {
    if (String(args[0]).endsWith("/01-baseline-launch-intent.json")) {
      phaseOpens += 1;
      if (late && phaseOpens === 2) { await writeFile(descriptor.path, altered); changed = true; }
    }
    return originalOpen(...args);
  });
  syncBuiltinESMExports();
  try { await assert.rejects(loadClosedSymbolJournal(journal.operationId), /bytes|hash|UTF|encoded|unchanged|replaced/u); }
  finally { spy.mock.restore(); syncBuiltinESMExports(); }
  assert.equal(changed, true);
  assert.equal(phaseOpens, late ? 2 : 1);
});
}
