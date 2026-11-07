/** Actual original-holder accessor metadata observer. It qualifies only the
 * fixed Text/decorator/watched-monitor path and grants no action authority. */
/* oxlint-disable import/max-dependencies -- Join the actual original issuer, independent fixed source/metadata leaves and finite read-only protocol. */
import { z } from "zod";
import { CURRENT_SCHEMATIC_RELEVANCE_DISPLAY_ACCESSOR_REQUESTS as REQUESTS } from "./current-schematic-relevance-display-accessor-profile.ts";
import { decodeCurrentSchematicRelevanceDisplayAccessorFunction } from "./current-schematic-relevance-display-accessor-replies.ts";
import { requireOriginalCurrentSchematicRelevanceDisplayAccessorOrigin } from "./current-pcb-diagnostic-owner.ts";
import type { CurrentSchematicRelevanceDisplayWriteOwner } from "./current-schematic-relevance-display-write-owner.ts";
import type { GeneratedSchematicRelevanceDisplayNativeArguments } from "./generated-schematic-relevance-display-source.ts";
import type { CurrentSchematicDisplayAccessorBindings, CurrentSchematicRelevanceDisplayAccessorOrigin } from "./current-schematic-relevance-display-accessor-origin.ts";
import { CURRENT_SCHEMATIC_DISPLAY_ACCESSOR_CALLS as CALLS, CURRENT_SCHEMATIC_DISPLAY_ACCESSOR_GROUP as GROUP } from "./current-schematic-display-accessor-programs.ts";
import { CURRENT_SCHEMATIC_DISPLAY_ACCESSOR_FLAGS as FLAGS, validateCurrentSchematicDisplayAccessorCommand } from "./current-schematic-display-accessor-protocol.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { captureCurrentSchematicDisplayAccessorSource, currentSchematicDisplayAccessorArray, currentSchematicDisplayAccessorFourFunctions,
  currentSchematicDisplayAccessorFunctionScriptId, currentSchematicDisplayAccessorScopeFunction } from "./current-schematic-display-accessor-replies.ts";
import { decodeGeneratedSchematicDisplayAccessorCallees, decodeGeneratedSchematicDisplayAccessorScopeValue,
  decodeGeneratedSchematicDisplayAccessorScopes, generatedSchematicDisplayPublicAccessorRole, qualifyGeneratedSchematicDisplayAccessorSource, requireGeneratedSchematicDisplayAccessorDescription } from "./generated-schematic-display-accessor-replies.ts";
