/** Consume-once original route observation; native HTTP/backend and event
 * destination ownership remain requirements of the execution lifecycle. */
import { types } from "node:util";
import { z } from "zod";
import { decodeCurrentFootprintCopyDependencies, decodeCurrentFootprintCopyDependencyFunction } from "./current-footprint-copy-dependency-bindings.ts";
import { decodeCurrentFootprintCopyDestinationArray, decodeCurrentFootprintCopyDestinationFunction } from "./current-footprint-copy-destination-bindings.ts";
import { decodeCurrentFootprintCopyProducerScope } from "./current-footprint-copy-producer-scope.ts";
import type { CurrentFootprintCopyStatePacket } from "./current-footprint-copy-state.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { assertCurrentFootprintCopyProgramReturned } from "./current-footprint-copy-program-exception.ts";
import { CURRENT_FOOTPRINT_COPY_DESTINATION_PROFILES } from "./current-footprint-copy-destination-profiles.ts";

const observeRequests = CURRENT_FOOTPRINT_COPY_DESTINATION_PROFILES.length + 8;
export const CURRENT_FOOTPRINT_COPY_DESTINATION_REQUESTS = Object.freeze({ observe: observeRequests, reproof: 3,
  originalObserve: observeRequests + 2, originalReproof: 5 });
export interface CurrentFootprintCopyDestinationTransport {
  readonly dependencyBundleObjectId: string;
  readonly assertCurrent: () => void;
  readonly properties: (objectId: string) => Promise<unknown>;
  readonly capture: (scopeId: string) => Promise<unknown>;
  readonly recheck: (scopeId: string, bundleId: string) => Promise<unknown>;
}
export interface CurrentFootprintCopyDestinationObservation {
  readonly profile: "private.current-footprint-copy-destinations.v1";
  readonly selectedFunctions: 31;
  readonly originalProjectAndApiObjectsMatched: true;
  readonly privateCooperationBranchExcluded: true;
  /** Only the six selected upload/cache containers; publishTimer and detached
   * callbacks remain outside this observation. */
  readonly trackedUploadQueuesEmptyAtObservation: true;
  readonly relativeHistoryRoutesQualified: true;
  readonly nativeHttpBackendOwned: false;
  readonly notificationPeerOwned: false;
  readonly cacheNamespacesQualified: false;
  readonly callbacksCompleted: false;
  readonly executionAuthorized: false;
}
const handle = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
const arrayReply = z.object({ result: z.object({ type: z.literal("object"), subtype: z.literal("array"), className: z.literal("Array"),
  description: z.literal("Array(43)"), objectId: handle }).strict() }).strict();
