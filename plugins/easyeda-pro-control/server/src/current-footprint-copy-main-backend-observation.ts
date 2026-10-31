/** Pure journal schema. Importing historical records never initializes a live
 * native owner, main inspector, scheduler or execution capability. */
import { z } from "zod";
import { CURRENT_FOOTPRINT_COPY_MAIN_BACKEND_SOURCE as SOURCE } from "./current-footprint-copy-main-backend-source.ts";

export const currentFootprintCopyMainBackendObservationSchema = z.object({
  profile: z.literal("private.current-footprint-copy-main-backend-construction.v1"),
  originalMainTransportRetained: z.literal(true), runtimeAppSourceQualified: z.literal(true),
  runtimeAppSourceSha256: z.literal(SOURCE.sha256), initialContinuationCount: z.union([z.literal(0), z.literal(1)]),
  registrationBreakpointArmedBeforeInitialContinuation: z.literal(true), actualRegistrationLocationVerified: z.literal(true),
  originalProtocolCallbackAndBackendRetained: z.literal(true), originalDriverCallbackAndRouterRetained: z.literal(true),
  originalActorClockAndSqlFunctionsRetained: z.literal(true), originalNativeDateNowRetained: z.literal(true),
  // Historical construction records precede parser custody.
  // Parsing them issues no live runner or age authority. New observations set true.
  originalDateParserRetained: z.literal(true).optional(),
  protocolRegistrationObserved: z.literal(false), requestContextRetained: z.literal(false), actualActorClockInvocationObserved: z.literal(false),
  projectSqlInvocationObserved: z.literal(false), responderExclusivityProven: z.literal(false), executionAuthorized: z.literal(false),
}).strict();
export type CurrentFootprintCopyMainBackendObservation = Readonly<z.infer<typeof currentFootprintCopyMainBackendObservationSchema>>;
