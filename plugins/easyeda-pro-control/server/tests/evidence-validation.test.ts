import assert from "node:assert/strict";
import { lstat, mkdtemp, open, readFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { after, before, test } from "node:test";
import { canonicalJson, isRecord, sha256Text } from "../src/core.ts";
import type { UnknownRecord } from "../src/core.ts";
import type {
  archiveCaptureEvidence,
  archiveExternalEvidence,
  controlRootCapability,
  reserveEvidencePaths,
  verifyEvidenceReceipt,
} from "../src/artifacts.ts";

let dataDirectory = "";
let artifacts: {
  archiveCaptureEvidence: typeof archiveCaptureEvidence;
  archiveExternalEvidence: typeof archiveExternalEvidence;
  controlRootCapability: typeof controlRootCapability;
  reserveEvidencePaths: typeof reserveEvidencePaths;
  verifyEvidenceReceipt: typeof verifyEvidenceReceipt;
};

before(async () => {
  dataDirectory = await mkdtemp("/tmp/easyeda-evidence-validation-");
  process.env["EASYEDA_CONTROL_DATA_DIR"] = dataDirectory;
  artifacts = await import("../src/artifacts.ts");
});

after(async () => {
  const root = await artifacts.controlRootCapability();
  await root.close();
  delete process.env["EASYEDA_CONTROL_DATA_DIR"];
  await rm(dataDirectory, { recursive: true, force: true });
});

async function changeReceipt(
  path: string,
  change: (receipt: UnknownRecord) => void,
): Promise<void> {
  const value: unknown = JSON.parse(await readFile(path, "utf8"));
  assert.ok(isRecord(value));
  change(value);
  delete value["receiptSha256"];
  value["receiptSha256"] = sha256Text(canonicalJson(value));
  await writeFile(path, JSON.stringify(value));
}

const receiptCases = [
  ["request digest", (receipt: UnknownRecord): void => { receipt["requestSha256"] = "0".repeat(64); }],
  ["metadata", (receipt: UnknownRecord): void => { receipt["metadata"] = { state: "different" }; }],
  ["attachment omission", (receipt: UnknownRecord): void => { receipt["attachments"] = []; }],
  ["non-array attachments", (receipt: UnknownRecord): void => { receipt["attachments"] = {}; }],
  ["receipt schema", (receipt: UnknownRecord): void => { receipt["schema"] = "easyeda-pro-control.capture-receipt.v1"; receipt["images"] = []; }],
  ["coerced schema", (receipt: UnknownRecord): void => { receipt["schema"] = ["easyeda-pro-control.tool-receipt.v1"]; }],
] as const;

function registerReceiptCase(name: string, change: (receipt: UnknownRecord) => void): void {
  void test(`rejects internally inconsistent evidence ${name} despite valid self-hashes`, async () => {
    const stem = name.replaceAll(" ", "-");
    const resultPath = join(dataDirectory, `${stem}.result.json`);
    const receiptPath = join(dataDirectory, `${stem}.receipt.json`);
    const attachmentPath = join(dataDirectory, `${stem}.dsn`);
    await writeFile(attachmentPath, "fixture-route-context");
    await artifacts.archiveExternalEvidence({
      evidence: { resultPath, receiptPath },
      request: { tool: "fixture" },
      result: { ok: true },
      metadata: { state: "before" },
      attachments: [{ path: attachmentPath, kind: "fixture" }],
    });
    const verified = await artifacts.verifyEvidenceReceipt(receiptPath);
    assert.equal(verified.ok, true);
    await changeReceipt(receiptPath, change);
    await assert.rejects(artifacts.verifyEvidenceReceipt(receiptPath), /evidence|receipt|attachment/iu);
  });
}

for (const [name, change] of receiptCases) {
  registerReceiptCase(name, change);
}

void test("rejects oversized sparse evidence JSON before reading it", async () => {
  const path = join(dataDirectory, "oversized.receipt.json");
  const handle = await open(path, "wx", 0o600);
  try {
    await handle.truncate(64 * 1024 * 1024 + 1);
  } finally {
    await handle.close();
  }
  await assert.rejects(artifacts.verifyEvidenceReceipt(path), /byte limit/iu);
});

void test("rejects capture receipts whose image list omits published images", async () => {
  const resultPath = join(dataDirectory, "capture.result.json");
  const receiptPath = join(dataDirectory, "capture.receipt.json");
  const reservation = await artifacts.reserveEvidencePaths({ resultPath, receiptPath });
  await artifacts.archiveCaptureEvidence({
    reservation,
    request: { tool: "fixture-capture" },
    payload: {},
    images: [{ mimeType: "image/png", bytes: Buffer.from("fixture-image") }],
  });
  await changeReceipt(receiptPath, (receipt) => { receipt["images"] = []; });
  await assert.rejects(artifacts.verifyEvidenceReceipt(receiptPath), /image|receipt/iu);
});

void test("evidence reservation cannot create a journal that quarantines the bridge", async () => {
  const directory = join(dataDirectory, "operations");
  const resultPath = join(directory, "easyeda-not-a-journal.json");
  const receiptPath = join(dataDirectory, "journal-poison.receipt.json");
  await assert.rejects(
    artifacts.reserveEvidencePaths({ resultPath, receiptPath }),
    /reserved for operation journals/u,
  );
  await assert.rejects(lstat(directory), { code: "ENOENT" });
  await assert.rejects(lstat(receiptPath), { code: "ENOENT" });
  await assert.rejects(
    artifacts.reserveEvidencePaths({ resultPath: receiptPath, receiptPath: resultPath }),
    /reserved for operation journals/u,
  );
  await assert.rejects(lstat(directory), { code: "ENOENT" });
  await assert.rejects(lstat(receiptPath), { code: "ENOENT" });
});
