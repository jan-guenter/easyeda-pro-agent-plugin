/** Private fixed-generation adapters retain original typed packets and methods.
 * A union at the journal boundary never permits shape-based packet adoption. */
import type { CurrentDisposableOpenSealedTarget } from "./current-disposable-open.ts";
import type { CurrentPcbDiagnosticOpeningResult } from "./current-pcb-diagnostic-opening.ts";
import type { CurrentPcbWorkerConstructionAssignments } from "./current-pcb-worker-construction-assignment.ts";
import type { CurrentPcbWorkerStartupActorPacket } from "./current-pcb-worker-startup-actor-runner.ts";
import type { CurrentPcbWorkerStartupChannelPacket } from "./current-pcb-worker-startup-channel-observation.ts";
import type { CurrentPcbWorkerStartupOpening, CurrentPcbWorkerStartupOpeningResult } from "./current-pcb-worker-startup-opening.ts";
import type { CurrentPcb209WorkerStartupTransport, CurrentPcbWorkerStartupTransport } from "./current-pcb-worker-startup-transport.ts";
import type { CurrentPcb209WorkerStartupActorPacket } from "./current-pcb-209-worker-startup-actor.ts";
import { CurrentPcb209WorkerStartupOpening } from "./current-pcb-209-worker-startup-opening.ts";
import type { CurrentPcb209WorkerStartupOpeningResult } from "./current-pcb-209-worker-startup-opening.ts";
import { types } from "node:util";

export type CurrentPcbStartupOpeningResult = CurrentPcbWorkerStartupOpeningResult | CurrentPcb209WorkerStartupOpeningResult;
export type CurrentPcbStartupActorPacket = CurrentPcbWorkerStartupActorPacket | CurrentPcb209WorkerStartupActorPacket;
export type CurrentPcbStartupTransport = CurrentPcbWorkerStartupTransport | CurrentPcb209WorkerStartupTransport;
const methodNames = ["open", "status", "retainedOpeningResult", "requireOriginal", "proveCurrentAssignments", "requireCurrentAssignments",
  "retainedActorObservation", "observeActorClock", "requireActorClock", "retainedChannelObservation", "observeCurrentChannel", "requireCurrentChannel",
  "releaseAfterTermination"] as const;
