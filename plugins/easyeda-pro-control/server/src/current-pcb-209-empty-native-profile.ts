/** Resource limits for one separately launched209 empty-baseline owner. No
 * caller may choose this profile or reset any counter at a stage boundary.
 * The deadline is an availability cap, not a promise that every request can
 * consume its individual timeout and still finish. */
import { CURRENT_PCB_209_COMMON_BASELINE_CHUNK_MAX_BYTES, CURRENT_PCB_209_COMMON_BASELINE_REQUEST_COUNT } from "./current-pcb-209-common-baseline-runner.ts";
import { CURRENT_PCB_209_EMPTY_ROOT_REQUEST_COUNT } from "./current-pcb-209-empty-root-runner.ts";
import type { CurrentPcb209EmptyNativeCommand } from "./current-pcb-209-worker-startup-empty-session.ts";
import { CURRENT_PCB_COMMON_GRAPH_BYTES } from "./current-pcb-common-graph.ts";
import { CURRENT_PCB_COMMON_PACKET_MAX_STEPS, CURRENT_PCB_COMMON_PACKET_MAX_TEXT_BYTES } from "./current-pcb-common-packet-program.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

const mib = 1024 * 1024;
const factoryRequests = 1;
const identityRequests = 2;
const pcbRequests = 64;
const startupRequests = 186;
const cleanupRequests = 32, optionalRequests = 23 + 24 + 35;
const normalRequestLimit = startupRequests + factoryRequests + pcbRequests + identityRequests +
  CURRENT_PCB_209_COMMON_BASELINE_REQUEST_COUNT + CURRENT_PCB_209_EMPTY_ROOT_REQUEST_COUNT + optionalRequests;
const requestLimit = normalRequestLimit + cleanupRequests;
const chunkReplies = 3 * CURRENT_PCB_COMMON_PACKET_MAX_STEPS;
const packetHandles = 3 * CURRENT_PCB_COMMON_PACKET_MAX_STEPS;
const envelope = 1024, handleFrame = 2048;
// JSON string escaping expands a well-formed UTF8 string by at most six. Each
// Stream can exceed its decoded aggregate by one final bounded rejected chunk;
// No subsequent normal dispatch follows that refusal.
const chunkReplyBytes = 6 * 3 * (CURRENT_PCB_209_COMMON_BASELINE_CHUNK_MAX_BYTES + CURRENT_PCB_COMMON_PACKET_MAX_TEXT_BYTES) + chunkReplies * envelope;
const finalTextReplyBytes = 5 * (6 * CURRENT_PCB_COMMON_GRAPH_BYTES + envelope);
const commonReplyBytes = packetHandles * handleFrame + 12 * mib + chunkReplyBytes + finalTextReplyBytes + envelope;
const rootReplyBytes = 6 * mib + 2 * (6 * 16_384 + envelope) + envelope;
// Prefix includes original discovery, source replies, startup, PCB qualification
// And optional observations together, never64MiB per stage. Additional events
// And cleanup have separate reserves, while all bytes still count globally.
const continuationEventBytes = 8 * mib, prefixBytes = 64 * mib;
const normalBytes = prefixBytes + commonReplyBytes + rootReplyBytes + continuationEventBytes;
const cleanupBytes = cleanupRequests * mib, totalBytes = normalBytes + cleanupBytes;
const cleanupMilliseconds = 60 * 1000, normalMilliseconds = 60 * 60 * 1000;
const chunkBytes = 65_536, pollIntervalMilliseconds = 20;
// A reply may wake polling twice. Full chunks add drain polls; idle polls are
// Bounded by the immutable launch deadline. Fragmentation can reach this cap
// And refuse early; this is not a transport throughput guarantee.
const pollLimit = Math.ceil((normalMilliseconds + cleanupMilliseconds) / pollIntervalMilliseconds) +
  2 * requestLimit + Math.ceil(totalBytes / chunkBytes);
// Native reproof uses two small helper exchanges. Reserve sixteen control
// Envelopes per CDP request plus128 lifecycle messages. For base64, each poll
// Adds at most two padding bytes before4/3 expansion, even for tiny chunks.
const helperControlMessages = 16 * requestLimit + 128;
const helperStdoutBytes = Math.ceil((4 * totalBytes + 8 * pollLimit) / 3) +
  (pollLimit + helperControlMessages) * envelope + 128 * 100_000;
