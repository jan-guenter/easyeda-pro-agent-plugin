/** Actual original Wire lexical values and fixed native joins. This observes
 * no action, monitor callback, worker mutation, clock, SQL or Save completion. */
/* oxlint-disable import/max-dependencies -- The original observer joins independent source pins, inspector data, fixed programs and private owner custody. */
import { z } from "zod";
import { canonicalJson, sha256Text } from "./core.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { requireOriginalCurrentSchematicWireLexicalOrigin } from "./current-pcb-diagnostic-owner.ts";
import type { CurrentSchematicWireEditOwner } from "./current-schematic-wire-edit-owner.ts";
import type { GeneratedSchematicWireEditNativeArguments } from "./generated-schematic-wire-edit.ts";
import type { CurrentSchematicWireAccessorContext } from "./current-schematic-wire-accessor-observer.ts";
import { CURRENT_SCHEMATIC_WIRE_LEXICAL_CALLS as CALLS, CURRENT_SCHEMATIC_WIRE_LEXICAL_EXTRA_ARGUMENTS as EXTRA, CURRENT_SCHEMATIC_WIRE_LEXICAL_FLAGS as FLAGS,
  CURRENT_SCHEMATIC_WIRE_LEXICAL_REQUESTS as REQUESTS, validateCurrentSchematicWireLexicalCommand } from "./current-schematic-wire-lexical-protocol.ts";
import type { CurrentSchematicWireLexicalCommand, CurrentSchematicWireLexicalRole } from "./current-schematic-wire-lexical-protocol.ts";
import { GENERATED_SCHEMATIC_WIRE_NATIVE_SOURCE as WIRE_SOURCE } from "./generated-schematic-wire-native-source.ts";
import { GENERATED_SCHEMATIC_DISPLAY_ACTION_SOURCE as ACTION_SOURCE } from "./generated-schematic-display-action-source.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";
import { decodeCurrentSchematicRelevanceDisplayActionNoop } from "./current-schematic-relevance-display-action-replies.ts";

export interface CurrentSchematicWireLexicalOrigin { readonly profile: "private.current-schematic-wire-lexical-origin.v1" }
export interface CurrentSchematicWireLexicalBindings {
  readonly holderObjectId: string; readonly targetJson: string; readonly operationJson: string; readonly context: CurrentSchematicWireAccessorContext;
  readonly request: (command: CurrentSchematicWireLexicalCommand, cleanup: boolean) => Promise<unknown>;
  readonly assertCurrent: () => Promise<void>; readonly assertOriginalGenerationExited: () => Promise<void>; readonly fail: () => void;
}
export interface CurrentSchematicWireLexicalObservation {
  readonly schema: "private.current-schematic-wire-lexical-observation.v1"; readonly sourceSha256: string; readonly variant: 0 | 1;
  readonly originalConstructorScopeValuesJoined: true; readonly originalSixteenByteViewsJoined: true; readonly originalNormalMethodJoined: true;
  readonly originalFiniteBuiltinJoined: true; readonly originalFrozenDefaultsAndNoopJoined: true;
  readonly originalMonitorJoined: false; readonly originalCallbackJoined: false; readonly liveContinuationAuthorized: false;
  readonly executionAuthorized: false; readonly saveAuthorized: false; readonly selectedSqlAuthorized: false; readonly persistenceVerified: false;
}
interface Ref { readonly objectId: string; readonly description: string }
export interface CurrentSchematicWireLexicalValues {
  readonly pointCtor: Ref; readonly normalClass: Ref; readonly floats: Ref; readonly ints: Ref;
  readonly normalMethod: Ref; readonly finite: Ref; readonly options: Ref; readonly noop: Ref;
}
const issued = new WeakMap<CurrentSchematicWireLexicalObservation, CurrentSchematicWireLexicalObserver>();
const handle = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
const remote = z.strictObject({ type: z.string(), subtype: z.string().optional(), className: z.string().optional(), objectId: handle.optional(), description: z.string().max(65_536).optional(), value: z.unknown().optional() });
const property = z.strictObject({ name: z.string().max(128), value: remote, writable: z.boolean(), configurable: z.boolean(), enumerable: z.boolean(), isOwn: z.literal(true) });
const internal = z.strictObject({ name: z.string(), value: remote });
const properties = z.strictObject({ result: z.array(property).max(64), internalProperties: z.array(internal).max(4).optional() });
const arrayReply = z.strictObject({ result: remote }); const empty = z.strictObject({});
const trueReply = z.strictObject({ result: z.strictObject({ type: z.literal("boolean"), value: z.literal(true) }) });
function need(value: boolean, code: string): asserts value { if (!value) { throw new Error(`SCHEMATIC_WIRE_LEXICAL_${code}`); } }
/** Own scope-list metadata only. Script/Global reads remain unavailable to
 * constructor/default roles; the finite role reads only its literal builtin. */
