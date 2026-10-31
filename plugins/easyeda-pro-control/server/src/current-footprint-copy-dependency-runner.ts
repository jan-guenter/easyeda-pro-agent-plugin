/** One original worker's selected dependency closure. This does not execute any
 * producer or establish remote peers, parser subscribers or queued uploads. */
import { decodeCurrentFootprintCopyBackendCacheNativeProperties } from "./current-footprint-copy-backend-cache.ts";
import { types } from "node:util";
import { z } from "zod";
import { decodeCurrentFootprintCopyDependencies, decodeCurrentFootprintCopyDependencyFunction, decodeCurrentFootprintCopyDependencyNativeFunctions,
  decodeCurrentFootprintCopyStructureCallback, decodeCurrentFootprintCopyStructureCallbackMetadata, decodeCurrentFootprintCopyStructureScope } from "./current-footprint-copy-dependency-bindings.ts";
import { CURRENT_FOOTPRINT_COPY_DEPENDENCY_PROFILES } from "./current-footprint-copy-dependency-profiles.ts";
import { decodeCurrentFootprintCopyProducerArray, decodeCurrentFootprintCopyProducerFunction, decodeCurrentFootprintCopyProducerScope } from "./current-footprint-copy-producer-scope.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { assertCurrentFootprintCopyProgramReturned } from "./current-footprint-copy-program-exception.ts";

export const CURRENT_FOOTPRINT_COPY_DEPENDENCY_REQUESTS = CURRENT_FOOTPRINT_COPY_DEPENDENCY_PROFILES.length + 18;
export const CURRENT_FOOTPRINT_COPY_DEPENDENCY_REPROOF_REQUESTS = 6;
export const CURRENT_FOOTPRINT_COPY_DEPENDENCY_OWNER_REQUESTS = Object.freeze({ observeMaximum: CURRENT_FOOTPRINT_COPY_DEPENDENCY_REQUESTS + 12,
  requireMaximum: CURRENT_FOOTPRINT_COPY_DEPENDENCY_REPROOF_REQUESTS + 6 });
export interface CurrentFootprintCopyDependencyTransport {
  readonly lexicalBundleObjectId: string;
  readonly assertCurrent: () => void;
  readonly properties: (objectId: string) => Promise<unknown>;
  readonly capture: (scopeId: string) => Promise<unknown>;
  readonly recheck: (scopeId: string, bundleId: string) => Promise<unknown>;
  readonly captureStructure: (scopeId: string, bundleId: string) => Promise<unknown>;
  readonly recheckStructure: (scopeId: string, bundleId: string, callbackId: string) => Promise<unknown>;
}
export const currentFootprintCopyDependencyObservationSchema = z.object({
  profile: z.literal("private.current-footprint-copy-dependencies.v1"), selectedFunctionCount: z.literal(64), freshDirectScopeCount: z.literal(3),
  nativeParserOverrideQualified: z.literal(true),
  nativePublicationMethodsRetained: z.literal(true), ownUploadStructureCallbackRetained: z.literal(true),
  uploadStructureArrowReceiverVerified: z.literal(false),
  originalSelectedIdentitiesRechecked: z.literal(true), initializedNotificationBusRetained: z.literal(true), originalCacheObjectsRetained: z.literal(true),
  cacheWrapperFunctionsQualified: z.literal(7), cacheWrapperNamespaceNamesMatched: z.literal(true), originalNativeCacheReceiverCandidatesRetained: z.literal(true),
  nativeCacheFunctionsQualified: z.literal(4), nativeCacheNamespaceProvenanceVerified: z.literal(false),
  parserSubscriberCallbacksBound: z.literal(false), uploadCallbacksBound: z.literal(false), transitiveProducerClosuresBound: z.literal(false),
  notificationPeerOwnershipVerified: z.literal(false), clockProvenanceVerified: z.literal(false), executionAuthorized: z.literal(false),
}).strict();
export type CurrentFootprintCopyDependencyObservation = z.infer<typeof currentFootprintCopyDependencyObservationSchema>;
/** Historical journal decoding only. A recorded packet never reconstructs the
 * original runner or satisfies its private packet-identity check. */
const historicalParserDependencyObservationSchema = currentFootprintCopyDependencyObservationSchema.omit({
  nativePublicationMethodsRetained: true, ownUploadStructureCallbackRetained: true, uploadStructureArrowReceiverVerified: true,
}).extend({ selectedFunctionCount: z.literal(61) }).strict();
const historicalCacheDependencyObservationSchema = historicalParserDependencyObservationSchema.omit({ nativeParserOverrideQualified: true })
  .extend({ selectedFunctionCount: z.literal(60) }).strict();
