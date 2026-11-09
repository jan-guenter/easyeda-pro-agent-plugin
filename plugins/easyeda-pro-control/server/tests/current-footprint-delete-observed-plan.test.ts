/** Exact inert native serializer parity; no original inverse invocation. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { runInNewContext } from "node:vm";
import { prepareCurrentFootprintDeleteObservedPlan, verifyCurrentFootprintDeleteObservedUpload } from "../src/current-footprint-delete-observed-plan.ts";
import { footprintDeleteFragments as fragments } from "./helpers/footprint-delete-fragments.ts";

void test("v2 tombstone retains actual absent, own undefined and string worker versions with exact xt key order", async () => {
  const base = { targetUuid: "c".repeat(16), client: "d".repeat(16), maximumTicketBeforeClock: 100, maximumTicketAfterClock: 100,
    documentClock: 1_700_000_000_123, managerUserAbsent: true };
  for (const [present, version] of [[false, null], [true, null], [true, "3.2.185"], [true, "3.2.209"]] as const) {
    const plan = prepareCurrentFootprintDeleteObservedPlan({ ...base, workerEditorVersionPresent: present, workerEditorVersionUndefined: version === null, workerEditorVersion: version });
    const native: unknown = await runInNewContext(`(async()=>{globalThis.self=globalThis;${present ? `globalThis.PRO_EDITOR_VERSION=${version === null ? "undefined" : JSON.stringify(version)};` : ""}
${fragments.header}\n${fragments.atom}\nclass Encoder{constructor(){this.doctype='FOOTPRINT';}${fragments.headMethod}${fragments.deleteEncoder}}class Ke{constructor(){this.footprint=new Encoder;}}
const qe=async()=>${String(base.documentClock)},Ie='|\\n';class Tg{constructor(){this.client=${JSON.stringify(base.client)};this.user=undefined;this.maxTicket=100;}get newTicket(){return++this.maxTicket;}${fragments.deleteString}}
return new Tg().deleteString(${JSON.stringify(base.targetUuid)});})()`, {}, { timeout: 1000 });
    verifyCurrentFootprintDeleteObservedUpload(plan, native); assert.equal(plan.workerUpload, native);
    assert.equal(plan.workerEditorVersionPresent, present); assert.equal(plan.workerEditorVersion, version);
    assert.equal(plan.executionAuthorized, false); assert.equal(plan.nativeClockProvenanceVerified, false);
    assert.throws(() => { verifyCurrentFootprintDeleteObservedUpload({ ...plan }, native); });
  }
  for (const version of ["", "x".repeat(65), 209]) { assert.throws(() => prepareCurrentFootprintDeleteObservedPlan({ ...base, workerEditorVersionPresent: true, workerEditorVersionUndefined: false, workerEditorVersion: version })); }
  assert.throws(() => prepareCurrentFootprintDeleteObservedPlan({ ...base, workerEditorVersionPresent: false, workerEditorVersionUndefined: false, workerEditorVersion: "3.2.209" }));
  assert.throws(() => prepareCurrentFootprintDeleteObservedPlan({ ...base, maximumTicketAfterClock: 101, workerEditorVersionPresent: false, workerEditorVersionUndefined: true, workerEditorVersion: null }));
});