export function decodeCurrentSchematicWireLexicalScopes(input: unknown, finite: boolean): readonly string[] {
  const reply = properties.parse(captureCurrentPcbStringClockReply(input).value);
  need(reply.internalProperties === undefined && reply.result.length > 0 && reply.result.length <= 8, "SCOPE_LIST");
  const seen = new Set<string>(); const refs: string[] = [];
  for (const [index, field] of reply.result.entries()) {
    const value = field.value; need(field.name === String(index) && field.writable && field.enumerable && field.configurable && value.type === "object" && value.subtype === "internal#scope" && value.className === "Object" && value.objectId !== undefined && value.value === undefined && !seen.has(value.objectId), "SCOPE_ENTRY"); seen.add(value.objectId);
    const lexical = value.description === "Block" || value.description === "Closure" || /^Closure \([A-Za-z_$][\w$]*\)$/u.test(value.description ?? "");
    need(lexical || value.description === "Script" || value.description === "Global", "SCOPE_KIND"); if (lexical || finite) { refs.push(value.objectId); }
  }
  need(reply.result.at(-1)?.value.description === "Global" && refs.length > 0, "COMPLETE_SCOPE_CHAIN"); return Object.freeze(refs);
}
function captureArray(input: unknown, length: number): string {
  const value = arrayReply.parse(captureCurrentPcbStringClockReply(input).value).result;
  need(value.type === "object" && value.subtype === "array" && value.className === "Array" && value.description === `Array(${String(length)})` && value.objectId !== undefined && value.value === undefined, "ARRAY_CAPTURE"); return value.objectId;
}
export function decodeCurrentSchematicWireLexicalArray(input: unknown, length: 2 | 4 | 6): readonly z.infer<typeof remote>[] {
  const reply = properties.parse(captureCurrentPcbStringClockReply(input).value); const fields = new Map(reply.result.map(field => [field.name, field]));
  need(fields.size === length + 1 && reply.result.length === fields.size && reply.internalProperties?.length === 1 && reply.internalProperties[0]?.name === "[[Prototype]]", "ARRAY_ROSTER");
  const size = fields.get("length"); need(size !== undefined && size.writable && !size.enumerable && !size.configurable && size.value.type === "number" && size.value.value === length, "ARRAY_LENGTH");
  return freezeDeep(Array.from({ length }, (_, index) => { const field = fields.get(String(index)); need(field !== undefined && field.writable && field.enumerable && field.configurable, "ARRAY_FIELD"); return field.value; }));
}
function ref(value: z.infer<typeof remote> | undefined, kind: string, className: string): Ref {
  const typed = className === "Float64Array" || className === "Int32Array";
  need(value !== undefined && value.type === kind && value.className === className && value.subtype === (typed ? "typedarray" : undefined) && value.objectId !== undefined && value.value === undefined && typeof value.description === "string" && value.description.isWellFormed(), "ORIGINAL_REFERENCE");
  return Object.freeze({ objectId: value.objectId, description: value.description });
}
/** Function syntax, exact position and own fields only. Caller data cannot
 * issue the original lexical packet or replace its actual native handles. */
