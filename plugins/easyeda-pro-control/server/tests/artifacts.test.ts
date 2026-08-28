import assert from "node:assert/strict";
import {
  link,
  lstat,
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  rename,
  rm,
  symlink,
  unlink,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, before, describe, test } from "node:test";

import {
  OPERATION_SCHEMA,
  buildPlanHash,
  canonicalJson,
  isErrnoException,
  isRecord,
  sha256Text,
} from "../src/core.ts";
import type {
  archiveCaptureEvidence,
  archiveExternalEvidence,
  controlRootCapability,
  createOperation,
  ensureOperationStorage,
  listOperations,
  loadOperation,
  operationPath,
  publishManagedAttachmentExclusive,
  readArtifact,
  recoverPublishedEvidence,
  releaseEvidenceReservation,
  reserveEvidencePaths,
  updateOperation,
  verifyEvidenceReceipt,
  writePhaseArtifact,
} from "../src/artifacts.ts";
import type { UnknownRecord } from "../src/core.ts";

let dataDir = "";

interface ArtifactsModule {
  archiveCaptureEvidence: typeof archiveCaptureEvidence;
  archiveExternalEvidence: typeof archiveExternalEvidence;
  controlRootCapability: typeof controlRootCapability;
  createOperation: typeof createOperation;
  ensureOperationStorage: typeof ensureOperationStorage;
  listOperations: typeof listOperations;
  loadOperation: typeof loadOperation;
  operationPath: typeof operationPath;
  publishManagedAttachmentExclusive: typeof publishManagedAttachmentExclusive;
  readArtifact: typeof readArtifact;
  recoverPublishedEvidence: typeof recoverPublishedEvidence;
  releaseEvidenceReservation: typeof releaseEvidenceReservation;
  reserveEvidencePaths: typeof reserveEvidencePaths;
  updateOperation: typeof updateOperation;
  verifyEvidenceReceipt: typeof verifyEvidenceReceipt;
  writePhaseArtifact: typeof writePhaseArtifact;
}

let artifacts: ArtifactsModule;

const requiredArtifactFunctions = [
  "archiveCaptureEvidence",
  "archiveExternalEvidence",
  "controlRootCapability",
  "createOperation",
  "ensureOperationStorage",
  "listOperations",
  "loadOperation",
  "operationPath",
  "publishManagedAttachmentExclusive",
  "readArtifact",
  "recoverPublishedEvidence",
  "releaseEvidenceReservation",
  "reserveEvidencePaths",
  "updateOperation",
  "verifyEvidenceReceipt",
  "writePhaseArtifact",
] as const;

function isArtifactsModule(value: unknown): value is ArtifactsModule {
  return (
    isRecord(value) &&
    requiredArtifactFunctions.every((name) => typeof value[name] === "function")
  );
}

function parseJsonRecord(text: string): UnknownRecord {
  const parsed: unknown = JSON.parse(text);
  assert.ok(isRecord(parsed), "Expected fixture JSON to contain an object.");
  return parsed;
}

function reservationBinding(reservation: {
  readonly token: string;
  readonly resultPath: string;
  readonly receiptPath: string;
}): UnknownRecord {
  return {
    schema: "easyeda-pro-control.evidence-reservation-binding.v1",
    tokenSha256: sha256Text(reservation.token),
    resultPath: reservation.resultPath,
    receiptPath: reservation.receiptPath,
  };
}

function isUnknownArray(value: unknown): value is unknown[] {
  return Array.isArray(value);
}

function fixturePlan(name = "Artifact test plan"): UnknownRecord {
  return {
    name,
    intent: "Provide a stable plan payload for journal integrity tests.",
    capabilityLevel: "public-supported",
    expectedFingerprint: { fixture: true },
    expectedContext: {
      project: { uuid: "p" },
      document: { uuid: "d", documentType: 3 },
    },
    preflightCalls: [],
    applyCall: { toolName: "apply" },
    verifyCalls: [],
    verifyAssertions: [],
    rollbackCalls: [],
    reopenedVerifyCalls: [],
    reopenedAssertions: [],
    checkpoint: {
      source: "/tmp/project.eprj2",
      outputDir: "/tmp/checkpoints",
      label: "fixture",
    },
  };
}

before(async () => {
  dataDir = await mkdtemp(join("/tmp", "easyeda-control-artifacts-"));
  process.env["EASYEDA_CONTROL_DATA_DIR"] = dataDir;
  const loaded: unknown = await import(
    `../src/artifacts.ts?test-dir=${encodeURIComponent(dataDir)}`
  );
  assert.ok(
    isArtifactsModule(loaded),
    "Expected the artifact module to export its test contract.",
  );
  artifacts = loaded;
});

after(async () => {
  delete process.env["EASYEDA_CONTROL_DATA_DIR"];
  if (dataDir) {
    const controlRoot = await artifacts.controlRootCapability();
    await controlRoot.close();
    await rm(dataDir, { recursive: true, force: true });
  }
});

