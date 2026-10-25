/** Hold the original waiting child until its actual bootstrap owner is armed.
 * Failure cleanup never converts removed instrumentation into start authority. */
import { types } from "node:util";
import { CurrentPcb209RatlineBootstrapOwner } from "./current-pcb-209-ratline-bootstrap-owner.ts";
import type { CurrentPcb209RatlineCreationPacket, CurrentPcb209RatlinePcbCreation, CurrentPcb209RatlineWorkerCreation } from "./current-pcb-209-ratline-creation-runner.ts";
import type { CurrentPcb209RatlineRealmCommand, CurrentPcb209RatlineRealmDependency } from "./current-pcb-209-ratline-event-dispatcher.ts";
import { currentPcb209RatlineNativeWire } from "./current-pcb-209-ratline-native-wire.ts";
import { inheritCurrentPcb209RatlineContinuationTiming } from "./current-pcb-209-ratline-continuation-timing.ts";
import { inheritCurrentPcb209RatlineContinuationHandoff } from "./current-pcb-209-ratline-continuation-handoff.ts";

type Creation = CurrentPcb209RatlinePcbCreation | CurrentPcb209RatlineWorkerCreation;
type Role = "pcb" | "worker";
const methodNames = ["armOriginalChildBootstrap", "requireOriginalChildStartReady", "assertOriginalChildStartStillReady",
  "settleOriginalInstrumentationAfterAbort", "releaseAfterTermination"] as const;
