/** Journal-safe receipt of retained copy bindings, without transaction authority. */
import { z } from "zod";
import { CURRENT_FOOTPRINT_COPY_ACTOR_PREPARATION_REQUESTS, CURRENT_FOOTPRINT_COPY_ACTOR_REPROOF_REQUESTS } from "./current-footprint-copy-actor-preparation.ts";
import { CURRENT_FOOTPRINT_COPY_PRODUCER_OWNER_REQUESTS } from "./current-footprint-copy-producer-runner.ts";

// Opening delegates add one project-identity and one assignment read per use.
export const CURRENT_FOOTPRINT_COPY_BINDINGS_REQUESTS = 2 + CURRENT_FOOTPRINT_COPY_PRODUCER_OWNER_REQUESTS.observeMaximum +
  CURRENT_FOOTPRINT_COPY_ACTOR_PREPARATION_REQUESTS + CURRENT_FOOTPRINT_COPY_ACTOR_REPROOF_REQUESTS +
  2 + CURRENT_FOOTPRINT_COPY_PRODUCER_OWNER_REQUESTS.requireMaximum;
export const CURRENT_FOOTPRINT_COPY_BINDINGS_REPROOF_REQUESTS = CURRENT_FOOTPRINT_COPY_ACTOR_REPROOF_REQUESTS +
  2 + CURRENT_FOOTPRINT_COPY_PRODUCER_OWNER_REQUESTS.requireMaximum;
const digest = z.string().regex(/^[a-f0-9]{64}$/u);
export const currentFootprintCopyBindingsSchema = z.object({
  profile: z.literal("private.current-footprint-copy-owned-bindings.v1"),
  sourcePreparationSha256: digest, actorPacketSha256: digest, actorPreparationSha256: digest,
  producerObservationSha256: digest, beforeSqlSha256: digest,
  originalOpeningRetained: z.literal(true), originalProducerObservationRetained: z.literal(true),
  originalActorPreparationRetained: z.literal(true), methodCount: z.literal(8), lexicalFunctionCount: z.literal(7),
  footprintCapturedUser: z.literal("own-undefined"), footprintDocheadUserOmitted: z.literal(true),
  parserAndUploadCallbacksBound: z.literal(false), transitiveProducerClosuresBound: z.literal(false),
  uiSourceRouteBound: z.literal(false), clockProvenanceVerified: z.literal(false),
  executionAuthorized: z.literal(false), persistenceVerified: z.literal(false),
}).strict();
export type CurrentFootprintCopyBindings = Readonly<z.infer<typeof currentFootprintCopyBindingsSchema>>;