void describe("external evidence archives", () => {
  void test("writes an exclusive result and a self-hashed receipt", async () => {
    const resultPath = join(dataDir, "evidence", "context.result.json");
    const receiptPath = join(dataDir, "receipts", "context.receipt.json");
    const request = { toolName: "easyeda_get_document", args: {} };
    const result = { ok: true, documentUuid: "doc-1" };
    const metadata = { mode: "read" };

    const archived = await artifacts.archiveExternalEvidence({
      evidence: { resultPath, receiptPath },
      request,
      result,
      metadata,
    });
    assert.ok(archived);
    const payloadText = await readFile(resultPath, "utf8");
    const payload = parseJsonRecord(payloadText);
    const receipt = parseJsonRecord(await readFile(receiptPath, "utf8"));
    const { receiptSha256, ...receiptCore } = receipt;

    assert.equal(payload["schema"], "easyeda-pro-control.tool-result.v1");
    assert.deepEqual(payload["request"], request);
    assert.deepEqual(payload["result"], result);
    assert.equal(receipt["requestSha256"], sha256Text(canonicalJson(request)));
    assert.equal(receipt["resultSha256"], sha256Text(payloadText));
    assert.equal(receiptSha256, sha256Text(canonicalJson(receiptCore)));
    assert.equal(archived.resultPath, resultPath);
    assert.equal(archived.receiptPath, receiptPath);
  });

  void test("refuses overwrite and removes a newly reserved peer after a partial pair failure", async () => {
    const resultPath = join(dataDir, "exclusive", "result.json");
    const receiptPath = join(dataDir, "exclusive", "receipt.json");
    await writeFile(receiptPath, "preexisting\n", {
      encoding: "utf8",
      flag: "wx",
    }).catch(async (error: unknown) => {
      if (!isErrnoException(error) || error.code !== "ENOENT") {
        throw error;
      }
      await mkdir(join(dataDir, "exclusive"), {
        mode: 0o700,
        recursive: true,
      });
      await writeFile(receiptPath, "preexisting\n", {
        encoding: "utf8",
        flag: "wx",
      });
    });

    await assert.rejects(
      artifacts.archiveExternalEvidence({
        evidence: { resultPath, receiptPath },
        request: { toolName: "read" },
        result: { ok: true },
      }),
      (error: unknown) => isErrnoException(error) && error.code === "EEXIST",
    );
    await assert.rejects(
      readFile(resultPath, "utf8"),
      (error: unknown) => isErrnoException(error) && error.code === "ENOENT",
    );
    assert.equal(await readFile(receiptPath, "utf8"), "preexisting\n");
  });

  void test("reserves managed paths before dispatch and verifies the finalized evidence pair", async () => {
    const evidence = {
      resultPath: join(dataDir, "reserved", "read.result.json"),
      receiptPath: join(dataDir, "reserved", "read.receipt.json"),
    };
    const reservation = await artifacts.reserveEvidencePaths(evidence);
    assert.ok(Number.isFinite(Date.parse(reservation.createdAt)));

    await assert.rejects(
      artifacts.reserveEvidencePaths(evidence),
      (error: unknown) => isErrnoException(error) && error.code === "EEXIST",
    );
    await artifacts.archiveExternalEvidence({
      reservation,
      request: { toolName: "easyeda_read_state" },
      result: { state: "baseline" },
      metadata: { dispatched: true },
    });

    const verified = await artifacts.verifyEvidenceReceipt(
      evidence.receiptPath,
    );
    assert.equal(verified.ok, true);
    await writeFile(evidence.resultPath, '{"tampered":true}\n', "utf8");
    const tampered = await artifacts.verifyEvidenceReceipt(
      evidence.receiptPath,
    );
    assert.equal(tampered.ok, false);
    assert.equal(tampered.receiptHashOk, true);
    assert.equal(tampered.resultHashOk, false);
  });

  void test("resumes and repeats evidence finalization without changing committed bytes", async () => {
    const evidence = {
      resultPath: join(dataDir, "resumable", "read.result.json"),
      receiptPath: join(dataDir, "resumable", "read.receipt.json"),
    };
    const reservation = await artifacts.reserveEvidencePaths(evidence);
    const request = { toolName: "easyeda_read_state" };
    const result = { state: "stable" };
    const expectedResult = `${JSON.stringify({
      schema: "easyeda-pro-control.tool-result.v1",
      createdAt: reservation.createdAt,
      reservation: reservationBinding(reservation),
      request,
      result,
    })}\n`;

    // Simulate a crash after result publication but before receipt publication.
    await writeFile(evidence.resultPath, expectedResult, "utf8");
    const first = await artifacts.archiveExternalEvidence({
      reservation,
      request,
      result,
    });
    assert.ok(first);
    const firstReceipt = await readFile(evidence.receiptPath, "utf8");
    assert.equal(await readFile(evidence.resultPath, "utf8"), expectedResult);

    const second = await artifacts.archiveExternalEvidence({
      reservation,
      request,
      result,
    });
    assert.deepEqual(second, first);
    assert.equal(await readFile(evidence.resultPath, "utf8"), expectedResult);
    assert.equal(await readFile(evidence.receiptPath, "utf8"), firstReceipt);
    const verification = await artifacts.verifyEvidenceReceipt(
      evidence.receiptPath,
    );
    assert.equal(verification.ok, true);
  });

  void test("reconstructs and commits a published result after process state is lost", async () => {
    const evidence = {
      resultPath: join(dataDir, "crash-recovery", "read.result.json"),
      receiptPath: join(dataDir, "crash-recovery", "read.receipt.json"),
    };
    const reservation = await artifacts.reserveEvidencePaths(evidence);
    const request = { toolName: "easyeda_read_state" };
    const result = { state: "durably-published" };
    const publishedResult = `${JSON.stringify({
      schema: "easyeda-pro-control.tool-result.v1",
      createdAt: reservation.createdAt,
      reservation: reservationBinding(reservation),
      request,
      result,
    })}\n`;
    await writeFile(evidence.resultPath, publishedResult, "utf8");

    const verification = await artifacts.recoverPublishedEvidence(evidence);
    assert.equal(verification.ok, true);
    assert.equal(await readFile(evidence.resultPath, "utf8"), publishedResult);
    const receipt = parseJsonRecord(
      await readFile(evidence.receiptPath, "utf8"),
    );
    assert.equal(
      receipt["schema"],
      "easyeda-pro-control.tool-receipt.v1",
    );
    assert.equal(receipt["resultSha256"], sha256Text(publishedResult));
  });

  void test("rejects a published result copied from a different reservation", async () => {
    const firstEvidence = {
      resultPath: join(dataDir, "cross-pair", "first.result.json"),
      receiptPath: join(dataDir, "cross-pair", "first.receipt.json"),
    };
    const secondEvidence = {
      resultPath: join(dataDir, "cross-pair", "second.result.json"),
      receiptPath: join(dataDir, "cross-pair", "second.receipt.json"),
    };
    const firstReservation = await artifacts.reserveEvidencePaths(
      firstEvidence,
    );
    const secondReservation = await artifacts.reserveEvidencePaths(
      secondEvidence,
    );
    await artifacts.archiveExternalEvidence({
      reservation: firstReservation,
      request: { toolName: "easyeda_read_state" },
      result: { state: "first" },
    });
    const copied = parseJsonRecord(
      await readFile(firstEvidence.resultPath, "utf8"),
    );
    copied["createdAt"] = secondReservation.createdAt;
    await writeFile(
      secondEvidence.resultPath,
      `${JSON.stringify(copied)}\n`,
      "utf8",
    );

    await assert.rejects(
      artifacts.recoverPublishedEvidence(secondEvidence),
      /does not bind the recoverable reservation token and exact paths/u,
    );
  });

  void test("rejects caller-supplied paths from different committed pairs", async () => {
    const firstEvidence = {
      resultPath: join(dataDir, "committed-cross-pair", "first.result.json"),
      receiptPath: join(
        dataDir,
        "committed-cross-pair",
        "first.receipt.json",
      ),
    };
    const secondEvidence = {
      resultPath: join(dataDir, "committed-cross-pair", "second.result.json"),
      receiptPath: join(
        dataDir,
        "committed-cross-pair",
        "second.receipt.json",
      ),
    };
    await artifacts.archiveExternalEvidence({
      evidence: firstEvidence,
      request: { toolName: "easyeda_read_state" },
      result: { state: "first" },
    });
    await artifacts.archiveExternalEvidence({
      evidence: secondEvidence,
      request: { toolName: "easyeda_read_state" },
      result: { state: "second" },
    });

    await assert.rejects(
      artifacts.recoverPublishedEvidence({
        resultPath: firstEvidence.resultPath,
        receiptPath: secondEvidence.receiptPath,
      }),
      /does not belong to the supplied result and receipt paths/u,
    );
  });

  void test("rejects a committed receipt copied byte-for-byte to another path", async () => {
    const evidence = {
      resultPath: join(dataDir, "copied-receipt", "read.result.json"),
      receiptPath: join(dataDir, "copied-receipt", "read.receipt.json"),
    };
    await artifacts.archiveExternalEvidence({
      evidence,
      request: { toolName: "easyeda_read_state" },
      result: { state: "bound" },
    });
    const copiedReceiptPath = join(
      dataDir,
      "copied-receipt",
      "copied.receipt.json",
    );
    await writeFile(copiedReceiptPath, await readFile(evidence.receiptPath));

    await assert.rejects(
      artifacts.verifyEvidenceReceipt(copiedReceiptPath),
      /receipt path does not match the path opened/u,
    );
    await assert.rejects(
      artifacts.recoverPublishedEvidence({
        resultPath: evidence.resultPath,
        receiptPath: copiedReceiptPath,
      }),
      /does not belong to the supplied result and receipt paths/u,
    );
  });

  void test("refuses unmanaged evidence paths and reservation identity changes", async () => {
    const outside = await mkdtemp(join(tmpdir(), "easyeda-control-outside-"));
    try {
      await assert.rejects(
        artifacts.reserveEvidencePaths({
          resultPath: join(outside, "result.json"),
          receiptPath: join(outside, "receipt.json"),
        }),
        /must stay inside/u,
      );

      const evidence = {
        resultPath: join(dataDir, "reservation-tamper", "result.json"),
        receiptPath: join(dataDir, "reservation-tamper", "receipt.json"),
      };
      const reservation = await artifacts.reserveEvidencePaths(evidence);
      await writeFile(
        evidence.resultPath,
        `${JSON.stringify({ schema: "easyeda-pro-control.evidence-reservation.v1", token: "other" })}\n`,
        "utf8",
      );
      await assert.rejects(
        artifacts.archiveExternalEvidence({
          reservation,
          request: { toolName: "read" },
          result: { ok: true },
        }),
        /reservation identity changed/u,
      );
    } finally {
      await rm(outside, { recursive: true, force: true });
    }
  });

  void test("releases an undispatched reservation and rejects symlinked managed parents", async () => {
    const evidence = {
      resultPath: join(dataDir, "released", "result.json"),
      receiptPath: join(dataDir, "released", "receipt.json"),
    };
    const reservation = await artifacts.reserveEvidencePaths(evidence);
    await artifacts.releaseEvidenceReservation(reservation);
    await assert.rejects(
      readFile(evidence.resultPath),
      (error: unknown) => isErrnoException(error) && error.code === "ENOENT",
    );
    await assert.rejects(
      readFile(evidence.receiptPath),
      (error: unknown) => isErrnoException(error) && error.code === "ENOENT",
    );
    await artifacts.releaseEvidenceReservation(reservation);

    const partialEvidence = {
      resultPath: join(dataDir, "released-partial", "result.json"),
      receiptPath: join(dataDir, "released-partial", "receipt.json"),
    };
    const partial = await artifacts.reserveEvidencePaths(partialEvidence);
    await unlink(partial.resultPath);
    await artifacts.releaseEvidenceReservation(partial);
    await artifacts.releaseEvidenceReservation(partial);

    const outside = await mkdtemp(
      join(tmpdir(), "easyeda-control-symlink-target-"),
    );
    try {
      await symlink(outside, join(dataDir, "linked-parent"), "dir");
      await assert.rejects(
        artifacts.reserveEvidencePaths({
          resultPath: join(dataDir, "linked-parent", "result.json"),
          receiptPath: join(dataDir, "linked-parent", "receipt.json"),
        }),
        /not a real directory/u,
      );
    } finally {
      await rm(outside, { recursive: true, force: true });
    }
  });

  void test("hashes capture images and detects image tampering", async () => {
    const evidence = {
      resultPath: join(dataDir, "capture", "capture.result.json"),
      receiptPath: join(dataDir, "capture", "capture.receipt.json"),
    };
    const reservation = await artifacts.reserveEvidencePaths(evidence);
    const archived = await artifacts.archiveCaptureEvidence({
      reservation,
      request: { toolName: "easyeda_canvas_capture" },
      payload: { width: 2, height: 1 },
      images: [{ mimeType: "image/png", bytes: Buffer.from("fixture-png") }],
      metadata: { projectUuid: "project-1" },
    });
    const verified = await artifacts.verifyEvidenceReceipt(
      archived.receiptPath,
    );
    assert.equal(verified.ok, true);
    assert.equal(verified.imageChecks.length, 1);
    const verifiedImage = verified.imageChecks[0];
    assert.ok(verifiedImage);

    const repeated = await artifacts.archiveCaptureEvidence({
      reservation,
      request: { toolName: "easyeda_canvas_capture" },
      payload: { width: 2, height: 1 },
      images: [{ mimeType: "image/png", bytes: Buffer.from("fixture-png") }],
      metadata: { projectUuid: "project-1" },
    });
    assert.deepEqual(repeated, archived);

    await writeFile(verifiedImage.path, "changed-image", "utf8");
    const changed = await artifacts.verifyEvidenceReceipt(archived.receiptPath);
    assert.equal(changed.ok, false);
    const changedImage = changed.imageChecks[0];
    assert.ok(changedImage);
    assert.equal(changedImage.ok, false);
  });

  void test("retains published capture images when receipt publication fails", async () => {
    const evidence = {
      resultPath: join(dataDir, "capture-recovery", "capture.result.json"),
      receiptPath: join(dataDir, "capture-recovery", "capture.receipt.json"),
    };
    const reservation = await artifacts.reserveEvidencePaths(evidence);
    const receiptMarker = await readFile(evidence.receiptPath, "utf8");
    await writeFile(evidence.receiptPath, '{"changed":true}\n', "utf8");

    await assert.rejects(
      artifacts.archiveCaptureEvidence({
        reservation,
        request: { toolName: "easyeda_canvas_capture" },
        payload: { width: 2, height: 1 },
        images: [
          { mimeType: "image/png", bytes: Buffer.from("recoverable-png") },
        ],
        metadata: { projectUuid: "project-recovery" },
      }),
      /reservation identity changed/u,
    );

    const published = parseJsonRecord(
      await readFile(evidence.resultPath, "utf8"),
    );
    const result = published["result"];
    assert.ok(isRecord(result));
    const images = result["images"];
    assert.ok(isUnknownArray(images));
    const image = images[0];
    assert.ok(isRecord(image));
    assert.equal(
      await readFile(String(image["path"]), "utf8"),
      "recoverable-png",
    );

    await writeFile(evidence.receiptPath, receiptMarker, "utf8");
    const recovered = await artifacts.recoverPublishedEvidence(evidence);
    assert.equal(recovered.ok, true);
  });

  void test("does not redirect export bytes through a swapped symlink", async () => {
    const parent = join(dataDir, "descriptor-bound-export");
    const exportDirectory = join(parent, "export-swap-proof");
    const movedDirectory = join(parent, "export-swap-proof-moved");
    const outside = await mkdtemp(join(tmpdir(), "easyeda-export-swap-"));
    await mkdir(exportDirectory, { mode: 0o700, recursive: true });
    try {
      await assert.rejects(
        artifacts.publishManagedAttachmentExclusive(
          join(exportDirectory, "board.dsn"),
          "Descriptor-bound test export",
          Buffer.from("bound-export-bytes"),
          "export-artifact",
          async () => {
            await rename(exportDirectory, movedDirectory);
            await symlink(outside, exportDirectory, "dir");
          },
        ),
        /not a real directory/u,
      );
      await assert.rejects(readFile(join(outside, "board.dsn")), {
        code: "ENOENT",
      });
      await assert.rejects(readFile(join(movedDirectory, "board.dsn")), {
        code: "ENOENT",
      });
    } finally {
      await rm(outside, { recursive: true, force: true });
    }
  });

  void test("rejects a real-directory replacement after bound export publication", async () => {
    const parent = join(dataDir, "post-publication-swap");
    const exportDirectory = join(parent, "export-swap-proof");
    const movedDirectory = join(parent, "export-swap-proof-moved");
    const exportPath = join(exportDirectory, "board.dsn");
    await mkdir(exportDirectory, { mode: 0o700, recursive: true });

    await assert.rejects(
      artifacts.publishManagedAttachmentExclusive(
        exportPath,
        "Post-publication swap export",
        Buffer.from("generated-export-bytes"),
        "export-artifact",
        async () => {
          await rename(exportDirectory, movedDirectory);
          await mkdir(exportDirectory, { mode: 0o700 });
          await writeFile(exportPath, "attacker-replacement-bytes", "utf8");
        },
      ),
      /parent directory changed after bound publication/u,
    );
    assert.equal(
      await readFile(exportPath, "utf8"),
      "attacker-replacement-bytes",
    );
    await assert.rejects(readFile(join(movedDirectory, "board.dsn")), {
      code: "ENOENT",
    });
  });

  void test("rehashes export attachments and detects later artifact tampering", async () => {
    const exportPath = join(dataDir, "exports", "board-gerbers.zip");
    await mkdir(join(dataDir, "exports"), {
      mode: 0o700,
      recursive: true,
    });
    await writeFile(exportPath, "fresh-gerber-archive", "utf8");
    const evidence = {
      resultPath: join(dataDir, "export-evidence", "result.json"),
      receiptPath: join(dataDir, "export-evidence", "receipt.json"),
    };
    const archived = await artifacts.archiveExternalEvidence({
      evidence,
      request: { toolName: "easyeda_export_gerbers", projectId: "project-1" },
      result: { exported: true, artifact_path: exportPath },
      metadata: { effect: "artifact-write" },
      attachments: [{ kind: "export-artifact", path: exportPath }],
    });
    assert.ok(archived);
    const receipt = parseJsonRecord(
      await readFile(archived.receiptPath, "utf8"),
    );
    const receiptAttachments = receipt["attachments"];
    assert.ok(isUnknownArray(receiptAttachments));
    assert.equal(receiptAttachments.length, 1);
    const receiptAttachment = receiptAttachments[0];
    assert.ok(isRecord(receiptAttachment));
    assert.equal(receiptAttachment["kind"], "export-artifact");
    assert.equal(receiptAttachment["path"], exportPath);
    assert.equal(
      receiptAttachment["bytes"],
      Buffer.byteLength("fresh-gerber-archive"),
    );
    const attachmentSha256 = receiptAttachment["sha256"];
    assert.ok(typeof attachmentSha256 === "string");
    assert.match(attachmentSha256, /^[a-f0-9]{64}$/u);

    const verified = await artifacts.verifyEvidenceReceipt(
      archived.receiptPath,
    );
    assert.equal(verified.ok, true);
    assert.deepEqual(verified.attachmentChecks, [
      { path: exportPath, ok: true },
    ]);

    await writeFile(exportPath, "tampered-gerber-archive", "utf8");
    const tampered = await artifacts.verifyEvidenceReceipt(
      archived.receiptPath,
    );
    assert.equal(tampered.receiptHashOk, true);
    assert.equal(tampered.resultHashOk, true);
    assert.equal(tampered.ok, false);
    assert.deepEqual(tampered.attachmentChecks, [
      { path: exportPath, ok: false },
    ]);
  });

  void test("hashes a partially written export into dispatched-failure evidence", async () => {
    const exportPath = join(dataDir, "exports-after-failure", "partial.dsn");
    await mkdir(join(dataDir, "exports-after-failure"), {
      mode: 0o700,
      recursive: true,
    });
    await writeFile(exportPath, "partial-export-bytes", "utf8");
    const evidence = {
      resultPath: join(dataDir, "failed-export-evidence", "result.json"),
      receiptPath: join(dataDir, "failed-export-evidence", "receipt.json"),
    };
    const archived = await artifacts.archiveExternalEvidence({
      evidence,
      request: {
        toolName: "easyeda_pcb_export_route_context",
        projectId: "project-1",
      },
      result: {
        ok: false,
        outcome: "dispatched-but-not-proven",
        error: { name: "Error", message: "post-dispatch verification failed" },
      },
      metadata: {
        effect: "artifact-write",
        exportArtifactObserved: { path: exportPath },
      },
      attachments: [
        { kind: "export-artifact-after-failure", path: exportPath },
      ],
    });
    assert.ok(archived);
    const receipt = parseJsonRecord(
      await readFile(archived.receiptPath, "utf8"),
    );
    assert.deepEqual(receipt["attachments"], [
      {
        kind: "export-artifact-after-failure",
        path: exportPath,
        bytes: Buffer.byteLength("partial-export-bytes"),
        sha256: sha256Text("partial-export-bytes"),
      },
    ]);
    const verified = await artifacts.verifyEvidenceReceipt(
      archived.receiptPath,
    );
    assert.equal(verified.ok, true);

    await writeFile(exportPath, "changed-after-failure", "utf8");
    const tampered = await artifacts.verifyEvidenceReceipt(
      archived.receiptPath,
    );
    assert.equal(tampered.ok, false);
    assert.deepEqual(tampered.attachmentChecks, [
      { path: exportPath, ok: false },
    ]);
  });
});

