/** Historical retained-file comparison only. Never reads the original project,
 * recreates process authority, or qualifies startup/persistence effects.
 */
import { lstat, opendir } from "node:fs/promises";
import { basename, join } from "node:path";
import { z } from "zod";
import { controlDataDirectory, controlRootCapability, loadOperation, operationPath, readArtifact, readExactUtf8Artifact, verifyExactManagedArtifact } from "./artifacts.ts";
import { canonicalJson, isRecord, normalizeEasyedaProjectPath, sha256Json, sha256Text } from "./core.ts";
import { yieldProofEventLoop } from "./cooperative-proof.ts";
import type { MachineProfile } from "./machine-profile.ts";
import { nativeDocumentRecordHistoryProjection, validateNativeDocumentRecordHistory } from "./native-document-record-history.ts";
import { readNativeHistoryCheckpoint } from "./native-history.ts";
import type { NativeHistorySnapshot } from "./native-history.ts";
import { readExactSqlInventory, readerCompletion } from "./sqlite-inventory.ts";

const PROFILE = "easyeda-pro-control.current-symbol-baseline-analysis.v1";
const BASELINE_PROFILE = "easyeda-pro-control.current-symbol-closed-baseline.v1";
const MAX_JSON_BYTES = 262_144;
const MAX_REPORT_BYTES = 524_288;
const phases = ["capture-intent", "capture-result", "close-intent", "close-result", "copy-intent", "copy-result",
  "relaunch-intent", "relaunch-result", "capture-release-intent", "capture-release-result", "admission-intent",
  "admission-capture-intent", "admission-capture-result", "admission-result", "cache-intent", "cache-result",
  "project-only-intent", "project-only-result", "finish-close-intent", "finish-close-result", "finish-snapshot-intent",
  "finish-snapshot-result", "finish-retirement-proof", "finish-release-intent"] as const;
const identifier = z.string().regex(/^[a-z0-9][a-z0-9-]{7,95}$/u);
const hash = z.string().regex(/^[a-f0-9]{64}$/u);
const descriptorSchema = z.object({ path: z.string().min(1).max(4096), bytes: z.number().int().positive().max(268_435_456), sha256: hash }).strict();
const decimal = z.string().regex(/^(?:0|[1-9][0-9]*)$/u);
const identitySchema = z.object({ dev: decimal, ino: decimal, birthtimeNs: decimal, ctimeNs: decimal }).strict();
const statSchema = z.object({ size: decimal, mtimeNs: decimal, ctimeNs: decimal }).strict();
const fileIdentitySchema = z.object({ device: decimal, inode: decimal, size: decimal, mtimeNs: decimal, ctimeNs: decimal,
  birthtimeNs: decimal, mode: decimal, uid: decimal, gid: decimal, links: z.literal("1") }).strict();
const checkpointSchema = z.object({ schema: z.literal("easyeda-pro-control.checkpoint.v2"), createdAt: z.iso.datetime(),
  source: z.string().min(1).max(4096), checkpoint: z.string().min(1).max(4096), receiptPath: z.string().min(1).max(4096),
  sourceIdentity: identitySchema, checkpointIdentity: identitySchema, sourceStatBefore: statSchema, sourceStatAfter: statSchema,
  sourceDataVersion: z.number().int().nonnegative(), sourceSha256: hash, checkpointSha256: hash, sourceDumpSha256: hash, checkpointDumpSha256: hash,
  quickCheck: z.object({ sourceBefore: z.literal("ok"), sourceAfter: z.literal("ok"), checkpoint: z.literal("ok") }).strict(),
  integrityModel: z.string().min(1).max(4096), receiptSha256: hash }).strict();
const copySchema = z.object({ schema: z.literal("easyeda-pro-control.closed-file-byte-copy.v1"), source: z.string().min(1).max(4096),
  artifact: z.string().min(1).max(4096), bytes: z.number().int().positive().max(268_435_456), sha256: hash,
  sourceIdentity: fileIdentitySchema, artifactIdentity: fileIdentitySchema, closureProofSha256: hash,
  sourceEqualsArtifactBytes: z.literal(true), sourceProjectGenerationBindingVerified: z.literal(false), executionAuthorized: z.literal(false), receiptSha256: hash }).strict();
