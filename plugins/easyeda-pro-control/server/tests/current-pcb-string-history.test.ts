import assert from "node:assert/strict";
import { test } from "node:test";
import { planCurrentPcbStringCreate } from "../src/current-pcb-string-create.ts";
import { planCurrentPcbStringCreateObservation } from "../src/current-pcb-string-create-observation.ts";
import { compareCurrentPcbStringHistory, prepareCurrentPcbStringHistory } from "../src/current-pcb-string-history.ts";
import { planCurrentPcbStringPublication } from "../src/current-pcb-string-publication.ts";

const candidate = planCurrentPcbStringCreate({ x: 100, y: -200, text: "Saved String" });
const document = "b".repeat(16), project = "a".repeat(64);
const create = planCurrentPcbStringCreateObservation(candidate, { projectUuid: project, branchUuid: "c".repeat(32),
  documentUuid: document, tabId: `${document}@${project}` });
const publication = planCurrentPcbStringPublication(candidate, create, { primitiveId: "d".repeat(16), client: "e".repeat(16),
  uniqueId: "fixed-compiler-token", maximumTicket: 41 });
const input = { maximumTargetHeaderTime: 1, saveTime: 1000, backendTime: 2000,
  saveClock: { minimumMs: 900, maximumMs: 1100 }, backendClock: { minimumMs: 1900, maximumMs: 2100 },
  workerUser: { uuid: "f".repeat(32), nickname: "Current name", username: "current", avatar: "" },
  backendActor: { uuid: "f".repeat(32), username: "SQL name", nickname: "SQL nickname" } };

void test("String Save history keeps pending ticket, separate head ticket, worker user order and compiler-token editVersion", () => {
  const projection = prepareCurrentPcbStringHistory(candidate, publication, input);
  assert.equal(projection.publicationTicket, 42); assert.equal(projection.headTicket, 43);
  assert.equal(projection.recordsText, `{"type":"DOCHEAD","ticket":43}||` +
    `{"docType":"PCB","client":"${"e".repeat(16)}","uuid":"${document}","updateTime":1000,"version":"1000",` +
    `"editVersion":"fixed-compiler-token","user":${JSON.stringify(input.workerUser)}}|\n` +
    `{"type":"STRING","ticket":42,"id":"${"d".repeat(16)}"}||${candidate.expectedBodyText}`);
  assert.equal(projection.chunkText, `{"type":"EDIT_HEAD"}||${JSON.stringify({ ...input.backendActor, updateTime: 2000 })}|\n${projection.recordsText}`);
  assert.equal(compareCurrentPcbStringHistory(projection, projection.chunkText).suppliedChunkMatchesPrediction, true);
  for (const name of ["originalSaveVerified", "uploadCountVerified", "executionAuthorized", "fullSqlVerified", "reopened"] as const) {
    assert.equal(projection[name], false);
  }
});
void test("String Save history rejects extra uploads, META, alternate encodings, repeated tickets and lost actor bytes", () => {
  const projection = prepareCurrentPcbStringHistory(candidate, publication, input);
  for (const bad of [`${projection.chunkText  }|\n${  projection.chunkText}`, projection.recordsText, `${projection.chunkText  }|\n`,
    projection.chunkText.replace('"ticket":43', '"ticket":42'), projection.chunkText.replace('"type":"STRING"', '"type":"META"'),
    projection.chunkText.replace('"editVersion":"fixed-compiler-token"', '"editVersion":"3.2.206"'),
    projection.chunkText.replace('"avatar":""', '"avatar":null'), projection.chunkText.replace("SQL nickname", "Current name")]) {
    assert.throws(() => compareCurrentPcbStringHistory(projection, bad), /transcript/u);
  }
});
void test("String history rejects copied plans, proxies and accessors without executing them", () => {
  assert.throws(() => prepareCurrentPcbStringHistory(structuredClone(candidate), publication, input), /original/u);
  assert.throws(() => prepareCurrentPcbStringHistory(candidate, structuredClone(publication), input), /original/u);
  let reads = 0;
  const bad = Object.defineProperty({ ...input }, "workerUser", { get(): unknown { reads += 1; return input.workerUser; } });
  assert.throws(() => prepareCurrentPcbStringHistory(candidate, publication, bad), /own data/u);
  assert.throws(() => prepareCurrentPcbStringHistory(candidate, publication, new Proxy(input, {
    ownKeys(): never { reads += 1; throw new Error("trap"); },
  })), /plain/u);
  assert.equal(reads, 0);
  const projection = prepareCurrentPcbStringHistory(candidate, publication, input);
  assert.throws(() => compareCurrentPcbStringHistory(structuredClone(projection), projection.chunkText), /original/u);
});
void test("String history requires strict independent clocks and the supported complete account shape", () => {
  for (const changed of [{ saveTime: 1 }, { saveTime: 1101 }, { backendTime: 2101 }, { maximumTargetHeaderTime: -0 },
    { workerUser: { ...input.workerUser, extra: true } }, { workerUser: { ...input.workerUser, uuid: "a".repeat(32) } },
    { backendActor: { ...input.backendActor, nickname: "\uD800" } }]) {
    assert.throws(() => prepareCurrentPcbStringHistory(candidate, publication, { ...input, ...changed }));
  }
});
