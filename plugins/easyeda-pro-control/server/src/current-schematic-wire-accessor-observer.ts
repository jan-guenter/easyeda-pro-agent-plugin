/** Original Wire holder metadata and complete source qualification. Lexical
 * operands, monitor history and the original action remain separate gates. */
/* oxlint-disable import/max-dependencies -- This observer joins its original issuer, strict transport, independently pinned complete source and full inspector metadata. */
import { z } from "zod";
import { canonicalJson, sha256Text } from "./core.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { captureCurrentSchematicDisplayAccessorSource, currentSchematicDisplayAccessorArray, currentSchematicDisplayAccessorFourFunctions, currentSchematicDisplayAccessorFunctionScriptId } from "./current-schematic-display-accessor-replies.ts";
import { CURRENT_SCHEMATIC_WIRE_ACCESSOR_CALLS as CALLS, CURRENT_SCHEMATIC_WIRE_ACCESSOR_FLAGS as FLAGS, CURRENT_SCHEMATIC_WIRE_ACCESSOR_REQUESTS as REQUESTS,
  CURRENT_SCHEMATIC_WIRE_ACCESSOR_ROLES as ROLES, validateCurrentSchematicWireAccessorCommand } from "./current-schematic-wire-accessor-protocol.ts";
import type { CurrentSchematicWireAccessorCommand } from "./current-schematic-wire-accessor-protocol.ts";
import type { CurrentSchematicWireEditOwner } from "./current-schematic-wire-edit-owner.ts";
import type { GeneratedSchematicWireEditNativeArguments } from "./generated-schematic-wire-edit.ts";
import { GENERATED_SCHEMATIC_WIRE_NATIVE_SOURCE as METHODS } from "./generated-schematic-wire-native-source.ts";
import { GENERATED_SCHEMATIC_WIRE_SOURCE_PROFILE as SOURCE } from "./generated-schematic-wire-source.ts";
import { requireOriginalCurrentSchematicWireAccessorOrigin } from "./current-pcb-diagnostic-owner.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export interface CurrentSchematicWireAccessorOrigin { readonly profile: "private.current-schematic-wire-accessor-origin.v1" }
export interface CurrentSchematicWireAccessorBindings {
  readonly holderObjectId: string; readonly targetJson: string; readonly operationJson: string;
  readonly request: (command: CurrentSchematicWireAccessorCommand, cleanup: boolean) => Promise<unknown>;
  readonly assertCurrent: () => Promise<void>; readonly assertOriginalGenerationExited: () => Promise<void>; readonly fail: () => void;
}
type Role = typeof ROLES[number];
/** Existing geometry pins identify source-span starts. Inspector function
 * locations identify parameter openings, including the actual constructor. */
export const CURRENT_SCHEMATIC_WIRE_ACCESSOR_PARAMETER_OFFSETS = Object.freeze({ pointsGet: 10, pointsSet: 10, setLines: 8, pointConstructor: 743 });
export interface CurrentSchematicWireAccessorObservation {
  readonly schema: "private.current-schematic-wire-accessor-observation.v1"; readonly sourceSha256: string; readonly variant: 0 | 1; readonly functions: 4;
  readonly originalHolderFunctionsQualified: true; readonly originalSourceLocationsQualified: true;
  readonly originalLexicalOperandsJoined: false; readonly originalMonitorJoined: false; readonly originalActionJoined: false;
  readonly executionAuthorized: false; readonly saveAuthorized: false; readonly selectedSqlAuthorized: false; readonly persistenceVerified: false;
}
interface Ref { readonly objectId: string; readonly description: string; readonly scopes: string }
export interface CurrentSchematicWireAccessorContext {
  readonly functions: Readonly<Record<Role, Ref>>; readonly scriptId: string; readonly variant: 0 | 1; readonly sourceSha256: string;
}
const packets = new WeakMap<CurrentSchematicWireAccessorObservation, CurrentSchematicWireAccessorObserver>();
const handle = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
const remote = z.strictObject({ type: z.string(), subtype: z.string().optional(), className: z.string().optional(), description: z.string().max(65_536).optional(), objectId: handle.optional(), value: z.unknown().optional() });
const property = z.strictObject({ name: z.string().max(128), value: remote, writable: z.boolean(), configurable: z.boolean(), enumerable: z.boolean(), isOwn: z.literal(true) });
const internal = z.strictObject({ name: z.string(), value: remote });
const properties = z.strictObject({ result: z.array(property).max(64), internalProperties: z.array(internal).max(4) });
const trueReply = z.strictObject({ result: z.strictObject({ type: z.literal("boolean"), value: z.literal(true) }) }); const empty = z.strictObject({});
function need(value: boolean, code: string): asserts value { if (!value) { throw new Error(`SCHEMATIC_WIRE_ACCESSOR_${code}`); } }
/** Data-only source qualification preserves both native bundle alternatives.
 * It cannot construct an original observation, owner or function handle. */
