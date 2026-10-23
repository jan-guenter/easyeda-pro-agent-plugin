/** Current associations of the original constructor-captured channel. Native
 * peers, intrinsic provenance and interval ownership remain separate proofs. */
import { z } from "zod";
import { canonicalJson, sha256Json } from "./core.ts";
import { CURRENT_PCB_STRING_OBSERVATION_GUARDS } from "./current-pcb-string-observation-core.ts";
import { CURRENT_PCB_STRING_WORKER_GATE_PROGRAM, CURRENT_PCB_STRING_WORKER_GATE_SELECTOR,
  decodeCurrentPcbStringWorkerGates } from "./current-pcb-string-worker-gate-program.ts";
import { CURRENT_PCB_STRING_WORKER_GATE_ORDER } from "./current-pcb-string-worker-gate-scope.ts";
import { currentPcbWorkerStartupActorIdentitySchema } from "./current-pcb-worker-startup-actor.ts";

/** `onmessage` is normally an inherited browser accessor. Read the existing
 * property only under V8 throwOnSideEffect, never invoke the callback or claim
 * that this identifies pristine native intrinsics or other channel peers. */
export const CURRENT_PCB_WORKER_STARTUP_CHANNEL_RELATION = `function(bus,channel,onmessage){${CURRENT_PCB_STRING_OBSERVATION_GUARDS}
if(own(globalThis,"PROJECT")!==this||own(this,"workerBus")!==object(bus)||own(bus,"bc")!==object(channel)||typeof onmessage!=="function")bad();
if(channel.onmessage!==onmessage)bad();verify();if(channel.onmessage!==onmessage)bad();return true;}`;
export const CURRENT_PCB_WORKER_STARTUP_CHANNEL_CALLS = Object.freeze({
  "channel-relation": Object.freeze({ program: CURRENT_PCB_WORKER_STARTUP_CHANNEL_RELATION, arguments: 3, returnByValue: true }),
  "gate-select": Object.freeze({ program: CURRENT_PCB_STRING_WORKER_GATE_SELECTOR, arguments: 0, returnByValue: false }),
  gates: Object.freeze({ program: CURRENT_PCB_STRING_WORKER_GATE_PROGRAM, arguments: 2, returnByValue: true }),
});

export const CURRENT_PCB_WORKER_STARTUP_CHANNEL_OBSERVATION_REQUEST_COUNT = 18;
export const CURRENT_PCB_WORKER_STARTUP_CHANNEL_OBSERVATION_LIMITS = Object.freeze({
  continuousObservation: false, atomicSnapshotVerified: false, nativeIntrinsicsVerified: false,
  nativeChannelIntrinsicAndPeerOwnershipVerified: false, completePublishersVerified: false,
  writeDestinationsContained: false, queueCompletionVerified: false, executionAuthorized: false, saveAuthorized: false,
} as const);
const text = z.string().max(16_384).refine(value => value.isWellFormed() && Buffer.byteLength(value) <= 16_384);
const bodySchema = z.object({
  profile: z.literal("private.current-pcb-worker-startup-channel-observation.v1"),
  identity: currentPcbWorkerStartupActorIdentitySchema,
  originalRunnerIssued: z.literal(true), originalConstructorChannelRelationsObserved: z.literal(true),
  currentPublisherMethodRelationsQualified: z.literal(true), pairedGateSamplesMatched: z.literal(true),
  channelRelationChecks: z.literal(2), requestCount: z.literal(18),
  qualifiedMethodKinds: z.tuple([z.literal("readOnly"), z.literal("format"), z.literal("canPublish"), z.literal("publish"),
    z.literal("broadcast"), z.literal("post"), z.literal("message"), z.literal("received")]),
  gateReplies: z.tuple([text, text]), publisherSenderUuid: z.string().length(36).regex(/^[a-f\d]{8}-[a-f\d]{4}-4[a-f\d]{3}-[89ab][a-f\d]{3}-[a-f\d]{12}$/u),
  continuousObservation: z.literal(false), atomicSnapshotVerified: z.literal(false), nativeIntrinsicsVerified: z.literal(false),
  nativeChannelIntrinsicAndPeerOwnershipVerified: z.literal(false), completePublishersVerified: z.literal(false),
  writeDestinationsContained: z.literal(false), queueCompletionVerified: z.literal(false), executionAuthorized: z.literal(false), saveAuthorized: z.literal(false),
}).strict();
export const currentPcbWorkerStartupChannelPacketSchema = bodySchema.extend({ packetSha256: z.string().length(64).regex(/^[a-f\d]{64}$/u) })
  .refine(packet => {
    const { packetSha256, ...body } = packet;
    if (packetSha256 !== sha256Json(body) || Buffer.byteLength(canonicalJson(packet)) > 65_536) { return false; }
    try {
      const [first, second] = packet.gateReplies.map(value => decodeCurrentPcbStringWorkerGates({ result: { type: "string", value } }));
      return first !== undefined && second !== undefined && canonicalJson(first) === canonicalJson(second) &&
        canonicalJson(first.identity) === canonicalJson(packet.identity) && first.publisher.senderUuid === packet.publisherSenderUuid &&
        canonicalJson(packet.qualifiedMethodKinds) === canonicalJson(CURRENT_PCB_STRING_WORKER_GATE_ORDER);
    } catch { return false; }
  });
export type CurrentPcbWorkerStartupChannelPacket = Readonly<z.infer<typeof currentPcbWorkerStartupChannelPacketSchema>>;

/** These private phases never accept programs or a project/channel receiver.
 * The original construction runner supplies those receivers itself. Returned
 * metadata handles stay inside this collector and its original transport. */
export type CurrentPcbWorkerStartupChannelObservationCommand =
  | Readonly<{ phase: "channel-relation" }>
  | Readonly<{ phase: "gate-select" }>
  | Readonly<{ phase: "properties"; objectId: string }>
  | Readonly<{ phase: "gates"; bundle: string; scope: string }>;
export interface CurrentPcbWorkerStartupChannelObservationTransport {
  readonly scriptId: string;
  readonly request: (command: CurrentPcbWorkerStartupChannelObservationCommand) => Promise<unknown>;
  readonly assertCurrent: () => Promise<void>;
}