export function decodeCurrentSchematicWireLexicalFunction(input: unknown, context: Pick<CurrentSchematicWireAccessorContext, "variant" | "scriptId" | "sourceSha256">, role: "normal" | "noop", description: string): string {
  const source = WIRE_SOURCE[context.variant]; const action = ACTION_SOURCE[context.variant]; need(source !== undefined && action !== undefined && action.sha256 === context.sourceSha256, "SOURCE_VARIANT");
  const normalSource = 'normal(e){if(isFinite(e))return e;throw new Error(Uh.format("%f is not permitted",e))}';
  const expected = role === "normal" ? { name: "normal", arity: 1, lineNumber: source.methods.pointNormal.lineNumber, columnNumber: source.methods.pointNormal.columnNumber + 13, description: normalSource } : {
    name: "Cr", arity: 0, lineNumber: action.methods.noop.lineNumber, columnNumber: action.methods.noop.columnNumber, description: "function Cr(...i){}" };
  const sourceHash = role === "normal" ? sha256Text(`static ${description}`) : sha256Text(description);
  need(description === expected.description && description.isWellFormed() && sourceHash === (role === "normal" ? source.methods.pointNormal.sha256 : action.methods.noop.sha256), "FUNCTION_SOURCE");
  const reply = properties.parse(captureCurrentPcbStringClockReply(input).value); const fields = new Map(reply.result.map(field => [field.name, field]));
  need(fields.size === reply.result.length && fields.size === (role === "normal" ? 2 : 5), "FUNCTION_ROSTER");
  for (const [name, value] of [["name", expected.name], ["length", expected.arity]] as const) { const field = fields.get(name); need(field !== undefined && !field.writable && field.configurable && !field.enumerable && field.value.type === (name === "name" ? "string" : "number") && field.value.objectId === undefined && field.value.className === undefined && field.value.subtype === undefined && field.value.value === value, "FUNCTION_FIELDS"); }
  if (role === "noop") { decodeCurrentSchematicRelevanceDisplayActionNoop(input, context.variant, context.scriptId); const prototype = fields.get("prototype"); need(prototype !== undefined && prototype.writable && !prototype.configurable && !prototype.enumerable && prototype.value.type === "object" && prototype.value.objectId !== undefined && prototype.value.value === undefined, "NOOP_PROTOTYPE"); }
  const internals = new Map(reply.internalProperties?.map(field => [field.name, field.value])); const location = internals.get("[[FunctionLocation]]"); const scopes = internals.get("[[Scopes]]"); const parent = internals.get("[[Prototype]]");
  need(internals.size === 3 && reply.internalProperties?.length === 3 && location?.type === "object" && location.subtype === "internal#location" && location.objectId === undefined && canonicalJson(location.value) === canonicalJson({ scriptId: context.scriptId, lineNumber: expected.lineNumber, columnNumber: expected.columnNumber }) &&
    scopes?.type === "object" && scopes.subtype === "internal#scopeList" && scopes.className === "Array" && scopes.objectId !== undefined && /^Scopes\[[1-8]\]$/u.test(scopes.description ?? "") && parent?.type === "function" && parent.objectId !== undefined, "FUNCTION_LOCATION_SCOPES"); return scopes.objectId;
}