export function qualifyCurrentSchematicWireAccessorSource(input: unknown): 0 | 1 {
  const { scriptSource } = captureCurrentSchematicDisplayAccessorSource(input); const bytes = Buffer.byteLength(scriptSource); const hash = sha256Text(scriptSource);
  const index = SOURCE.files.findIndex(file => file.bytes === bytes && file.sha256 === hash); need(index === 0 || index === 1, "COMPLETE_SOURCE_IDENTITY");
  const source = METHODS[index]; const file = SOURCE.files[index]; need(source !== undefined && file !== undefined && source.relativePath === file.relativePath, "SOURCE_ROSTER");
  for (const method of Object.values(source.methods)) { need(sha256Text(scriptSource.slice(method.start, method.end)) === method.sha256, "SOURCE_METHOD_SPAN"); }
  for (const role of ROLES) {
    const method = source.methods[role]; const body = scriptSource.slice(method.start, method.end); const parameter = body.indexOf("(", role === "pointConstructor" ? body.indexOf("constructor") : 0);
    need(parameter === CURRENT_SCHEMATIC_WIRE_ACCESSOR_PARAMETER_OFFSETS[role] && !body.slice(0, parameter).includes("\n"), "FUNCTION_PARAMETER_LOCATION");
  }
  return index;
}
/** Join exact function text, own descriptors and Inspector location to one
 * qualified source variant. Return its scope handle without invoking the function. */
export function decodeCurrentSchematicWireAccessorFunction(input: unknown, variant: 0 | 1, role: Role, scriptId: string, description: string): Readonly<Omit<Ref, "objectId">> {
  handle.parse(scriptId); const source = METHODS[variant]; need(source !== undefined, "SOURCE_VARIANT"); const expected = source.methods[role];
  need(description.isWellFormed() && Buffer.byteLength(description) === expected.end - expected.start && sha256Text(description) === expected.sha256, "FUNCTION_DESCRIPTION");
  const reply = properties.parse(captureCurrentPcbStringClockReply(input).value); const fields = new Map(reply.result.map(row => [row.name, row]));
  need(fields.size === reply.result.length, "DUPLICATE_PROPERTIES");
  let name: string = role; let arity = 1;
  if (role === "pointsGet") { name = "get points"; arity = 0; } else if (role === "pointsSet") { name = "set points"; }
  else if (role === "pointConstructor") { name = variant === 0 ? "dl" : "hl"; arity = 2; }
  for (const [key, value] of [["name", name], ["length", arity]] as const) {
    const field = fields.get(key); need(field !== undefined && !field.writable && field.configurable && !field.enumerable && field.value.objectId === undefined && field.value.value === value && field.value.type === (key === "name" ? "string" : "number"), "FUNCTION_NAME_ARITY");
  }
  if (role === "pointConstructor") { const prototype = fields.get("prototype"); need(prototype !== undefined && !prototype.writable && !prototype.configurable && !prototype.enumerable && prototype.value.type === "object" && prototype.value.objectId !== undefined && prototype.value.value === undefined, "POINT_PROTOTYPE"); }
  else { need(fields.size === 2, "FUNCTION_OWN_ROSTER"); }
  const internals = new Map(reply.internalProperties.map(row => [row.name, row.value]));
  const location = internals.get("[[FunctionLocation]]"); const scopes = internals.get("[[Scopes]]"); const parent = internals.get("[[Prototype]]");
  need(internals.size === 3 && reply.internalProperties.length === 3 && location?.type === "object" && location.subtype === "internal#location" && location.objectId === undefined &&
    canonicalJson(location.value) === canonicalJson({ scriptId, lineNumber: expected.lineNumber, columnNumber: expected.columnNumber + CURRENT_SCHEMATIC_WIRE_ACCESSOR_PARAMETER_OFFSETS[role] }) &&
    scopes?.type === "object" && scopes.subtype === "internal#scopeList" && scopes.className === "Array" && scopes.objectId !== undefined && /^Scopes\[[1-8]\]$/u.test(scopes.description ?? "") &&
    parent?.type === "function" && parent.objectId !== undefined, "ORIGINAL_LOCATION_SCOPES");
  return Object.freeze({ description, scopes: scopes.objectId });
}

