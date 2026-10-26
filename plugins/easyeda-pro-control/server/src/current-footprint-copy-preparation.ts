/** Bounded durable description of owned copy preparation, never writer authority. */
import { z } from "zod";

// Three original-source checks inside preparation and one after it. Each
// Reproves project identity and current assignments with two native requests.
export const CURRENT_FOOTPRINT_COPY_PREPARATION_REQUESTS = 8;
const digest = z.string().regex(/^[a-f0-9]{64}$/u);
export const currentFootprintCopyPreparationSchema = z.object({
  profile: z.literal("private.current-footprint-copy-owned-preparation.v1"),
  beforeCheckpointSha256: digest, beforeSqlSha256: digest, sourcePlanSha256: digest,
  sourcePacketSha256: digest, copyPlanSha256: digest, nativeArgumentsSha256: digest,
  originalOpeningRetained: z.literal(true), originalSourceObservationRetained: z.literal(true),
  lifecyclePublicationVerified: z.literal(false), copyLaunchPurposeQualified: z.literal(false),
  completeCapacityReserved: z.literal(false), producerBindingVerified: z.literal(false),
  actorAndClocksVerified: z.literal(false), executionAuthorized: z.literal(false), persistenceVerified: z.literal(false),
}).strict();
export type CurrentFootprintCopyPreparation = Readonly<z.infer<typeof currentFootprintCopyPreparationSchema>>;
