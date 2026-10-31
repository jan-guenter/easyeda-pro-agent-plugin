/** Supplied-transcript regressions. No original native events, SQL result,
 * source qualification, transport or writer admission are provided here. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { CurrentProjectStructureCompletionModel } from "../src/current-project-structure-completion-runner.ts";
import { requireCurrentProjectStructureCompletionSource } from "../src/current-project-structure-completion-source.ts";
import { validateCurrentProjectStructureCompletionEvent, validateCurrentProjectStructureCompletionPlan } from "../src/current-project-structure-completion-protocol.ts";

const branchUuid = "b".repeat(32), projectUuid = "a".repeat(64);
const scope = { workerScriptId: "worker", mainScriptId: "main", projectObjectId: "project", channelObjectId: "channel",
  projectUuid, branchUuid, connectionObjectId: "connection", path: projectUuid, projectPath: "/private/fixture.eprj2" };
const beforeStructureText = '{"title":"before"}', structureText = '{"title":"after"}';
const rows = [{ id: 1, projectUuid, branchUuid, ticket: 100, structureText: beforeStructureText }];
const plan = { scope, ticket: 101, beforeStructureText, structureText, rows };
const boundary = { stage: "boundary", scope, uploadRunning: null, uploadQueued: null, structureRunning: null, structureQueued: null, task2Count: 0 };
const prefix = [boundary,
  { stage: "serial-call", kind: "uploadStructure", callId: "upload-call", argumentsId: "upload-args", promiseId: "upload-promise", disposition: "start" },
  { stage: "serial-enter", kind: "uploadStructure", runId: "upload-run", argumentsId: "upload-args", promiseId: "upload-promise" },
  { stage: "serial-call", kind: "structure", callId: "structure-call", argumentsId: "structure-args", promiseId: "structure-promise", disposition: "start" },
  { stage: "serial-enter", kind: "structure", runId: "structure-run", argumentsId: "structure-args", promiseId: "structure-promise" },
  { stage: "upload-return", runId: "upload-run", structureCallId: "structure-call" },
];
const body = [
  { stage: "callback-enter", runId: "structure-run", callbackId: "callback", taskId: "task", packetId: "packet", ticket: 101, structureText },
  { stage: "post", callbackId: "callback", packetId: "packet", requestId: "request", projectUuid, branchUuid, path: projectUuid, method: "POST", url: `/api/v4/projects/${projectUuid}/branches/${branchUuid}/structures`, ticket: 101, structureText },
  { stage: "main-select", requestId: "request", connectionObjectId: "connection", projectPath: scope.projectPath, selectedTicket: 100, selectedStructureText: beforeStructureText,
    rows: [{ ticket: 100, structureText: beforeStructureText }] },
  { stage: "main-update", requestId: "request", connectionObjectId: "connection", branchUuid, ticket: 101, structureText },
  { stage: "main-update-return", requestId: "request" },
  { stage: "main-service-return", requestId: "request" },
  { stage: "main-controller-return", requestId: "request", responseId: "response" },
  { stage: "post-return", callbackId: "callback", requestId: "request", responseId: "response", success: true },
  { stage: "callback-return", callbackId: "callback", taskId: "task" },
];
const suffix = [
  { stage: "serial-finally", kind: "structure", runId: "structure-run", promiseId: "structure-promise" },
  { stage: "promise-settled", kind: "structure", promiseId: "structure-promise", outcome: "fulfilled" },
  { stage: "serial-finally", kind: "uploadStructure", runId: "upload-run", promiseId: "upload-promise" },
  { stage: "promise-settled", kind: "uploadStructure", promiseId: "upload-promise", outcome: "fulfilled" }, boundary,
];
/** Feed a supplied fixture transcript through the real comparison model and
 * consume its terminal result; this helper supplies no original native events. */