export class CurrentSchematicWireAccessorObserver {
  readonly #origin: CurrentSchematicWireAccessorOrigin; readonly #owner: CurrentSchematicWireEditOwner; readonly #args: GeneratedSchematicWireEditNativeArguments; readonly #bindings: CurrentSchematicWireAccessorBindings;
  #attempted = false; #failed = false; #released = false; #retired = false; #normal = 0; #cleanup = 0;
  #array: string | null = null; #packet: CurrentSchematicWireAccessorObservation | null = null; #functions: Readonly<Record<Role, Ref>> | null = null;
  #context: CurrentSchematicWireAccessorContext | null = null;
  public constructor(origin: CurrentSchematicWireAccessorOrigin, owner: CurrentSchematicWireEditOwner, args: GeneratedSchematicWireEditNativeArguments) {
    this.#bindings = requireOriginalCurrentSchematicWireAccessorOrigin(origin, owner, args); this.#origin = origin; this.#owner = owner; this.#args = args; Object.freeze(this);
  }
  async #current(): Promise<void> {
    need(!this.#failed && !this.#released && !this.#retired && requireOriginalCurrentSchematicWireAccessorOrigin(this.#origin, this.#owner, this.#args) === this.#bindings, "ORIGINAL");
    await this.#bindings.assertCurrent(); need(!this.#failed && !this.#released && !this.#retired && requireOriginalCurrentSchematicWireAccessorOrigin(this.#origin, this.#owner, this.#args) === this.#bindings, "CHANGED");
  }
  async #send(input: unknown): Promise<unknown> {
    await this.#current(); const command = validateCurrentSchematicWireAccessorCommand(input); need(command.phase !== "wire-accessor-release" && this.#normal < REQUESTS.normal, "NORMAL_BOUND"); this.#normal += 1;
    const raw = await this.#bindings.request(command, false); const captured = command.phase === "wire-accessor-source" ? captureCurrentSchematicDisplayAccessorSource(raw) : captureCurrentPcbStringClockReply(raw).value;
    await this.#current(); return captured;
  }
  #properties(objectId: string): Promise<unknown> { return this.#send({ phase: "wire-accessor-properties", method: "Runtime.getProperties", params: { objectId, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } }); }
  public async observe(): Promise<CurrentSchematicWireAccessorObservation> {
    await this.#current(); need(!this.#attempted, "CONSUMED"); this.#attempted = true;
    try {
      const args = [{ value: this.#bindings.targetJson }, { value: this.#bindings.operationJson }];
      const array = currentSchematicDisplayAccessorArray(await this.#send({ phase: "wire-accessor-callees", method: "Runtime.callFunctionOn", params: { ...FLAGS, objectId: this.#bindings.holderObjectId, functionDeclaration: CALLS.callees, arguments: args, returnByValue: false } }), 4); this.#array = array;
      const refs = currentSchematicDisplayAccessorFourFunctions(await this.#properties(array)); need(new Set(refs.map(ref => ref.objectId)).size === 4, "DISTINCT_FUNCTIONS");
      const first = refs[0]; need(first !== undefined, "FIRST_FUNCTION"); const initial = await this.#properties(first.objectId); const scriptId = currentSchematicDisplayAccessorFunctionScriptId(initial);
      const rawSource = await this.#send({ phase: "wire-accessor-source", method: "Debugger.getScriptSource", params: { scriptId } });
      const variant = qualifyCurrentSchematicWireAccessorSource(rawSource); const file = SOURCE.files[variant]; need(file !== undefined, "SOURCE_VARIANT"); const sourceSha256 = file.sha256; const functions: Partial<Record<Role, Ref>> = {};
      for (const [index, role] of ROLES.entries()) { const ref = refs[index]; need(ref !== undefined, "FUNCTION_ROSTER");
        const metadata = index === 0 ? initial : await this.#properties(ref.objectId); const decoded = decodeCurrentSchematicWireAccessorFunction(metadata, variant, role, scriptId, ref.description);
        functions[role] = Object.freeze({ ...decoded, objectId: ref.objectId });
      }
      const candidate = z.record(z.enum(ROLES), z.strictObject({ objectId: handle, description: z.string(), scopes: handle })).parse(functions); this.#functions = freezeDeep(candidate);
      trueReply.parse(await this.#send({ phase: "wire-accessor-same", method: "Runtime.callFunctionOn", params: { ...FLAGS, objectId: array, functionDeclaration: CALLS.same,
        arguments: [{ objectId: this.#bindings.holderObjectId }, ...args], returnByValue: true } }));
      await this.#current(); need(this.#normal === REQUESTS.normal, "COMPLETE_LEDGER");
      const packet: CurrentSchematicWireAccessorObservation = Object.freeze({ schema: "private.current-schematic-wire-accessor-observation.v1", sourceSha256, variant, functions: 4,
        originalHolderFunctionsQualified: true, originalSourceLocationsQualified: true, originalLexicalOperandsJoined: false, originalMonitorJoined: false, originalActionJoined: false,
        executionAuthorized: false, saveAuthorized: false, selectedSqlAuthorized: false, persistenceVerified: false });
      this.#context = Object.freeze({ functions: this.#functions, scriptId, variant, sourceSha256 }); this.#packet = packet; packets.set(packet, this); return packet;
    } catch (error) { this.#failed = true; this.#bindings.fail(); throw error; }
  }
  public async release(): Promise<void> {
    await this.#current(); need(this.#cleanup < REQUESTS.cleanup && this.#packet !== null, "RELEASE_CONSUMED"); this.#cleanup += 1;
    try { const command = validateCurrentSchematicWireAccessorCommand({ phase: "wire-accessor-release", method: "Runtime.releaseObjectGroup", params: { objectGroup: FLAGS.objectGroup } });
      const reply = await this.#bindings.request(command, true); empty.parse(captureCurrentPcbStringClockReply(reply).value); await this.#current(); this.#released = true; }
    catch (error) { this.#failed = true; this.#bindings.fail(); throw error; }
  }
  public async retireAfterOriginalExit(): Promise<void> {
    need(!this.#retired && requireOriginalCurrentSchematicWireAccessorOrigin(this.#origin, this.#owner, this.#args) === this.#bindings, "ORIGINAL_EXIT_OWNER");
    await this.#bindings.assertOriginalGenerationExited(); need(requireOriginalCurrentSchematicWireAccessorOrigin(this.#origin, this.#owner, this.#args) === this.#bindings, "ORIGINAL_EXIT_CHANGED"); this.#retired = true;
  }
  public requireOriginal(packet: CurrentSchematicWireAccessorObservation, origin: CurrentSchematicWireAccessorOrigin, owner: CurrentSchematicWireEditOwner, args: GeneratedSchematicWireEditNativeArguments): Readonly<Record<Role, Ref>> {
    need(packet === this.#packet && packets.get(packet) === this && this.#origin === origin && this.#owner === owner && this.#args === args && !this.#failed && !this.#released && !this.#retired && this.#array !== null && this.#functions !== null && this.#normal === REQUESTS.normal &&
      requireOriginalCurrentSchematicWireAccessorOrigin(origin, owner, args) === this.#bindings, "ORIGINAL_OBSERVATION"); return this.#functions;
  }
  public requireOriginalContext(packet: CurrentSchematicWireAccessorObservation, origin: CurrentSchematicWireAccessorOrigin, owner: CurrentSchematicWireEditOwner, args: GeneratedSchematicWireEditNativeArguments): CurrentSchematicWireAccessorContext {
    need(this.requireOriginal(packet, origin, owner, args) === this.#context?.functions && this.#context !== null, "ORIGINAL_CONTEXT"); return this.#context;
  }
}
export function requireOriginalCurrentSchematicWireAccessorObservation(packet: CurrentSchematicWireAccessorObservation, origin: CurrentSchematicWireAccessorOrigin, owner: CurrentSchematicWireEditOwner, args: GeneratedSchematicWireEditNativeArguments): Readonly<Record<Role, Ref>> {
  const observer = packets.get(packet); need(observer !== undefined, "ORIGINAL_OBSERVER"); return observer.requireOriginal(packet, origin, owner, args);
}
export function requireOriginalCurrentSchematicWireAccessorContext(packet: CurrentSchematicWireAccessorObservation, origin: CurrentSchematicWireAccessorOrigin, owner: CurrentSchematicWireEditOwner, args: GeneratedSchematicWireEditNativeArguments): CurrentSchematicWireAccessorContext {
  const observer = packets.get(packet); need(observer !== undefined, "ORIGINAL_OBSERVER_CONTEXT"); return observer.requireOriginalContext(packet, origin, owner, args);
}
