/** One consumed, unmounted worker producer observation. The transport must be
 * made by the original construction owner; it is not a caller JSON interface.
 * No writer, allocator, parser, source router or clock is executed. */
import { types } from "node:util";
import { z } from "zod";
import { decodeCurrentFootprintCopyCreateMethodArray, decodeCurrentFootprintCopyCreateMethodProperties } from "./current-footprint-copy-create-bindings.ts";
import { decodeCurrentFootprintCopyProducerArray, decodeCurrentFootprintCopyProducerFunction, decodeCurrentFootprintCopyProducerScope } from "./current-footprint-copy-producer-scope.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";

/** Two requests for method capture+array; eight method metadata requests;
 * five fresh scope lists; capture+array+seven lexical metadata; four identity
 * comparisons; final original-method recheck. Owner lifecycle reproof costs
 * must be reserved separately; this count does not expand the224 envelope. */
export const CURRENT_FOOTPRINT_COPY_PRODUCER_REQUESTS = 29;
/** The integrated owner adds two state checks. Each costs three requests
 * before cache-method qualification or five afterward; reuse adds one state
 * check and one original-create-method check. Reserve these maxima, retaining
 * any transport-owned context/source reproof costs separately. No budget is
 * acquired merely by importing these constants. */
export const CURRENT_FOOTPRINT_COPY_PRODUCER_OWNER_REQUESTS = Object.freeze({ observeMaximum: 39, requireMaximum: 6 });
const selected = new Set([0, 1, 2, 4, 5]);
export interface CurrentFootprintCopyProducerTransport {
  readonly assertCurrent: () => void;
  /** Must reprove the retained PROJECT/manager/consistency/constructor bundle.
   * captureOriginalMethods uses only CREATE_METHOD_CALLS.capture and retains
   * its array in the original owner; recheck uses that same array. */
  readonly captureOriginalMethods: () => Promise<unknown>;
  readonly recheckOriginalMethods: () => Promise<unknown>;
  readonly properties: (objectId: string) => Promise<unknown>;
  /** These two callbacks accept only the fixed LEXICAL_CALLS programs. Scope
   * handles originate in fresh metadata of the original eight methods. */
  readonly captureLexicals: (scopeId: string) => Promise<unknown>;
  readonly recheckLexicals: (scopeId: string, bundleId: string) => Promise<unknown>;
}
const token = z.string().min(1).max(256).regex(/^[A-Za-z\d_.:-]+$/u);
const arrayReply = z.object({ result: z.object({ type: z.literal("object"), subtype: z.literal("array"), className: z.literal("Array"),
  description: z.string(), objectId: token }).strict() }).strict();
const yes = z.object({ result: z.object({ type: z.literal("boolean"), value: z.literal(true) }).strict() }).strict();
const names = ["assertCurrent", "captureOriginalMethods", "recheckOriginalMethods", "properties", "captureLexicals", "recheckLexicals"] as const;
export interface CurrentFootprintCopyProducerObservation {
  readonly profile: "private.current-footprint-copy-producer.v1";
  readonly methodCount: 8;
  readonly lexicalFunctionCount: 7;
  readonly freshScopeCount: 5;
  readonly originalMethodRelationsRechecked: true;
  readonly lexicalIdentitiesRechecked: true;
  readonly parserAndUploadCallbacksBound: false;
  readonly transitiveProducerClosuresBound: false;
  readonly uiSourceRouteBound: false;
  readonly clockProvenanceVerified: false;
  readonly nativeGenerationClosed: false;
  readonly executionAuthorized: false;
}
function need(condition: boolean): asserts condition { if (!condition) { throw new Error("FOOTPRINT_COPY_PRODUCER_OWNER"); } }
function methods(transport: CurrentFootprintCopyProducerTransport): readonly unknown[] {
  need(!types.isProxy(transport) && (Object.getPrototypeOf(transport) === Object.prototype || Object.getPrototypeOf(transport) === null));
  need(Reflect.ownKeys(transport).length === names.length);
  return Object.freeze(names.map(name => {
    const descriptor = Object.getOwnPropertyDescriptor(transport, name);
    need(descriptor !== undefined && Object.hasOwn(descriptor, "value") && typeof descriptor.value === "function");
    return descriptor.value as unknown;
  }));
}