void describe("operation journals and phase artifacts", () => {
  const operationId = "easyeda-test-operation-0001";

  function fixtureOperation(
    id: string,
    overrides: UnknownRecord = {},
  ): UnknownRecord {
    const plan = fixturePlan(id);
    return {
      schema: OPERATION_SCHEMA,
      operationId: id,
      plan,
      planHash: buildPlanHash(plan),
      state: "preflight-proven",
      artifacts: [],
      updatedAt: "2026-08-27T10:00:00Z",
      ...overrides,
    };
  }

  void test("creates, validates, atomically updates, and lists operation journals", async () => {
    const operation = fixtureOperation(operationId);
    const path = await artifacts.createOperation(operation);
    assert.equal(path, artifacts.operationPath(operationId));
    assert.deepEqual(await artifacts.loadOperation(operationId), operation);
    await assert.rejects(
      artifacts.createOperation(operation),
      (error: unknown) => isErrnoException(error) && error.code === "EEXIST",
    );

    const updated = {
      ...operation,
      state: "applied-unsaved",
      updatedAt: "2026-08-27T10:01:00Z",
    };
    await artifacts.updateOperation(updated);
    assert.deepEqual(await artifacts.loadOperation(operationId), updated);
    await assert.rejects(
      artifacts.updateOperation({
        ...updated,
        operationId: "easyeda-missing-operation",
      }),
      /does not exist/u,
    );

    const operationsDir = await artifacts.ensureOperationStorage();
    await writeFile(
      join(operationsDir, "easyeda-broken-journal.json"),
      "{broken",
      "utf8",
    );
    const listed = await artifacts.listOperations();
    assert.equal(
      listed.find((item) => item["operationId"] === operationId)?.["state"],
      "applied-unsaved",
    );
    const unreadable = listed.find(
      (item) => item["operationId"] === "easyeda-broken-journal",
    );
    assert.ok(unreadable);
    assert.equal(unreadable["state"], "journal-unreadable");
    assert.equal(unreadable["mutationState"], "unknown");
    assert.equal(unreadable["hardStop"], true);
    assert.equal(unreadable["mutationMayHaveOccurred"], true);
    assert.equal(
      unreadable["journalPath"],
      join(operationsDir, "easyeda-broken-journal.json"),
    );
    const lastError = unreadable["lastError"];
    assert.ok(isRecord(lastError));
    assert.equal(typeof lastError["name"], "string");
    assert.equal(typeof lastError["message"], "string");
    assert.ok(
      typeof lastError["name"] === "string" && lastError["name"].length <= 128,
    );
    assert.ok(
      typeof lastError["message"] === "string" &&
        lastError["message"].length <= 2048,
    );
    assert.match(
      String(unreadable["nextSafeAction"]),
      /named managed journal/u,
    );
  });

  void test("rejects unsafe journal identities and invalid stored identity", async () => {
    assert.throws(
      () => artifacts.operationPath("../escape"),
      /Invalid operationId/u,
    );
    assert.throws(
      () => artifacts.operationPath("short"),
      /Invalid operationId/u,
    );

    const badId = "easyeda-invalid-identity";
    await artifacts.createOperation({
      ...fixtureOperation(badId),
    });
    const path = artifacts.operationPath(badId);
    const stored = parseJsonRecord(await readFile(path, "utf8"));
    stored["operationId"] = "easyeda-different-identity";
    await writeFile(path, `${JSON.stringify(stored)}\n`, "utf8");
    await assert.rejects(
      artifacts.loadOperation(badId),
      /invalid schema or identity/u,
    );
  });

  void test("writes append-only, hashed phase artifacts with sanitized names", async () => {
    const first = await artifacts.writePhaseArtifact(
      operationId,
      3,
      "Verify Live/Readback",
      {
        ok: true,
        count: 608,
      },
    );
    assert.match(first.path, /03-verify-live-readback\.json$/u);
    const text = await readFile(first.path, "utf8");
    assert.equal(first.sha256, sha256Text(text));
    assert.equal(first.bytes, Buffer.byteLength(text));
    await assert.rejects(
      artifacts.writePhaseArtifact(operationId, 3, "Verify Live/Readback", {
        ok: false,
      }),
      (error: unknown) => isErrnoException(error) && error.code === "EEXIST",
    );
  });

  void test("rejects journal, plan, and phase-artifact hash tampering", async () => {
    const journalId = "easyeda-journal-hash-tamper";
    await artifacts.createOperation(fixtureOperation(journalId));
    const journalPath = artifacts.operationPath(journalId);
    const journal = parseJsonRecord(await readFile(journalPath, "utf8"));
    journal["state"] = "completed";
    await writeFile(
      journalPath,
      `${JSON.stringify(journal, null, 2)}\n`,
      "utf8",
    );
    await assert.rejects(
      artifacts.loadOperation(journalId),
      /failed its self-hash/u,
    );

    const planId = "easyeda-plan-hash-tamper";
    await artifacts.createOperation(fixtureOperation(planId));
    const planPath = artifacts.operationPath(planId);
    const planJournal = parseJsonRecord(await readFile(planPath, "utf8"));
    const storedPlan = planJournal["plan"];
    assert.ok(isRecord(storedPlan));
    storedPlan["intent"] = "Tampered execution-bearing intent.";
    delete planJournal["journalSha256"];
    planJournal["journalSha256"] = sha256Text(canonicalJson(planJournal));
    await writeFile(
      planPath,
      `${JSON.stringify(planJournal, null, 2)}\n`,
      "utf8",
    );
    await assert.rejects(
      artifacts.loadOperation(planId),
      /mismatched plan hash/u,
    );

    const artifactId = "easyeda-phase-hash-tamper";
    const descriptor = await artifacts.writePhaseArtifact(
      artifactId,
      0,
      "preflight",
      {
        state: "baseline",
      },
    );
    await artifacts.createOperation(
      fixtureOperation(artifactId, { artifacts: [descriptor] }),
    );
    await writeFile(descriptor.path, '{"state":"changed"}\n', "utf8");
    await assert.rejects(
      artifacts.loadOperation(artifactId),
      /phase artifact failed hash/u,
    );
  });
});

