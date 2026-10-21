/** String-only conditional timestamp windows. Original issuers provide the
 * samples; neither these windows nor a matching supplied history proves Save.
 * Pre-close values are sealed while live, never revived after termination. */
import { canonicalJson } from "./core.ts";
import { requireOriginalCurrentPcbStringHistory } from "./current-pcb-string-history.ts";
import type { CurrentPcbStringHistoryProjection } from "./current-pcb-string-history.ts";
import { CurrentPcbStringNativeClockIssuer } from "./current-pcb-string-native-clock.ts";
import type { CurrentPcbStringNativeClockObservation } from "./current-pcb-string-native-clock.ts";
import { currentPcbStringSaveProvenanceSource } from "./current-pcb-string-save-provenance.ts";
import type { CurrentPcbStringSaveProvenance } from "./current-pcb-string-save-provenance.ts";
import { CurrentPcbStringServerClockRunner } from "./current-pcb-string-server-clock-runner.ts";
import type { CurrentPcbStringServerClockPacket } from "./current-pcb-string-server-clock-runner.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

const EPOCH = 621_355_968_000_000_000n;
const LIMITS = Object.freeze({ nativeOwnerAdmissionVerified: false, originalClockedLaunchVerified: false,
  appClockDirectlyObserved: false, continuousClockStabilityProved: false, originalSaveVerified: false,
  futureSaveClockVerified: false, backendActorPreverified: false, fullSqlVerified: false,
  generationClosureVerified: false, persistentUploadReplayExcluded: false, reopened: false,
  executionAuthorized: false, saveAuthorized: false } as const);
type Window = Readonly<{ minimumMs: number; maximumMs: number }>;
export interface CurrentPcbStringSaveClockPlan extends Readonly<typeof LIMITS> {
  readonly profile: "private.current-pcb-string-save-clock-plan.v1";
  readonly identity: CurrentPcbStringSaveProvenance["identity"];
  readonly actorPacketSha256: string; readonly beforeSqlSha256: string;
  readonly originalStringIssuerObjectsRetained: true;
  readonly workerUserText: string; readonly backendActorCandidateText: string;
  readonly saveWindow: Window; readonly backendWindow: Window;
  readonly backendLocalOffsetMinutes: number;
  readonly commonOsClockAndNoInterveningChangeRequired: true;
  readonly reviewedOrdinaryDateAndVfsImplementationsRequired: true;
}
interface Owned {
  readonly issuer: CurrentPcbStringNativeClockIssuer;
  readonly before: CurrentPcbStringNativeClockObservation;
  readonly armed: CurrentPcbStringNativeClockObservation;
  postAttempted: boolean; closureAttempted: boolean;
  post?: CurrentPcbStringNativeClockObservation;
}
const attempted = new WeakSet<CurrentPcbStringSaveProvenance>(), issued = new WeakMap<CurrentPcbStringSaveClockPlan, Owned>();
// oxlint-disable typescript/unbound-method -- Call captured private-field methods with their original issuer/runner receivers only.
const nativeOriginal = CurrentPcbStringNativeClockIssuer.prototype.requireOriginal;
const serverOriginal = CurrentPcbStringServerClockRunner.prototype.requireOriginal;
// oxlint-enable typescript/unbound-method
function need(value: boolean, detail: string): asserts value { if (!value) { throw new Error(`PCB_STRING_SAVE_CLOCK: ${detail}`); } }
function minimum(clock: CurrentPcbStringNativeClockObservation): number { return Number((BigInt(clock.before.utcBeforeTicks) - EPOCH) / 10_000n); }
function maximum(clock: CurrentPcbStringNativeClockObservation): number { return Number((BigInt(clock.after.utcAfterTicks) - EPOCH + 9999n) / 10_000n); }
function ordering(first: CurrentPcbStringNativeClockObservation, last: CurrentPcbStringNativeClockObservation): void {
  need(canonicalJson(first.binding) === canonicalJson(last.binding) && first.after.localOffsetMinutes === last.before.localOffsetMinutes &&
    first.after.zoneRulesSha256 === last.before.zoneRulesSha256 && first.after.qpcFrequency === last.before.qpcFrequency &&
    BigInt(first.after.utcAfterTicks) <= BigInt(last.before.utcBeforeTicks) && BigInt(first.after.qpcAfter) <= BigInt(last.before.qpcBefore),
  "original String native windows differ");
}
export function prepareCurrentPcbStringSaveClock(provenance: CurrentPcbStringSaveProvenance,
  issuer: CurrentPcbStringNativeClockIssuer, before: CurrentPcbStringNativeClockObservation, armed: CurrentPcbStringNativeClockObservation,
  serverRunner: CurrentPcbStringServerClockRunner, server: CurrentPcbStringServerClockPacket): CurrentPcbStringSaveClockPlan {
  currentPcbStringSaveProvenanceSource(provenance);
  need(!attempted.has(provenance), "original String clock plan consumed"); attempted.add(provenance);
  nativeOriginal.call(issuer, before); nativeOriginal.call(issuer, armed); serverOriginal.call(serverRunner, server);
  need(before.phase === "before" && armed.phase === "armed" && canonicalJson(server.identity) === canonicalJson(provenance.identity) &&
    server.actorPacketSha256 === provenance.actorPacketSha256 && server.beforeSqlSha256 === provenance.beforeSqlSha256 &&
    server.sample.workerUserText === provenance.workerUserText, "original String clock source differs");
  ordering(before, armed);
  const observed = server.sample;
  need(observed.clock.before.milliseconds >= maximum(before) && observed.clock.after.milliseconds <= minimum(armed) &&
    observed.clock.before.timezoneOffsetMinutes === -before.before.localOffsetMinutes &&
    maximum(armed) - minimum(before) <= 10_000 &&
    BigInt(armed.after.qpcAfter) - BigInt(before.before.qpcBefore) <= BigInt(before.before.qpcFrequency) * 10n,
  "server-time observation outside independent Windows bracket");
  const backendWindow = { minimumMs: minimum(before), maximumMs: minimum(before) + 60_000 };
  const saveWindow = { minimumMs: observed.serverTimeMs, maximumMs: observed.serverTimeMs + 60_000 };
  need(backendWindow.maximumMs <= 253_402_214_400_000 && saveWindow.maximumMs <= 253_402_214_400_000, "SQL calendar range exceeded");
  const plan: CurrentPcbStringSaveClockPlan = freezeDeep({ profile: "private.current-pcb-string-save-clock-plan.v1", identity: provenance.identity,
    actorPacketSha256: provenance.actorPacketSha256, beforeSqlSha256: provenance.beforeSqlSha256, originalStringIssuerObjectsRetained: true,
    workerUserText: provenance.workerUserText, backendActorCandidateText: provenance.backendActorCandidateText,
    saveWindow, backendWindow, backendLocalOffsetMinutes: before.before.localOffsetMinutes,
    commonOsClockAndNoInterveningChangeRequired: true, reviewedOrdinaryDateAndVfsImplementationsRequired: true, ...LIMITS });
  issued.set(plan, { issuer, before, armed, postAttempted: false, closureAttempted: false }); return plan;
}
/** Seal the original post token while its native process is still current. */
export function recordCurrentPcbStringSaveClockPost(plan: CurrentPcbStringSaveClockPlan, post: CurrentPcbStringNativeClockObservation): void {
  const owner = issued.get(plan); need(owner !== undefined && !owner.postAttempted && !owner.closureAttempted, "original post already consumed");
  owner.postAttempted = true; nativeOriginal.call(owner.issuer, post);
  need(post.phase === "post", "original post phase required"); ordering(owner.armed, post); owner.post = post;
}
/** This is a supplied-history postcondition, not proof that Save or SQL ran.
 * It reuses sealed historical pre/post values and checks only the original
 * termination token live. No pre-close owner is revived after its exit. */
