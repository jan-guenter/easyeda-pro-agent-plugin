/** Join actual original seven-record effect, pending body and clock. The
 * projected delta keeps false provenance fields and grants no SQL or Save. */
import { canonicalJson } from "./core.ts";
import { assertOriginalCurrentSchematicRelevanceDisplayWriteOwner, originalCurrentSchematicRelevanceDisplayWriteTarget } from "./current-pcb-diagnostic-owner.ts";
import type { CurrentSchematicRelevanceDisplayWriteOwner } from "./current-schematic-relevance-display-write-owner.ts";
import { requireOriginalGeneratedSchematicRelevanceDisplayEffect } from "./generated-schematic-relevance-display-effect.ts";
import type { GeneratedSchematicRelevanceDisplayNativeEffect } from "./generated-schematic-relevance-display-effect.ts";
import type { GeneratedSchematicRelevanceDisplayNativeArguments } from "./generated-schematic-relevance-display-source.ts";
import { compareGeneratedSchematicRelevanceDisplayPendingSaveDelta, generatedSchematicRelevanceDisplayPendingSaveBodyValueSchema } from "./generated-schematic-relevance-display-save-delta.ts";
import { requireOriginalCurrentSchematicRelevanceDisplaySaveBody, requireOriginalCurrentSchematicRelevanceDisplaySaveBodyData } from "./current-schematic-relevance-display-save-observer.ts";
import type { CurrentSchematicRelevanceDisplaySaveBodyObservation } from "./current-schematic-relevance-display-save-observer.ts";
import { requireOriginalCurrentSchematicRelevanceDisplayClockBodyJoin, requireOriginalCurrentSchematicRelevanceDisplayClockBodyJoinData, requireOriginalCurrentSchematicRelevanceDisplayClockData } from "./current-schematic-relevance-display-clock-observer.ts";
import type { CurrentSchematicRelevanceDisplayClockBodyJoin, CurrentSchematicRelevanceDisplayClockObservation } from "./current-schematic-relevance-display-clock-observer.ts";
import { verifyHistoricalGeneratedSchematicRelevanceFixtureOpenCheckpoint } from "./managed-schematic-relevance-fixture-open-checkpoint.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export type GeneratedSchematicRelevanceDisplaySaveDelta = ReturnType<typeof compareGeneratedSchematicRelevanceDisplayPendingSaveDelta>;
export interface GeneratedSchematicRelevanceDisplayNativeSaveData {
  readonly schema: "private.generated-schematic-relevance-display-native-save-data.v1";
  readonly delta: GeneratedSchematicRelevanceDisplaySaveDelta;
  readonly originalEffectBodyClockJoined: true;
  readonly selectedSqlAuthorized: false;
  readonly persistenceVerified: false;
}
interface Original {
  readonly owner: CurrentSchematicRelevanceDisplayWriteOwner; readonly argumentsValue: GeneratedSchematicRelevanceDisplayNativeArguments;
  readonly effect: GeneratedSchematicRelevanceDisplayNativeEffect; readonly body: CurrentSchematicRelevanceDisplaySaveBodyObservation;
  readonly clock: CurrentSchematicRelevanceDisplayClockObservation; readonly join: CurrentSchematicRelevanceDisplayClockBodyJoin;
  readonly text: string;
}
const attempts = new WeakSet<CurrentSchematicRelevanceDisplayWriteOwner>();
const issued = new WeakMap<GeneratedSchematicRelevanceDisplayNativeSaveData, Original>();
function need(value: boolean): asserts value { if (!value) { throw new Error("SCHEMATIC_RELEVANCE_NATIVE_SAVE_ORIGINAL_DATA"); } }
function compare(original: Omit<Original, "text">): GeneratedSchematicRelevanceDisplaySaveDelta {
  const { argumentsValue, body, clock, effect, join, owner } = original;
  const prepared = originalCurrentSchematicRelevanceDisplayWriteTarget(owner);
  const projection = requireOriginalGeneratedSchematicRelevanceDisplayEffect(effect, owner, argumentsValue);
  const value = requireOriginalCurrentSchematicRelevanceDisplaySaveBodyData(body, owner, argumentsValue);
  const observed = requireOriginalCurrentSchematicRelevanceDisplayClockData(clock, owner, argumentsValue);
  const joined = requireOriginalCurrentSchematicRelevanceDisplayClockBodyJoinData(join, body, owner, argumentsValue);
  need(observed.value === value.clock && joined.clockValue === value.clock && joined.bodySha256 === body.bodySha256);
  // This is an explicit data projection from an original observer packet.
  // It does not relabel the observer's existing persisted schema or authority.
  const input = generatedSchematicRelevanceDisplayPendingSaveBodyValueSchema.parse({ ...value, schema: "private.generated-schematic-relevance-display-save-body-value.v1" });
  return compareGeneratedSchematicRelevanceDisplayPendingSaveDelta(argumentsValue, prepared.history, projection, input);
}
/** Original live body hold and immutable complete baseline required. Failure
 * consumes qualification; it never retries Save or reconstructs an origin. */