const yes = z.object({ result: z.object({ type: z.literal("boolean"), value: z.literal(true) }).strict() }).strict();
const fields = ["dependencyBundleObjectId", "assertCurrent", "properties", "capture", "recheck"] as const;
function need(value: boolean): asserts value { if (!value) { throw new Error("FOOTPRINT_COPY_DESTINATION_OWNER"); } }
function members(transport: CurrentFootprintCopyDestinationTransport): readonly unknown[] {
  need(!types.isProxy(transport) && Object.getPrototypeOf(transport) === Object.prototype && Reflect.ownKeys(transport).length === fields.length);
  return fields.map((key, index) => {
    const item = Object.getOwnPropertyDescriptor(transport, key); need(item !== undefined && Object.hasOwn(item, "value") && typeof item.value === (index === 0 ? "string" : "function"));
    return item.value as unknown;
  });
}
export class CurrentFootprintCopyDestinationRunner {
  readonly #transport: CurrentFootprintCopyDestinationTransport;
  readonly #members: readonly unknown[];
  readonly #scriptId: string;
  readonly #state: CurrentFootprintCopyStatePacket;
  readonly #replies: unknown[] = [];
  #attempted = false;
  #reproofAttempted = false;
  #failed = false;
  #requests = 0;
  #head: string | null = null;
  #bundle: string | null = null;
  #packet: CurrentFootprintCopyDestinationObservation | null = null;
  public constructor(transport: CurrentFootprintCopyDestinationTransport, scriptId: string, state: CurrentFootprintCopyStatePacket) {
    this.#members = members(transport); this.#transport = transport; this.#scriptId = handle.parse(scriptId); this.#state = state;
    handle.parse(transport.dependencyBundleObjectId);
  }
  #current(): void { need(!this.#failed && members(this.#transport).every((value, index) => value === this.#members[index])); this.#transport.assertCurrent(); }
  async #request(operation: () => Promise<unknown>): Promise<unknown> {
    this.#current(); need(this.#requests < observeRequests + (this.#reproofAttempted ? 3 : 0)); this.#requests += 1;
    const raw = captureCurrentPcbStringClockReply(await operation()).value; this.#replies.push(raw); this.#current();
    assertCurrentFootprintCopyProgramReturned(raw, "destinations"); return raw;
  }
  async #scope(): Promise<string> {
    const head = this.#head; need(head !== null);
    const scopes = decodeCurrentFootprintCopyDependencyFunction(await this.#request(() => this.#transport.properties(head)), this.#scriptId, 39);
    return decodeCurrentFootprintCopyProducerScope(await this.#request(() => this.#transport.properties(scopes)));
  }
  public async observe(): Promise<CurrentFootprintCopyDestinationObservation> {
    need(!this.#attempted); this.#attempted = true;
    try {
      const dependencies = decodeCurrentFootprintCopyDependencies(await this.#request(() => this.#transport.properties(this.#transport.dependencyBundleObjectId)));
      const head = dependencies[39]; need(head !== undefined); this.#head = head;
      const scope = await this.#scope();
      const captured = arrayReply.parse(await this.#request(() => this.#transport.capture(scope))); this.#bundle = captured.result.objectId;
      const decoded = decodeCurrentFootprintCopyDestinationArray(await this.#request(() => this.#transport.properties(captured.result.objectId)));
      need(decoded.client === this.#state.client && decoded.maximumTicket === this.#state.maximumTicket &&
        decoded.projectUuid === this.#state.identity.projectUuid && decoded.branchUuid === this.#state.identity.branchUuid);
      for (const [index, objectId] of decoded.functions.entries()) {
        decodeCurrentFootprintCopyDestinationFunction(await this.#request(() => this.#transport.properties(objectId)), this.#scriptId, index);
      }
      const finalScope = await this.#scope();
      yes.parse(await this.#request(() => this.#transport.recheck(finalScope, captured.result.objectId)));
      need(this.#requests === observeRequests); this.#current();
      this.#packet = Object.freeze({ profile: "private.current-footprint-copy-destinations.v1", selectedFunctions: 31,
        originalProjectAndApiObjectsMatched: true, privateCooperationBranchExcluded: true, trackedUploadQueuesEmptyAtObservation: true,
        relativeHistoryRoutesQualified: true, nativeHttpBackendOwned: false, notificationPeerOwned: false,
        cacheNamespacesQualified: false, callbacksCompleted: false, executionAuthorized: false });
      return this.#packet;
    } catch (error) { this.#failed = true; throw error; }
  }
  public async requireOriginal(packet: CurrentFootprintCopyDestinationObservation): Promise<void> {
    need(packet === this.#packet && this.#packet !== null && !this.#reproofAttempted && this.#bundle !== null); this.#reproofAttempted = true;
    try {
      const bundle = this.#bundle, scope = await this.#scope();
      yes.parse(await this.#request(() => this.#transport.recheck(scope, bundle))); this.#current();
    } catch (error) { this.#failed = true; throw error; }
  }
  public retained(): Readonly<Record<string, unknown>> {
    return Object.freeze({ attempted: this.#attempted, failed: this.#failed, completed: this.#packet !== null,
      reproofAttempted: this.#reproofAttempted, requests: this.#requests, observation: this.#packet, replies: Object.freeze([...this.#replies]) });
  }
}