const ownerMethods = methodNames.map(name => CurrentPcb209RatlineBootstrapOwner.prototype[name]);
function need(value: boolean, code: string): asserts value { if (!value) { throw new Error(`PCB209_RATLINE_CHILD_GATE_${code}`); } }
function ownerIdentity(owner: CurrentPcb209RatlineBootstrapOwner): void {
  need(owner !== null && typeof owner === "object" && !types.isProxy(owner) &&
    Object.getPrototypeOf(owner) === CurrentPcb209RatlineBootstrapOwner.prototype, "BOOTSTRAP_OWNER");
  for (const [index, name] of methodNames.entries()) {
    const method = Object.getOwnPropertyDescriptor(CurrentPcb209RatlineBootstrapOwner.prototype, name);
    need(Object.getOwnPropertyDescriptor(owner, name) === undefined && method !== undefined && Object.hasOwn(method, "value") &&
      method.value === ownerMethods[index], "BOOTSTRAP_METHOD");
  }
}
function members(value: CurrentPcb209RatlineRealmDependency): readonly unknown[] {
  need(value !== null && typeof value === "object" && !types.isProxy(value) && Object.getPrototypeOf(value) === Object.prototype, "DEPENDENCY");
  const keys = ["scriptId", "parentTargetId", "parentSessionId", "assertOriginalPinnedParentAndAutoAttach", "assertOriginalTermination", "request", "subscribe"] as const;
  need(Reflect.ownKeys(value).length === keys.length, "DEPENDENCY");
  return keys.map((key, index) => { const descriptor = Object.getOwnPropertyDescriptor(value, key);
    need(descriptor !== undefined && Object.hasOwn(descriptor, "value") && typeof descriptor.value === (index < 3 ? "string" : "function"), "DEPENDENCY");
    return descriptor.value as unknown; });
}
export class CurrentPcb209RatlineChildStartGate {
  readonly #dependency: CurrentPcb209RatlineRealmDependency;
  readonly #members: readonly unknown[];
  readonly #owner: CurrentPcb209RatlineBootstrapOwner;
  readonly #role: Role;
  readonly #realm: CurrentPcb209RatlineRealmDependency;
  #creation: Creation | null = null;
  #packet: CurrentPcb209RatlineCreationPacket | null = null;
  #claimed = false;
  #armConsumed = false;
  #startConsumed = false;
  #failed = false;
  #released = false;
  #cleanup: Promise<void> | null = null;
  public constructor(role: Role, dependency: CurrentPcb209RatlineRealmDependency, owner: CurrentPcb209RatlineBootstrapOwner) {
    need(role === "pcb" || role === "worker", "ROLE"); ownerIdentity(owner);
    this.#role = role; this.#dependency = dependency; this.#members = members(dependency); this.#owner = owner;
    this.#realm = Object.freeze<CurrentPcb209RatlineRealmDependency>({ scriptId: dependency.scriptId, parentTargetId: dependency.parentTargetId, parentSessionId: dependency.parentSessionId,
      assertOriginalPinnedParentAndAutoAttach: async source => {
        this.#same(); need(!this.#failed && !this.#released, "NOT_CURRENT");
        try { await dependency.assertOriginalPinnedParentAndAutoAttach(source); this.#same(); need(!this.#failed && !this.#released, "NOT_CURRENT"); }
        catch (error) { this.#failed = true; throw error; }
      },
      assertOriginalTermination: async (): Promise<void> => { this.#same(); await dependency.assertOriginalTermination(); this.#same(); },
      request: command => this.#request(command),
      subscribe: events => { this.#same(); need(!this.#released, "RELEASED"); return dependency.subscribe({
        paused: value => { events.paused(value); }, resumed: () => { events.resumed(); }, attached: value => { events.attached(value); },
        lost: () => { this.#failed = true; events.lost(); },
      }); },
    });
    inheritCurrentPcb209RatlineContinuationTiming(dependency, this.#realm);
    inheritCurrentPcb209RatlineContinuationHandoff(dependency, this.#realm);
  }
  #same(): void { ownerIdentity(this.#owner); need(members(this.#dependency).every((value, index) => value === this.#members[index]), "DEPENDENCY_CHANGED"); }
  public claimOriginalRealm(): CurrentPcb209RatlineRealmDependency {
    this.#same(); need(!this.#claimed && !this.#failed && !this.#released, "REALM_CONSUMED"); this.#claimed = true; return this.#realm;
  }
  public async armOriginalChildBootstrap(creation: Creation, packet: CurrentPcb209RatlineCreationPacket): Promise<void> {
    this.#same(); need(this.#claimed && !this.#armConsumed && !this.#failed && !this.#released, "ARM_CONSUMED");
    this.#armConsumed = true; this.#creation = creation; this.#packet = packet;
    try { await this.#owner.armOriginalChildBootstrap(creation, packet); this.#same(); need(!this.#failed && !this.#released, "NOT_CURRENT"); }
    catch (error) { this.#failed = true; throw error; }
  }
  async #request(input: CurrentPcb209RatlineRealmCommand): Promise<unknown> {
    this.#same(); need(!this.#released, "RELEASED");
    // ID1 is syntax validation only. The original channel still allocates its
    // Monotonic real IDs and retains all cumulative limits.
    const wire = currentPcb209RatlineNativeWire(this.#role, input, 1);
    const phase = wire.request["phase"];
    need(typeof phase === "string" && !phase.startsWith("bootstrap-"), "REALM_COMMAND");
    const { id: _validationId, ...command } = wire.command;
    need(command.method !== "Target.setAutoAttach" && command.method !== "Runtime.enable" && command.method !== "Debugger.enable" &&
      command.method !== "Debugger.setInstrumentationBreakpoint" && command.method !== "Debugger.getScriptSource" &&
      command.method !== "Debugger.setAsyncCallStackDepth" && command.method !== "Debugger.getStackTrace", "REALM_COMMAND");
    if (command.method === "Runtime.runIfWaitingForDebugger") {
      need(!this.#failed && !this.#startConsumed && this.#creation !== null && this.#packet !== null &&
        command.sessionId === this.#packet.childSessionId, "CHILD_HELD"); this.#startConsumed = true;
      try {
        await this.#owner.requireOriginalChildStartReady(this.#creation, this.#packet);
        this.#same(); need(!this.#failed && !this.#released, "CHILD_HELD");
        this.#owner.assertOriginalChildStartStillReady(this.#creation, this.#packet);
      } catch (error) { this.#failed = true; throw error; }
    } else {
      need(!this.#failed || command.method === "Debugger.resume" || command.method === "Debugger.removeBreakpoint", "FAILED");
      need(command.method === "Target.getTargets" || command.sessionId === this.#dependency.parentSessionId, "PARENT_SESSION");
    }
    switch (command.method) {
      case "Debugger.resume": case "Runtime.runIfWaitingForDebugger": {
        return this.#dependency.request({ method: command.method, params: command.params, sessionId: command.sessionId });
      }
      case "Target.getTargets": case "Debugger.setBreakpoint": case "Debugger.removeBreakpoint":
      case "Debugger.evaluateOnCallFrame": case "Runtime.callFunctionOn": { return this.#dependency.request(command); }
      default: { throw new Error("PCB209_RATLINE_CHILD_GATE_REALM_COMMAND"); }
    }
  }
  /** Marks failure synchronously, before creation abort can attempt its shared
   * child-start promise. Settlement removes instrumentation only. */
  public abort(): Promise<void> {
    this.#failed = true; this.#same(); need(!this.#released, "RELEASED");
    this.#cleanup ??= this.#creation === null || this.#packet === null ? Promise.resolve() :
      this.#owner.settleOriginalInstrumentationAfterAbort(this.#creation, this.#packet);
    return this.#cleanup;
  }
  public async releaseAfterTermination(): Promise<void> {
    this.#same(); need(!this.#released, "RELEASED"); await this.#dependency.assertOriginalTermination(); this.#same();
    if (this.#armConsumed) { await this.#owner.releaseAfterTermination(); this.#same(); }
    this.#released = true;
  }
}
