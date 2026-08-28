import assert from 'node:assert/strict';
import { mkdir, mkdtemp, readFile, readdir, rm, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { after, before, describe, test } from 'node:test';

import {
  buildPlanHash,
  canonicalJson,
  OPERATION_SCHEMA,
  sha256Text,
} from '../src/core.mjs';

let dataDir;
let artifacts;

before(async () => {
  dataDir = await mkdtemp(join(tmpdir(), 'easyeda-control-artifacts-'));
  process.env.EASYEDA_CONTROL_DATA_DIR = dataDir;
  artifacts = await import(`../src/artifacts.mjs?test-dir=${encodeURIComponent(dataDir)}`);
});

after(async () => {
  delete process.env.EASYEDA_CONTROL_DATA_DIR;
  if (dataDir) await rm(dataDir, { recursive: true, force: true });
});

describe('external evidence archives', () => {
  test('writes an exclusive result and a self-hashed receipt', async () => {
    const resultPath = join(dataDir, 'evidence', 'context.result.json');
    const receiptPath = join(dataDir, 'receipts', 'context.receipt.json');
    const request = { toolName: 'easyeda_get_document', args: {} };
    const result = { ok: true, documentUuid: 'doc-1' };
    const metadata = { mode: 'read' };

    const archived = await artifacts.archiveExternalEvidence({
      evidence: { resultPath, receiptPath },
      request,
      result,
      metadata,
    });
    const payloadText = await readFile(resultPath, 'utf8');
    const payload = JSON.parse(payloadText);
    const receipt = JSON.parse(await readFile(receiptPath, 'utf8'));
    const { receiptSha256, ...receiptCore } = receipt;

    assert.equal(payload.schema, 'easyeda-pro-control.tool-result.v1');
    assert.deepEqual(payload.request, request);
    assert.deepEqual(payload.result, result);
    assert.equal(receipt.requestSha256, sha256Text(canonicalJson(request)));
    assert.equal(receipt.resultSha256, sha256Text(payloadText));
    assert.equal(receiptSha256, sha256Text(canonicalJson(receiptCore)));
    assert.equal(archived.resultPath, resultPath);
    assert.equal(archived.receiptPath, receiptPath);
  });

  test('refuses overwrite and removes a newly reserved peer after a partial pair failure', async () => {
    const resultPath = join(dataDir, 'exclusive', 'result.json');
    const receiptPath = join(dataDir, 'exclusive', 'receipt.json');
    await writeFile(receiptPath, 'preexisting\n', { encoding: 'utf8', flag: 'wx' }).catch(async (error) => {
      if (error.code !== 'ENOENT') throw error;
      const { mkdir } = await import('node:fs/promises');
      await mkdir(join(dataDir, 'exclusive'), { recursive: true });
      await writeFile(receiptPath, 'preexisting\n', { encoding: 'utf8', flag: 'wx' });
    });

    await assert.rejects(
      artifacts.archiveExternalEvidence({
        evidence: { resultPath, receiptPath },
        request: { toolName: 'read' },
        result: { ok: true },
      }),
      (error) => error.code === 'EEXIST',
    );
    await assert.rejects(readFile(resultPath, 'utf8'), (error) => error.code === 'ENOENT');
    assert.equal(await readFile(receiptPath, 'utf8'), 'preexisting\n');
  });

  test('reserves managed paths before dispatch and verifies the finalized evidence pair', async () => {
    const evidence = {
      resultPath: join(dataDir, 'reserved', 'read.result.json'),
      receiptPath: join(dataDir, 'reserved', 'read.receipt.json'),
    };
    const reservation = await artifacts.reserveEvidencePaths(evidence);

    await assert.rejects(
      artifacts.reserveEvidencePaths(evidence),
      (error) => error.code === 'EEXIST',
    );
    await artifacts.archiveExternalEvidence({
      reservation,
      request: { toolName: 'easyeda_read_state' },
      result: { state: 'baseline' },
      metadata: { dispatched: true },
    });

    assert.equal((await artifacts.verifyEvidenceReceipt(evidence.receiptPath)).ok, true);
    await writeFile(evidence.resultPath, '{"tampered":true}\n', 'utf8');
    const tampered = await artifacts.verifyEvidenceReceipt(evidence.receiptPath);
    assert.equal(tampered.ok, false);
    assert.equal(tampered.receiptHashOk, true);
    assert.equal(tampered.resultHashOk, false);
  });

  test('refuses unmanaged evidence paths and reservation identity changes', async () => {
    const outside = await mkdtemp(join(tmpdir(), 'easyeda-control-outside-'));
    try {
      await assert.rejects(
        artifacts.reserveEvidencePaths({
          resultPath: join(outside, 'result.json'),
          receiptPath: join(outside, 'receipt.json'),
        }),
        /must stay inside/,
      );

      const evidence = {
        resultPath: join(dataDir, 'reservation-tamper', 'result.json'),
        receiptPath: join(dataDir, 'reservation-tamper', 'receipt.json'),
      };
      const reservation = await artifacts.reserveEvidencePaths(evidence);
      await writeFile(
        evidence.resultPath,
        `${JSON.stringify({ schema: 'easyeda-pro-control.evidence-reservation.v1', token: 'other' })}\n`,
        'utf8',
      );
      await assert.rejects(
        artifacts.archiveExternalEvidence({
          reservation,
          request: { toolName: 'read' },
          result: { ok: true },
        }),
        /reservation identity changed/,
      );
    } finally {
      await rm(outside, { recursive: true, force: true });
    }
  });

  test('releases an undispatched reservation and rejects symlinked managed parents', async () => {
    const evidence = {
      resultPath: join(dataDir, 'released', 'result.json'),
      receiptPath: join(dataDir, 'released', 'receipt.json'),
    };
    const reservation = await artifacts.reserveEvidencePaths(evidence);
    await artifacts.releaseEvidenceReservation(reservation);
    await assert.rejects(readFile(evidence.resultPath), (error) => error.code === 'ENOENT');
    await assert.rejects(readFile(evidence.receiptPath), (error) => error.code === 'ENOENT');

    const outside = await mkdtemp(join(tmpdir(), 'easyeda-control-symlink-target-'));
    try {
      await symlink(outside, join(dataDir, 'linked-parent'), 'dir');
      await assert.rejects(
        artifacts.reserveEvidencePaths({
          resultPath: join(dataDir, 'linked-parent', 'result.json'),
          receiptPath: join(dataDir, 'linked-parent', 'receipt.json'),
        }),
        /not a real directory/,
      );
    } finally {
      await rm(outside, { recursive: true, force: true });
    }
  });

  test('hashes capture images and detects image tampering', async () => {
    const evidence = {
      resultPath: join(dataDir, 'capture', 'capture.result.json'),
      receiptPath: join(dataDir, 'capture', 'capture.receipt.json'),
    };
    const reservation = await artifacts.reserveEvidencePaths(evidence);
    const archived = await artifacts.archiveCaptureEvidence({
      reservation,
      request: { toolName: 'easyeda_canvas_capture' },
      payload: { width: 2, height: 1 },
      images: [{ mimeType: 'image/png', bytes: Buffer.from('fixture-png') }],
      metadata: { projectUuid: 'project-1' },
    });
    const verified = await artifacts.verifyEvidenceReceipt(archived.receiptPath);
    assert.equal(verified.ok, true);
    assert.equal(verified.imageChecks.length, 1);

    await writeFile(verified.imageChecks[0].path, 'changed-image', 'utf8');
    const changed = await artifacts.verifyEvidenceReceipt(archived.receiptPath);
    assert.equal(changed.ok, false);
    assert.equal(changed.imageChecks[0].ok, false);
  });

  test('rehashes export attachments and detects later artifact tampering', async () => {
    const exportPath = join(dataDir, 'exports', 'board-gerbers.zip');
    await mkdir(join(dataDir, 'exports'), { recursive: true });
    await writeFile(exportPath, 'fresh-gerber-archive', 'utf8');
    const evidence = {
      resultPath: join(dataDir, 'export-evidence', 'result.json'),
      receiptPath: join(dataDir, 'export-evidence', 'receipt.json'),
    };
    const archived = await artifacts.archiveExternalEvidence({
      evidence,
      request: { toolName: 'easyeda_export_gerbers', projectId: 'project-1' },
      result: { exported: true, artifact_path: exportPath },
      metadata: { effect: 'artifact-write' },
      attachments: [{ kind: 'export-artifact', path: exportPath }],
    });
    const receipt = JSON.parse(await readFile(archived.receiptPath, 'utf8'));
    assert.equal(receipt.attachments.length, 1);
    assert.equal(receipt.attachments[0].kind, 'export-artifact');
    assert.equal(receipt.attachments[0].path, exportPath);
    assert.equal(receipt.attachments[0].bytes, Buffer.byteLength('fresh-gerber-archive'));
    assert.match(receipt.attachments[0].sha256, /^[a-f0-9]{64}$/);

    const verified = await artifacts.verifyEvidenceReceipt(archived.receiptPath);
    assert.equal(verified.ok, true);
    assert.deepEqual(verified.attachmentChecks, [{ path: exportPath, ok: true }]);

    await writeFile(exportPath, 'tampered-gerber-archive', 'utf8');
    const tampered = await artifacts.verifyEvidenceReceipt(archived.receiptPath);
    assert.equal(tampered.receiptHashOk, true);
    assert.equal(tampered.resultHashOk, true);
    assert.equal(tampered.ok, false);
    assert.deepEqual(tampered.attachmentChecks, [{ path: exportPath, ok: false }]);
  });

  test('hashes a partially written export into dispatched-failure evidence', async () => {
    const exportPath = join(dataDir, 'exports-after-failure', 'partial.dsn');
    await mkdir(join(dataDir, 'exports-after-failure'), { recursive: true });
    await writeFile(exportPath, 'partial-export-bytes', 'utf8');
    const evidence = {
      resultPath: join(dataDir, 'failed-export-evidence', 'result.json'),
      receiptPath: join(dataDir, 'failed-export-evidence', 'receipt.json'),
    };
    const archived = await artifacts.archiveExternalEvidence({
      evidence,
      request: { toolName: 'easyeda_pcb_export_route_context', projectId: 'project-1' },
      result: {
        ok: false,
        outcome: 'dispatched-but-not-proven',
        error: { name: 'Error', message: 'post-dispatch verification failed' },
      },
      metadata: {
        effect: 'artifact-write',
        exportArtifactObserved: { path: exportPath },
      },
      attachments: [{ kind: 'export-artifact-after-failure', path: exportPath }],
    });
    const receipt = JSON.parse(await readFile(archived.receiptPath, 'utf8'));
    assert.deepEqual(receipt.attachments, [
      {
        kind: 'export-artifact-after-failure',
        path: exportPath,
        bytes: Buffer.byteLength('partial-export-bytes'),
        sha256: sha256Text('partial-export-bytes'),
      },
    ]);
    assert.equal((await artifacts.verifyEvidenceReceipt(archived.receiptPath)).ok, true);

    await writeFile(exportPath, 'changed-after-failure', 'utf8');
    const tampered = await artifacts.verifyEvidenceReceipt(archived.receiptPath);
    assert.equal(tampered.ok, false);
    assert.deepEqual(tampered.attachmentChecks, [{ path: exportPath, ok: false }]);
  });
});

describe('operation journals and phase artifacts', () => {
  const operationId = 'easyeda-test-operation-0001';

  function fixturePlan(name = 'Artifact test plan') {
    return {
      name,
      intent: 'Provide a stable plan payload for journal integrity tests.',
      capabilityLevel: 'public-supported',
      expectedFingerprint: { fixture: true },
      expectedContext: { project: { uuid: 'p' }, document: { uuid: 'd', documentType: 3 } },
      preflightCalls: [],
      applyCall: { toolName: 'apply' },
      verifyCalls: [],
      verifyAssertions: [],
      rollbackCalls: [],
      reopenedVerifyCalls: [],
      reopenedAssertions: [],
      checkpoint: { source: '/tmp/project.eprj2', outputDir: '/tmp/checkpoints', label: 'fixture' },
    };
  }

  function fixtureOperation(id, overrides = {}) {
    const plan = fixturePlan(id);
    return {
      schema: OPERATION_SCHEMA,
      operationId: id,
      plan,
      planHash: buildPlanHash(plan),
      state: 'preflight-proven',
      artifacts: [],
      updatedAt: '2026-08-27T10:00:00Z',
      ...overrides,
    };
  }

  test('creates, validates, atomically updates, and lists operation journals', async () => {
    const operation = fixtureOperation(operationId);
    const path = await artifacts.createOperation(operation);
    assert.equal(path, artifacts.operationPath(operationId));
    assert.deepEqual(await artifacts.loadOperation(operationId), operation);
    await assert.rejects(artifacts.createOperation(operation), (error) => error.code === 'EEXIST');

    const updated = { ...operation, state: 'applied-unsaved', updatedAt: '2026-08-27T10:01:00Z' };
    await artifacts.updateOperation(updated);
    assert.deepEqual(await artifacts.loadOperation(operationId), updated);
    await assert.rejects(
      artifacts.updateOperation({ ...updated, operationId: 'easyeda-missing-operation' }),
      /does not exist/,
    );

    const operationsDir = await artifacts.ensureOperationStorage();
    await writeFile(join(operationsDir, 'easyeda-broken-journal.json'), '{broken', 'utf8');
    const listed = await artifacts.listOperations();
    assert.equal(listed.find((item) => item.operationId === operationId)?.state, 'applied-unsaved');
    const unreadable = listed.find((item) => item.operationId === 'easyeda-broken-journal');
    assert.equal(unreadable.state, 'journal-unreadable');
    assert.equal(unreadable.mutationState, 'unknown');
    assert.equal(unreadable.hardStop, true);
    assert.equal(unreadable.mutationMayHaveOccurred, true);
    assert.equal(
      unreadable.journalPath,
      join(operationsDir, 'easyeda-broken-journal.json'),
    );
    assert.equal(typeof unreadable.lastError.name, 'string');
    assert.equal(typeof unreadable.lastError.message, 'string');
    assert.ok(unreadable.lastError.name.length <= 128);
    assert.ok(unreadable.lastError.message.length <= 2048);
    assert.match(unreadable.nextSafeAction, /named managed journal/);
  });

  test('rejects unsafe journal identities and invalid stored identity', async () => {
    assert.throws(() => artifacts.operationPath('../escape'), /Invalid operationId/);
    assert.throws(() => artifacts.operationPath('short'), /Invalid operationId/);

    const badId = 'easyeda-invalid-identity';
    await artifacts.createOperation({
      ...fixtureOperation(badId),
    });
    const path = artifacts.operationPath(badId);
    const stored = JSON.parse(await readFile(path, 'utf8'));
    stored.operationId = 'easyeda-different-identity';
    await writeFile(path, `${JSON.stringify(stored)}\n`, 'utf8');
    await assert.rejects(artifacts.loadOperation(badId), /invalid schema or identity/);
  });

  test('writes append-only, hashed phase artifacts with sanitized names', async () => {
    const first = await artifacts.writePhaseArtifact(operationId, 3, 'Verify Live/Readback', {
      ok: true,
      count: 608,
    });
    assert.match(first.path, /03-verify-live-readback\.json$/);
    const text = await readFile(first.path, 'utf8');
    assert.equal(first.sha256, sha256Text(text));
    assert.equal(first.bytes, Buffer.byteLength(text));
    await assert.rejects(
      artifacts.writePhaseArtifact(operationId, 3, 'Verify Live/Readback', { ok: false }),
      (error) => error.code === 'EEXIST',
    );
  });

  test('rejects journal, plan, and phase-artifact hash tampering', async () => {
    const journalId = 'easyeda-journal-hash-tamper';
    await artifacts.createOperation(fixtureOperation(journalId));
    const journalPath = artifacts.operationPath(journalId);
    const journal = JSON.parse(await readFile(journalPath, 'utf8'));
    journal.state = 'completed';
    await writeFile(journalPath, `${JSON.stringify(journal, null, 2)}\n`, 'utf8');
    await assert.rejects(artifacts.loadOperation(journalId), /failed its self-hash/);

    const planId = 'easyeda-plan-hash-tamper';
    await artifacts.createOperation(fixtureOperation(planId));
    const planPath = artifacts.operationPath(planId);
    const planJournal = JSON.parse(await readFile(planPath, 'utf8'));
    planJournal.plan.intent = 'Tampered execution-bearing intent.';
    const { journalSha256: ignoredPlanHash, ...planCore } = planJournal;
    planJournal.journalSha256 = sha256Text(canonicalJson(planCore));
    await writeFile(planPath, `${JSON.stringify(planJournal, null, 2)}\n`, 'utf8');
    await assert.rejects(artifacts.loadOperation(planId), /mismatched plan hash/);

    const artifactId = 'easyeda-phase-hash-tamper';
    const descriptor = await artifacts.writePhaseArtifact(artifactId, 0, 'preflight', {
      state: 'baseline',
    });
    await artifacts.createOperation(
      fixtureOperation(artifactId, { artifacts: [descriptor] }),
    );
    await writeFile(descriptor.path, '{"state":"changed"}\n', 'utf8');
    await assert.rejects(artifacts.loadOperation(artifactId), /phase artifact failed hash/);
  });
});

describe('bounded artifact reads', () => {
  test('supports offsets and caps a single read at 256 KiB', async () => {
    const path = join(dataDir, 'large-artifact.txt');
    const payloadBytes = 512 * 1024;
    const text = `${'a'.repeat(payloadBytes)}tail`;
    await writeFile(path, text, 'utf8');

    const first = await artifacts.readArtifact(path, 0, 1024 * 1024);
    assert.equal(first.bytesRead, 256 * 1024);
    assert.equal(first.eof, false);
    assert.equal(first.text.length, 256 * 1024);

    const tail = await artifacts.readArtifact(path, payloadBytes, 32);
    assert.equal(tail.text, 'tail');
    assert.equal(tail.eof, true);
  });

  test('rejects directories', async () => {
    await assert.rejects(artifacts.readArtifact(dataDir), /regular non-symlink file/);
  });
});