type Descriptor = z.infer<typeof descriptorSchema>;
type Bag = Record<string, unknown>;
type Inventory = Awaited<ReturnType<typeof readExactSqlInventory>>;
interface Snapshot {
  readonly raw: Descriptor; readonly checkpoint: Descriptor; readonly receipt: Descriptor;
  readonly copy: Bag; readonly checkpointReceipt: Bag; readonly result: Bag;
}
interface Evidence {
  readonly journal: Awaited<ReturnType<typeof loadOperation>>; readonly events: readonly Bag[];
  readonly baseline: Snapshot; readonly finish: Snapshot; readonly projectUuid: string; readonly branchUuid: string; readonly ownerUuid: string;
}
function need(condition: boolean, detail: string): asserts condition { if (!condition) { throw new Error(`Current baseline analysis ${detail}.`); } }
function bag(value: unknown): Bag { need(isRecord(value), "requires an object"); return value; }
function same(left: unknown, right: unknown, detail: string): void { need(canonicalJson(left) === canonicalJson(right), detail); }
function sealed(value: unknown, key: string): Bag {
  const object = bag(value); const expected = hash.parse(object[key]);
  const payload = Object.fromEntries(Object.entries(object).filter(([name]) => name !== key));
  need(sha256Json(payload) === expected, `${key} differs`); return object;
}
function eventAt(events: readonly Bag[], phase: typeof phases[number]): Bag {
  const value = events[phases.indexOf(phase)]; need(value !== undefined, "phase is absent"); return value;
}
async function checkpointReceipt(path: string, expected: Bag): Promise<Descriptor> {
  const page = await readArtifact(path, 0, MAX_JSON_BYTES);
  need(page.eof && page.size > 0 && page.size <= MAX_JSON_BYTES && page.bytesRead === page.size, "checkpoint receipt exceeds its bound");
  const descriptor = descriptorSchema.parse({ path, bytes: page.size, sha256: sha256Text(page.text) });
  const raw = await readExactUtf8Artifact(descriptor); same(JSON.parse(raw.text), expected, "checkpoint receipt changed"); return descriptor;
}
async function snapshot(operationId: string, result: Bag, source: string): Promise<Snapshot> {
  const checkpoint = checkpointSchema.parse(sealed(result["checkpoint"], "receiptSha256")), copy = copySchema.parse(sealed(result["copy"], "receiptSha256")), sql = bag(result["sql"]);
  need(checkpoint.source === source && copy.source === source && checkpoint.sourceSha256 === copy.sha256 && sql["checkpointSha256"] === copy.sha256 &&
    checkpoint.sourceDumpSha256 === checkpoint.checkpointDumpSha256 && checkpoint.sourceStatAfter.size === String(copy.bytes) && copy.sourceIdentity.size === String(copy.bytes) &&
    checkpoint.sourceStatAfter.mtimeNs === copy.sourceIdentity.mtimeNs && checkpoint.sourceStatAfter.ctimeNs === copy.sourceIdentity.ctimeNs,
  "snapshot source or raw-copy binding differs");
  hash.parse(sql["schemaSha256"]); hash.parse(sql["logicalSha256"]);
  const raw = descriptorSchema.parse({ path: copy.artifact, bytes: copy.bytes, sha256: copy.sha256 });
  need(/^closed-copy-[a-f0-9-]{36}\.eprj2$/u.test(basename(raw.path)) && raw.path === join(operationPath(operationId).slice(0, -5), basename(raw.path)),
    "raw copy escaped its operation");
  const rawStat = await lstat(raw.path, { bigint: true }); const rawIdentity = bag(copy.artifactIdentity);
  for (const [key, value] of Object.entries({ device: rawStat.dev, inode: rawStat.ino, size: rawStat.size, mtimeNs: rawStat.mtimeNs,
    ctimeNs: rawStat.ctimeNs, birthtimeNs: rawStat.birthtimeNs, mode: rawStat.mode, uid: rawStat.uid, gid: rawStat.gid, links: rawStat.nlink })) {
    need(value.toString() === rawIdentity[key], "raw-copy identity differs");
  }
  need(rawStat.isFile() && !rawStat.isSymbolicLink() && rawStat.nlink === 1n, "raw-copy file kind differs");
  const checkpointPath = checkpoint.checkpoint, receiptPath = checkpoint.receiptPath;
  need(checkpointPath === join(controlDataDirectory(), "checkpoints", basename(checkpointPath)) && checkpointPath.endsWith(".eprj2") &&
    receiptPath === checkpointPath.replace(/\.eprj2$/u, ".checkpoint.json"), "checkpoint escaped its managed directory");
  const receipt = await checkpointReceipt(receiptPath, checkpoint);
  const stat = await lstat(checkpointPath, { bigint: true }); const identity = bag(checkpoint.checkpointIdentity);
  need(stat.isFile() && !stat.isSymbolicLink() && stat.nlink === 1n && stat.dev.toString() === identity["dev"] &&
    stat.ino.toString() === identity["ino"] && stat.birthtimeNs.toString() === identity["birthtimeNs"] && stat.ctimeNs.toString() === identity["ctimeNs"],
  "checkpoint identity differs");
  const checkpointArtifact = descriptorSchema.parse({ path: checkpointPath, bytes: Number(stat.size), sha256: checkpoint.checkpointSha256 });
  await verifyExactManagedArtifact(raw); await verifyExactManagedArtifact(checkpointArtifact);
  const sourceIdentity = bag(checkpoint.sourceIdentity); const copySourceIdentity = bag(copy.sourceIdentity);
  need(sourceIdentity["dev"] === copySourceIdentity["device"] && sourceIdentity["ino"] === copySourceIdentity["inode"] &&
    sourceIdentity["birthtimeNs"] === copySourceIdentity["birthtimeNs"] && sourceIdentity["ctimeNs"] === copySourceIdentity["ctimeNs"],
  "snapshot source identity projections differ");
  return { raw, checkpoint: checkpointArtifact, receipt, copy, checkpointReceipt: checkpoint, result };
}
async function exactDirectory(operationId: string, names: readonly string[]): Promise<void> {
  const root = await controlRootCapability(false); const directory = await root.openDirectory(operationPath(operationId).slice(0, -5), false);
  try {
    const expected = new Set(names), seen = new Set<string>(); need(expected.size === names.length, "duplicate file descriptor");
    const entries = await opendir(`/proc/self/fd/${directory.handle.fd}`);
    for await (const entry of entries) {
      need(entry.isFile() && expected.has(entry.name) && !seen.has(entry.name), "found later or conflicting evidence"); seen.add(entry.name);
    }
    need(seen.size === expected.size, "evidence directory is incomplete");
    const after = await directory.handle.stat({ bigint: true });
    const unchanged = (info: typeof after): boolean => info.dev === directory.info.dev && info.ino === directory.info.ino &&
      info.ctimeNs === directory.info.ctimeNs && info.mtimeNs === directory.info.mtimeNs;
    need(unchanged(after), "evidence directory changed");
    const named = await root.openDirectory(directory.absolute, false);
    try { need(unchanged(named.info), "evidence directory was substituted"); } finally { await named.handle.close(); }
    await root.assertCurrent();
  } finally { await directory.handle.close(); }
}
function closure(events: readonly Bag[], operationId: string, final: boolean, launch: Bag): Bag {
  const capture = bag(eventAt(events, final ? "admission-capture-result" : "capture-result")["capture"]);
  const intent = sealed(eventAt(events, final ? "finish-close-intent" : "close-intent")["intent"], "closeIntentSha256");
  const receipt = sealed(eventAt(events, final ? "finish-close-result" : "close-result")["closeReceipt"], "closeReceiptSha256");
  const proof = sealed(eventAt(events, final ? "finish-snapshot-intent" : "copy-intent")["proof"], "proofSha256");
  const phase = final ? "closed-edit" : "closed-baseline";
  need(intent["schema"] === "easyeda-pro-control.closed-session-close-intent.v1" &&
    receipt["schema"] === "easyeda-pro-control.closed-session-close-dispatch.v1" && proof["schema"] === "easyeda-pro-control.closed-session-termination.v1" &&
    capture["operationId"] === operationId && capture["phase"] === phase && capture["challengeAttempt"] === 1 &&
    proof["operationId"] === operationId && proof["phase"] === phase && proof["challengeAttempt"] === 1 &&
    proof["closeIntentSha256"] === intent["closeIntentSha256"] && proof["closeReceiptSha256"] === receipt["closeReceiptSha256"] &&
    receipt["closeIntentSha256"] === intent["closeIntentSha256"] && receipt["closeDispatched"] === true && receipt["saveOrDiscardSelected"] === false &&
    receipt["terminationProved"] === false && proof["jobEmpty"] === true && proof["retainedProcessesExited"] === true && proof["saveOrDiscardSelected"] === false &&
    proof["queuedWritesPersisted"] === "not-proved" && proof["persistentWorkReplayExcluded"] === "not-proved",
  "recorded closure chain differs");
  const authority = sealed(capture["executionAuthority"], "authoritySha256");
  const processes = z.array(z.record(z.string(), z.unknown())).min(1).max(512).parse(authority["processes"]);
  need(authority["schema"] === "easyeda-pro-control.execution-authority.v1" && authority["processTreeSha256"] === sha256Json(processes) &&
    intent["captureBindingSha256"] === authority["bindingSha256"], "captured authority binding differs");
  same(processes.filter(process => process["role"] === "easyeda-main"), [launch["root"]], "captured root differs");
  const jobId = z.string().regex(/^[a-f0-9]{32}$/u).parse(launch["jobId"]); const helperInstance = z.string().regex(/^[a-f0-9]{32}$/u).parse(launch["helperInstance"]);
  need(processes.every(process => typeof process["startIdentity"] === "string" && process["startIdentity"].endsWith(`:job:${jobId}`)), "captured Job differs");
  for (const [key, value] of Object.entries({ operationId, phase, challengeAttempt: 1, authoritySha256: authority["authoritySha256"],
    bridgeSessionSha256: sha256Json(capture["bridgeSession"]), runtimeIdentitySha256: sha256Json(capture["runtimeIdentity"]),
    launchSha256: sha256Json(launch), jobId, helperInstance, policyId: authority["policyId"], policySha256: authority["policySha256"] })) {
    same(intent[key], value, "close intent capture differs"); same(proof[key], value, "termination capture differs");
  }
  return proof;
}
async function evidence(operationId: string): Promise<Evidence> {
  const journal = await loadOperation(identifier.parse(operationId)), plan = bag(journal.plan);
  need(journal.operationId === operationId && journal["journalPath"] === operationPath(operationId) && plan["profile"] === BASELINE_PROFILE &&
    journal["state"] === "plan-invalidated" && journal["hardStop"] === false && journal["orphanedCallPossible"] === false && journal["saved"] === false &&
    journal["reopened"] === false && journal["finishSnapshotAttempted"] === true && journal["finishSnapshotCaptured"] === true &&
    journal["finishSnapshotFailed"] === false && journal["sequence"] === phases.length && journal.artifacts?.length === phases.length,
  "requires the completed successful captured-snapshot lifecycle");
  for (const key of ["closeAttempted", "copyAttempted", "relaunchAttempted", "releaseAttempted", "admissionAttempted", "cacheAttempted",
    "projectOpenAttempted", "finishCloseAttempted", "finishReleaseAttempted"]) { need(journal[key] === true, "lifecycle attempt is missing"); }
  const events: Bag[] = [];
  for (const [index, phase] of phases.entries()) {
    const artifact = descriptorSchema.parse(journal.artifacts[index]);
    need(artifact.bytes <= MAX_JSON_BYTES && artifact.path === join(operationPath(operationId).slice(0, -5), `${String(index + 1).padStart(2, "0")}-${phase}.json`),
      "phase order or descriptor differs");
    const raw = await readExactUtf8Artifact(artifact); events.push(bag(JSON.parse(raw.text)));
  }
  const target = bag(plan["target"]); const rawPath = z.string().parse(target["rawWindowsPath"]); const projectUuid = hash.parse(target["projectUuid"]);
  need(sha256Text(rawPath) === projectUuid, "path-hash project differs");
  const branchUuid = z.string().regex(/^[a-f0-9]{32}$/u).parse(target["branchUuid"]), source = normalizeEasyedaProjectPath(rawPath);
  const baseline = await snapshot(operationId, eventAt(events, "copy-result"), source), finish = await snapshot(operationId, eventAt(events, "finish-snapshot-result"), source);
  const ownerUuid = z.string().regex(/^[a-f0-9]{32}$/u).parse(bag(baseline.result["targetEvidence"])["ownerUuid"]);
  const targetEvidence = bag(baseline.result["targetEvidence"]);
  need(targetEvidence["projectUuid"] === projectUuid && targetEvidence["branchUuid"] === branchUuid &&
    targetEvidence["documentUuid"] === target["documentUuid"] && targetEvidence["docType"] === "PCB", "baseline target differs from operation");
  const beforeLaunch = bag(plan["launch"]), finalLaunch = bag(eventAt(events, "relaunch-result")["launch"]);
  need(beforeLaunch["jobId"] !== finalLaunch["jobId"] && beforeLaunch["helperInstance"] === finalLaunch["helperInstance"], "replacement launch lineage differs");
  const beforeProof = closure(events, operationId, false, beforeLaunch); const afterProof = closure(events, operationId, true, finalLaunch);
  const oldSession = bag(bag(eventAt(events, "capture-result")["capture"])["bridgeSession"]); const newSession = bag(bag(eventAt(events, "admission-capture-result")["capture"])["bridgeSession"]);
  const oldSequence = z.number().int().positive().parse(oldSession["sequence"]); const newSequence = z.number().int().positive().parse(newSession["sequence"]);
  need(typeof oldSession["gatewayInstanceId"] === "string" && newSession["gatewayInstanceId"] === oldSession["gatewayInstanceId"] &&
    typeof oldSession["sessionId"] === "string" && typeof newSession["sessionId"] === "string" && newSession["sessionId"] !== oldSession["sessionId"] &&
    newSequence > oldSequence, "replacement bridge session lineage differs");
  need(beforeProof["proofSha256"] === baseline.copy["closureProofSha256"] && afterProof["proofSha256"] === finish.copy["closureProofSha256"] &&
    beforeProof["proofSha256"] !== afterProof["proofSha256"] && baseline.raw.path !== finish.raw.path && baseline.checkpoint.path !== finish.checkpoint.path,
  "baseline and finish copies do not bind distinct closures");
  need(finish.result["profile"] === "private.current-symbol-finish-snapshot.v1" && finish.result["snapshotCaptured"] === true &&
    finish.result["baselineCopyReceiptSha256"] === baseline.copy["receiptSha256"], "finish snapshot baseline binding differs");
  for (const result of [baseline.result, finish.result]) {
    for (const key of ["openingEffectsVerified", "writerReady", "executionAuthorized"]) { need(result[key] === false, "snapshot authority flags differ"); }
  }
  need(baseline.result["beforeWriteBaselineVerified"] === false && finish.result["persistenceVerified"] === false, "snapshot qualification flags differ");
  const beforeIdentity = bag(baseline.checkpointReceipt["sourceIdentity"]); const afterIdentity = bag(finish.checkpointReceipt["sourceIdentity"]);
  for (const key of ["dev", "ino", "birthtimeNs"]) { same(beforeIdentity[key], afterIdentity[key], "source lineage differs"); }
  const relaunch = eventAt(events, "relaunch-intent"), snapshotIntent = eventAt(events, "finish-snapshot-intent");
  need(relaunch["copyReceiptSha256"] === baseline.copy["receiptSha256"] && snapshotIntent["baselineCopyReceiptSha256"] === baseline.copy["receiptSha256"],
    "relaunch or final snapshot baseline differs");
  same(relaunch["checkpoint"], baseline.checkpointReceipt, "relaunch checkpoint differs"); same(relaunch["proof"], beforeProof, "relaunch closure differs");
  const retirement = eventAt(events, "finish-retirement-proof"); const released = eventAt(events, "finish-release-intent");
  need(retirement["schema"] === "easyeda-pro-control.current-symbol-finish-retirement.v1" && retirement["operationId"] === operationId &&
    retirement["finishSnapshotStatus"] === "captured" && retirement["finishSnapshotCaptured"] === true && retirement["priorOrphan"] === false &&
    retirement["persistenceVerified"] === false && retirement["writerAuthority"] === false && retirement["replayAllowed"] === false && retirement["continuationAuthorized"] === false,
  "terminal retirement differs");
  same(retirement["proof"], afterProof, "retirement closure differs");
  same(retirement["originalLaunch"], finalLaunch, "retirement launch differs");
  same(eventAt(events, "finish-close-intent")["originalLaunch"], finalLaunch, "finish-close launch differs");
  const finishIntent = eventAt(events, "finish-close-intent")["intent"], finishReceipt = eventAt(events, "finish-close-result")["closeReceipt"];
  same(snapshotIntent["closeIntent"], finishIntent, "snapshot close intent differs"); same(snapshotIntent["closeReceipt"], finishReceipt, "snapshot close receipt differs");
  same(retirement["closeIntent"], finishIntent, "retirement close intent differs"); same(retirement["closeReceipt"], finishReceipt, "retirement close receipt differs");
  same(retirement["finishSnapshotEvidence"], { checkpoint: finish.checkpointReceipt, copy: finish.copy }, "retirement snapshot differs");
  const capture = eventAt(events, "admission-capture-result")["capture"], captureHash = sha256Json(capture);
  need(snapshotIntent["admissionCaptureSha256"] === captureHash && retirement["admissionCaptureSha256"] === captureHash &&
    released["admissionCaptureSha256"] === captureHash && released["trackedCaptureSha256"] === null, "retirement capture differs");
  same(journal["result"], { ...retirement, admissionCaptureReleased: true, retired: true }, "terminal journal result differs");
  await exactDirectory(operationId, [...journal.artifacts.map(item => basename(item.path)), basename(baseline.raw.path), basename(finish.raw.path)]);
  return { journal, events, baseline, finish, projectUuid, branchUuid, ownerUuid };
}
function completion(inventory: Inventory): void {
  const result = readerCompletion(inventory);
  need(result.observedChildClose && result.exitCode === 0 && result.exitSignal === null, "SQL reader did not complete");
}
async function sqlComparison(before: Inventory, after: Inventory): Promise<Bag> {
  completion(before); completion(after);
  const names = [...new Set([...before.tables, ...after.tables].map(table => table.name))].toSorted();
  need(names.length <= 256, "SQL table report exceeds its bound");
  const tables = [];
  for (const name of names) {
    const left = before.tables.find(table => table.name === name), right = after.tables.find(table => table.name === name);
    tables.push({ name, equal: canonicalJson(left ?? null) === canonicalJson(right ?? null),
      before: left === undefined ? null : { sha256: left.sha256, rows: left.rows.length, columns: left.columns.length },
      after: right === undefined ? null : { sha256: right.sha256, rows: right.rows.length, columns: right.columns.length } });
    await yieldProofEventLoop();
  }
  const schemaEqual = canonicalJson(before.schema) === canonicalJson(after.schema); const propertiesEqual = canonicalJson(before.properties) === canonicalJson(after.properties);
  const equal = before.profile === after.profile && schemaEqual && propertiesEqual && tables.every(table => table.equal);
  need(equal === (before.logicalSha256 === after.logicalSha256), "SQL equality and commitments disagree");
  return { exactLogicalSqlUnchanged: equal, schemaEqual, propertiesEqual, beforeLogicalSha256: before.logicalSha256, afterLogicalSha256: after.logicalSha256,
    beforeSchemaSha256: before.schemaSha256, afterSchemaSha256: after.schemaSha256,
    beforePropertiesSha256: sha256Json(before.properties), afterPropertiesSha256: sha256Json(after.properties), tables,
    comparisonScope: "complete schema, properties, every table, rowid and typed cell", detailedCellDifferencesReturned: false };
}
function nativeProject(history: NativeHistorySnapshot): Bag {
  return { profile: history.profile, projectUuid: history.projectUuid, ownerUuid: history.projectOwnerUuid,
    branchUuid: history.branchUuid, headHistoryUuid: history.headHistoryUuid, historyRows: history.historyRowCount, chunks: history.chunkCount, plaintextBytes: history.plaintextBytes };
}
async function nativeComparison(before: NativeHistorySnapshot, after: NativeHistorySnapshot): Promise<Bag> {
  const names = [...new Set([...before.documents, ...after.documents].map(document => document.uuid))].toSorted();
  need(names.length <= 4096, "native document report exceeds its bound");
  const documents = [];
  for (const uuid of names) {
    const projection = (history: NativeHistorySnapshot): Bag | null => {
      const document = history.documents.find(item => item.uuid === uuid); if (document === undefined) { return null; }
      validateNativeDocumentRecordHistory(document, history.checkpointSha256);
      return { uuid, docType: document.docType, metadata: document.metadata, records: document.records,
        headerHistory: document.headerHistory?.headers ?? null, atomHeaderHistory: document.atomHeaderHistory?.occurrences ?? null,
        recordHistory: nativeDocumentRecordHistoryProjection(document) };
    };
    const left = projection(before), right = projection(after);
    documents.push({ uuid, equal: canonicalJson(left) === canonicalJson(right),
      before: left === null ? null : { sha256: sha256Json(left), records: before.documents.find(item => item.uuid === uuid)?.records.length },
      after: right === null ? null : { sha256: sha256Json(right), records: after.documents.find(item => item.uuid === uuid)?.records.length } });
    await yieldProofEventLoop();
  }
  const identityAndCountsEqual = canonicalJson(nativeProject(before)) === canonicalJson(nativeProject(after));
  return { exactMaterializedNativeAndDocumentProvenanceUnchanged: identityAndCountsEqual && documents.every(document => document.equal),
    semanticContentUnchanged: before.semanticSha256 === after.semanticSha256, identityAndCountsEqual,
    beforeHistorySemanticSha256: before.semanticSha256, afterHistorySemanticSha256: after.semanticSha256, before: nativeProject(before), after: nativeProject(after), documents,
    comparisonScope: "all selected-branch documents, complete materialized records and ordered document record-history commitments; global raw history including EDIT_HEAD is covered by complete SQL comparison",
    detailedRecordDifferencesReturned: false };
}
function bindReaders(snapshotValue: Snapshot, inventory: Inventory, history: NativeHistorySnapshot, selected: Evidence, final: boolean): void {
  same(snapshotValue.result["sql"], { checkpointSha256: inventory.checkpointSha256, schemaSha256: inventory.schemaSha256, logicalSha256: inventory.logicalSha256 },
    "recorded SQL commitments differ from retained raw copy");
  need(history.projectUuid === selected.projectUuid && history.branchUuid === selected.branchUuid && history.projectOwnerUuid === selected.ownerUuid,
    "retained native project identity differs");
  if (final) {
    same(snapshotValue.result["native"], { projectUuid: history.projectUuid, branchUuid: history.branchUuid, ownerUuid: history.projectOwnerUuid,
      headHistoryUuid: history.headHistoryUuid, historyRows: history.historyRowCount, chunks: history.chunkCount, documents: history.documents.length,
      historySemanticSha256: history.semanticSha256 }, "recorded final native commitments differ");
  } else {
    const target = bag(snapshotValue.result["targetEvidence"]); const document = history.documents.find(item => item.uuid === target["documentUuid"]);
    need(document !== undefined && target["projectUuid"] === history.projectUuid && target["branchUuid"] === history.branchUuid &&
      target["ownerUuid"] === history.projectOwnerUuid && target["docType"] === document.docType && target["documentSemanticSha256"] === document.semanticSha256 &&
      target["historySemanticSha256"] === history.semanticSha256 && target["headHistoryUuid"] === history.headHistoryUuid,
    "recorded baseline native commitments differ");
  }
}