void describe("bounded artifact reads", () => {
  void test("supports offsets and caps a single read at 256 KiB", async () => {
    const path = join(dataDir, "large-artifact.txt");
    const payloadBytes = 512 * 1024;
    const text = `${"a".repeat(payloadBytes)}tail`;
    await writeFile(path, text, "utf8");

    const first = await artifacts.readArtifact(path, 0, 1024 * 1024);
    assert.equal(first.bytesRead, 256 * 1024);
    assert.equal(first.eof, false);
    assert.equal(first.text.length, 256 * 1024);

    const tail = await artifacts.readArtifact(path, payloadBytes, 32);
    assert.equal(tail.text, "tail");
    assert.equal(tail.eof, true);
  });

  void test("rejects directories", async () => {
    await assert.rejects(
      artifacts.readArtifact(dataDir),
      /regular non-symlink file/u,
    );
  });

  void test("does not create missing parents while reading or verifying", async () => {
    const missingReadParent = join(dataDir, "missing-read", "nested");
    const missingReceiptParent = join(dataDir, "missing-receipt", "nested");

    await assert.rejects(
      artifacts.readArtifact(join(missingReadParent, "artifact.json")),
      (error: unknown) => isErrnoException(error) && error.code === "ENOENT",
    );
    await assert.rejects(
      artifacts.verifyEvidenceReceipt(
        join(missingReceiptParent, "receipt.json"),
      ),
      (error: unknown) => isErrnoException(error) && error.code === "ENOENT",
    );

    await assert.rejects(lstat(missingReadParent), {
      code: "ENOENT",
    });
    await assert.rejects(lstat(missingReceiptParent), {
      code: "ENOENT",
    });
  });

  void test("denies credentials, bridge builds, lease state, upstream-private data, and their hard-link aliases", async () => {
    const tokenPath = join(dataDir, "bridge-token");
    const bridgeBuildDirectory = join(dataDir, "bridge-build");
    const bridgeBuildPaths = [
      join(bridgeBuildDirectory, "authenticated.eext"),
      join(bridgeBuildDirectory, "authenticated.eext.receipt.json"),
      join(bridgeBuildDirectory, "sibling.txt"),
    ];
    const leasePath = join(dataDir, "facade.lock");
    const upstreamPath = join(dataDir, "upstream", "private-state.json");
    const exportDirectory = join(
      dataDir,
      "upstream",
      "artifacts",
      "facade-exports",
      "export-fixture01",
    );
    const exportPath = join(exportDirectory, "board.dsn");
    await writeFile(tokenPath, "bearer-secret\n", "utf8");
    await mkdir(bridgeBuildDirectory, { mode: 0o700 });
    for (const path of bridgeBuildPaths) {
      await writeFile(path, "private-bridge-material\n", "utf8");
    }
    await writeFile(leasePath, '{"token":"lease-secret"}\n', "utf8");
    await mkdir(join(dataDir, "upstream"), { mode: 0o700 });
    await writeFile(upstreamPath, '{"private":true}\n', "utf8");
    await mkdir(exportDirectory, { mode: 0o700, recursive: true });
    await writeFile(exportPath, "public-export\n", "utf8");
    const aliasDirectory = join(dataDir, "allowed-hard-link-aliases");
    const tokenAlias = join(aliasDirectory, "token-copy.txt");
    const buildAlias = join(aliasDirectory, "bridge-copy.eext");
    await mkdir(aliasDirectory, { mode: 0o700 });
    await link(tokenPath, tokenAlias);
    await link(bridgeBuildPaths[0] ?? "", buildAlias);

    for (const path of [
      tokenPath,
      ...bridgeBuildPaths,
      leasePath,
      upstreamPath,
    ]) {
      await assert.rejects(
        artifacts.readArtifact(path),
        /reserved for EasyEDA control credentials or process state/u,
      );
    }
    await assert.rejects(
      artifacts.reserveEvidencePaths({
        resultPath: tokenPath,
        receiptPath: join(dataDir, "token.receipt.json"),
      }),
      /reserved for EasyEDA control credentials or process state/u,
    );
    await assert.rejects(
      artifacts.reserveEvidencePaths({
        resultPath: bridgeBuildPaths[0] ?? "",
        receiptPath: join(dataDir, "bridge-build-result.receipt.json"),
      }),
      /reserved for EasyEDA control credentials or process state/u,
    );
    await assert.rejects(
      artifacts.reserveEvidencePaths({
        resultPath: join(dataDir, "bridge-build-receipt.result.json"),
        receiptPath: bridgeBuildPaths[1] ?? "",
      }),
      /reserved for EasyEDA control credentials or process state/u,
    );
    for (const alias of [tokenAlias, buildAlias]) {
      await assert.rejects(
        artifacts.readArtifact(alias),
        /current-user-owned single-link regular file/u,
      );
    }
    const exported = await artifacts.readArtifact(exportPath);
    assert.equal(exported.text, "public-export\n");
  });
});