export class CurrentSchematicWireLexicalObserver {
  readonly #origin: CurrentSchematicWireLexicalOrigin; readonly #owner: CurrentSchematicWireEditOwner; readonly #args: GeneratedSchematicWireEditNativeArguments; readonly #bindings: CurrentSchematicWireLexicalBindings;
  #attempted = false; #busy = false; #failed = false; #retired = false; #released = false; #normal = 0; #cleanup = 0;
  #packet: CurrentSchematicWireLexicalObservation | null = null; #values: CurrentSchematicWireLexicalValues | null = null;
  public constructor(origin: CurrentSchematicWireLexicalOrigin, owner: CurrentSchematicWireEditOwner, args: GeneratedSchematicWireEditNativeArguments) {
    this.#bindings = requireOriginalCurrentSchematicWireLexicalOrigin(origin, owner, args); this.#origin = origin; this.#owner = owner; this.#args = args; Object.freeze(this);
  }
  async #current(): Promise<void> {
    need(!this.#failed && !this.#released && !this.#retired && requireOriginalCurrentSchematicWireLexicalOrigin(this.#origin, this.#owner, this.#args) === this.#bindings, "ORIGINAL");
    await this.#bindings.assertCurrent(); need(!this.#failed && !this.#released && !this.#retired && requireOriginalCurrentSchematicWireLexicalOrigin(this.#origin, this.#owner, this.#args) === this.#bindings, "CHANGED");
  }
  async #send(input: unknown): Promise<unknown> {
    await this.#current(); const command = validateCurrentSchematicWireLexicalCommand(input); need(command.phase !== "wire-lexical-release" && this.#normal < REQUESTS.normal, "NORMAL_BOUND"); this.#normal += 1;
    const raw = await this.#bindings.request(command, false); const data = captureCurrentPcbStringClockReply(raw).value; await this.#current(); return data;
  }
  #properties(objectId: string): Promise<unknown> { return this.#send({ phase: "wire-lexical-properties", method: "Runtime.getProperties", params: { objectId, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } }); }
  #call(role: CurrentSchematicWireLexicalRole, objectId: string, values: readonly Ref[] = []): Promise<unknown> {
    need(values.length === EXTRA[role], "FIXED_ARGUMENT_COUNT"); return this.#send({ phase: "wire-lexical-call", role, method: "Runtime.callFunctionOn", params: { ...FLAGS, objectId, functionDeclaration: CALLS[role],
      arguments: [{ objectId: this.#bindings.holderObjectId }, { value: this.#bindings.targetJson }, { value: this.#bindings.operationJson }, ...values.map(value => ({ objectId: value.objectId }))], returnByValue: role === "same" || role === "defaultJoin" || role === "finiteJoin" } });
  }
  async #scopeValues(scopes: string, role: "point0" | "point1" | "defaults" | "finite", names: readonly string[]): Promise<ReadonlyMap<string, z.infer<typeof remote>>> {
    const chain = decodeCurrentSchematicWireLexicalScopes(await this.#properties(scopes), role === "finite"); const found = new Map<string, z.infer<typeof remote>>();
    for (const scope of chain) {
      const length = names.length * 2; need(length === 2 || length === 4 || length === 6, "FIXED_SCOPE_LENGTH"); const array = captureArray(await this.#call(role, scope), length);
      const cells = decodeCurrentSchematicWireLexicalArray(await this.#properties(array), length);
      for (const [index, name] of names.entries()) { const present = cells[index * 2]; const value = cells[index * 2 + 1];
        need(present?.type === "boolean" && typeof present.value === "boolean" && present.objectId === undefined && present.className === undefined && present.subtype === undefined && value !== undefined, "SCOPE_PRESENCE");
        if (present.value) { if (!found.has(name)) { found.set(name, value); } }
        else { need(value.type === "undefined" && value.objectId === undefined && value.value === undefined, "ABSENT_BINDING"); }
      }
      if (found.size === names.length) { break; }
    }
    need(found.size === names.length, "COMPLETE_BINDINGS"); return found;
  }
  public async observe(): Promise<CurrentSchematicWireLexicalObservation> {
    await this.#current(); need(!this.#attempted && !this.#busy, "CONSUMED"); this.#attempted = true; this.#busy = true;
    try {
      const { context } = this.#bindings; const ctor = context.functions.pointConstructor; const role = context.variant === 0 ? "point0" : "point1"; const names = context.variant === 0 ? ["Ea", "_he", "ok"] : ["Ma", "Rce", "Yk"];
      const pointValues = await this.#scopeValues(ctor.scopes, role, names); const first = names[0]; const second = names[1]; const third = names[2]; need(first !== undefined && second !== undefined && third !== undefined, "POINT_NAMES");
      const pointCtor: Ref = Object.freeze({ objectId: ctor.objectId, description: ctor.description }); const normalClass = ref(pointValues.get(first), "function", "Function"); const floats = ref(pointValues.get(second), "object", "Float64Array"); const ints = ref(pointValues.get(third), "object", "Int32Array");
      const joined = captureArray(await this.#call("point", this.#bindings.holderObjectId, [pointCtor, normalClass, floats, ints]), 2); const functions = decodeCurrentSchematicWireLexicalArray(await this.#properties(joined), 2);
      const normalMethod = ref(functions[0], "function", "Function"); const finite = ref(functions[1], "function", "Function");
      const normalScopes = decodeCurrentSchematicWireLexicalFunction(await this.#properties(normalMethod.objectId), context, "normal", normalMethod.description);
      const finiteBindings = await this.#scopeValues(normalScopes, "finite", ["isFinite"]); const actualFinite = ref(finiteBindings.get("isFinite"), "function", "Function");
      trueReply.parse(await this.#call("finiteJoin", this.#bindings.holderObjectId, [actualFinite]));
      const defaults = await this.#scopeValues(context.functions.setLines.scopes, "defaults", ["qt", "Cr"]); const options = ref(defaults.get("qt"), "object", "Object"); const noop = ref(defaults.get("Cr"), "function", "Function");
      decodeCurrentSchematicWireLexicalFunction(await this.#properties(noop.objectId), context, "noop", noop.description);
      trueReply.parse(await this.#call("defaultJoin", this.#bindings.holderObjectId, [options, noop]));
      trueReply.parse(await this.#call("same", this.#bindings.holderObjectId, [pointCtor, normalClass, floats, ints, normalMethod, finite])); await this.#current();
      this.#values = Object.freeze({ pointCtor, normalClass, floats, ints, normalMethod, finite, options, noop });
      const packet: CurrentSchematicWireLexicalObservation = Object.freeze({ schema: "private.current-schematic-wire-lexical-observation.v1", sourceSha256: context.sourceSha256, variant: context.variant,
        originalConstructorScopeValuesJoined: true, originalSixteenByteViewsJoined: true, originalNormalMethodJoined: true, originalFiniteBuiltinJoined: true, originalFrozenDefaultsAndNoopJoined: true,
        originalMonitorJoined: false, originalCallbackJoined: false, liveContinuationAuthorized: false, executionAuthorized: false, saveAuthorized: false, selectedSqlAuthorized: false, persistenceVerified: false });
      this.#packet = packet; issued.set(packet, this); return packet;
    } catch (error) { this.#failed = true; this.#bindings.fail(); throw error; } finally { this.#busy = false; }
  }
  public requireOriginal(packet: CurrentSchematicWireLexicalObservation, origin: CurrentSchematicWireLexicalOrigin, owner: CurrentSchematicWireEditOwner, args: GeneratedSchematicWireEditNativeArguments): CurrentSchematicWireLexicalValues {
    need(packet === this.#packet && issued.get(packet) === this && origin === this.#origin && owner === this.#owner && args === this.#args && this.#values !== null && !this.#failed && !this.#released && !this.#retired && requireOriginalCurrentSchematicWireLexicalOrigin(origin, owner, args) === this.#bindings, "ORIGINAL_PACKET"); return this.#values;
  }
  public async release(): Promise<void> {
    await this.#current(); need(!this.#busy && this.#packet !== null && this.#cleanup < REQUESTS.cleanup, "RELEASE_CONSUMED"); this.#busy = true; this.#cleanup += 1;
    try { const command = validateCurrentSchematicWireLexicalCommand({ phase: "wire-lexical-release", method: "Runtime.releaseObjectGroup", params: { objectGroup: FLAGS.objectGroup } }); const reply = await this.#bindings.request(command, true);
      empty.parse(captureCurrentPcbStringClockReply(reply).value); await this.#current(); this.#released = true; } catch (error) { this.#failed = true; this.#bindings.fail(); throw error; } finally { this.#busy = false; }
  }
  public async retireAfterOriginalExit(): Promise<void> {
    need(!this.#busy && !this.#retired && requireOriginalCurrentSchematicWireLexicalOrigin(this.#origin, this.#owner, this.#args) === this.#bindings, "ORIGINAL_EXIT_OWNER"); await this.#bindings.assertOriginalGenerationExited();
    need(requireOriginalCurrentSchematicWireLexicalOrigin(this.#origin, this.#owner, this.#args) === this.#bindings, "ORIGINAL_EXIT_CHANGED"); this.#retired = true;
  }
}
export function requireOriginalCurrentSchematicWireLexicalObservation(packet: CurrentSchematicWireLexicalObservation, origin: CurrentSchematicWireLexicalOrigin, owner: CurrentSchematicWireEditOwner, args: GeneratedSchematicWireEditNativeArguments): CurrentSchematicWireLexicalValues {
  const observer = issued.get(packet); need(observer !== undefined, "ORIGINAL_OBSERVER"); return observer.requireOriginal(packet, origin, owner, args);
}
