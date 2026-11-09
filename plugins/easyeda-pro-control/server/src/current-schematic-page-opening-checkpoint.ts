import { join } from "node:path";
import { controlDataDirectory, controlRootCapability, readArtifact, verifyExactManagedArtifact } from "./artifacts.ts";
import { createCheckpoint, verifyCheckpoint } from "./checkpoint.ts";
import type { CheckpointAccessPolicy, CheckpointReceipt } from "./checkpoint.ts";
import { canonicalJson, isRecord, normalizeEasyedaProjectPath } from "./core.ts";
import { currentDisposableOpenPreparationCheckpointSchema } from "./current-disposable-open.ts";
import type { CurrentDisposableOpenPreparationCheckpoint } from "./current-disposable-open.ts";
import { currentSchematicPageOpeningTargetSchema } from "./current-schematic-page-opening.ts";
import type { CurrentSchematicPageOpeningTarget } from "./current-schematic-page-opening.ts";
import { isNativeDocumentDeleted, readNativeHistoryCheckpoint } from "./native-history.ts";

type Target = CurrentSchematicPageOpeningTarget;
export interface CurrentSchematicPageOpeningCheckpoint {
  readonly profile: "easyeda-pro-control.schematic-page-opening-checkpoint.v1";
  readonly checkpoint: CheckpointReceipt;
  readonly preparationCheckpoint: Readonly<CurrentDisposableOpenPreparationCheckpoint>;
  readonly evidence: Readonly<{ projectUuid: string; branchUuid: string; documentUuid: string; schematicUuid: string;
    pageSemanticSha256: string; parentSemanticSha256: string; historySemanticSha256: string }>;
}
async function policy(source: string): Promise<CheckpointAccessPolicy> {
  return { expectedSource: source, controlRoot: await controlRootCapability(),
    artifactRoots: [join(controlDataDirectory(), "checkpoints")], maximumSourceBytes: 268_435_456 };
}
async function evidence(checkpoint: CheckpointReceipt, target: Target): Promise<CurrentSchematicPageOpeningCheckpoint["evidence"]> {
  const history = await readNativeHistoryCheckpoint({ checkpointPath: checkpoint.checkpoint, expectedSha256: checkpoint.checkpointSha256,
    projectUuid: target.projectUuid, libraryAtomHeaders: "preserve" });
  const pages = history.documents.filter(document => document.uuid === target.documentUuid), parents = history.documents.filter(document => document.uuid === target.schematicUuid);
  const page = pages[0], parent = parents[0];
  if (history.projectUuid !== target.projectUuid || history.branchUuid !== target.branchUuid || pages.length !== 1 || parents.length !== 1 ||
    page?.docType !== "SCH_PAGE" || parent?.docType !== "SCH" || isNativeDocumentDeleted(page) || isNativeDocumentDeleted(parent)) {
    throw new Error("SCH209_OPEN_CHECKPOINT_MEMBERSHIP");
  }
  const pageMeta = page.records.filter(record => record.type === "META"), parentMeta = parent.records.filter(record => record.type === "META");
  if (pageMeta.length !== 1 || parentMeta.length !== 1 || !isRecord(pageMeta[0]?.body) || !isRecord(parentMeta[0]?.body) ||
    pageMeta[0].body["schematic"] !== target.schematicUuid || pageMeta[0].body["source"] !== "" || parentMeta[0].body["source"] !== "" ||
    Object.hasOwn(pageMeta[0].body, "blockSymbolUuid") || parentMeta[0].body["reuseBlock"] === true) { throw new Error("SCH209_OPEN_CHECKPOINT_ORDINARY_PAGE"); }
  return Object.freeze({ projectUuid: history.projectUuid, branchUuid: history.branchUuid, documentUuid: page.uuid, schematicUuid: parent.uuid,
    pageSemanticSha256: page.semanticSha256, parentSemanticSha256: parent.semanticSha256, historySemanticSha256: history.semanticSha256 });
}

/** Preserve the complete exact original project before navigation. This is not
 * an unchanged-storage or saved/reopened claim for the subsequent public open. */
export async function prepareCurrentSchematicPageOpeningCheckpoint(input: unknown): Promise<CurrentSchematicPageOpeningCheckpoint> {
  const target = currentSchematicPageOpeningTargetSchema.parse(input);
  const source = normalizeEasyedaProjectPath(target.rawWindowsPath);
  const checkpoint = await createCheckpoint({ source, outputDir: join(controlDataDirectory(), "checkpoints"), label: "schematic-page-open209" }, await policy(source));
  if (checkpoint.sourceSha256 !== target.expectedSourceSha256) { throw new Error("SCH209_OPEN_CHECKPOINT_SOURCE"); }
  const observed = await readArtifact(checkpoint.checkpoint, 0, 1), sourceEvidence = await evidence(checkpoint, target);
  const preparationCheckpoint = Object.freeze(currentDisposableOpenPreparationCheckpointSchema.parse({ path: observed.path, bytes: observed.size,
    sha256: checkpoint.checkpointSha256 }));
  const prepared: CurrentSchematicPageOpeningCheckpoint = Object.freeze({ profile: "easyeda-pro-control.schematic-page-opening-checkpoint.v1", checkpoint,
    preparationCheckpoint, evidence: sourceEvidence });
  await verifyCurrentSchematicPageOpeningCheckpoint(prepared, target); return prepared;
}

/** Rehash source, checkpoint, receipt and full default-branch parent/page proof.
 * Only the original pre-navigation interval is eligible for this comparison. */
export async function verifyCurrentSchematicPageOpeningCheckpoint(prepared: CurrentSchematicPageOpeningCheckpoint, input: unknown): Promise<void> {
  const target = currentSchematicPageOpeningTargetSchema.parse(input);
  const source = normalizeEasyedaProjectPath(target.rawWindowsPath);
  const checkpoint = structuredClone(prepared.checkpoint), snapshot = canonicalJson(prepared);
  if (prepared.profile !== "easyeda-pro-control.schematic-page-opening-checkpoint.v1" || checkpoint.source !== source ||
    checkpoint.sourceSha256 !== target.expectedSourceSha256 || prepared.preparationCheckpoint.path !== checkpoint.checkpoint ||
    prepared.preparationCheckpoint.sha256 !== checkpoint.checkpointSha256) { throw new Error("SCH209_OPEN_CHECKPOINT_BINDING"); }
  await verifyExactManagedArtifact(prepared.preparationCheckpoint);
  const receipt = await readArtifact(checkpoint.receiptPath, 0, 65_536);
  if (!receipt.eof || canonicalJson(JSON.parse(receipt.text)) !== canonicalJson(checkpoint)) { throw new Error("SCH209_OPEN_CHECKPOINT_RECEIPT"); }
  const verified = await verifyCheckpoint(checkpoint.receiptPath, await policy(source));
  if (!verified.ok || verified.sourceChanged || !verified.sourceMatchesReceipt || !verified.checkpointMatchesReceipt || !verified.sourceEqualsCheckpoint ||
    verified.checkpointSha256 !== checkpoint.checkpointSha256 || verified.sourceSha256 !== target.expectedSourceSha256 ||
    canonicalJson(await evidence(checkpoint, target)) !== canonicalJson(prepared.evidence) || canonicalJson(prepared) !== snapshot) {
    throw new Error("SCH209_OPEN_CHECKPOINT_CHANGED");
  }
}