void describe("control-root lifetime binding", { concurrency: false }, () => {
  void test("rejects a post-validation control-root replacement without publishing into either directory", async () => {
    const parent = await mkdtemp(
      join("/tmp", "easyeda-control-artifact-root-swap-"),
    );
    const root = join(parent, "control");
    const movedRoot = join(parent, "control-moved");
    const previousRoot = process.env["EASYEDA_CONTROL_DATA_DIR"];
    await mkdir(root, { mode: 0o700 });
    process.env["EASYEDA_CONTROL_DATA_DIR"] = root;
    let swappedArtifacts: ArtifactsModule | undefined;
    try {
      const loaded: unknown = await import(
        `../src/artifacts.ts?root-swap=${encodeURIComponent(root)}`
      );
      assert.ok(isArtifactsModule(loaded));
      swappedArtifacts = loaded;
      await swappedArtifacts.controlRootCapability();
      await rename(root, movedRoot);
      await mkdir(root, { mode: 0o700 });

      await assert.rejects(
        swappedArtifacts.reserveEvidencePaths({
          resultPath: join(root, "evidence", "result.json"),
          receiptPath: join(root, "evidence", "receipt.json"),
        }),
        /control-root pathname changed/u,
      );
      assert.deepEqual(await readdir(root), []);
      assert.deepEqual(await readdir(movedRoot), []);
    } finally {
      if (swappedArtifacts) {
        const controlRoot = await swappedArtifacts.controlRootCapability();
        await controlRoot.close();
      }
      if (previousRoot === undefined) {
        delete process.env["EASYEDA_CONTROL_DATA_DIR"];
      } else {
        process.env["EASYEDA_CONTROL_DATA_DIR"] = previousRoot;
      }
      await rm(parent, { recursive: true, force: true });
    }
  });

  void test("rejects an intermediate managed-parent symlink installed during reservation", async () => {
    const parent = join(dataDir, "reservation-parent-swap");
    const movedParent = join(dataDir, "reservation-parent-swap-moved");
    const evidenceDirectory = join(parent, "evidence");
    const evidence = {
      resultPath: join(evidenceDirectory, "result.json"),
      receiptPath: join(evidenceDirectory, "receipt.json"),
    };
    await mkdir(evidenceDirectory, { mode: 0o700, recursive: true });
    try {
      await assert.rejects(
        artifacts.reserveEvidencePaths(evidence, async () => {
          await rename(parent, movedParent);
          await symlink(movedParent, parent, "dir");
        }),
        /not a real directory/u,
      );
      assert.deepEqual(await readdir(join(movedParent, "evidence")), []);
    } finally {
      await unlink(parent).catch(() => null);
      await rm(movedParent, { recursive: true, force: true });
    }
  });
});
