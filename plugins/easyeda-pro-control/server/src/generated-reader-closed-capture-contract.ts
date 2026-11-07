/** Historical data projections only. These schemas recreate no issued target,
 * prepared checkpoint, runtime owner, Native Job or writer authority. */
import { z } from "zod";
import { currentDisposableOpenSealedTargetSchema } from "./current-disposable-open.ts";

const digest = z.string().regex(/^[a-f0-9]{64}$/u);
const uuid = z.string().regex(/^[a-f0-9]{32}$/u);
const primitive = z.string().regex(/^[a-f0-9]{16}$/u);
const initial = { target: currentDisposableOpenSealedTargetSchema, archiveSha256: digest, qualificationSha256: digest, inventoryLogicalSha256: digest, sourceSha256: digest,
  nativeLocalOffsetMinutes: z.number().int().min(-840).max(840), sourceCreatedEpochMs: z.number().positive().max(8_640_000_000_000_000), sourceModifiedEpochMs: z.number().positive().max(8_640_000_000_000_000),
  completeInitialSqlRowsQualified: z.literal(true), exactInitialNativePayloadQualified: z.literal(true), writerClockAuthority: z.literal(false), registrationVerified: z.literal(false), designExecutionAuthorized: z.literal(false) };
export const generatedPadReaderOriginalQualificationSchema = z.strictObject({ schema: z.literal("easyeda-pro-control.qualified-generated-pad-fixture-target.v1"), ...initial, untickedDocHeadQualified: z.literal(true) });
export const generatedComponentReaderOriginalQualificationSchema = z.strictObject({ schema: z.literal("easyeda-pro-control.qualified-generated-component-fixture-target.v1"), ...initial,
  footprintUuid: uuid, componentId: primitive, ownedPadId: uuid, untickedDocHeadsQualified: z.literal(true), nativeComponentCacheQualified: z.literal(false), nativeIndexQualified: z.literal(false) });
