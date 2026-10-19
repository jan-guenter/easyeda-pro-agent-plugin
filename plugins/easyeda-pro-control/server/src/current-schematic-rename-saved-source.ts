/** Original verified SCH SQL effect -> post-write metadata/child projections.
 * These are data relations, not dispatch, closure or fresh-generation issuers.
 */
import { compareCompleteClosedSql } from "./closed-sql-equality.ts";
import { canonicalJson, sha256Json } from "./core.ts";
import { assertOriginalCurrentSchematicChildRoster, compareCurrentSchematicChildRoster, prepareCurrentSchematicChildRoster } from "./current-schematic-child-roster.ts";
import type { CurrentSchematicChildRoster } from "./current-schematic-child-roster.ts";
import { copyCurrentSchematicChildTransport } from "./current-schematic-child-roster-contract.ts";
import { assertOriginalCurrentSchematicNativeMetadata, prepareCurrentSchematicNativeMetadata } from "./current-schematic-native-metadata.ts";
import type { CurrentSchematicNativeMetadata } from "./current-schematic-native-metadata.ts";
import { compareCurrentSchematicRenameObservation, currentSchematicRenameObservationSchema, validateCurrentSchematicRenameObservation } from "./current-schematic-rename-observation.ts";
import { originalCurrentSchematicRenameSqlPreparation } from "./current-schematic-rename-sql.ts";
import type { CurrentSchematicRenameSqlPreparation } from "./current-schematic-rename-sql.ts";
import { completedCurrentSchematicRenameStoredSource } from "./current-schematic-rename-stored-effect.ts";
import type { CurrentSchematicRenameStoredEffect } from "./current-schematic-rename-stored-effect.ts";
import { readerCompletion } from "./sqlite-inventory.ts";
import type { readExactSqlInventory } from "./sqlite-inventory.ts";

type Inventory = Awaited<ReturnType<typeof readExactSqlInventory>>;
const LIMITATIONS = Object.freeze({ originalDispatchVerified: false, producerBindingVerified: false, actorProvenanceVerified: false,
  clockProvenanceVerified: false, schematicSubscriberCompletionVerified: false, queueCompletionVerified: false,
  generationClosureVerified: false, persistentUploadReplayExcluded: false, reopened: false, executionAuthorized: false } as const);
export interface CurrentSchematicRenameSavedSource extends Readonly<typeof LIMITATIONS> {
  readonly profile: "private.current-schematic-rename-saved-source.v1";
  readonly targetUuid: string;
  readonly beforeSqlSha256: string;
  readonly afterSqlSha256: string;
  readonly storedEffectSha256: string;
  readonly metadataProjectionSha256: string;
  readonly childProjectionSha256: string;
  readonly maximumTicket: number;
  readonly completeChildRosterUnchanged: true;
  readonly sourceSha256: string;
}
interface Original {
  readonly preparation: CurrentSchematicRenameSqlPreparation;
  readonly before: Inventory;
  readonly beforeMetadata: CurrentSchematicNativeMetadata;
  readonly beforeChildren: CurrentSchematicChildRoster;
  readonly effect: CurrentSchematicRenameStoredEffect;
  readonly after: Inventory;
  readonly metadata: CurrentSchematicNativeMetadata;
  readonly children: CurrentSchematicChildRoster;
}
const issued = new WeakMap<CurrentSchematicRenameSavedSource, Original>();
function need(condition: boolean, message: string): asserts condition {
  if (!condition) { throw new Error(`Current SCH saved source: ${message}`); }
}
function current(original: Original): void {
  const { preparation, before, beforeMetadata, beforeChildren, effect, after, metadata, children } = original;
  originalCurrentSchematicRenameSqlPreparation(preparation, before, beforeMetadata);
  assertOriginalCurrentSchematicChildRoster(beforeChildren, before, beforeMetadata);
  completedCurrentSchematicRenameStoredSource(effect, preparation, after);
  assertOriginalCurrentSchematicNativeMetadata(metadata, after);
  assertOriginalCurrentSchematicChildRoster(children, after, metadata);
}
/** Original completed-reader/effect identities only. A JSON copy, a new read of
 * identical bytes or a supplied hash cannot reconstruct this relation.
 */
export function originalCurrentSchematicRenameSavedSource(source: CurrentSchematicRenameSavedSource, after: Inventory): Readonly<Original> {
  const original = issued.get(source);
  need(original !== undefined && original.after === after, "original successful saved-source relation required");
  current(original); return original;
}

/** Required before a future mutation. The fixed saved observer queries the
 * former normalized name for absence, so a pre-existing duplicate peer would
 * make that observation unsupported even if the rename itself succeeded.
 */
export function assertCurrentSchematicRenameSavedReadEligibility(metadata: CurrentSchematicNativeMetadata, before: Inventory): void {
  assertOriginalCurrentSchematicNativeMetadata(metadata, before);
  const { target, expectedBefore } = metadata.request;
  need(metadata.peers.every(peer => peer.uuid === target.schematicUuid || peer.name !== expectedBefore.name),
    "saved-read absence query requires a unique original normalized name");
}

