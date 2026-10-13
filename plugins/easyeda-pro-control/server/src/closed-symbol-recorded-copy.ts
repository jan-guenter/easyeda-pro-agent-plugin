/** Internal historical evidence reader. Never restores action authority. */
import type { BigIntStats } from "node:fs";
import { lstat } from "node:fs/promises";
import { basename, dirname, isAbsolute, resolve } from "node:path";
import { controlRootCapability, operationPath } from "./artifacts.ts";
import type { ClosedFileCopyReceipt } from "./closed-file-copy.ts";
import { loadClosedSymbolHistoricalPhaseJournal as loadClosedSymbolJournal } from "./closed-symbol-journal.ts";
import { canonicalJson, isRecord, sha256Json } from "./core.ts";
import type { MachineProfile } from "./machine-profile.ts";
import { readExactSqlInventory, readerCompletion } from "./sqlite-inventory.ts";

type CopyPhase = "baseline-copy" | "edit-copy" | "verify-copy";
const HASH = /^[a-f0-9]{64}$/u;
const NUMBER = /^(?:0|[1-9][0-9]{0,30})$/u;
const IDENTITY_KEYS = ["device", "inode", "size", "mtimeNs", "ctimeNs", "birthtimeNs", "mode", "uid", "gid", "links"] as const;
type FileIdentity = ClosedFileCopyReceipt["artifactIdentity"];
function requireValue(condition: boolean, message: string): asserts condition { if (!condition) { throw new Error(message); } }
function exact(input: unknown, keys: readonly string[]): Record<string, unknown> {
  requireValue(isRecord(input) && (Object.getPrototypeOf(input) === Object.prototype || Object.getPrototypeOf(input) === null) && Reflect.ownKeys(input).length === keys.length, "Recorded copy exact object refused.");
  const result: Record<string, unknown> = {};
  for (const key of keys) {
    const descriptor = Object.getOwnPropertyDescriptor(input, key);
    requireValue(descriptor !== undefined && Object.hasOwn(descriptor, "value"), "Recorded copy requires own data fields.");
    result[key] = descriptor.value as unknown;
  }
  return result;
}
function text(input: unknown, expression: RegExp): string { requireValue(typeof input === "string" && expression.test(input), "Recorded copy text refused."); return input; }
function fileIdentity(input: unknown, bytes: number): FileIdentity {
  const value = exact(input, IDENTITY_KEYS);
  const result = { device: text(value["device"], NUMBER), inode: text(value["inode"], NUMBER), size: text(value["size"], NUMBER),
    mtimeNs: text(value["mtimeNs"], NUMBER), ctimeNs: text(value["ctimeNs"], NUMBER), birthtimeNs: text(value["birthtimeNs"], NUMBER),
    mode: text(value["mode"], NUMBER), uid: text(value["uid"], NUMBER), gid: text(value["gid"], NUMBER), links: text(value["links"], NUMBER) };
  requireValue(result.size === String(bytes) && result.links === "1" && BigInt(result.mode) <= 65_535n, "Recorded copy file identity refused.");
  return Object.freeze(result);
}
function copyReceipt(input: unknown, source: string, directory: string): ClosedFileCopyReceipt {
  const value = exact(input, ["schema", "source", "artifact", "bytes", "sha256", "sourceIdentity", "artifactIdentity", "closureProofSha256", "sourceEqualsArtifactBytes", "sourceProjectGenerationBindingVerified", "executionAuthorized", "receiptSha256"]);
  requireValue(value["schema"] === "easyeda-pro-control.closed-file-byte-copy.v1" && value["source"] === source && isAbsolute(source) && resolve(source) === source && source.endsWith(".eprj2"), "Recorded copy source/schema binding refused.");
  const artifact = value["artifact"];
  requireValue(typeof artifact === "string" && dirname(artifact) === directory && resolve(artifact) === artifact && /^closed-copy-[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}\.eprj2$/u.test(basename(artifact)), "Recorded copy artifact is not the operation-owned direct child.");
  const bytes = value["bytes"];
  requireValue(typeof bytes === "number" && Number.isSafeInteger(bytes) && bytes > 0 && bytes <= 268_435_456, "Recorded copy byte bound refused.");
  requireValue(value["sourceEqualsArtifactBytes"] === true && value["sourceProjectGenerationBindingVerified"] === false && value["executionAuthorized"] === false, "Recorded copy authority flags refused.");
  const payload = { schema: "easyeda-pro-control.closed-file-byte-copy.v1" as const, source, artifact, bytes,
    sha256: text(value["sha256"], HASH), sourceIdentity: fileIdentity(value["sourceIdentity"], bytes), artifactIdentity: fileIdentity(value["artifactIdentity"], bytes),
    closureProofSha256: text(value["closureProofSha256"], HASH), sourceEqualsArtifactBytes: true as const, sourceProjectGenerationBindingVerified: false as const, executionAuthorized: false as const };
  const receiptSha256 = text(value["receiptSha256"], HASH);
  requireValue(receiptSha256 === sha256Json(payload), "Recorded copy receipt digest refused.");
  return Object.freeze({ ...payload, receiptSha256 });
}
function identity(value: BigIntStats): FileIdentity {
  return { device: value.dev.toString(), inode: value.ino.toString(), size: value.size.toString(), mtimeNs: value.mtimeNs.toString(), ctimeNs: value.ctimeNs.toString(), birthtimeNs: value.birthtimeNs.toString(), mode: value.mode.toString(), uid: value.uid.toString(), gid: value.gid.toString(), links: value.nlink.toString() };
}
async function assertArtifact(path: string, expected: FileIdentity): Promise<void> {
  const value = await lstat(path, { bigint: true });
  requireValue(value.isFile() && !value.isSymbolicLink() && value.nlink === 1n && value.mode % 512n === 0o600n && typeof process.getuid === "function" && value.uid === BigInt(process.getuid()) && canonicalJson(identity(value)) === canonicalJson(expected), "Recorded copy artifact identity changed.");
}