function compare(events: readonly unknown[]): ReturnType<CurrentProjectStructureCompletionModel["finish"]> {
  const model = new CurrentProjectStructureCompletionModel(plan); for (const event of events) { model.accept(event); } return model.finish();
}
/** Change only the named fixture stage so refusal cases isolate a foreign
 * request/response field or changed SELECT multiplicity in an otherwise valid chain. */
function changeBody(stage: string, changes: Readonly<Record<string, unknown>>): readonly unknown[] {
  const result: unknown[] = [];
  for (const event of body) { result.push(event.stage === stage ? { ...event, ...changes } : event); }
  return result;
}
void test("complete supplied callback/request/SQL/finalizer relation grants no native completion", () => {
  const result = compare([...prefix, ...body, ...suffix]); assert.equal(result.suppliedTranscriptConsistent, true);
  assert.equal(result.calls, 2); assert.equal(result.runs, 2); assert.match(result.transcriptSha256, /^[a-f0-9]{64}$/u);
  for (const field of ["originalEventProvenanceVerified", "nativeQueueCompletionGranted", "completeSqlEffectVerified", "independentClosedSqlVerified", "savedResultVerified", "executionAuthorized"] as const) {
    assert.equal(result[field], false);
  }
});
void test("timer interval with no task2 entry and post-ACK without finalizers remain incomplete", () => {
  assert.throws(() => compare(prefix), /INCOMPLETE/u);
  assert.throws(() => compare([...prefix, ...body]), /INCOMPLETE/u);
  assert.throws(() => compare([...prefix, ...body, boundary]), /PENDING_WORK/u);
  assert.throws(() => compare([...prefix, ...body, ...suffix.slice(0, -2), boundary]), /PENDING_WORK/u);
});
void test("queued and coalesced Nd callers survive first callback completion and block terminal output", () => {
  const queued = { stage: "serial-call", kind: "structure", callId: "queued-call", argumentsId: "queued-args", promiseId: "queued-promise", disposition: "queue" };
  const coalesced = { ...queued, callId: "coalesced-call", argumentsId: "latest-args", disposition: "coalesce" };
  assert.throws(() => compare([...prefix, queued, coalesced, ...body, ...suffix]), /PENDING_WORK/u);
  const model = new CurrentProjectStructureCompletionModel(plan);
  for (const event of [...prefix, queued, coalesced, ...body, ...suffix.slice(0, -1)]) { model.accept(event); }
  assert.throws(() => { model.accept({ stage: "serial-enter", kind: "structure", runId: "queued-run", argumentsId: "queued-args", promiseId: "queued-promise" }); }, /RUN_ENTRY/u);
  assert.throws(() => { model.accept({ stage: "serial-enter", kind: "structure", runId: "queued-run", argumentsId: "latest-args", promiseId: "queued-promise" }); }, /CONSUMED/u);
});
void test("second actual structure publication is refused even when the initial upload has completed", () => {
  const model = new CurrentProjectStructureCompletionModel(plan);
  for (const event of [...prefix,
    { stage: "serial-call", kind: "structure", callId: "queue", argumentsId: "queue-args", promiseId: "queue-promise", disposition: "queue" },
    ...body, ...suffix.slice(0, -1),
    { stage: "serial-enter", kind: "structure", runId: "queue-run", argumentsId: "queue-args", promiseId: "queue-promise" }]) { model.accept(event); }
  assert.throws(() => { model.accept({ ...body[0], runId: "queue-run" }); }, /EXTRA_OR_CHANGED_PUBLICATION/u);
});
void test("every lost await acknowledgment prevents terminal acceptance and cannot be repaired later", () => {
  for (const stage of ["main-update-return", "main-service-return", "main-controller-return", "post-return", "callback-return"] as const) {
    const model = new CurrentProjectStructureCompletionModel(plan);
    assert.throws(() => { for (const event of [...prefix, ...body.filter(item => item.stage !== stage), ...suffix]) { model.accept(event); } });
    assert.throws(() => { model.accept(body.find(event => event.stage === stage)); }, /CONSUMED/u);
  }
});
void test("equal tickets, duplicate row IDs and a branch row from another project refuse before observation", () => {
  for (const changedRows of [[{ ...rows[0], ticket: 101 }], [rows[0], { ...rows[0] }], [{ ...rows[0], projectUuid: "c".repeat(64) }]]) {
    assert.throws(() => new CurrentProjectStructureCompletionModel({ ...plan, rows: changedRows }));
  }
});
void test("script, branch, connection, response and complete selected-row multiplicity drift refuse", () => {
  for (const changedScope of [{ ...scope, workerScriptId: "foreign" }, { ...scope, branchUuid: "c".repeat(32) }]) {
    assert.throws(() => compare([{ ...boundary, scope: changedScope }]), /SCOPE_CHANGED/u);
  }
  assert.throws(() => compare([...prefix, ...changeBody("main-update", { connectionObjectId: "foreign" }), ...suffix]), /UPDATE_JOIN/u);
  assert.throws(() => compare([...prefix, ...changeBody("post-return", { responseId: "foreign" }), ...suffix]), /RESPONSE_JOIN/u);
  assert.throws(() => compare([...prefix, ...changeBody("main-select", { rows: [{ ticket: 100, structureText: beforeStructureText }, { ticket: 100, structureText: beforeStructureText }] }), ...suffix]), /SELECT_JOIN/u);
  assert.throws(() => compare([...prefix, ...changeBody("post", { url: "/foreign" }), ...suffix]), /POST_JOIN/u);
  assert.throws(() => compare([...prefix, ...changeBody("main-select", { projectPath: "/foreign.eprj2" }), ...suffix]), /SELECT_JOIN/u);
});
void test("large exact structure strings use their declared bound; malformed input runs no getter/proxy trap", () => {
  const text = "a".repeat(100_000); const parsed = validateCurrentProjectStructureCompletionPlan({ ...plan, beforeStructureText: text, structureText: text, rows: [{ ...rows[0], structureText: text }] });
  assert.equal(parsed.structureText.length, 100_000);
  let calls = 0; const accessor = { get stage(): string { calls += 1; return "boundary"; } };
  assert.throws(() => validateCurrentProjectStructureCompletionEvent(accessor));
  assert.throws(() => validateCurrentProjectStructureCompletionEvent(new Proxy({}, { getPrototypeOf(): null { calls += 1; return null; } })));
  assert.equal(calls, 0);
  assert.throws(() => validateCurrentProjectStructureCompletionEvent({ ...boundary, task2Count: 1 }));
  assert.throws(() => validateCurrentProjectStructureCompletionEvent({ ...boundary, unknown: true }));
  assert.throws(() => { requireCurrentProjectStructureCompletionSource({ profile: "private.current-project-structure-completion-source.v1", originalRuntimeVerified: false, executionAuthorized: false }); });
});

void test("a delayed duplicate cannot extend a finished model or reinterpret a terminal boundary", () => {
  const model = new CurrentProjectStructureCompletionModel(plan);
  for (const event of [...prefix, ...body, ...suffix]) { model.accept(event); }
  const result = model.finish(); assert.equal(result.suppliedTranscriptConsistent, true);
  assert.throws(() => { model.accept(prefix[1]); }, /CONSUMED/u);
  assert.throws(() => model.finish(), /CONSUMED/u);
});

void test("a later uploader cannot claim an earlier invocation's structure dependency", () => {
  const model = new CurrentProjectStructureCompletionModel(plan);
  for (const event of [...prefix, ...body, ...suffix.slice(0, -1),
    { stage: "serial-call", kind: "uploadStructure", callId: "later-upload", argumentsId: "later-args", promiseId: "later-promise", disposition: "start" },
    { stage: "serial-enter", kind: "uploadStructure", runId: "later-run", argumentsId: "later-args", promiseId: "later-promise" }]) { model.accept(event); }
  assert.throws(() => { model.accept({ stage: "upload-return", runId: "later-run", structureCallId: "structure-call" }); }, /UPLOAD_DEPENDENCY/u);
});