const historicalDependencyObservationSchema = historicalCacheDependencyObservationSchema.omit({
  cacheWrapperFunctionsQualified: true, cacheWrapperNamespaceNamesMatched: true, originalNativeCacheReceiverCandidatesRetained: true,
  nativeCacheFunctionsQualified: true, nativeCacheNamespaceProvenanceVerified: true,
}).extend({ selectedFunctionCount: z.literal(53) }).strict();
export const recordedCurrentFootprintCopyDependencyObservationSchema = z.union([
  currentFootprintCopyDependencyObservationSchema, historicalParserDependencyObservationSchema, historicalCacheDependencyObservationSchema, historicalDependencyObservationSchema,
]);

const handle = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
const arrayDescription = `Array(${String(CURRENT_FOOTPRINT_COPY_DEPENDENCY_PROFILES.length + 9)})`;
const array = z.object({ result: z.object({ type: z.literal("object"), subtype: z.literal("array"), className: z.literal("Array"),
  description: z.literal(arrayDescription), objectId: handle }).strict() }).strict();
const yes = z.object({ result: z.object({ type: z.literal("boolean"), value: z.literal(true) }).strict() }).strict();
const scopeValue = z.looseObject({ objectId: handle.optional() });
const scopeInternal = z.looseObject({ name: z.string(), value: scopeValue });
const scopeMetadata = z.looseObject({ internalProperties: z.array(scopeInternal) });
const fields = ["lexicalBundleObjectId", "assertCurrent", "properties", "capture", "recheck", "captureStructure", "recheckStructure"] as const;
function need(condition: boolean): asserts condition { if (!condition) { throw new Error("FOOTPRINT_COPY_DEPENDENCY_OWNER"); } }
function methods(transport: CurrentFootprintCopyDependencyTransport): readonly unknown[] {
  need(transport !== null && typeof transport === "object" && !types.isProxy(transport) &&
    (Object.getPrototypeOf(transport) === Object.prototype || Object.getPrototypeOf(transport) === null) && Reflect.ownKeys(transport).length === fields.length);
  return fields.map((name, index) => {
    const descriptor = Object.getOwnPropertyDescriptor(transport, name);
    need(descriptor !== undefined && Object.hasOwn(descriptor, "value") && typeof descriptor.value === (index === 0 ? "string" : "function"));
    return descriptor.value as unknown;
  });
}
export class CurrentFootprintCopyDependencyRunner {
  readonly #transport: CurrentFootprintCopyDependencyTransport;
  readonly #methods: readonly unknown[];
  readonly #scriptId: string;
  readonly #replies: unknown[] = [];
  #attempted = false;
  #failed = false;
  #requests = 0;
  #reproofAttempted = false;
  #bundleId: string | null = null;
  #clockFunctionId: string | null = null;
  #structureWrapperId: string | null = null;
  #structureCallbackId: string | null = null;
  #packet: CurrentFootprintCopyDependencyObservation | null = null;
  public constructor(transport: CurrentFootprintCopyDependencyTransport, scriptId: string) {
    this.#methods = methods(transport); this.#transport = transport; this.#scriptId = handle.parse(scriptId);
    handle.parse(transport.lexicalBundleObjectId);
  }
  #current(): void { need(!this.#failed && methods(this.#transport).every((method, index) => method === this.#methods[index])); this.#transport.assertCurrent(); }
  async #request(operation: () => Promise<unknown>, reproof = false): Promise<unknown> {
    this.#current(); need(this.#requests < CURRENT_FOOTPRINT_COPY_DEPENDENCY_REQUESTS + (reproof ? CURRENT_FOOTPRINT_COPY_DEPENDENCY_REPROOF_REQUESTS : 0));
    this.#requests += 1;
    const raw = captureCurrentPcbStringClockReply(await operation()).value; this.#replies.push(raw); this.#current();
    assertCurrentFootprintCopyProgramReturned(raw, "dependencies"); return raw;
  }
  async #scope(objectId: string, index: number, reproof = false): Promise<string> {
    const input = await this.#request(() => this.#transport.properties(objectId), reproof);
    // Existing direct-source decoder verifies the function's exact source in
    // The original lexical array; its metadata establishes this fresh scope.
    decodeCurrentFootprintCopyProducerFunction(input, this.#scriptId, index);
    const metadata = scopeMetadata.parse(input);
    const scopesId = metadata.internalProperties.find(item => item.name === "[[Scopes]]")?.value.objectId; need(scopesId !== undefined);
    return decodeCurrentFootprintCopyProducerScope(await this.#request(() => this.#transport.properties(scopesId), reproof));
  }
  async #structureScope(reproof: boolean): Promise<string> {
    const wrapper = this.#structureWrapperId; need(wrapper !== null);
    const scopes = decodeCurrentFootprintCopyDependencyFunction(await this.#request(() => this.#transport.properties(wrapper), reproof),
      this.#scriptId, CURRENT_FOOTPRINT_COPY_DEPENDENCY_PROFILES.length - 1);
    return decodeCurrentFootprintCopyStructureScope(await this.#request(() => this.#transport.properties(scopes), reproof));
  }
  async #captureStructure(wrapper: string, scopes: string): Promise<void> {
    this.#structureWrapperId = wrapper;
    const scope = decodeCurrentFootprintCopyStructureScope(await this.#request(() => this.#transport.properties(scopes)));
    const bundle = this.#bundleId; need(bundle !== null);
    const callback = decodeCurrentFootprintCopyStructureCallback(await this.#request(() => this.#transport.captureStructure(scope, bundle)));
    this.#structureCallbackId = callback;
    decodeCurrentFootprintCopyStructureCallbackMetadata(await this.#request(() => this.#transport.properties(callback)), this.#scriptId);
  }
  async #captureBundle(scopeId: string): Promise<void> {
    const captured = array.parse(await this.#request(() => this.#transport.capture(scopeId)));
    this.#bundleId = captured.result.objectId;
    const capturedProperties = await this.#request(() => this.#transport.properties(captured.result.objectId));
    const functions = decodeCurrentFootprintCopyDependencies(capturedProperties);
    for (const [position, id] of functions.entries()) {
      const scopes = decodeCurrentFootprintCopyDependencyFunction(await this.#request(() => this.#transport.properties(id)), this.#scriptId, position);
      if (position === CURRENT_FOOTPRINT_COPY_DEPENDENCY_PROFILES.length - 1) { await this.#captureStructure(id, scopes); }
    }
    for (const [position, id] of decodeCurrentFootprintCopyDependencyNativeFunctions(capturedProperties).entries()) {
      decodeCurrentFootprintCopyBackendCacheNativeProperties(await this.#request(() => this.#transport.properties(id)), position);
    }
  }
  public async observe(): Promise<CurrentFootprintCopyDependencyObservation> {
    need(!this.#attempted); this.#attempted = true;
    try {
      const direct = decodeCurrentFootprintCopyProducerArray(await this.#request(() => this.#transport.properties(this.#transport.lexicalBundleObjectId)));
      const clock = direct[2]; need(clock !== undefined); this.#clockFunctionId = clock;
      for (const index of [2, 4, 5]) {
        const objectId = direct[index]; need(objectId !== undefined);
        const scopeId = await this.#scope(objectId, index);
        if (this.#bundleId === null) {
          await this.#captureBundle(scopeId);
        } else {
          const bundle = this.#bundleId; yes.parse(await this.#request(() => this.#transport.recheck(scopeId, bundle)));
        }
      }
      need(this.#requests === CURRENT_FOOTPRINT_COPY_DEPENDENCY_REQUESTS && CURRENT_FOOTPRINT_COPY_DEPENDENCY_PROFILES.length === 64 &&
        this.#structureWrapperId !== null && this.#structureCallbackId !== null);
      this.#packet = Object.freeze({ profile: "private.current-footprint-copy-dependencies.v1", selectedFunctionCount: 64, freshDirectScopeCount: 3,
        nativeParserOverrideQualified: true,
        nativePublicationMethodsRetained: true, ownUploadStructureCallbackRetained: true, uploadStructureArrowReceiverVerified: false,
        originalSelectedIdentitiesRechecked: true, initializedNotificationBusRetained: true, originalCacheObjectsRetained: true,
        cacheWrapperFunctionsQualified: 7, cacheWrapperNamespaceNamesMatched: true, originalNativeCacheReceiverCandidatesRetained: true,
        nativeCacheFunctionsQualified: 4, nativeCacheNamespaceProvenanceVerified: false,
        parserSubscriberCallbacksBound: false, uploadCallbacksBound: false, transitiveProducerClosuresBound: false,
        notificationPeerOwnershipVerified: false, clockProvenanceVerified: false, executionAuthorized: false });
      return this.#packet;
    } catch (error) { this.#failed = true; throw error; }
  }
  public async requireOriginal(packet: CurrentFootprintCopyDependencyObservation): Promise<void> {
    need(packet === this.#packet && this.#packet !== null && !this.#reproofAttempted && this.#clockFunctionId !== null && this.#bundleId !== null &&
      this.#structureCallbackId !== null);
    this.#reproofAttempted = true;
    try {
      const bundle = this.#bundleId, scopeId = await this.#scope(this.#clockFunctionId, 2, true);
      yes.parse(await this.#request(() => this.#transport.recheck(scopeId, bundle), true));
      const callback = this.#structureCallbackId, structureScope = await this.#structureScope(true);
      yes.parse(await this.#request(() => this.#transport.recheckStructure(structureScope, bundle, callback), true)); this.#current();
    } catch (error) { this.#failed = true; throw error; }
  }
  public retained(): Readonly<{ attempted: boolean; failed: boolean; completed: boolean; requests: number;
    originalBundleRetained: boolean; reproofAttempted: boolean; replies: readonly unknown[] }> {
    return Object.freeze({ attempted: this.#attempted, failed: this.#failed, completed: this.#packet !== null, requests: this.#requests,
      originalBundleRetained: this.#bundleId !== null, reproofAttempted: this.#reproofAttempted, replies: Object.freeze([...this.#replies]) });
  }
}
