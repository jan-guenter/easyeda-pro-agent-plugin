/** One finite original request lane. Core supplies the retained session and
 * correlated helper receipts; this class issues no owner or forwarding token. */
import { z } from "zod";
import { CURRENT_FOOTPRINT_INVERSE_DELETE_FORWARD_CALLS as CALLS, CURRENT_FOOTPRINT_INVERSE_DELETE_FORWARD_FLAGS as FLAGS, validateCurrentFootprintInverseDeleteForwardCommand as validate } from "./current-footprint-inverse-delete-forward-protocol.ts";
import type { CurrentFootprintInverseDeleteForwardCommand as Command } from "./current-footprint-inverse-delete-forward-protocol.ts";
import { currentFootprintInverseLookupArray as array, currentFootprintInverseLookupObject as object, currentFootprintInverseLookupProperties as properties, currentFootprintInverseLookupResult as result } from "./current-footprint-inverse-lookup-preentry-replies.ts";
import type { CurrentFootprintInverseLookupRemote as Remote } from "./current-footprint-inverse-lookup-preentry-replies.ts";
import { captureCurrentFootprintInversePreferenceReply as capture } from "./current-footprint-inverse-public-preferences-replies.ts";
import { currentFootprintInverseLookupIdentity } from "./current-footprint-inverse-lookup-identity.ts";

