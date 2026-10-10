import assert from "node:assert/strict";
import { test } from "node:test";
import { verifyLayoutRetainedSaveAuthority } from "../src/design-execution.ts";
import { parseDocumentSource } from "../src/document-source.ts";

void test("retained layout Save requires source-bound lifecycle evidence and never accepts orphan or historical authority", () => {
  const source = '{"type":"DOCHEAD"}||{"uuid":"page","docType":"SCH_PAGE","editVersion":"3.2.149.88089769"}|\n{"type":"CANVAS","id":"CANVAS"}||{"originX":0,"originY":0}|\n';
  const topology = [{ uniqueId: "part", designator: "R1", pins: [{ pinNumber: "1", net: "GND" }] }];
  const context = { project: { uuid: "project", path: "/project.eprj2" }, document: { uuid: "page", tabId: "page@project", documentType: 1 } };
  const journal: Parameters<typeof verifyLayoutRetainedSaveAuthority>[0] = {
    plan: { profile: "easyeda-pro-control.typed-design-transaction.v1", operation: { id: "layout", action: "sch.layout.batch", documentType: 1,
      operations: [{ id: "display", action: "sch.attribute.display", target: { primitiveId: "attribute" }, patch: { x: 10 } }] },
      expectedContext: context, expectedFingerprint: {}, expectedTopology: topology },
    context, after: parseDocumentSource(source), afterNative: { profile: "easyeda-pro-control.schematic-native.v1",
      document: { documentUuid: "page", tabId: "page@project" }, source, components: [] },
    createdIds: {}, beforeTopology: topology, orphanedCallPossible: false,
  };
  const hash = "a".repeat(64);
  const phase = { snapshot: journal.after, native: journal.afterNative, payload: { source,
    read_consistency: { stable: true, attempts: 2, snapshotSha256: hash } } };
  const acknowledgment = { ok: true, saved: true, closed: true, reopened: true, document: context.document,
    exactSaveGuard: { passes: 2, labels: ["schematic-source"], snapshotSha256: [hash], saveInvokedInSameExecution: true, publicCompareAndSwapAvailable: false },
    closeProof: { profile: "easyeda-pro-control.native-document-close.v1", closeCalls: 1, terminalNotification: true, oldFrameRemoved: true, oldTabRemoved: true, saved: false },
    openProof: { profile: "easyeda-pro-control.native-document-open.v1", tabId: "page@project", newFrameReady: true, exactContext: true, readinessSamples: 2, activated: true },
    projectUploadBarrier: { profile: "easyeda-pro-control.project-upload-barrier.v1", projectUuid: "project", scheduledWritesSettled: true, savedEditorChanges: false } };
  assert.doesNotThrow(() => { verifyLayoutRetainedSaveAuthority(journal, phase, acknowledgment); });
  assert.throws(() => { verifyLayoutRetainedSaveAuthority({ ...journal, orphanedCallPossible: true }, phase, acknowledgment); });
  assert.throws(() => { verifyLayoutRetainedSaveAuthority({ ...journal, beforeTopology: [] }, phase, acknowledgment); });
  assert.throws(() => { verifyLayoutRetainedSaveAuthority(journal, { ...phase, native: { ...journal.afterNative, components: [{ id: "foreign" }] } }, acknowledgment); });
  for (const patch of [{ saved: false }, { document: { ...context.document, uuid: "other" } },
    { exactSaveGuard: { ...acknowledgment.exactSaveGuard, snapshotSha256: ["b".repeat(64)] } },
    { closeProof: { ...acknowledgment.closeProof, oldFrameRemoved: false } },
    { openProof: { ...acknowledgment.openProof, readinessSamples: 1 } },
    { projectUploadBarrier: { ...acknowledgment.projectUploadBarrier, projectUuid: "other" } }]) {
    assert.throws(() => { verifyLayoutRetainedSaveAuthority(journal, phase, { ...acknowledgment, ...patch }); });
  }
  assert.throws(() => { verifyLayoutRetainedSaveAuthority({ ...journal, plan: { ...journal.plan, operation: { id: "old", action: "sch.layout.batch", documentType: 1,
    operations: [{ id: "wire", action: "sch.wire.replace", target: { primitiveId: "wire" }, line: [[0, 0, 10, 0]] }] } } }, phase, acknowledgment); });
});
