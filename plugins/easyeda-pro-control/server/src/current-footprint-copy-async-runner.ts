/** Original parser/upload callback capture with two coherent queue snapshots.
 * Empty tracked queues do not cover the native detached cache-cleanup promise. */
import { types } from "node:util";
import { z } from "zod";
import { decodeCurrentFootprintCopyAsyncArray, decodeCurrentFootprintCopyAsyncFunction, decodeCurrentFootprintCopyAsyncScope } from "./current-footprint-copy-async-bindings.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";

export interface CurrentFootprintCopyAsyncTransport {
  readonly assertCurrent: () => void;
  readonly properties: (objectId: string) => Promise<unknown>;
  readonly capture: () => Promise<unknown>;
  readonly recheck: (originalId: string) => Promise<unknown>;
  readonly captureUpload: (scopeId: string) => Promise<unknown>;
  readonly sample: (scopeId: string, originalId: string, uploadId: string) => Promise<unknown>;
}
const count = z.number().int().min(0).max(1_000_000).refine(value => !Object.is(value, -0));
export const currentFootprintCopyAsyncSnapshotSchema = z.object({ timerPending: z.boolean(), bufferedPromiseRetained: z.boolean(),
  task1: count, task2: count, task3: count, cachePromises: count, bufferedUploads: count, bufferedUploadCaches: count,
  uploading: z.boolean(), batchUploading: z.boolean(), pendingSync: z.boolean() }).strict();
export type CurrentFootprintCopyAsyncSnapshot = z.infer<typeof currentFootprintCopyAsyncSnapshotSchema>;
const limits = Object.freeze({ parserArrowReceiversVerified: false, uploadArrowReceiverVerified: false,
  untrackedUploadCacheCleanupComplete: false, callbacksCompleted: false, executionAuthorized: false } as const);
export const currentFootprintCopyAsyncObservationSchema = z.object({ profile: z.literal("private.current-footprint-copy-async.v1"),
  sourceQualifiedCallbacks: z.literal(7), parserHeadSubscribers: z.literal(1), parserChangeSubscribers: z.literal(1),
  originalCallbackIdentitiesRetained: z.literal(true), bufferedClosureProjectMatched: z.literal(true), coherentSnapshots: z.literal(2),
  snapshot: currentFootprintCopyAsyncSnapshotSchema, trackedQueuesEmptyAtSamples: z.boolean(),
  parserArrowReceiversVerified: z.literal(false), uploadArrowReceiverVerified: z.literal(false), untrackedUploadCacheCleanupComplete: z.literal(false),
  callbacksCompleted: z.literal(false), executionAuthorized: z.literal(false) }).strict();
export type CurrentFootprintCopyAsyncObservation = z.infer<typeof currentFootprintCopyAsyncObservationSchema>;
/** Issued only by the original construction core after its retained upload
 * argument is matched to this callback's native closure. The standalone leaf
 * cannot establish this relation from supplied metadata. */
export interface CurrentFootprintCopyConstructedAsyncObservation extends Omit<CurrentFootprintCopyAsyncObservation, "uploadArrowReceiverVerified"> {
  readonly uploadArrowReceiverVerified: true;
  readonly originalConstructionUploadMatched: true;
}
export const CURRENT_FOOTPRINT_COPY_CONSTRUCTED_ASYNC_REQUESTS = Object.freeze({ observe: 19, reproof: 6 });
export const CURRENT_FOOTPRINT_COPY_ASYNC_REQUESTS = Object.freeze({ observe: 17, reproof: 4 });