export async function qualifyOriginalGeneratedSchematicRelevanceDisplaySaveData(owner: CurrentSchematicRelevanceDisplayWriteOwner,
  argumentsValue: GeneratedSchematicRelevanceDisplayNativeArguments, effect: GeneratedSchematicRelevanceDisplayNativeEffect,
  body: CurrentSchematicRelevanceDisplaySaveBodyObservation, clock: CurrentSchematicRelevanceDisplayClockObservation,
  join: CurrentSchematicRelevanceDisplayClockBodyJoin): Promise<GeneratedSchematicRelevanceDisplayNativeSaveData> {
  assertOriginalCurrentSchematicRelevanceDisplayWriteOwner(owner); need(!attempts.has(owner)); attempts.add(owner);
  const original = Object.freeze({ owner, argumentsValue, effect, body, clock, join });
  const prepared = originalCurrentSchematicRelevanceDisplayWriteTarget(owner); const delta = compare(original);
  const current = (): void => {
    need(originalCurrentSchematicRelevanceDisplayWriteTarget(owner) === prepared && canonicalJson(compare(original)) === canonicalJson(delta));
    owner.requireSchematicRelevanceDisplayOriginalSaveValue(argumentsValue, body.value);
  };
  current(); await requireOriginalCurrentSchematicRelevanceDisplaySaveBody(body, owner, argumentsValue); current();
  await requireOriginalCurrentSchematicRelevanceDisplayClockBodyJoin(join, body, owner, argumentsValue); current();
  await verifyHistoricalGeneratedSchematicRelevanceFixtureOpenCheckpoint(prepared); current();
  const packet: GeneratedSchematicRelevanceDisplayNativeSaveData = freezeDeep({ schema: "private.generated-schematic-relevance-display-native-save-data.v1", delta,
    originalEffectBodyClockJoined: true, selectedSqlAuthorized: false, persistenceVerified: false });
  issued.set(packet, Object.freeze({ ...original, text: canonicalJson(packet) })); return packet;
}
/** Historical data only. Original body/clock references remain necessary;
 * the Main coordinator must independently reprove its live dispatch holds. */
export function requireOriginalGeneratedSchematicRelevanceDisplaySaveData(packet: GeneratedSchematicRelevanceDisplayNativeSaveData,
  owner: CurrentSchematicRelevanceDisplayWriteOwner, argumentsValue: GeneratedSchematicRelevanceDisplayNativeArguments): GeneratedSchematicRelevanceDisplaySaveDelta {
  const original = issued.get(packet);
  need(original !== undefined && original.owner === owner && original.argumentsValue === argumentsValue && original.text === canonicalJson(packet) && canonicalJson(compare(original)) === canonicalJson(packet.delta));
  return packet.delta;
}