import type { GeneratedSchematicDisplayScopeValue } from "./generated-schematic-display-accessor-replies.ts";
import { GENERATED_SCHEMATIC_DISPLAY_ACCESSOR_CALLEES as CALLEES, GENERATED_SCHEMATIC_DISPLAY_ACCESSOR_FIELDS as FIELDS, GENERATED_SCHEMATIC_DISPLAY_ACCESSOR_SOURCE as SOURCES } from "./generated-schematic-display-accessor-source.ts";
import type { GeneratedSchematicDisplayAccessorRole } from "./generated-schematic-display-accessor-source.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export interface CurrentSchematicRelevanceDisplayAccessorObservation {
  readonly schema: "private.current-schematic-relevance-display-accessor-observation.v2"; readonly sourceSha256: string; readonly fields: 10;
  readonly originalHolderCalleesObserved: true; readonly exactRawAndDecoratedSettersObserved: true; readonly watchedMonitorAndAstFunctionMetadataObserved: true; readonly originalMonitorReceiversQualified: false;
  readonly activeActionHistoryCallbackQualified: false; readonly completeActionFrontierQualified: false; readonly executionAuthorized: false; readonly selectedSqlAuthorized: false; readonly persistenceVerified: false;
}
export interface CurrentSchematicRelevanceDisplayUnderlineFunctions { readonly getObjectId: string; readonly setObjectId: string; readonly rawDescriptorObjectId: string; readonly rawGetObjectId: string; readonly rawSetObjectId: string; readonly decoratorObjectId: string; readonly decoratorSetterObjectId: string; readonly decoratorAccessorObjectId: string }
export interface CurrentSchematicRelevanceDisplayAccessorFunctions { readonly setAttributeObjectId: string; readonly recordObjectId: string; readonly astObjectId: string; readonly normalRequests: number; readonly underline: CurrentSchematicRelevanceDisplayUnderlineFunctions }
const packets = new WeakMap<object, CurrentSchematicRelevanceDisplayAccessorObserver>();
export function requireOriginalCurrentSchematicRelevanceDisplayAccessorObservation(packet: unknown, origin: CurrentSchematicRelevanceDisplayAccessorOrigin, owner: CurrentSchematicRelevanceDisplayWriteOwner, args: GeneratedSchematicRelevanceDisplayNativeArguments): CurrentSchematicRelevanceDisplayAccessorFunctions {
  need(packet !== null && typeof packet === "object", "ORIGINAL_METADATA_PACKET"); const observer = packets.get(packet); need(observer !== undefined, "ORIGINAL_METADATA_PACKET"); return observer.requireFunctions(packet, origin, owner, args);
}
const empty = z.strictObject({}), trueReply = z.strictObject({ result: z.strictObject({ type: z.literal("boolean"), value: z.literal(true) }) });
function need(value: boolean, code: string): asserts value { if (!value) { throw new Error(`SCHEMATIC_DISPLAY_ACCESSOR_${code}`); } }
type FunctionRef = Readonly<{ objectId: string; description: string }>;
export class CurrentSchematicRelevanceDisplayAccessorObserver {
  readonly #origin: CurrentSchematicRelevanceDisplayAccessorOrigin; readonly #owner: CurrentSchematicRelevanceDisplayWriteOwner; readonly #argumentsValue: GeneratedSchematicRelevanceDisplayNativeArguments;
  readonly #bindings: CurrentSchematicDisplayAccessorBindings;
  #phase = "not-started";
  #normal = 0; #cleanup = 0; #attempted = false; #busy = false; #failed = false; #released = false; #retired = false;
  #functions: CurrentSchematicRelevanceDisplayAccessorFunctions | null = null;
  #scriptId: string | null = null; #source: 0 | 1 | null = null; #callees: string | null = null; #packet: CurrentSchematicRelevanceDisplayAccessorObservation | null = null;
  public constructor(origin: CurrentSchematicRelevanceDisplayAccessorOrigin, owner: CurrentSchematicRelevanceDisplayWriteOwner, argumentsValue: GeneratedSchematicRelevanceDisplayNativeArguments) {
    this.#origin = origin; this.#owner = owner; this.#argumentsValue = argumentsValue; this.#bindings = requireOriginalCurrentSchematicRelevanceDisplayAccessorOrigin(origin, owner, argumentsValue); Object.freeze(this);
  }
  async #current(): Promise<void> { need(!this.#failed && !this.#released && !this.#retired && requireOriginalCurrentSchematicRelevanceDisplayAccessorOrigin(this.#origin, this.#owner, this.#argumentsValue) === this.#bindings, "ORIGINAL");
    await this.#bindings.assertCurrent(); need(!this.#failed && !this.#released && !this.#retired && requireOriginalCurrentSchematicRelevanceDisplayAccessorOrigin(this.#origin, this.#owner, this.#argumentsValue) === this.#bindings, "CHANGED"); }
  #failure(): void { this.#failed = true; this.#bindings.fail(); }
  async #send(input: unknown, cleanup = false): Promise<unknown> {
    await this.#current(); const command = validateCurrentSchematicDisplayAccessorCommand(input);
    if (cleanup) { this.#cleanup += 1; need(this.#cleanup <= REQUESTS.cleanup, "CLEANUP_BOUND"); } else { this.#normal += 1; need(this.#normal <= REQUESTS.normal, "NORMAL_BOUND"); }
    const raw = await this.#bindings.request(command, cleanup); const captured = command.phase === "schematic-accessor-source" ? captureCurrentSchematicDisplayAccessorSource(raw) : captureCurrentPcbStringClockReply(raw).value;
    await this.#current(); return captured;
  }
  #properties(objectId: string): Promise<unknown> { return this.#send({ phase: "schematic-accessor-properties", method: "Runtime.getProperties", params: { objectId, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } }); }
  #arguments(): readonly Readonly<{ value: string }>[] { return [{ value: this.#bindings.targetJson }, { value: this.#bindings.operationJson }]; }
  async #metadata(ref: FunctionRef, role: GeneratedSchematicDisplayAccessorRole): Promise<string> {
    this.#phase = `metadata:${role}`;
    need(this.#source !== null && this.#scriptId !== null, "SOURCE_REQUIRED"); requireGeneratedSchematicDisplayAccessorDescription(ref.description, this.#source, role);
    return decodeCurrentSchematicRelevanceDisplayAccessorFunction(await this.#properties(ref.objectId), this.#source, role, this.#scriptId).scopes;
  }
  #mergeScope(raw: unknown, names: readonly ("a" | "i" | "t" | "e" | "this")[], result: Map<string, GeneratedSchematicDisplayScopeValue>): void {
    need(this.#source !== null, "SOURCE_REQUIRED");
    for (const name of names) { if (!result.has(name)) { const value = decodeGeneratedSchematicDisplayAccessorScopeValue(raw, name, this.#source); if (value !== null) { result.set(name, value); } } }
  }
  async #scope(scopes: string, names: readonly ("a" | "i" | "t" | "e" | "this")[]): Promise<ReadonlyMap<string, GeneratedSchematicDisplayScopeValue>> {
    need(this.#source !== null, "SOURCE_REQUIRED"); const selected = decodeGeneratedSchematicDisplayAccessorScopes(await this.#properties(scopes)); const result = new Map<string, GeneratedSchematicDisplayScopeValue>();
    for (const handle of selected) { if (result.size < names.length) { this.#mergeScope(await this.#properties(handle), names, result); } }
    need(result.size === names.length, "LEXICAL_BINDING_MISSING"); return result;
  }
  async #recordAst(scopes: string): Promise<FunctionRef> {
    need(this.#source !== null, "SOURCE_REQUIRED"); const selected = decodeGeneratedSchematicDisplayAccessorScopes(await this.#properties(scopes));
    for (const handle of selected) { const raw = await this.#properties(handle); const fn = currentSchematicDisplayAccessorScopeFunction(raw, "t"); if (fn !== null) { return fn; } }
    throw new Error("SCHEMATIC_DISPLAY_ACCESSOR_ORIGINAL_AST_BINDING");
  }
  public async observe(): Promise<CurrentSchematicRelevanceDisplayAccessorObservation> {
    need(!this.#attempted && !this.#busy, "CONSUMED"); this.#attempted = true; this.#busy = true;
    try {
      this.#phase = "callees";
      this.#callees = currentSchematicDisplayAccessorArray(await this.#send({ phase: "schematic-accessor-callees", method: "Runtime.callFunctionOn", params: { ...FLAGS, objectId: this.#bindings.holderObjectId,
        functionDeclaration: CALLS.callees, arguments: this.#arguments(), returnByValue: false } }), 26);
      const callees = decodeGeneratedSchematicDisplayAccessorCallees(await this.#properties(this.#callees)); const first = await this.#properties(callees.textConstructor.objectId);
      this.#phase = "complete-source"; this.#scriptId = currentSchematicDisplayAccessorFunctionScriptId(first); const rawSource = await this.#send({ phase: "schematic-accessor-source", method: "Debugger.getScriptSource", params: { scriptId: this.#scriptId } });
      this.#source = qualifyGeneratedSchematicDisplayAccessorSource(rawSource); requireGeneratedSchematicDisplayAccessorDescription(callees.textConstructor.description, this.#source, "textConstructor");
      const scopes = new Map<string, string>([["textConstructor", decodeCurrentSchematicRelevanceDisplayAccessorFunction(first, this.#source, "textConstructor", this.#scriptId).scopes]]);
      for (const role of CALLEES) { if (role !== "textConstructor") { scopes.set(role, await this.#metadata(callees[role], generatedSchematicDisplayPublicAccessorRole(role))); } }
      let underline: CurrentSchematicRelevanceDisplayUnderlineFunctions | null = null;
      for (const field of FIELDS.slice(2)) {
        const scope = scopes.get(`${field}.set`); need(scope !== undefined, "DECORATOR_SCOPES"); const values = await this.#scope(scope, ["a", "i", "t"]); const raw = values.get("a"); const decorator = values.get("i"); const captured = values.get("t");
        need(raw?.kind === "object" && decorator?.kind === "object" && captured?.kind === "field" && captured.field === field, "DECORATOR_BINDINGS");
        const array = currentSchematicDisplayAccessorArray(await this.#send({ phase: "schematic-accessor-closure", method: "Runtime.callFunctionOn", params: { ...FLAGS, objectId: raw.objectId, functionDeclaration: CALLS.closure,
          arguments: [{ objectId: this.#bindings.holderObjectId }, ...this.#arguments(), { value: field }, { objectId: decorator.objectId }, { value: captured.field }], returnByValue: false } }), 4);
        const functions = currentSchematicDisplayAccessorFourFunctions(await this.#properties(array)); const roles = ["decoratorSetter", `${field}.get`, `${field}.set`, "decoratorAccessor"] as const; let setterScopes: string | null = null;
        for (const [index, ref] of functions.entries()) { const role = roles[index]; need(role !== undefined, "DECORATOR_FUNCTION_ROSTER"); const actual = await this.#metadata(ref, role); if (index === 0) { setterScopes = actual; } }
        need(setterScopes !== null, "DECORATOR_SETTER_SCOPES"); this.#phase = `validator:${field}`; const validator = await this.#scope(setterScopes, ["e"]); need(validator.get("e")?.kind === "undefined", "DECORATOR_VALIDATOR");
        if (field === "underline") { const decoratorAccessor = functions[3], decoratorSetter = functions[0], getter = functions[1], setter = functions[2]; need(decoratorSetter !== undefined && getter !== undefined && setter !== undefined && decoratorAccessor !== undefined && underline === null, "ORIGINAL_UNDERLINE_FUNCTIONS"); underline = Object.freeze({ getObjectId: callees["underline.get"].objectId, setObjectId: callees["underline.set"].objectId, rawDescriptorObjectId: raw.objectId, rawGetObjectId: getter.objectId, rawSetObjectId: setter.objectId, decoratorObjectId: decorator.objectId, decoratorSetterObjectId: decoratorSetter.objectId, decoratorAccessorObjectId: decoratorAccessor.objectId }); }
      }
      const record = scopes.get("monitorRecord"); need(record !== undefined, "MONITOR_FUNCTIONS");
      this.#phase = "monitor:record-ast"; const ast = await this.#recordAst(record); await this.#metadata(ast, "monitorAst");
      this.#phase = "same-callees"; trueReply.parse(await this.#send({ phase: "schematic-accessor-same", method: "Runtime.callFunctionOn", params: { ...FLAGS, objectId: this.#callees, functionDeclaration: CALLS.same,
        arguments: [{ objectId: this.#bindings.holderObjectId }, ...this.#arguments()], returnByValue: true } }));
      this.#packet = freezeDeep({ schema: "private.current-schematic-relevance-display-accessor-observation.v2", sourceSha256: SOURCES[this.#source].sha256, fields: 10, originalHolderCalleesObserved: true,
        exactRawAndDecoratedSettersObserved: true, watchedMonitorAndAstFunctionMetadataObserved: true, originalMonitorReceiversQualified: false, activeActionHistoryCallbackQualified: false, completeActionFrontierQualified: false, executionAuthorized: false, selectedSqlAuthorized: false, persistenceVerified: false });
      need(underline !== null, "ORIGINAL_UNDERLINE_FUNCTIONS_REQUIRED");
      this.#functions = Object.freeze({ underline, setAttributeObjectId: callees.monitorSetAttribute.objectId, recordObjectId: callees.monitorRecord.objectId, astObjectId: ast.objectId, normalRequests: this.#normal });
      packets.set(this.#packet, this); this.#phase = "observed"; return this.#packet;
    } catch (error) { this.#failure(); throw error; } finally { this.#busy = false; }
  }
  public async release(): Promise<void> { need(!this.#busy && this.#packet !== null && !this.#released, "RELEASE_CONSUMED"); this.#busy = true;
    try { empty.parse(await this.#send({ phase: "schematic-accessor-release", method: "Runtime.releaseObjectGroup", params: { objectGroup: GROUP } }, true)); this.#released = true; } catch (error) { this.#failure(); throw error; } finally { this.#busy = false; } }
  public async retireAfterOriginalExit(): Promise<void> { need(!this.#busy && !this.#retired, "RETIRE_PENDING"); await this.#bindings.assertOriginalGenerationExited(); this.#retired = true; }
  public retained(): Readonly<{ phase: string; normalRequests: number; cleanupRequests: number; failed: boolean; busy: boolean; released: boolean; retired: boolean; executionAuthorized: false }> {
    return Object.freeze({ phase: this.#phase, normalRequests: this.#normal, cleanupRequests: this.#cleanup, failed: this.#failed, busy: this.#busy, released: this.#released, retired: this.#retired, executionAuthorized: false });
  }
  public requireData(packet: unknown, owner: CurrentSchematicRelevanceDisplayWriteOwner, argumentsValue: GeneratedSchematicRelevanceDisplayNativeArguments): void { need(packet !== null && typeof packet === "object" && packets.get(packet) === this && packet === this.#packet && owner === this.#owner && argumentsValue === this.#argumentsValue && !this.#failed && !this.#released && !this.#retired, "ORIGINAL_PACKET_DATA"); }
  public requireFunctions(packet: unknown, origin: CurrentSchematicRelevanceDisplayAccessorOrigin, owner: CurrentSchematicRelevanceDisplayWriteOwner, args: GeneratedSchematicRelevanceDisplayNativeArguments): CurrentSchematicRelevanceDisplayAccessorFunctions {
    this.requireData(packet, owner, args); need(origin === this.#origin && this.#phase === "observed" && this.#functions !== null && !this.#busy, "ORIGINAL_METADATA_FUNCTIONS"); return this.#functions;
  }

}