const token = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
const yes = z.object({ result: z.object({ type: z.literal("boolean"), value: z.literal(true) }).strict() }).strict();
const sample = z.object({ result: z.object({ type: z.literal("object"), value: currentFootprintCopyAsyncSnapshotSchema }).strict() }).strict();
const fields = ["assertCurrent", "properties", "capture", "recheck", "captureUpload", "sample"] as const;
function need(condition: boolean): asserts condition { if (!condition) { throw new Error("FOOTPRINT_COPY_ASYNC_OWNER"); } }
function methods(transport: CurrentFootprintCopyAsyncTransport): readonly unknown[] {
  need(transport !== null && typeof transport === "object" && !types.isProxy(transport) &&
    (Object.getPrototypeOf(transport) === Object.prototype || Object.getPrototypeOf(transport) === null) && Reflect.ownKeys(transport).length === fields.length);
  return fields.map(name => { const property = Object.getOwnPropertyDescriptor(transport, name);
    need(property !== undefined && Object.hasOwn(property, "value") && typeof property.value === "function"); return property.value as unknown; });
}
function arrayId(input: unknown, length: 3 | 14): string {
  const description = `Array(${String(length)})`;
  return z.object({ result: z.object({ type: z.literal("object"), subtype: z.literal("array"), className: z.literal("Array"),
    description: z.literal(description), objectId: token }).strict() }).strict().parse(input).result.objectId;
}
export class CurrentFootprintCopyAsyncRunner {
  readonly #transport: CurrentFootprintCopyAsyncTransport;
  readonly #methods: readonly unknown[];
  readonly #scriptId: string;
  readonly #replies: unknown[] = [];
  #attempted = false;
  #failed = false;
  #requests = 0;
  #reproof = false;
  #originalId: string | null = null;
  #uploadId: string | null = null;
  #bufferedId: string | null = null;
  #packet: CurrentFootprintCopyAsyncObservation | null = null;
  public constructor(transport: CurrentFootprintCopyAsyncTransport, scriptId: string) {
    this.#transport = transport; this.#methods = methods(transport); this.#scriptId = token.parse(scriptId);
  }
  #current(): void {
    need(!this.#failed && methods(this.#transport).every((method, index) => method === this.#methods[index]));
    this.#transport.assertCurrent();
  }
  async #request(operation: () => Promise<unknown>): Promise<unknown> {
    this.#current(); need(this.#requests < CURRENT_FOOTPRINT_COPY_ASYNC_REQUESTS.observe + (this.#reproof ? CURRENT_FOOTPRINT_COPY_ASYNC_REQUESTS.reproof : 0));
    this.#requests += 1;
    const raw = captureCurrentPcbStringClockReply(await operation()).value; this.#replies.push(raw); this.#current(); return raw;
  }
  async #scope(): Promise<string> {
    const id = this.#bufferedId; need(id !== null);
    const scopes = decodeCurrentFootprintCopyAsyncFunction(await this.#request(() => this.#transport.properties(id)), this.#scriptId, 2);
    return decodeCurrentFootprintCopyAsyncScope(await this.#request(() => this.#transport.properties(scopes)));
  }
  async #sample(scope: string): Promise<CurrentFootprintCopyAsyncSnapshot> {
    const original = this.#originalId, upload = this.#uploadId; need(original !== null && upload !== null);
    return Object.freeze(sample.parse(await this.#request(() => this.#transport.sample(scope, original, upload))).result.value);
  }
  public async observe(): Promise<CurrentFootprintCopyAsyncObservation> {
    need(!this.#attempted); this.#attempted = true;
    try {
      this.#originalId = arrayId(await this.#request(() => this.#transport.capture()), 14);
      const ids = decodeCurrentFootprintCopyAsyncArray(await this.#request(() => this.#transport.properties(this.#originalId ?? "")), false);
      let bufferedScopes: string | null = null;
      for (const [index, id] of ids.entries()) {
        const scopes = decodeCurrentFootprintCopyAsyncFunction(await this.#request(() => this.#transport.properties(id)), this.#scriptId, index);
        if (index === 2) { this.#bufferedId = id; bufferedScopes = scopes; }
      }
      need(bufferedScopes !== null);
      const scope = decodeCurrentFootprintCopyAsyncScope(await this.#request(() => this.#transport.properties(bufferedScopes ?? "")));
      this.#uploadId = arrayId(await this.#request(() => this.#transport.captureUpload(scope)), 3);
      const uploads = decodeCurrentFootprintCopyAsyncArray(await this.#request(() => this.#transport.properties(this.#uploadId ?? "")), true);
      for (const [index, id] of uploads.entries()) { decodeCurrentFootprintCopyAsyncFunction(await this.#request(() => this.#transport.properties(id)), this.#scriptId, index + 4); }
      const first = await this.#sample(scope), freshScope = await this.#scope(), original = this.#originalId;
      yes.parse(await this.#request(() => this.#transport.recheck(original)));
      const second = await this.#sample(freshScope);
      need(this.#requests === CURRENT_FOOTPRINT_COPY_ASYNC_REQUESTS.observe && JSON.stringify(first) === JSON.stringify(second));
      this.#packet = Object.freeze({ profile: "private.current-footprint-copy-async.v1", sourceQualifiedCallbacks: 7, parserHeadSubscribers: 1, parserChangeSubscribers: 1,
        originalCallbackIdentitiesRetained: true, bufferedClosureProjectMatched: true, coherentSnapshots: 2, snapshot: second,
        trackedQueuesEmptyAtSamples: Object.values(second).every(value => value === false || value === 0), ...limits }); return this.#packet;
    } catch (error) { this.#failed = true; throw error; }
  }
  /** One fresh read can retain a preflight observation, but it cannot authorize
   * create or relabel an empty task1 snapshot as callback completion. */
  public async requireOriginal(packet: CurrentFootprintCopyAsyncObservation): Promise<void> {
    need(this.#packet !== null && packet === this.#packet && !this.#reproof && this.#originalId !== null); this.#reproof = true;
    try {
      const original = this.#originalId, scope = await this.#scope();
      yes.parse(await this.#request(() => this.#transport.recheck(original)));
      need(JSON.stringify(await this.#sample(scope)) === JSON.stringify(packet.snapshot)); this.#current();
    } catch (error) { this.#failed = true; throw error; }
  }
  public retained(): Readonly<{ attempted: boolean; failed: boolean; completed: boolean; requests: number; reproofAttempted: boolean; replies: readonly unknown[] }> {
    return Object.freeze({ attempted: this.#attempted, failed: this.#failed, completed: this.#packet !== null, requests: this.#requests,
      reproofAttempted: this.#reproof, replies: Object.freeze([...this.#replies]) });
  }
}