const replyClasses = freezeDeep({
  commonHandles: { count: packetHandles, frameBytes: handleFrame, totalBytes: packetHandles * handleFrame },
  commonScopes: { count: 12, frameBytes: mib, totalBytes: 12 * mib },
  commonChunks: { count: chunkReplies, frameBytes: 6 * CURRENT_PCB_COMMON_PACKET_MAX_TEXT_BYTES + envelope, totalBytes: chunkReplyBytes },
  commonTexts: { count: 5, frameBytes: 6 * CURRENT_PCB_COMMON_GRAPH_BYTES + envelope, totalBytes: finalTextReplyBytes },
  commonRelease: { count: 1, frameBytes: envelope, totalBytes: envelope },
  rootScopes: { count: 6, frameBytes: mib, totalBytes: 6 * mib },
  rootSamples: { count: 2, frameBytes: 6 * 16_384 + envelope, totalBytes: 2 * (6 * 16_384 + envelope) },
  rootRelease: { count: 1, frameBytes: envelope, totalBytes: envelope },
} as const);

export const CURRENT_PCB_209_EMPTY_NATIVE_PROFILE = freezeDeep({
  purpose: "worker-startup-empty209", requestLimit, normalRequestLimit, cleanupRequests,
  requests: { startup: startupRequests, factory: factoryRequests, pcb: pcbRequests, identity: identityRequests,
    common: CURRENT_PCB_209_COMMON_BASELINE_REQUEST_COUNT, roots: CURRENT_PCB_209_EMPTY_ROOT_REQUEST_COUNT, optional: optionalRequests },
  // Constructor capture has 30 fixed reads, eight breakpoint installs/removals
  // And nine resumes. The four footprint reads consume the existing reserve;
  // They do not increase this purpose's request, byte or time ceilings.
  startupDerivation: { discovery: 19, bootstrapTransport: 20, constructorCapture: 55, openingCoordinator: 15,
    publishedIdentity: 1, conservativeReserve: 76 },
  bytes: { prefix: prefixBytes, common: commonReplyBytes, roots: rootReplyBytes, continuationEvents: continuationEventBytes,
    normal: normalBytes, cleanup: cleanupBytes, total: totalBytes, helperStdout: helperStdoutBytes },
  frames: { ordinary: mib, source: 32 * mib, packetHandle: handleFrame, envelope, chunk: chunkBytes, outbound: 65_536 },
  events: { totalCount: 8192, totalBytes: 16 * mib, continuationCount: 4096, continuationBytes: continuationEventBytes },
  polling: { limit: pollLimit, intervalMilliseconds: pollIntervalMilliseconds },
  elapsed: { normalMilliseconds, cleanupMilliseconds, totalMilliseconds: normalMilliseconds + cleanupMilliseconds,
    anchor: "original-monotonic-launch" },
  helperControlMessages, pendingRequests: 32, replyClasses,
} as const);

export type CurrentPcb209EmptyNativeReplyClass = keyof typeof replyClasses;
/** Count and byte attribution follows the original pending command. The new
 * owner must retain all class counters from launch, including failed replies. */
export function currentPcb209EmptyNativeReplyClass(command: CurrentPcb209EmptyNativeCommand): CurrentPcb209EmptyNativeReplyClass | null {
  if ("commonPhase" in command) {
    if (command.commonPhase.endsWith("-seed") || command.commonPhase === "packet-advance") { return "commonHandles"; }
    if (command.commonPhase === "packet-read") { return "commonChunks"; }
    if (["packet-result", "assets", "metadata"].includes(command.commonPhase)) { return "commonTexts"; }
    return command.commonPhase === "release" ? "commonRelease" : "commonScopes";
  }
  if ("rootPhase" in command) {
    if (command.rootPhase === "before" || command.rootPhase === "after") { return "rootSamples"; }
    return command.rootPhase === "release" ? "rootRelease" : "rootScopes";
  }
  return null;
}

/** The channel must apply these to the original pending command, never an
 * untrusted reply tag. Frame size is not reply semantic acceptance. */
export function currentPcb209EmptyNativeReplyFrameBytes(command: CurrentPcb209EmptyNativeCommand): number {
  const kind = currentPcb209EmptyNativeReplyClass(command);
  if (kind !== null) { return replyClasses[kind].frameBytes; }
  return command.method === "Debugger.getScriptSource" ? 32 * mib : mib;
}
