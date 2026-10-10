import assert from "node:assert/strict";
import { test } from "node:test";
import { executeAndCommitDesign } from "../src/design-execute.ts";

const INPUT = { operation: {}, expectedContext: { project: { uuid: "project", path: "/fixture/project.eprj2" }, document: { uuid: "board", documentType: 3, tabId: "tab" } }, expectedFingerprint: {}, confirmWrite: true as const };
const READY = { operationId: "retained-operation", state: "applied-unsaved", hardStop: false, orphanedCallPossible: false };
void test("execute commits the one verified apply result and returns its persistence result", async () => {
  const calls: string[] = [];
  const result = await executeAndCommitDesign({ apply: (): Promise<Record<string, unknown>> => { calls.push("apply"); return Promise.resolve(READY); },
    commit: (id: string): Promise<Record<string, unknown>> => { calls.push(`commit:${id}`); return Promise.resolve({ saved: true, reopened: true }); } }, INPUT);
  assert.deepEqual(calls, ["apply", "commit:retained-operation"]);
  assert.deepEqual(result, { saved: true, reopened: true });
});
void test("execute never commits unverified state or retries a failed apply/commit", async () => {
  for (const applied of [{ ...READY, state: "apply-needs-review" }, { ...READY, hardStop: true }, { ...READY, orphanedCallPossible: true }, { ...READY, operationId: null }]) {
    let commits = 0;
    await assert.rejects(executeAndCommitDesign({ apply: (): Promise<Record<string, unknown>> => Promise.resolve(applied),
      commit: (): Promise<Record<string, unknown>> => { commits += 1; return Promise.resolve({}); } }, INPUT), /commit-ready/u);
    assert.equal(commits, 0);
  }
  let applies = 0, commits = 0;
  await assert.rejects(executeAndCommitDesign({ apply: (): Promise<Record<string, unknown>> => { applies += 1; return Promise.resolve(READY); },
    commit: (): Promise<Record<string, unknown>> => { commits += 1; return Promise.reject(new Error("persistence failure")); } }, INPUT), /persistence failure/u);
  assert.equal(applies, 1); assert.equal(commits, 1);
});
