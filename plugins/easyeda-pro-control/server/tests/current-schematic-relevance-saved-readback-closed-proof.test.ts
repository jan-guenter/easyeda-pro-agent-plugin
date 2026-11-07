/** Synthetic native/plan custody, actual SQLite and retained descriptor pipeline. */
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { test } from "node:test";
import { fixture } from "./helpers/schematic-saved-closed-capture-fixture.ts";

void test("original schematic saved reader captures full bytes/SQL/raw history after closure without promoting cold or reopened facts", async () => {
  const f = await fixture(); f.copyRefused(); const snapshot = await f.capture.capture();
  assert.equal(snapshot.completeSqlInventoryCaptured, true); assert.equal(snapshot.persistenceVerified, false); assert.equal(snapshot.completeSqlEffectsAccepted, true);
  assert.equal(f.capture.isReleaseAcknowledged(), true); await f.capture.settleRelease(); assert.notEqual(f.requireSnapshot(snapshot), undefined);
  assert.throws(() => { f.requireSnapshot(structuredClone(snapshot)); }, /ORIGINAL_SNAPSHOT/u); assert.throws(() => f.capture.capture(), /COPY_CANNOT_REPEAT/u);
  assert.equal(createHash("sha256").update(await readFile(f.source)).digest("hex"), snapshot.sourceSha256);
  const report = snapshot.report;
  for (const name of ["snapshot", "sql", "rawHistory"]) {
    const attachment = report[name]; assert.ok(attachment !== null && typeof attachment === "object" && "path" in attachment && "sha256" in attachment && typeof attachment.path === "string");
    const bytes = await readFile(attachment.path); assert.equal(createHash("sha256").update(bytes).digest("hex"), attachment.sha256);
    if (name === "rawHistory") { assert.match(bytes.toString("utf8"), /SCH/u); assert.match(bytes.toString("utf8"), /SCH_PAGE/u); }
  }
});
void test("a closed sidecar refuses the entire original copy while acknowledging every partly acquired descriptor", async () => {
  const f = await fixture(); await writeFile(`${f.source}-wal`, "synthetic sidecar"); await assert.rejects(f.capture.capture(), /SOURCE_OR_ROSTER_CHANGED/u);
  assert.equal(f.capture.isReleaseAcknowledged(), true); await f.capture.settleRelease(); assert.equal(f.capture.status()["settled"], true);
  assert.deepEqual(f.capture.status()["attachments"], []); assert.throws(() => f.capture.capture(), /COPY_CANNOT_REPEAT/u);
});

void test("a different complete historical inventory refuses closed SQL equality", async () => {
  const f = await fixture(true); await assert.rejects(f.capture.capture(), /SAVED_COMPLETE_SQL_CHANGED/u);
  assert.equal(f.capture.isReleaseAcknowledged(), true); await f.capture.settleRelease();
  assert.equal(f.capture.status()["persistenceVerified"], false); assert.throws(() => f.capture.capture(), /COPY_CANNOT_REPEAT/u);
});

void test("a changed original plan during the pending closed capture cannot issue acceptance and closes acquired descriptors", async () => {
  const f = await fixture(); const work = f.capture.capture(); f.changeOriginalPlan(); await assert.rejects(work);
  assert.equal(f.capture.isReleaseAcknowledged(), true); await f.capture.settleRelease(); assert.equal(f.capture.status()["persistenceVerified"], false);
});