export function compareCurrentPcbStringSaveClockHistory(plan: CurrentPcbStringSaveClockPlan,
  history: CurrentPcbStringHistoryProjection, termination: CurrentPcbStringNativeClockObservation): Readonly<{
    profile: "private.current-pcb-string-save-clock-history.v1"; suppliedHistoryActorAndClockRelationMatched: true;
    saveWindow: Window; backendWindow: Window; historyChunkSha256: string;
  } & typeof LIMITS> {
  const owner = issued.get(plan); need(owner !== undefined && owner.post !== undefined && !owner.closureAttempted, "original post missing or closure consumed");
  owner.closureAttempted = true; nativeOriginal.call(owner.issuer, termination); requireOriginalCurrentPcbStringHistory(history);
  need(termination.phase === "termination", "original termination phase required"); ordering(owner.post, termination);
  need(history.targetUuid === plan.identity.documentUuid && history.workerUserText === plan.workerUserText &&
    history.backendActorText === plan.backendActorCandidateText, "history identity/actor differs");
  need(history.saveTime >= plan.saveWindow.minimumMs && history.saveTime <= plan.saveWindow.maximumMs &&
    history.saveTime >= maximum(owner.armed) && history.saveTime <= minimum(owner.post) &&
    history.backendTime >= plan.backendWindow.minimumMs && history.backendTime <= plan.backendWindow.maximumMs &&
    history.backendTime >= maximum(owner.armed) && history.backendTime <= maximum(termination), "history timestamp outside original windows");
  return Object.freeze({ profile: "private.current-pcb-string-save-clock-history.v1", suppliedHistoryActorAndClockRelationMatched: true,
    saveWindow: plan.saveWindow, backendWindow: plan.backendWindow, historyChunkSha256: history.chunkSha256, ...LIMITS });
}