export interface CurrentFootprintInverseDeleteForwardTuple { readonly id: string; readonly values: readonly Remote[]; readonly packets: readonly unknown[] }
export interface CurrentFootprintInverseDeleteForwardIoBindings { readonly receipt: string; readonly current: () => void; readonly request: (command: Command) => Promise<unknown>; readonly target: Readonly<{ projectUuid: string; branchUuid: string; documentUuid: string }>; readonly maximum: number }
type Call = keyof typeof CALLS;
type FrameCommand = Extract<Command, { method: "Debugger.evaluateOnCallFrame" }>;
const promiseRemote = z.strictObject({ type: z.literal("object"), subtype: z.literal("promise"), className: z.literal("Promise"), description: z.literal("Promise"), objectId: z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u) });
const prototype = z.strictObject({ name: z.literal("[[Prototype]]"), value: z.strictObject({ type: z.literal("object"), className: z.literal("Promise"), description: z.literal("Promise"), objectId: z.string() }) });
const state = z.strictObject({ name: z.literal("[[PromiseState]]"), value: z.strictObject({ type: z.literal("string"), value: z.enum(["pending", "fulfilled"]) }) });
const promiseResult = z.strictObject({ name: z.literal("[[PromiseResult]]"), value: z.strictObject({ type: z.literal("undefined") }) });
const promisePacket = z.strictObject({ result: z.tuple([]), internalProperties: z.tuple([prototype, state, promiseResult]) });
/** Reject a failed inverse delete forward io predicate with its fixed refusal code. */
function need(value: boolean): asserts value { if (!value) { throw new Error("INVERSE_DELETE_FORWARD_IO"); } }
export class CurrentFootprintInverseDeleteForwardIo {
  readonly #b: CurrentFootprintInverseDeleteForwardIoBindings; #state = { requests: 0 };
  public constructor(b: CurrentFootprintInverseDeleteForwardIoBindings) { need(Number.isSafeInteger(b.maximum) && b.maximum > 0 && b.maximum <= 1024); this.#b = b; }
  public current(): void { this.#b.current(); }
  /** Add an operation-local failure check without resetting or raising the
   * original lane's request bound. Both guards run before and after each await. */
  public withCurrent(current: () => void): CurrentFootprintInverseDeleteForwardIo { const view = new CurrentFootprintInverseDeleteForwardIo({ ...this.#b, current: (): void => { this.current(); current(); } }); view.#state = this.#state; return view; }
  /** Share one finite counter across views and reprove custody on both sides
   * of each awaited request, including operation-local permanent failure. */
  public async send(input: Command): Promise<unknown> { this.current(); this.#state.requests += 1; need(this.#state.requests <= this.#b.maximum); const raw = await this.#b.request(validate(input)); this.current(); return raw; }
  public properties(id: string): Promise<unknown> { return this.send({ phase: "inverse-delete-forward-properties", method: "Runtime.getProperties", params: { objectId: id, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } }); }
  /** Construct one closed helper call from its fixed role and exact references. */
  public call(role: Call, refs: readonly string[], value?: string, receiver = this.#b.receipt): Promise<unknown> { const row = CALLS[role]; const args: unknown[] = refs.map(objectId => ({ objectId })); if (row.value !== 0) { args.push({ value: row.value === 1 ? currentFootprintInverseLookupIdentity(this.#b.target) : value }); } return this.send(validate({ phase: "inverse-delete-forward-call", role, method: "Runtime.callFunctionOn", params: { ...FLAGS, objectId: receiver, functionDeclaration: row.program, arguments: args, returnByValue: row.byValue } })); }
  /** Decode a bounded tuple and qualify every newly returned object before
   * later traversal; the known original I11 root may remain opaque. */
  public async inspect(id: string, size: number, skipRoot = false): Promise<CurrentFootprintInverseDeleteForwardTuple> { const packets: unknown[] = []; const values = array(await this.properties(id), size); for (const [index, value] of values.entries()) { if (skipRoot && index === 0) { packets.push(null); } else if (value.type === "function" || value.type === "object" && value.subtype !== "null") { const raw = await this.properties(object(value)); if (value.subtype === "promise") { promisePacket.parse(capture(raw)); } else { properties(raw); } packets.push(raw); } else { packets.push(null); } } return Object.freeze({ id, values, packets: Object.freeze(packets) }); }
  /** Invoke a fixed tuple builder, then retain its full qualified metadata. */
  public async tuple(role: Call, refs: readonly string[], size: number, value?: string, receiver?: string): Promise<CurrentFootprintInverseDeleteForwardTuple> { const raw = await this.call(role, refs, value, receiver); return this.inspect(result(raw, size), size); }
  /** Project actual live lexicals from the selected held frame and inspect
   * its literal; a historical Inspector scope mirror cannot replace it. */
  public async frame(role: FrameCommand["role"], frameId: string, expression: string, size: number, skipRoot = true): Promise<CurrentFootprintInverseDeleteForwardTuple> { const raw = await this.send(validate({ phase: "inverse-delete-forward-frame", role, method: "Debugger.evaluateOnCallFrame", params: { callFrameId: frameId, expression, objectGroup: FLAGS.objectGroup, silent: true, generatePreview: false, throwOnSideEffect: true, returnByValue: false, includeCommandLineAPI: false } })); return this.inspect(result(raw, size), size, skipRoot); }
  /** Native prototype equality is independently checked by send-promise. */
  public async retainPromise(id: string, members: string, expected: "pending" | "fulfilled"): Promise<string> { const raw = promisePacket.parse(capture(await this.properties(id))); need(raw.internalProperties[1].value.value === expected); const checked = z.strictObject({ result: z.strictObject({ type: z.literal("boolean"), value: z.literal(true) }) }).parse(capture(await this.call("send-promise", [id, members]))); need(checked.result.value); const retained = z.strictObject({ result: promiseRemote }).parse(capture(await this.call("send-retain", [], undefined, id))).result; const again = promisePacket.parse(capture(await this.properties(retained.objectId))); need(again.internalProperties[1].value.value === expected); return retained.objectId; }
  /** Read the actual fulfilled object from the original retained force Promise.
   * Its native prototype and complete result descriptors are proved separately. */
  public async forceResult(id: string, members: string): Promise<string> { const checked = await this.call("send-promise", [id, members]); z.strictObject({ result: z.strictObject({ type: z.literal("boolean"), value: z.literal(true) }) }).parse(capture(checked));
    const fulfilled = z.strictObject({ name: z.literal("[[PromiseState]]"), value: z.strictObject({ type: z.literal("string"), value: z.literal("fulfilled") }) }); const returned = z.strictObject({ name: z.literal("[[PromiseResult]]"), value: z.strictObject({ type: z.literal("object"), className: z.literal("Object"), description: z.literal("Object"), objectId: z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u) }) });
    const schema = z.strictObject({ result: z.tuple([]), internalProperties: z.tuple([prototype, fulfilled, returned]) }); const raw = schema.parse(capture(await this.properties(id))); const resultId = raw.internalProperties[2].value.objectId; properties(await this.properties(resultId)); return resultId;
  }
}
