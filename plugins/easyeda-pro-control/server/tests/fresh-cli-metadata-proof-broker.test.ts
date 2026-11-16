import assert from "node:assert/strict";
import { access, appendFile, mkdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { test } from "node:test";
import { createLinuxBrokerProofEvidence, linuxEvidenceBrokerProgram } from "../../scripts/fresh-cli-metadata-proof-broker.ts";
import { parseFreshCliMetadataPlan, parseFreshCliMetadataPlanV2, previewFreshCliMetadataProof } from "../../scripts/fresh-cli-metadata-proof.ts";
import { OwnedProofProcess } from "../../scripts/fresh-cli-metadata-proof-resources.ts";
import type { ProofJournal } from "../../scripts/fresh-cli-metadata-proof-resources.ts";
import { createTestTemporaryDirectory } from "./helpers/temporary-directory.ts";

const NONCE = "00000000-0000-4000-8000-000000000001";
function capture(): ProofJournal {
  const retained: Buffer[] = [];
  return { append(bytes): boolean { retained.push(Buffer.from(bytes)); return true; }, put(value): boolean { retained.push(Buffer.from(JSON.stringify(value))); return true; }, flush(): boolean { return true; }, snapshot(): Record<string, unknown> { return { receivedBytes: retained.reduce((count, bytes) => count + bytes.length, 0) }; } };
}
void test("v2 has only Linux evidence and actual serial fsync ACK gates normal dispatch and original broker closure", async (context) => {
  const root = await createTestTemporaryDirectory("fresh-cli-broker-durable-"); const directory = join(root, "evidence");
  const plan = { schema: "easyeda-pro-control.fresh-cli-metadata-plan.v2", host: "windows", mergedCommit: "a".repeat(40), version: "0.3.0", cliExecutable: "C:\\trusted\\codex.exe", expectedHostNodeVersion: "v24.10.0", linuxPluginRoot: "/trusted/plugin", linuxNodeExecutable: "/trusted/node", linuxNodeSha256: "0".repeat(64), hostPluginRoot: "C:\\trusted\\plugin", linuxEvidenceDirectory: directory, evidenceBackend: "wsl-linux-fsync.v1", workspace: "C:\\new-workspace", distribution: "Ubuntu-24.04", overrides: [], windowsNodeExecutable: "C:\\trusted\\node.exe", windowsNodeSha256: "0".repeat(64),
    files: ["server/dist/server.mjs", "server/dist/upstream-supervisor.mjs", "server/bin/easyeda-fd-sanitizer", "server/dist/control-session-manager.mjs", "reviewed-compatibility.json", ".codex-plugin/plugin.json"].map((relativePath, index) => ({ relativePath, bytes: 1, sha256: "0".repeat(64), mode: index === 2 ? 0o755 : 0o644 })) };
  const parsed = parseFreshCliMetadataPlanV2(JSON.stringify(plan)); assert.equal(previewFreshCliMetadataProof(parsed)["ownerStarted"], false); assert.throws(() => parseFreshCliMetadataPlan(JSON.stringify(plan)));
  for (const extra of [{ ...plan, evidenceDirectory: "C:\\unused-evidence" }, { ...plan, evidenceBackend: "arbitrary" }, { ...plan, linuxEvidenceDirectory: "/trusted/../elsewhere" }, { ...plan, program: "arbitrary" }]) { assert.throws(() => parseFreshCliMetadataPlanV2(JSON.stringify(extra))); }
  const evidence = await createLinuxBrokerProofEvidence({ distribution: "Ubuntu-24.04", linuxEvidenceDirectory: directory, workspace: join(root, "workspace"), nonce: NONCE });
  try {
    const bytes = Buffer.from("€\u0000🙂\n".repeat(12_000)); assert.equal(evidence.journal("app-server.stdout.jsonl").append(bytes), true); assert.equal(evidence.hasPending(), true);
    let normalDispatch = false; const barrier = evidence.flush(); const originalSend = (async (): Promise<void> => { assert.equal(await barrier, true); normalDispatch = true; })(); assert.equal(normalDispatch, false); await originalSend; assert.equal(normalDispatch, true);
    assert.deepEqual(await readFile(join(directory, "app-server.stdout.jsonl")), bytes); assert.equal(evidence.hasPending(), false);
    const control = Buffer.from(`${JSON.stringify({ nonce: NONCE, action: "status" })}\n`); await appendFile(join(directory, "control.jsonl"), control); assert.deepEqual(await evidence.readControl(), control);
    // oxlint-disable-next-line typescript/unbound-method -- Retain the exact original implementation, call it with its receiver, then restore it after this inert ACK-delay fixture.
    const originalNext = OwnedProofProcess.prototype.next; const closeSeen = Promise.withResolvers<null>(), releaseClose = Promise.withResolvers<null>();
    context.mock.timers.enable({ apis: ["setTimeout"] });
    OwnedProofProcess.prototype.next = async function next(this: OwnedProofProcess): Promise<unknown> {
      const value = await originalNext.call(this); if (value !== null && typeof value === "object" && "kind" in value && value.kind === "close-ready") { closeSeen.resolve(null); await releaseClose.promise; } return value;
    };
    try {
      const originalClose = evidence.close(); await closeSeen.promise; context.mock.timers.tick(30_000); assert.equal(await originalClose, false);
      releaseClose.resolve(null); assert.equal(await evidence.flush(), true); assert.equal(await evidence.close(), true); assert.equal(evidence.failed(), true);
    } finally { releaseClose.resolve(null); OwnedProofProcess.prototype.next = originalNext; context.mock.timers.reset(); }
    const protocol = await readFile(join(directory, "broker-protocol.jsonl"), "utf8"); const lines: unknown[] = protocol.trim().split("\n").map((line: string): unknown => JSON.parse(line));
    assert.equal(lines.filter(line => line !== null && typeof line === "object" && "kind" in line && line.kind === "close-ready").length, 1);
    const last = lines.at(-1); assert.ok(last !== null && typeof last === "object" && "kind" in last && last.kind === "close-ready");
    const backend = evidence.snapshots().at(-1); assert.ok(backend !== undefined && "originalClose" in backend && backend["originalClose"] !== null && typeof backend["originalClose"] === "object" && "code" in backend["originalClose"]); assert.equal(backend["originalClose"].code, 0);
  } finally { await evidence.close(); }
});

void test("fixed broker refuses a traversal journal before downstream write and joins the original failed process", async () => {
  const root = await createTestTemporaryDirectory("fresh-cli-broker-refusal-"); const workspace = join(root, "workspace"); await mkdir(workspace);
  const peer = new OwnedProofProcess("/usr/bin/python3", ["-I", "-S", "-c", linuxEvidenceBrokerProgram()], workspace, capture(), capture());
  try {
    await peer.sendWatcherPacket({ schema: "easyeda-pro-control.fresh-cli-linux-evidence-broker.v1", seq: 1, op: "initialize", directory: join(root, "evidence"), nonce: NONCE }); const ready = await peer.next(); assert.ok(ready !== null && typeof ready === "object" && "fileAndDirectorySync" in ready && ready.fileAndDirectorySync === true);
    const bytes = Buffer.from("retained € original bytes\n"); await peer.sendWatcherPacket({ seq: 2, op: "append", journal: "state.jsonl", offset: 0, bytes: bytes.toString("base64") }); const acknowledged = await peer.next(); assert.ok(acknowledged !== null && typeof acknowledged === "object" && "ok" in acknowledged && acknowledged.ok === true);
    await peer.sendWatcherPacket({ seq: 3, op: "append", journal: "../escape", offset: 0, bytes: Buffer.from("must not write").toString("base64") }); const refused = await peer.next(); assert.ok(refused !== null && typeof refused === "object" && "kind" in refused && refused.kind === "refused" && "seq" in refused && refused.seq === 3);
    peer.closeInput(); assert.deepEqual(await peer.closed.promise, { code: 1, signal: null }); assert.deepEqual(await readFile(join(root, "evidence/state.jsonl")), bytes); await assert.rejects(access(join(root, "escape")));
  } finally { peer.closeInput(); await peer.closed.promise; }
});


void test("accepted pre-owner abort remains sticky when the original ready ACK has already resolved", async () => {
  const root = await createTestTemporaryDirectory("fresh-cli-broker-abort-"); let originalBroker: OwnedProofProcess | undefined;
  // oxlint-disable-next-line typescript/unbound-method -- Preserve and receiver-bind the original implementation at this exact inert ready/abort boundary.
  const originalNext = OwnedProofProcess.prototype.next;
  OwnedProofProcess.prototype.next = async function next(this: OwnedProofProcess): Promise<unknown> {
    const value = await originalNext.call(this);
    if (value !== null && typeof value === "object" && "kind" in value && value.kind === "ready") {
      // oxlint-disable-next-line typescript/no-this-alias, unicorn/no-this-assignment -- Retain the exact allocated peer through abort and original close, rather than reconstructing it from a PID.
      originalBroker = this;
      process.stdin.emit("data", Buffer.from(`${JSON.stringify({ nonce: NONCE, action: "close-cli-stdin" })}\n`));
    }
    return value;
  };
  try {
    const originalSetup = createLinuxBrokerProofEvidence({ distribution: "Ubuntu-24.04", linuxEvidenceDirectory: join(root, "evidence"), workspace: join(root, "workspace"), nonce: NONCE });
    await assert.rejects(originalSetup, /ORIGINAL_LINUX_EVIDENCE_BROKER_SETUP_FAILED/u);
    assert.ok(originalBroker !== undefined); assert.equal(originalBroker.child.stdin.writableEnded, true); assert.deepEqual(originalBroker.closeResult, { code: 1, signal: null });
  } finally { OwnedProofProcess.prototype.next = originalNext; originalBroker?.closeInput(); if (originalBroker !== undefined) { await originalBroker.closed.promise; } }
});