export type CurrentPcbWorkerStartupOpeningCoordinator = Pick<CurrentPcbWorkerStartupOpening, (typeof methodNames)[number]>;
export type CurrentPcb209WorkerStartupOpeningCoordinator = Pick<CurrentPcb209WorkerStartupOpening, (typeof methodNames)[number]>;
interface Coordinator<R extends CurrentPcbStartupOpeningResult, A extends CurrentPcbStartupActorPacket, T extends CurrentPcbStartupTransport> {
  readonly open: (target: CurrentDisposableOpenSealedTarget, reverify: () => Promise<void>) => Promise<R>;
  readonly status: () => Readonly<Record<string, unknown>>;
  readonly retainedOpeningResult: () => CurrentPcbDiagnosticOpeningResult | null;
  readonly requireOriginal: (result: R) => Promise<T>;
  readonly proveCurrentAssignments: (result: R) => Promise<CurrentPcbWorkerConstructionAssignments>;
  readonly requireCurrentAssignments: (result: R, assignments: CurrentPcbWorkerConstructionAssignments) => Promise<void>;
  readonly retainedActorObservation: () => Readonly<Record<string, unknown>> | null;
  readonly observeActorClock: (result: R, assignments: CurrentPcbWorkerConstructionAssignments) => Promise<A>;
  readonly requireActorClock: (result: R, assignments: CurrentPcbWorkerConstructionAssignments, packet: A) => Promise<void>;
  readonly retainedChannelObservation: () => Readonly<Record<string, unknown>> | null;
  readonly observeCurrentChannel: (result: R, assignments: CurrentPcbWorkerConstructionAssignments) => Promise<CurrentPcbWorkerStartupChannelPacket>;
  readonly requireCurrentChannel: (result: R, assignments: CurrentPcbWorkerConstructionAssignments, packet: CurrentPcbWorkerStartupChannelPacket) => Promise<void>;
  readonly releaseAfterTermination: () => Promise<void>;
}
export interface CurrentPcbStartupLifecycleAdapter extends Coordinator<CurrentPcbStartupOpeningResult, CurrentPcbStartupActorPacket, CurrentPcbStartupTransport> {
  readonly assertOriginalMethodsCurrent: () => void;
}
function refuse(): never { throw new Error("PCB_WORKER_STARTUP_LIFECYCLE_ORIGINAL_ADAPTER"); }
const original209 = new WeakMap<CurrentPcbStartupLifecycleAdapter, Readonly<{
  owner: CurrentPcb209WorkerStartupOpening;
  result: (input: CurrentPcbStartupOpeningResult) => CurrentPcb209WorkerStartupOpeningResult;
}>>();
// oxlint-disable-next-line typescript/unbound-method -- Private-field brand check always supplies the original instance as receiver.
const status209 = CurrentPcb209WorkerStartupOpening.prototype.status;
function adapt<R extends CurrentPcbStartupOpeningResult, A extends CurrentPcbStartupActorPacket, T extends CurrentPcbStartupTransport>(
  owner: Coordinator<R, A, T>): Readonly<{ adapter: CurrentPcbStartupLifecycleAdapter; original: (result: CurrentPcbStartupOpeningResult) => R }> {
  const methods = Object.freeze({ open: owner.open, status: owner.status, retainedOpeningResult: owner.retainedOpeningResult,
    requireOriginal: owner.requireOriginal, proveCurrentAssignments: owner.proveCurrentAssignments,
    requireCurrentAssignments: owner.requireCurrentAssignments, retainedActorObservation: owner.retainedActorObservation,
    observeActorClock: owner.observeActorClock, requireActorClock: owner.requireActorClock,
    retainedChannelObservation: owner.retainedChannelObservation, observeCurrentChannel: owner.observeCurrentChannel,
    requireCurrentChannel: owner.requireCurrentChannel, releaseAfterTermination: owner.releaseAfterTermination });
  let retainedActor: A | null = null, retainedResult: R | null = null;
  const current = (): void => { if (!methodNames.every(name => owner[name] === methods[name])) { refuse(); } };
  const original = (result: CurrentPcbStartupOpeningResult): R => {
    current(); if (retainedResult === null || result !== retainedResult) { return refuse(); } return retainedResult;
  };
  const adapter: CurrentPcbStartupLifecycleAdapter = {
    assertOriginalMethodsCurrent: current,
    open: async (target, reverify) => { current(); const result = await methods.open.call(owner, target, reverify); current(); retainedResult = result; return result; },
    status: () => { current(); return methods.status.call(owner); },
    retainedOpeningResult: () => { current(); return methods.retainedOpeningResult.call(owner); },
    requireOriginal: result => methods.requireOriginal.call(owner, original(result)),
    proveCurrentAssignments: result => methods.proveCurrentAssignments.call(owner, original(result)),
    requireCurrentAssignments: (result, assignments) => methods.requireCurrentAssignments.call(owner, original(result), assignments),
    retainedActorObservation: () => { current(); return methods.retainedActorObservation.call(owner); },
    observeActorClock: async (result, assignments) => {
      const packet = await methods.observeActorClock.call(owner, original(result), assignments); current(); retainedActor = packet; return packet;
    },
    requireActorClock: (result, assignments, packet) => {
      const opened = original(result); if (retainedActor === null || packet !== retainedActor) { return refuse(); }
      return methods.requireActorClock.call(owner, opened, assignments, retainedActor);
    },
    retainedChannelObservation: () => { current(); return methods.retainedChannelObservation.call(owner); },
    observeCurrentChannel: (result, assignments) => methods.observeCurrentChannel.call(owner, original(result), assignments),
    requireCurrentChannel: (result, assignments, packet) => methods.requireCurrentChannel.call(owner, original(result), assignments, packet),
    releaseAfterTermination: () => { current(); return methods.releaseAfterTermination.call(owner); },
  };
  return Object.freeze({ adapter: Object.freeze(adapter), original });
}
export function adaptCurrentPcbWorkerStartupLifecycle(owner: CurrentPcbWorkerStartupOpeningCoordinator): CurrentPcbStartupLifecycleAdapter {
  return adapt(owner).adapter;
}
export function adaptCurrentPcb209WorkerStartupLifecycle(owner: CurrentPcb209WorkerStartupOpeningCoordinator): CurrentPcbStartupLifecycleAdapter {
  const retained = adapt(owner);
  // Structural fixture coordinators cannot supply the private-field opening.
  if (!types.isProxy(owner) && Object.getPrototypeOf(owner) === CurrentPcb209WorkerStartupOpening.prototype &&
      owner instanceof CurrentPcb209WorkerStartupOpening) {
    status209.call(owner);
    original209.set(retained.adapter, Object.freeze({ owner, result: retained.original }));
  }
  return retained.adapter;
}

/** Original in-memory forwarding only. No native proof or navigation occurs;
 * the retained owner must separately issue the broader native dependency. */
export function requireCurrentPcb209StartupOpening(adapter: CurrentPcbStartupLifecycleAdapter,
  result: CurrentPcbStartupOpeningResult): Readonly<{ opening: CurrentPcb209WorkerStartupOpening; result: CurrentPcb209WorkerStartupOpeningResult }> {
  const retained = original209.get(adapter);
  if (retained === undefined || Object.getPrototypeOf(retained.owner) !== CurrentPcb209WorkerStartupOpening.prototype ||
      CurrentPcb209WorkerStartupOpening.prototype.status !== status209) { return refuse(); }
  status209.call(retained.owner);
  return Object.freeze({ opening: retained.owner, result: retained.result(result) });
}