export async function prepareCurrentSchematicRenameSavedSource(preparation: CurrentSchematicRenameSqlPreparation, before: Inventory,
  beforeMetadata: CurrentSchematicNativeMetadata, beforeChildren: CurrentSchematicChildRoster,
  effect: CurrentSchematicRenameStoredEffect, after: Inventory): Promise<CurrentSchematicRenameSavedSource> {
  const retained = (): void => {
    originalCurrentSchematicRenameSqlPreparation(preparation, before, beforeMetadata);
    assertOriginalCurrentSchematicChildRoster(beforeChildren, before, beforeMetadata);
    completedCurrentSchematicRenameStoredSource(effect, preparation, after);
  };
  retained(); assertCurrentSchematicRenameSavedReadEligibility(beforeMetadata, before);
  const { target, expectedBefore, desiredTitle } = beforeMetadata.request;
  // Reuse the original metadata observer with the former name solely as an
  // Absence query. This never prepares an inverse mutation or a second rename.
  const metadata = await prepareCurrentSchematicNativeMetadata({ before: after, target, desiredTitle: expectedBefore.displayName }); retained();
  const expectedAfter = { ...expectedBefore, name: desiredTitle.toLowerCase(), displayName: desiredTitle,
    version: String(effect.documentTime), updateTime: effect.documentTime, ticket: beforeMetadata.maximumTicket + 1 };
  need(canonicalJson(metadata.request.expectedBefore) === canonicalJson(expectedAfter) && metadata.maximumTicket === expectedAfter.ticket,
    "post-write metadata differs from the frozen title and verified native time/ticket");
  const peers = beforeMetadata.peers.map(peer => peer.uuid === target.schematicUuid ? { uuid: peer.uuid, ...expectedAfter } : peer);
  need(canonicalJson(metadata.peers) === canonicalJson(peers), "complete schematic peer metadata differs");
  const children = await prepareCurrentSchematicChildRoster(metadata, after); retained();
  const expectedAst = { ...beforeChildren.targetAst, title: expectedAfter.name, displayTitle: expectedAfter.displayName,
    version: expectedAfter.version, updateTime: expectedAfter.updateTime };
  need(canonicalJson(children.childKv) === canonicalJson(beforeChildren.childKv) &&
    canonicalJson(children.targetAst) === canonicalJson(expectedAst) &&
    canonicalJson(children.startupInput) === canonicalJson(beforeChildren.startupInput),
  "complete child roster, AST order, or startup premises changed");
  const original: Original = Object.freeze({ preparation, before, beforeMetadata, beforeChildren, effect, after, metadata, children });
  current(original);
  const body = { profile: "private.current-schematic-rename-saved-source.v1" as const, targetUuid: target.schematicUuid,
    beforeSqlSha256: before.logicalSha256, afterSqlSha256: after.logicalSha256, storedEffectSha256: sha256Json(effect),
    metadataProjectionSha256: metadata.projectionSha256, childProjectionSha256: children.projectionSha256,
    maximumTicket: metadata.maximumTicket, completeChildRosterUnchanged: true as const, ...LIMITATIONS };
  const source: CurrentSchematicRenameSavedSource = Object.freeze({ ...body, sourceSha256: sha256Json(body) });
  issued.set(source, original); return source;
}

/** Compare complete supplied metadata and both child AST samples against the
 * original post-write SQL projections. Native reply provenance and a distinct
 * reopened generation must still be bound by a future lifecycle coordinator.
 */
export function compareCurrentSchematicRenameSavedObservations(source: CurrentSchematicRenameSavedSource, after: Inventory,
  rawMetadata: unknown, rawChildren: unknown, expectedUiActor: unknown): Readonly<Record<string, unknown>> {
  const original = originalCurrentSchematicRenameSavedSource(source, after);
  const observed = validateCurrentSchematicRenameObservation(original.metadata.request, rawMetadata);
  const intent = originalCurrentSchematicRenameSqlPreparation(original.preparation, original.before, original.beforeMetadata);
  const uiActor = currentSchematicRenameObservationSchema.shape.runtimeObservation.shape.actor.parse(copyCurrentSchematicChildTransport(expectedUiActor));
  // The lifecycle supplies its original write-input UI actor. SQL history uses
  // The same UUID with separately frozen project-user names, including absence.
  need(uiActor.uuid === intent.backendActor.uuid && canonicalJson(observed.runtimeObservation.actor) === canonicalJson(uiActor),
    "supplied saved actor differs from original UI actor or frozen SQL UUID");
  const metadata = compareCurrentSchematicRenameObservation(original.metadata, after, observed);
  const children = compareCurrentSchematicChildRoster(original.children, after, rawChildren); current(original);
  return Object.freeze({ profile: "private.current-schematic-rename-saved-observations.v1", sourceSha256: source.sourceSha256,
    metadataObservationSha256: metadata["observationSha256"], childObservationSha256: children["observationSha256"],
    suppliedSavedMetadataMatched: true, suppliedSavedChildRosterMatched: true, ...LIMITATIONS });
}

/** A separate completed reader must preserve every SQL cell, schema entry and
 * database property. This is not evidence that an application was reopened or
 * closed; neither reader identity nor matching SQL establishes those events.
 */
export async function compareCurrentSchematicRenameLaterSql(source: CurrentSchematicRenameSavedSource, after: Inventory,
  later: Inventory): Promise<Readonly<Record<string, unknown>>> {
  const original = originalCurrentSchematicRenameSavedSource(source, after);
  const completion = readerCompletion(later);
  need(later !== after && completion !== readerCompletion(after) && completion.observedChildClose && completion.exitCode === 0 && completion.exitSignal === null,
    "a distinct successful original SQL reader is required");
  need(later.logicalSha256 === after.logicalSha256, "complete later SQL changed");
  await compareCompleteClosedSql(after, later); current(original);
  need(readerCompletion(later) === completion, "original later reader changed");
  return Object.freeze({ profile: "private.current-schematic-rename-later-sql-relation.v1", sourceSha256: source.sourceSha256,
    afterSqlSha256: after.logicalSha256, laterSqlSha256: later.logicalSha256, completeLaterSqlUnchanged: true, ...LIMITATIONS });
}