export class CurrentFootprintCopyProducerRunner {
  readonly #transport: CurrentFootprintCopyProducerTransport;
  readonly #methods: readonly unknown[];
  readonly #scriptId: string;
  readonly #replies: unknown[] = [];
  #attempted = false;
  #failed = false;
  #requests = 0;
  #packet: CurrentFootprintCopyProducerObservation | null = null;
  public constructor(transport: CurrentFootprintCopyProducerTransport, scriptId: string) {
    this.#methods = methods(transport); this.#transport = transport; this.#scriptId = token.parse(scriptId);
  }
  #current(): void {
    need(!this.#failed && methods(this.#transport).every((method, index) => method === this.#methods[index]));
    this.#transport.assertCurrent();
  }
  async #request(operation: () => Promise<unknown>): Promise<unknown> {
    this.#current(); need(this.#requests < CURRENT_FOOTPRINT_COPY_PRODUCER_REQUESTS); this.#requests += 1;
    const reply = captureCurrentPcbStringClockReply(await operation()).value;
    // Keep received evidence even when the owner is lost after delivery.
    this.#replies.push(reply); this.#current(); return reply;
  }
  public retained(): Readonly<{ attempted: boolean; failed: boolean; requests: number; completed: boolean; replies: readonly unknown[] }> {
    return Object.freeze({ attempted: this.#attempted, failed: this.#failed, requests: this.#requests,
      completed: this.#packet !== null, replies: Object.freeze([...this.#replies]) });
  }
  async #captureLexicals(scope: string): Promise<string> {
    const bundle = arrayReply.parse(await this.#request(() => this.#transport.captureLexicals(scope)));
    need(bundle.result.description === "Array(10)");
    const functions = decodeCurrentFootprintCopyProducerArray(await this.#request(() => this.#transport.properties(bundle.result.objectId)));
    for (const [index, objectId] of functions.entries()) {
      decodeCurrentFootprintCopyProducerFunction(await this.#request(() => this.#transport.properties(objectId)), this.#scriptId, index);
    }
    return bundle.result.objectId;
  }
  public async observe(): Promise<CurrentFootprintCopyProducerObservation> {
    need(!this.#attempted); this.#attempted = true;
    try {
      const captured = arrayReply.parse(await this.#request(() => this.#transport.captureOriginalMethods()));
      need(captured.result.description === "Array(8)");
      const ids = decodeCurrentFootprintCopyCreateMethodArray(await this.#request(() => this.#transport.properties(captured.result.objectId)));
      let lexicalBundle: string | null = null;
      for (const [index, objectId] of ids.entries()) {
        const metadata = decodeCurrentFootprintCopyCreateMethodProperties(await this.#request(() => this.#transport.properties(objectId)), this.#scriptId, index);
        if (selected.has(index)) {
          const scope = decodeCurrentFootprintCopyProducerScope(await this.#request(() => this.#transport.properties(metadata.scopesId)));
          if (lexicalBundle === null) {
            lexicalBundle = await this.#captureLexicals(scope);
          } else {
            const originalBundle = lexicalBundle;
            yes.parse(await this.#request(() => this.#transport.recheckLexicals(scope, originalBundle)));
          }
        }
      }
      yes.parse(await this.#request(() => this.#transport.recheckOriginalMethods()));
      need(this.#requests === CURRENT_FOOTPRINT_COPY_PRODUCER_REQUESTS);
      this.#packet = Object.freeze({ profile: "private.current-footprint-copy-producer.v1", methodCount: 8, lexicalFunctionCount: 7,
        freshScopeCount: 5, originalMethodRelationsRechecked: true, lexicalIdentitiesRechecked: true,
        parserAndUploadCallbacksBound: false, transitiveProducerClosuresBound: false, uiSourceRouteBound: false,
        clockProvenanceVerified: false, nativeGenerationClosed: false, executionAuthorized: false });
      return this.#packet;
    } catch (error) { this.#failed = true; throw error; }
  }
  /** Only this original runner's issued observation can be reused. This is a
   * lifetime check, not a new lexical sample or continuous ownership claim. */
  public requireOriginal(observation: CurrentFootprintCopyProducerObservation): void {
    try { this.#current(); need(observation === this.#packet && this.#packet !== null); }
    catch (error) { this.#failed = true; throw error; }
  }
}
