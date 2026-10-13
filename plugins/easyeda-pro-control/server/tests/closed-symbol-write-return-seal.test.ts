/** Actual managed publication boundary; all editor and child responses are synthetic. */
import assert from "node:assert/strict";
import fsPromises from "node:fs/promises";
import { syncBuiltinESMExports } from "node:module";
import { basename } from "node:path";
import { after, test } from "node:test";
import { isRecord } from "../src/core.ts";
import { encodeExactReadEnvelope } from "../src/exact-readers.ts";
import { loadClosedSymbolJournal } from "../src/closed-symbol-journal.ts";
import { installSyntheticNativeProfile } from "./helpers/install-synthetic-native-profile.ts";
// oxlint-disable-next-line node/no-top-level-await -- Install this exact worker-local prerequisite mock before loading the real stage graph.
const profile = await installSyntheticNativeProfile();
after(() => { profile.unregister(); });
// oxlint-disable-next-line node/no-top-level-await -- Load the actual stage fixture after its worker-local prerequisite mock.
const { writeFixture } = await import("./helpers/closed-symbol-write-fixture.ts");

void test("a malformed settled return cannot become an acknowledgment after artifact publication", async (context) => {
  const fixture = await writeFixture(context);
  fixture.writeState.malformed = true;
  const originalLink = fsPromises.link;
  let changed = false;
  const spy = context.mock.method(fsPromises, "link", async (...args: Parameters<typeof originalLink>): Promise<void> => {
    await originalLink(...args);
    if (basename(String(args[1])) !== "22-edit-write-result.json") { return; }
    assert.equal(changed, false);
    const raw = fixture.writeState.raw;
    assert.ok(isRecord(raw) && Array.isArray(raw["content"]));
    const first: unknown = raw["content"][0];
    assert.ok(isRecord(first));
    first["text"] = JSON.stringify(encodeExactReadEnvelope({ kind: "project-symbol-metadata", targetId: fixture.journal.plan.targetUuid, createdId: null }));
    changed = true;
  });
  syncBuiltinESMExports();
  try { await assert.rejects(fixture.writer.write(fixture.writeInput), /return|reply|acknowledgment|changed/u); }
  finally { spy.mock.restore(); syncBuiltinESMExports(); }
  assert.equal(changed, true);
  assert.equal(fixture.writeState.calls, 1);
  const retained = await loadClosedSymbolJournal(fixture.journal.operationId);
  const data = retained.events.at(-1)?.data;
  assert.ok(isRecord(data) && isRecord(data["rawReturn"]));
  assert.match(JSON.stringify(data["rawReturn"]), /unexpected/u);
  assert.strictEqual(fixture.writer.originalReturn(fixture.journal.operationId), fixture.writeState.raw);
  await assert.rejects(fixture.writer.write(fixture.writeInput), /already consumed/u);
});

void test("native capture cleanup cannot replace an already-published valid acknowledgment", async (context) => {
  const fixture = await writeFixture(context);
  const originalMutation = fixture.owner.behavior.mutateResponse;
  let changed = false;
  fixture.owner.behavior.mutateResponse = (request, response): void => {
    originalMutation?.(request, response);
    if (request["action"] !== "release-capture" || fixture.writeState.calls !== 1) { return; }
    assert.equal(changed, false);
    const raw = fixture.writeState.raw;
    assert.ok(isRecord(raw) && Array.isArray(raw["content"]));
    const first: unknown = raw["content"][0];
    assert.ok(isRecord(first));
    first["text"] = JSON.stringify(encodeExactReadEnvelope({ unexpected: true }));
    changed = true;
  };
  await assert.rejects(fixture.writer.write(fixture.writeInput), /return|reply|acknowledgment|changed/u);
  assert.equal(changed, true);
  assert.equal(fixture.writeState.calls, 1);
  assert.strictEqual(fixture.writer.originalReturn(fixture.journal.operationId), fixture.writeState.raw);
  const retained = await loadClosedSymbolJournal(fixture.journal.operationId);
  const data = retained.events.at(-1)?.data;
  assert.ok(isRecord(data) && isRecord(data["rawReturn"]));
  assert.match(JSON.stringify(data["rawReturn"]), /project-symbol-metadata/u);
  assert.doesNotMatch(JSON.stringify(data["rawReturn"]), /unexpected/u);
  await assert.rejects(fixture.writer.write(fixture.writeInput), /already consumed/u);
});
