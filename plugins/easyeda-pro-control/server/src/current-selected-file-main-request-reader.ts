/** Fixed source/scope observation on one original paused driver. This pure
 * reader issues no native ownership, request continuation or SQL authority. */
import { types } from "node:util";
import { z } from "zod";
import { captureManagedFixtureDispatchReply } from "./managed-fixture-dispatch-reply.ts";
import { captureCurrentSelectedFileMainFetchScriptReply, decodeCurrentSelectedFileMainRequestFunction,
  qualifyCurrentSelectedFileMainFetchSource, requireOriginalCurrentSelectedFileMainFetchSource } from "./current-selected-file-main-fetch-source.ts";
import type { CurrentSelectedFileMainFetchSource } from "./current-selected-file-main-fetch-source.ts";
import { CURRENT_SELECTED_FILE_MAIN_REQUEST_CALLS as CALLS, CURRENT_SELECTED_FILE_MAIN_REQUEST_FRAME as FRAME } from "./current-selected-file-main-request-programs.ts";
import { CURRENT_SELECTED_FILE_MAIN_SQL_FENCE_CALL_FLAGS as CALL, CURRENT_SELECTED_FILE_MAIN_SQL_FENCE_FRAME_FLAGS as FLAGS } from "./current-selected-file-main-sql-fence-protocol.ts";
import type { CurrentSelectedFileMainSqlFenceCommand as Command } from "./current-selected-file-main-sql-fence-protocol.ts";

