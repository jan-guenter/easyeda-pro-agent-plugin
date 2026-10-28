/** Durable data projections of the original route observations, never capabilities. */
import { z } from "zod";
import { canonicalJson } from "./core.ts";
import { currentFootprintCopyStatePacketSchema } from "./current-footprint-copy-state.ts";
import { currentFootprintCopyDependencyObservationSchema, recordedCurrentFootprintCopyDependencyObservationSchema } from "./current-footprint-copy-dependency-runner.ts";
import { currentFootprintCopyAsyncObservationSchema } from "./current-footprint-copy-async-runner.ts";
import { currentFootprintCopyUiObservationSchema } from "./current-footprint-copy-ui-runner.ts";
import { currentFootprintCopyManagerRouteObservationSchema } from "./current-footprint-copy-manager-route-runner.ts";
import { validateClockSample } from "./windows-clock-transport.ts";

const producer = z.object({ profile: z.literal("private.current-footprint-copy-producer.v1"), methodCount: z.literal(8),
  lexicalFunctionCount: z.literal(7), freshScopeCount: z.literal(5), originalMethodRelationsRechecked: z.literal(true),
  lexicalIdentitiesRechecked: z.literal(true), parserAndUploadCallbacksBound: z.literal(false), transitiveProducerClosuresBound: z.literal(false),
  uiSourceRouteBound: z.literal(false), clockProvenanceVerified: z.literal(false), nativeGenerationClosed: z.literal(false), executionAuthorized: z.literal(false) }).strict();
const callbacks = currentFootprintCopyAsyncObservationSchema.extend({ parserArrowReceiversVerified: z.literal(true),
  uploadArrowReceiverVerified: z.literal(true), originalConstructionUploadMatched: z.literal(true), originalParserRegistrationArgumentsMatched: z.literal(true) });
const destinations = z.object({ profile: z.literal("private.current-footprint-copy-destinations.v1"), selectedFunctions: z.literal(28),
  originalProjectAndApiObjectsMatched: z.literal(true), privateCooperationBranchExcluded: z.literal(true),
  trackedUploadQueuesEmptyAtObservation: z.literal(true), relativeHistoryRoutesQualified: z.literal(true),
  nativeHttpBackendOwned: z.literal(false), notificationPeerOwned: z.literal(false), cacheNamespacesQualified: z.literal(false),
  callbacksCompleted: z.literal(false), executionAuthorized: z.literal(false) }).strict();
const peer = z.object({ profile: z.literal("private.current-footprint-parent-worker-peer.v1"),
  parentWorkerNativeMessageReceivedByOriginalChild: z.literal(true), diagnosticListenerRemoved: z.literal(true),
  reciprocalProjectChannelQualified: z.literal(false), backendDynamicDispatchQualified: z.literal(false), executionAuthorized: z.literal(false) }).strict();
const cacheConstruction = z.object({ profile: z.literal("private.current-footprint-cache-construction.v1"),
  originalOpenEventsObserved: z.literal(4), originalWrapperReceiversMatched: z.literal(true),
  originalNativeCacheResultsMatched: z.literal(true), bothNamespaceArgumentsMatched: z.literal(true),
  originalProjectAssignmentsMatched: z.literal(true), nativeOpenInvokedByAgent: z.literal(false),
  networkBackendOwned: z.literal(false), executionAuthorized: z.literal(false) }).strict();
const digest = z.string().regex(/^[a-f0-9]{64}$/u);
const counter = z.string().regex(/^[0-9]{1,24}$/u);
const sample = z.object({ schema: z.literal("easyeda-pro-control.windows-clock-sample.v1"), utcBeforeTicks: counter,
  utcAfterTicks: counter, qpcBefore: counter, qpcAfter: counter, qpcFrequency: counter, highResolution: z.literal(true),
  localOffsetMinutes: z.number().int().min(-840).max(840), zoneRulesSha256: digest }).strict().refine(value => {
  try { validateClockSample(value); return !Object.is(value.localOffsetMinutes, -0); } catch { return false; }
}, "Invalid Windows clock sample.");
const windowsClock = z.object({ profile: z.literal("private.current-footprint-copy-windows-clock.v1"), phase: z.literal("before"), sequence: z.literal(1),
  binding: z.object({ helperInstance: z.string().regex(/^[a-f0-9]{32}$/u), jobId: z.string().regex(/^[a-f0-9]{32}$/u),
    rootPid: z.number().int().min(1).max(2_147_483_647), rootCreated: z.string().regex(/^[1-9]\d{14,19}$/u) }).strict(),
  before: sample, after: sample, originalTransportIssued: z.literal(true), rawReplySha256: digest, nativeClockSamplesVerified: z.literal(true),
  backendActorProvenanceVerified: z.literal(false), documentClockProvenanceVerified: z.literal(false), executionAuthorized: z.literal(false), saveAuthorized: z.literal(false) }).strict().refine(value => {
  try {
    const { after, before } = value;
    return before.localOffsetMinutes === after.localOffsetMinutes && before.zoneRulesSha256 === after.zoneRulesSha256 &&
      before.qpcFrequency === after.qpcFrequency && BigInt(before.utcAfterTicks) <= BigInt(after.utcBeforeTicks) &&
      BigInt(before.qpcAfter) <= BigInt(after.qpcBefore) && BigInt(after.utcAfterTicks) - BigInt(before.utcBeforeTicks) <= 100_000_000n &&
      BigInt(after.qpcAfter) - BigInt(before.qpcBefore) <= BigInt(before.qpcFrequency) * 10n;
  } catch { return false; }
}, "Windows clock pair order, zone, frequency or collection bound differs.");
export const CURRENT_FOOTPRINT_COPY_ROUTE_RESULT_MAX_BYTES = 128 * 1024;
const route = z.object({
  profile: z.literal("private.current-footprint-copy-route-preparation.v1"), state: currentFootprintCopyStatePacketSchema,
  producers: producer, dependencies: currentFootprintCopyDependencyObservationSchema, callbacks, destinations,
  ui: currentFootprintCopyUiObservationSchema, manager: currentFootprintCopyManagerRouteObservationSchema, peer, windowsClock,
  cacheConstruction,
  originalManagerWorkerPeerMatched: z.literal(true), finalOriginalWorkerObservationsReproved: z.literal(true),
  documentClocksArmed: z.literal(false), createDispatched: z.literal(false), callbacksCompleted: z.literal(false),
  backendDynamicDispatchQualified: z.literal(false), executionAuthorized: z.literal(false), saveAuthorized: z.literal(false), persistenceVerified: z.literal(false),
}).strict();
function withinResultBound(value: unknown): boolean { return Buffer.byteLength(canonicalJson(value)) <= CURRENT_FOOTPRINT_COPY_ROUTE_RESULT_MAX_BYTES; }
export const currentFootprintCopyRouteObservationSchema = route.refine(withinResultBound, "Route observation exceeds its bound.");
/** Historical data can be inspected but cannot issue a current runtime packet. */
export const recordedCurrentFootprintCopyRouteObservationSchema = route.extend({
  cacheConstruction: cacheConstruction.optional(), dependencies: recordedCurrentFootprintCopyDependencyObservationSchema,
}).strict().refine(withinResultBound, "Route observation exceeds its bound.");
export type CurrentFootprintCopyRouteObservation = z.infer<typeof currentFootprintCopyRouteObservationSchema>;
