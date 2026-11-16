/** Actual encrypted SQLite/read completion and vendor projection. This
 * fixture supplies no native worker, owner, cache Promise or continuation. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { prepareCurrentFootprintSourcePlan } from "../src/current-footprint-source-plan.ts";
import { prepareCurrentFootprintCopyHeadReference } from "../src/current-footprint-copy-head-reference.ts";
import { deriveCurrentFootprintForwardWriterStartupData } from "../src/current-footprint-forward-writer-startup-data.ts";
import { IDS, encrypted, fixture, inventory, mutate } from "./helpers/symbol-sql-fixture.ts";

void test("full opening's exact reader projects complete footprint cache jobs without generated-fixture authority", async () => {
  const projectUuid = "1".repeat(64), value = await fixture({ project: projectUuid, branch: IDS.branch, target: IDS.target });
  const content = [
    `${JSON.stringify({ type: "EDIT_HEAD" })}||${JSON.stringify({ uuid: IDS.actor, username: "synthetic", nickname: "Synthetic", updateTime: 100 })}`,
    `${JSON.stringify({ type: "DOCHEAD", ticket: 100 })}||${JSON.stringify({ docType: "FOOTPRINT", client: "a".repeat(16), uuid: IDS.target, updateTime: 100,
      version: "100", editVersion: "3.2.209", user: { uuid: IDS.actor, username: "synthetic", nickname: "Synthetic" } })}`,
    `${JSON.stringify({ type: "META", ticket: 90, id: "META" })}||${JSON.stringify({ title: "Footprint", description: "", tags: [], source: "" })}`,
  ].join("|\n");
  mutate(value.path, `UPDATE history_data SET dataStr='${encrypted(`${content}|\n`, IDS.oldHead, IDS.oldKey)}' WHERE uuid='${IDS.oldHead}'`);
  const before = await inventory(value.path), sourcePlan = await prepareCurrentFootprintSourcePlan(before, { projectUuid, branchUuid: IDS.branch, footprintUuid: IDS.target });
  const reference = await prepareCurrentFootprintCopyHeadReference(before, sourcePlan);
  const source = Object.freeze({ before, sourcePlan, reference, rawWindowsPath: String.raw`C:\Synthetic\source.eprj2` });
  const data = await deriveCurrentFootprintForwardWriterStartupData(source);
  assert.equal(data.cache.jobs.length, 2); assert.equal(data.cache.projectUuid, projectUuid);
  assert.ok(data.cache.jobs.some(job => job.kind === "flow" && job.key.endsWith("-FOOTPRINT") && job.body.includes('"docType":"FOOTPRINT"')));
  assert.equal(data.sync.cache.originalFlowDataSha256, data.cache.originalFlowDataSha256); assert.equal(data.continuationAuthorized, false);
  await assert.rejects(deriveCurrentFootprintForwardWriterStartupData({ ...source, before: { ...before } }), /completed|reader|original/iu);
});