const token = z.string().min(1).max(256).regex(/^[A-Za-z\d_.:-]+$/u);
const text = (maximum: number): z.ZodString => z.string().max(maximum);
export const currentSelectedFileMainRequestObservationSchema = z.strictObject({ schema: z.literal("private.selected-file-main-request.v1"), mode: z.enum(["fetch", "legacy"]),
  method: z.enum(["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]), pureUrl: text(4096).min(1), pureQuery: text(4096), pathHeader: text(4096).nullable(),
  originalRequestVerified: z.literal(true), readonlySql: z.literal(false), executionAuthorized: z.literal(false), saveAuthorized: z.literal(false) });
export type CurrentSelectedFileMainRequestObservation = z.infer<typeof currentSelectedFileMainRequestObservationSchema>;
export interface CurrentSelectedFileMainRequestReaderBindings { readonly appScriptId: string; readonly captureObjectId: string;
  readonly request: (command: Command) => Promise<unknown>; readonly assertCurrent: () => Promise<void>; readonly assertFetchScript: (scriptId: string) => void }
type Bag = Readonly<Record<string, unknown>>;
function need(value: boolean): asserts value { if (!value) { throw new Error("SELECTED_MAIN_REQUEST_REPLY"); } }
function bag(value: unknown): Bag { need(value !== null && typeof value === "object" && !Array.isArray(value)); return Object.fromEntries(Object.entries(value)); }
function rows(value: unknown): readonly Bag[] { const result = bag(value)["result"]; need(Array.isArray(result) && result.length <= 256); return result.map(row => bag(row)); }
function member(value: unknown, name: string): Bag { const found = rows(value).filter(row => row["name"] === name); need(found.length === 1); return found[0] ?? {}; }
function remote(row: Bag): Bag { need(row["isOwn"] === true); return bag(row["value"]); }
function objectId(value: Bag): string { return token.parse(value["objectId"]); }
function objectReply(value: unknown, length: number): string { const result = bag(bag(value)["result"]); need(result["type"] === "object" && result["subtype"] === "array" && result["className"] === "Array" && result["description"] === `Array(${String(length)})`); return objectId(result); }
export class CurrentSelectedFileMainRequestReader {
  readonly #bindings: CurrentSelectedFileMainRequestReaderBindings;
  readonly #originalCaptures = new WeakMap<CurrentSelectedFileMainRequestObservation, string>();
  #fetchSource: CurrentSelectedFileMainFetchSource | null = null; #fetchBound: string | null = null; #legacyCapture: string | null = null; #busy = false; #attempts = 0;
  public constructor(bindings: CurrentSelectedFileMainRequestReaderBindings) {
    need(bindings !== null && typeof bindings === "object" && !types.isProxy(bindings) && Object.isFrozen(bindings) && Object.getPrototypeOf(bindings) === Object.prototype);
    const keys = ["appScriptId", "captureObjectId", "request", "assertCurrent", "assertFetchScript"]; need(Reflect.ownKeys(bindings).length === keys.length);
    for (const [index, key] of keys.entries()) { const field = Object.getOwnPropertyDescriptor(bindings, key); need(field !== undefined && Object.hasOwn(field, "value") && typeof field.value === (index < 2 ? "string" : "function") && !types.isProxy(field.value)); }
    token.parse(bindings.appScriptId); token.parse(bindings.captureObjectId); this.#bindings = bindings; Object.freeze(this);
  }
  async #send(command: Command): Promise<unknown> {
    await this.#bindings.assertCurrent(); const raw = await this.#bindings.request(command);
    // Capture original bytes before a reproof await; full source has its own
    // Fixed larger envelope, never the ordinary metadata/string allowance.
    const reply: unknown = command.phase === "sql-fence-fetch-source" ? captureCurrentSelectedFileMainFetchScriptReply(raw) : captureManagedFixtureDispatchReply(raw).value;
    await this.#bindings.assertCurrent(); return reply;
  }
  #properties(object: string): Promise<unknown> { return this.#send({ phase: "sql-fence-properties", method: "Runtime.getProperties", params: { objectId: object, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } }); }
  async #scope(list: string, expected: string): Promise<string> {
    const scopes = rows(await this.#properties(list)); need(scopes.length > 0 && scopes.length <= 16);
    const found = scopes.filter(row => { const value = bag(row["value"]); return value["type"] === "object" && value["subtype"] === "internal#scope" && value["description"] === expected; });
    need(found.length === 1); return objectId(bag(found[0]?.["value"]));
  }
  async #bind(capture: string, metadata: unknown, frame: string): Promise<string> {
    const ctor = objectId(remote(member(metadata, "5"))), getter = objectId(remote(member(metadata, "6")));
    const actual = decodeCurrentSelectedFileMainRequestFunction(await this.#properties(getter), "method"); this.#bindings.assertFetchScript(actual.scriptId);
    const raw = bag(await this.#send({ phase: "sql-fence-fetch-source", method: "Debugger.getScriptSource", params: { scriptId: actual.scriptId } }));
    this.#fetchSource = qualifyCurrentSelectedFileMainFetchSource(raw["scriptSource"]);
    decodeCurrentSelectedFileMainRequestFunction(await this.#properties(ctor), "Request", actual.scriptId);
    const block = await this.#scope(actual.scopes, "Block (lib/web/fetch/request.js)"), closure = await this.#scope(actual.scopes, "Closure (lib/web/fetch/request.js)");
    const classScope = await this.#properties(block); need(remote(member(classScope, "_Request"))["type"] === "function");
    const captured = await this.#properties(closure), webidl = objectId(remote(member(captured, "webidl"))), webidlProperties = await this.#properties(webidl);
    const brand = objectId(remote(member(webidlProperties, "brandCheck"))), brandMetadata = decodeCurrentSelectedFileMainRequestFunction(await this.#properties(brand), "brand", actual.scriptId);
    const brandScope = await this.#scope(brandMetadata.scopes, "Closure (lib/web/webidl/index.js)"), originalBrand = await this.#properties(brandScope);
    need(remote(member(originalBrand, "FunctionPrototypeSymbolHasInstance"))["type"] === "function");
    // The source-held frame supplies original BL/zL constructors, independently
    // Of Fetch metadata; no Request.url/body accessor is evaluated.
    const originals = await this.#properties(frame); const wrapper = objectId(remote(member(originals, "5")));
    decodeCurrentSelectedFileMainRequestFunction(await this.#properties(wrapper), "fetch", this.#bindings.appScriptId);
    return objectReply(await this.#send({ phase: "sql-fence-request-bind", method: "Runtime.callFunctionOn", params: { ...CALL, objectId: capture,
      functionDeclaration: CALLS.bind, arguments: [{ objectId: block }, { objectId: closure }, { objectId: webidl }, { objectId: brandScope }], returnByValue: false } }), 7);
  }
  public requireOriginalCapture(packet: CurrentSelectedFileMainRequestObservation): string {
    const capture = this.#originalCaptures.get(packet); need(capture !== undefined); return capture;
  }
  public async observe(callFrameId: string): Promise<CurrentSelectedFileMainRequestObservation> {
    need(!this.#busy && this.#attempts < 64); this.#busy = true; this.#attempts += 1;
    try {
      const frame = objectReply(await this.#send({ phase: "sql-fence-driver-frame", method: "Debugger.evaluateOnCallFrame", params: { ...FLAGS, callFrameId, expression: FRAME } }), 7);
      const capture = objectReply(await this.#send({ phase: "sql-fence-request-capture", method: "Runtime.callFunctionOn", params: { ...CALL, objectId: frame,
        functionDeclaration: CALLS.capture, arguments: [{ objectId: this.#bindings.captureObjectId }], returnByValue: false } }), 9);
      const metadata = await this.#properties(capture), mode = remote(member(metadata, "7"))["value"]; let selected = capture;
      need(mode === "fetch" || mode === "legacy");
      if (mode === "fetch") {
        if (this.#fetchBound === null) { selected = await this.#bind(capture, metadata, frame); this.#fetchBound = selected; }
        else { need(this.#fetchSource !== null); requireOriginalCurrentSelectedFileMainFetchSource(this.#fetchSource); selected = objectReply(await this.#send({ phase: "sql-fence-request-rebind", method: "Runtime.callFunctionOn", params: { ...CALL, objectId: capture,
          functionDeclaration: CALLS.rebind, arguments: [{ objectId: this.#fetchBound }], returnByValue: false } }), 7); }
      } else if (this.#legacyCapture === null) {
        const originals = await this.#properties(frame); const wrapper = objectId(remote(member(originals, "6")));
        decodeCurrentSelectedFileMainRequestFunction(await this.#properties(wrapper), "legacy", this.#bindings.appScriptId); this.#legacyCapture = capture;
      } else { selected = objectReply(await this.#send({ phase: "sql-fence-request-rebind", method: "Runtime.callFunctionOn", params: { ...CALL, objectId: capture,
        functionDeclaration: CALLS.rebind, arguments: [{ objectId: this.#legacyCapture }], returnByValue: false } }), 9); }
      const result = bag(bag(await this.#send({ phase: "sql-fence-request-read", method: "Runtime.callFunctionOn", params: { ...CALL, objectId: selected,
        functionDeclaration: CALLS.read, arguments: [], returnByValue: true } }))["result"]); need(result["type"] === "object" && !Object.hasOwn(result, "objectId"));
      const observed = Object.freeze(currentSelectedFileMainRequestObservationSchema.parse(result["value"])); need(observed.mode === mode); this.#originalCaptures.set(observed, capture); return observed;
    } finally { this.#busy = false; }
  }
}
