/** Fixed fresh-purpose orchestration windows. Native request/source deadlines
 * and the original launch clock remain with the separate pipe ledger. A marker
 * is private in-memory metadata, never owner, source or execution authority. */
import { types } from "node:util";
import { CURRENT_PCB_209_RATLINE_CONTINUATION_NATIVE_PROFILE as native } from "./current-pcb-209-ratline-continuation-budget.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export type CurrentPcb209RatlineContinuationTimingRole = "pcb" | "worker" | "subordinate";
export interface CurrentPcb209RatlineContinuationTiming {
  readonly role: CurrentPcb209RatlineContinuationTimingRole;
  readonly ownerMilliseconds: number;
  readonly parentOwnerMilliseconds: number;
  readonly childDependencyMilliseconds: number;
  readonly bootstrapSendMilliseconds: number;
  readonly allocationMilliseconds: number;
  readonly bootstrapResumeMilliseconds: number;
  readonly sourceOwnerExtraMilliseconds: number;
  readonly bootstrapArmMilliseconds: number;
  readonly sourceReleaseMilliseconds: number;
  readonly childArmMilliseconds: number;
  readonly childStartRequestMilliseconds: number;
  readonly capturePauseMilliseconds: number;
  readonly captureWaitMilliseconds: number;
  readonly creationNextPauseMilliseconds: number;
  readonly creationContinuationMilliseconds: number;
  readonly comparisonMilliseconds: number;
}
const ordinary = native.elapsed.ordinaryRequestMilliseconds;
// Each child source reproof calls its parent's creation proof twice, then
// Three current-parent/session proofs. Once initial ancestry is admitted, the
// PCB source's context checks are synchronous: S0=D, S1=2D+3D, S2=2S1+3D.
const owner = Object.freeze({ pcb: ordinary, worker: 5 * ordinary, subordinate: 13 * ordinary });
function childArm(parent: number, source: number): number { return parent + 11 * source + 5 * ordinary; }
function profile(role: CurrentPcb209RatlineContinuationTimingRole): CurrentPcb209RatlineContinuationTiming {
  const parent = role === "subordinate" ? owner.worker : owner.pcb, source = owner[role];
  const sites = { pcb: 5, worker: 8, subordinate: 0 }[role];
  // Re-retaining an existing object adds its same-object comparison. The
  // Worker initialized pause therefore has nine calls, not seven.
  const pauseCalls = { pcb: 4, worker: 9, subordinate: 0 }[role];
  // One current proof; each ordinary realm request has before/request/after;
  // The runner adds its own before/after. Removal/resume do not repeat proofs.
  const capturePause = source + pauseCalls * (4 * source + ordinary) + sites * ordinary + 2 * ordinary;
  const captureArm = (2 + 3 * sites) * source + sites * ordinary;
  const sourceRelease = role === "pcb" ? native.elapsed.ancestryProofMilliseconds + 7 * source + 2 * ordinary : 6 * source + 2 * ordinary;
  const child = { pcb: owner.worker, worker: owner.subordinate, subordinate: 0 }[role];
  const armChild = role === "subordinate" ? 0 : childArm(source, child);
  // The worker's self bridge/name/entry/canvas pauses precede its constructor:
  // 16 reads/relations, four leading owner proofs and four observed resumes.
  const earlyCapture = role === "worker" ? 68 * source + 24 * ordinary : 0;
  return Object.freeze({ role, ownerMilliseconds: source, parentOwnerMilliseconds: parent,
    childDependencyMilliseconds: parent + 3 * ordinary,
    bootstrapSendMilliseconds: 2 * source + ordinary,
    allocationMilliseconds: source + ordinary,
    bootstrapResumeMilliseconds: 2 * source + 2 * ordinary,
    sourceOwnerExtraMilliseconds: source,
    bootstrapArmMilliseconds: childArm(parent, source),
    sourceReleaseMilliseconds: sourceRelease,
    childArmMilliseconds: armChild,
    childStartRequestMilliseconds: child + ordinary,
    capturePauseMilliseconds: capturePause,
    // A result may depend on both descendant source sequences. The original
    // Native launch clock still expires at its original start, even if this
    // Local wait began later. No per-request timeout or native budget changes.
    captureWaitMilliseconds: native.elapsed.normalMilliseconds,
    creationNextPauseMilliseconds: sourceRelease + 3 * source + (role === "worker" ? captureArm + earlyCapture : 0),
    creationContinuationMilliseconds: armChild + 5 * source + (role === "pcb" ? captureArm : 0),
    comparisonMilliseconds: 10 * source + 2 * ordinary,
  });
}
export const CURRENT_PCB_209_RATLINE_CONTINUATION_TIMING = freezeDeep({
  pcb: profile("pcb"), worker: profile("worker"), subordinate: profile("subordinate"),
});
const marked = new WeakMap<object, CurrentPcb209RatlineContinuationTiming>();
export function bindCurrentPcb209RatlineContinuationTiming(target: object, role: CurrentPcb209RatlineContinuationTimingRole): void {
  if (target === null || typeof target !== "object" || types.isProxy(target) || marked.has(target) ||
      (role !== "pcb" && role !== "worker" && role !== "subordinate")) { throw new Error("PCB209_RATLINE_CONTINUATION_TIMING_BINDING"); }
  marked.set(target, CURRENT_PCB_209_RATLINE_CONTINUATION_TIMING[role]);
}
export function inheritCurrentPcb209RatlineContinuationTiming(original: object, target: object): void {
  const timing = marked.get(original); if (timing !== undefined) { bindCurrentPcb209RatlineContinuationTiming(target, timing.role); }
}
export function currentPcb209RatlineContinuationTiming(target: object): CurrentPcb209RatlineContinuationTiming | null {
  return marked.get(target) ?? null;
}