/** Internal read-only entrypoint. Runtime is the facade's pinned SQL-reader
 * runtime, not a public caller-selected executable. Unkeyed journal seals prove
 * consistency only; this does not authenticate an adversarially rewritten past.
 */
export async function analyzeCurrentSymbolBaseline(operationId: string, runtime: MachineProfile["runtime"]): Promise<Readonly<Bag>> {
  const selected = await evidence(operationId); const frozen = canonicalJson(selected); const runtimeCopy = structuredClone(runtime);
  const read = async (snapshotValue: Snapshot, final: boolean): Promise<{ inventory: Inventory; history: NativeHistorySnapshot }> => {
    const inventory = await readExactSqlInventory({ checkpointPath: snapshotValue.raw.path, expectedSha256: snapshotValue.raw.sha256, runtime: runtimeCopy });
    const history = await readNativeHistoryCheckpoint({ checkpointPath: snapshotValue.checkpoint.path, expectedSha256: snapshotValue.checkpoint.sha256,
      projectUuid: selected.projectUuid, libraryAtomHeaders: "preserve", documentRecordHistory: "preserve" });
    bindReaders(snapshotValue, inventory, history, selected, final); return { inventory, history };
  };
  const before = await read(selected.baseline, false); const after = await read(selected.finish, true);
  const sql = await sqlComparison(before.inventory, after.inventory); const native = await nativeComparison(before.history, after.history);
  same(await evidence(operationId), JSON.parse(frozen), "retained evidence changed during analysis");
  const result = { profile: PROFILE, operationId, journalSha256: selected.journal["journalSha256"], evidenceSha256: sha256Text(frozen),
    baseline: { raw: selected.baseline.raw, checkpoint: selected.baseline.checkpoint, copyReceiptSha256: selected.baseline.copy["receiptSha256"] },
    finish: { raw: selected.finish.raw, checkpoint: selected.finish.checkpoint, copyReceiptSha256: selected.finish.copy["receiptSha256"] },
    rawFileBytesUnchanged: selected.baseline.raw.sha256 === selected.finish.raw.sha256, sql, native,
    classification: sql["exactLogicalSqlUnchanged"] === true && native["exactMaterializedNativeAndDocumentProvenanceUnchanged"] === true ? "unchanged" : "changed",
    classificationScope: "complete logical SQL and selected-branch native records/provenance, not physical SQLite file layout",
    comparisonComplete: true, detailedCellOrRecordDifferencesReturned: false, originalProjectRead: false, filesWritten: false,
    startupQualified: false, openingEffectsVerified: false, persistenceVerified: false, producerBindingVerified: false,
    backendActorVerified: false, backendClockVerified: false, beforeWriteBaselineVerified: false, writerReady: false,
    executionAuthorized: false, authorityRestored: false, replayAllowed: false, completionProved: false, processClosureProved: false, saved: false, reopened: false };
  need(Buffer.byteLength(JSON.stringify(result)) <= MAX_REPORT_BYTES, "complete report exceeds its byte bound");
  return Object.freeze(result);
}