export async function inspectRecordedClosedCopy(input: Readonly<{ operationId: string; phase: CopyPhase; runtime: MachineProfile["runtime"] }>): Promise<Readonly<{
  inventory: Awaited<ReturnType<typeof readExactSqlInventory>>; evidence: Readonly<Record<string, unknown>>;
}>> {
  const argumentsValue = exact(input, ["operationId", "phase", "runtime"]);
  const operationId = text(argumentsValue["operationId"], /^easyeda-[a-z0-9-]{8,96}$/u);
  const phase = argumentsValue["phase"];
  requireValue(phase === "baseline-copy" || phase === "edit-copy" || phase === "verify-copy", "Recorded copy phase refused.");
  const runtimeValue = exact(argumentsValue["runtime"], ["nodeExecutable", "nodeVersion", "nodeSha256"]);
  requireValue(runtimeValue["nodeVersion"] === "24.18.0", "Recorded copy runtime version refused.");
  const nodeExecutable = text(runtimeValue["nodeExecutable"], /^\/.{1,2047}$/u);
  requireValue(!nodeExecutable.includes(String.fromCodePoint(0)) && !nodeExecutable.includes("\r") && !nodeExecutable.includes("\n"), "Recorded copy executable path refused.");
  const runtime = Object.freeze({ nodeExecutable, nodeVersion: "24.18.0" as const, nodeSha256: text(runtimeValue["nodeSha256"], HASH) });
  // Existing-only capability must be retained before any lazy artifact-store read.
  const root = await controlRootCapability(false);
  const initial = await loadClosedSymbolJournal(operationId);
  const event = initial.events.find((value) => value.step === phase && value.kind === "result");
  requireValue(event !== undefined, "Recorded copy result is absent; no remaining action is authorized.");
  const data = exact(event.data, ["copyReceipt", "sqlDigests"]);
  const directoryPath = operationPath(operationId).slice(0, -5);
  const copy = copyReceipt(data["copyReceipt"], initial.journal.plan.projectPath, directoryPath);
  const expected = exact(data["sqlDigests"], ["checkpointSha256", "schemaSha256", "logicalSha256"]);
  for (const name of ["checkpointSha256", "schemaSha256", "logicalSha256"]) { text(expected[name], HASH); }
  requireValue(expected["checkpointSha256"] === copy.sha256, "Recorded copy SQL digest binding refused.");
  const directory = await root.openDirectory(directoryPath, false);
  try {
    const bound = `/proc/self/fd/${directory.handle.fd}/${basename(copy.artifact)}`;
    await assertArtifact(bound, copy.artifactIdentity);
    await assertArtifact(copy.artifact, copy.artifactIdentity);
    const inventory = await readExactSqlInventory({ checkpointPath: copy.artifact, expectedSha256: copy.sha256, runtime });
    requireValue(inventory.checkpointSha256 === expected["checkpointSha256"] && inventory.schemaSha256 === expected["schemaSha256"] && inventory.logicalSha256 === expected["logicalSha256"], "Recorded copy SQL inventory digests changed.");
    await assertArtifact(bound, copy.artifactIdentity);
    await assertArtifact(copy.artifact, copy.artifactIdentity);
    await root.assertCurrent();
    const current = await root.openDirectory(directoryPath, false);
    try {
      requireValue(current.info.dev === directory.info.dev && current.info.ino === directory.info.ino, "Recorded copy operation directory changed.");
    } finally { await current.handle.close(); }
    const final = await loadClosedSymbolJournal(operationId);
    requireValue(canonicalJson(final.journal) === canonicalJson(initial.journal), "Recorded copy journal changed during inspection.");
    await assertArtifact(bound, copy.artifactIdentity);
    await assertArtifact(copy.artifact, copy.artifactIdentity);
    return Object.freeze({ inventory, evidence: Object.freeze({ profile: "easyeda-pro-control.recorded-closed-copy-evidence.v1", operationId, phase,
      closedPlanSha256: initial.journal.closedPlanSha256, phaseDataSha256: event.dataSha256, copyReceiptSha256: copy.receiptSha256,
      checkpointSha256: inventory.checkpointSha256, schemaSha256: inventory.schemaSha256, logicalSha256: inventory.logicalSha256,
      readerCompletion: readerCompletion(inventory), historicalEvidenceVerified: true, copyAuthorityRestored: false, closureAuthorityRestored: false,
      sourceProjectGenerationBindingVerified: false, executionAuthorized: false, replayAllowed: false, completionProved: false }) });
  } finally { await directory.handle.close(); }
}
