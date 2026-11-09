/** Original idle runner/recorder and watched monitor callbacks. These actual
 * readonly joins issue no active setter, history completion or writer grant. */
/* oxlint-disable import/max-dependencies -- The distinct original issuer, shared inert source decoders and fixed Wire grammar remain independent. */
import { z } from "zod";
import { requireOriginalCurrentSchematicWireIntentOrigin } from "./current-pcb-diagnostic-owner.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import type { CurrentSchematicWireEditOwner } from "./current-schematic-wire-edit-owner.ts";
import type { GeneratedSchematicWireEditNativeArguments } from "./generated-schematic-wire-edit.ts";
import type { CurrentSchematicWireAccessorContext } from "./current-schematic-wire-accessor-observer.ts";
import { decodeCurrentSchematicWireLexicalArray, decodeCurrentSchematicWireLexicalScopes } from "./current-schematic-wire-lexical-observer.ts";
import type { CurrentSchematicWireLexicalValues } from "./current-schematic-wire-lexical-observer.ts";
import { CURRENT_SCHEMATIC_WIRE_INTENT_CALLS as CALLS, CURRENT_SCHEMATIC_WIRE_INTENT_EXTRA_ARGUMENTS as EXTRA, CURRENT_SCHEMATIC_WIRE_INTENT_FLAGS as FLAGS,
  CURRENT_SCHEMATIC_WIRE_INTENT_REQUESTS as REQUESTS, validateCurrentSchematicWireIntentCommand } from "./current-schematic-wire-intent-protocol.ts";
import type { CurrentSchematicWireIntentCommand, CurrentSchematicWireIntentRole } from "./current-schematic-wire-intent-protocol.ts";
import { GENERATED_SCHEMATIC_DISPLAY_ACTION_SOURCE as ACTION, GENERATED_SCHEMATIC_DISPLAY_ACTION_PREFLIGHT_CALLEES as ROLES } from "./generated-schematic-display-action-source.ts";
import { decodeGeneratedSchematicDisplayActionFunction, decodeGeneratedSchematicDisplayActionPreflightCallees, requireGeneratedSchematicDisplayActionDescription } from "./generated-schematic-display-action-replies.ts";
import { decodeCurrentSchematicRelevanceDisplayActionNoop } from "./current-schematic-relevance-display-action-replies.ts";
import { decodeCurrentSchematicRelevanceModelCalleeFunction, requireCurrentSchematicRelevanceModelCalleeDescription } from "./current-schematic-relevance-model-callee-replies.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_MODEL_CALLEE_SOURCE as MODEL } from "./current-schematic-relevance-model-callee-source.ts";

export interface CurrentSchematicWireIntentOrigin { readonly profile: "private.current-schematic-wire-intent-origin.v1" }
export interface CurrentSchematicWireIntentBindings {
  readonly holderObjectId: string; readonly targetJson: string; readonly operationJson: string;
  readonly context: CurrentSchematicWireAccessorContext; readonly lexical: CurrentSchematicWireLexicalValues;
  readonly request: (command: CurrentSchematicWireIntentCommand, cleanup: boolean) => Promise<unknown>;
  readonly assertCurrent: () => Promise<void>; readonly assertOriginalGenerationExited: () => Promise<void>; readonly fail: () => void;
}
export interface CurrentSchematicWireIntentObservation {
  readonly schema: "private.current-schematic-wire-intent-observation.v1"; readonly sourceSha256: string;
  readonly originalIdleRunnerRecorderJoined: true; readonly originalFrozenDefaultNoopJoined: true;
  readonly originalWatchedMonitorFunctionsJoined: true; readonly originalMonitorLexicalReceiversJoined: true;
  readonly activeFirstSetterObserved: false; readonly originalCallbackCompleted: false; readonly workerCompletionVerified: false;
  readonly executionAuthorized: false; readonly saveAuthorized: false; readonly selectedSqlAuthorized: false; readonly persistenceVerified: false;
}
export interface CurrentSchematicWireIntentValues {
  readonly actionArray: string; readonly monitorArray: string;
  readonly actionFunctions: ReturnType<typeof decodeGeneratedSchematicDisplayActionPreflightCallees>;
  readonly monitorFunctions: readonly Readonly<{ objectId: string; description: string }>[];
}
const issued = new WeakMap<CurrentSchematicWireIntentObservation, CurrentSchematicWireIntentObserver>();
const array = z.strictObject({ result: z.strictObject({ type: z.literal("object"), subtype: z.literal("array"), className: z.literal("Array"), description: z.string(), objectId: z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u) }) });
const truth = z.strictObject({ result: z.strictObject({ type: z.literal("boolean"), value: z.literal(true) }) });
function need(value: boolean, code: string): asserts value { if (!value) { throw new Error(`SCHEMATIC_WIRE_INTENT_${code}`); } }
export class CurrentSchematicWireIntentObserver {
  readonly #origin: CurrentSchematicWireIntentOrigin; readonly #owner: CurrentSchematicWireEditOwner; readonly #args: GeneratedSchematicWireEditNativeArguments; readonly #bindings: CurrentSchematicWireIntentBindings;
  #attempted = false; #busy = false; #failed = false; #retired = false; #released = false; #normal = 0; #cleanup = 0;
  #packet: CurrentSchematicWireIntentObservation | null = null; #values: CurrentSchematicWireIntentValues | null = null;
  public constructor(origin: CurrentSchematicWireIntentOrigin, owner: CurrentSchematicWireEditOwner, args: GeneratedSchematicWireEditNativeArguments) {
    this.#bindings = requireOriginalCurrentSchematicWireIntentOrigin(origin, owner, args); this.#origin = origin; this.#owner = owner; this.#args = args; Object.freeze(this);
  }
  async #current(): Promise<void> {
    need(!this.#failed && !this.#released && !this.#retired && requireOriginalCurrentSchematicWireIntentOrigin(this.#origin, this.#owner, this.#args) === this.#bindings, "ORIGINAL");
    await this.#bindings.assertCurrent(); need(!this.#failed && !this.#released && !this.#retired && requireOriginalCurrentSchematicWireIntentOrigin(this.#origin, this.#owner, this.#args) === this.#bindings, "CHANGED");
  }
  async #send(input: unknown): Promise<unknown> {
    await this.#current(); const command = validateCurrentSchematicWireIntentCommand(input); need(command.phase !== "wire-intent-release" && this.#normal < REQUESTS.normal, "NORMAL_BOUND"); this.#normal += 1;
    const value = captureCurrentPcbStringClockReply(await this.#bindings.request(command, false)).value; await this.#current(); return value;
  }
  #properties(objectId: string): Promise<unknown> { return this.#send({ phase: "wire-intent-properties", method: "Runtime.getProperties", params: { objectId, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } }); }
  #call(role: CurrentSchematicWireIntentRole, objectId: string, refs: readonly string[] = []): Promise<unknown> {
    need(refs.length === EXTRA[role], "ARGUMENT_COUNT"); return this.#send({ phase: "wire-intent-call", role, method: "Runtime.callFunctionOn", params: { ...FLAGS, objectId, functionDeclaration: CALLS[role],
      arguments: [{ objectId: this.#bindings.holderObjectId }, { value: this.#bindings.targetJson }, { value: this.#bindings.operationJson }, ...refs.map(ref => ({ objectId: ref }))], returnByValue: role === "idleSame" || role === "monitorsSame" || role.startsWith("closure") } });
  }
  async #array(role: "idle" | "monitors" | "scope", receiver: string, length: 2 | 6 | 18, refs: readonly string[] = []): Promise<string> {
    const reply = array.parse(await this.#call(role, receiver, refs)); need(reply.result.description === `Array(${String(length)})`, "ARRAY_LENGTH"); return reply.result.objectId;
  }
  async #monitorClosure(scopes: string, index: 0 | 1 | 2): Promise<void> {
    const refs = decodeCurrentSchematicWireLexicalScopes(await this.#properties(scopes), false); let joined = false;
    for (const scope of refs) {
      const values = decodeCurrentSchematicWireLexicalArray(await this.#properties(await this.#array("scope", scope, 2)), 2); const has = values[0], receiver = values[1];
      need(has?.type === "boolean" && typeof has.value === "boolean" && has.objectId === undefined && has.subtype === undefined && receiver !== undefined, "CLOSURE_PRESENCE");
      if (has.value) { need(receiver.type === "object" && receiver.subtype === undefined && receiver.objectId !== undefined && receiver.value === undefined, "LEXICAL_THIS");
        truth.parse(await this.#call((["closure0", "closure1", "closure2"] as const)[index], this.#bindings.holderObjectId, [receiver.objectId])); joined = true; break; }
      need(receiver.type === "undefined" && receiver.objectId === undefined && receiver.value === undefined, "ABSENT_THIS");
    }
    need(joined, "COMPLETE_LEXICAL_RECEIVER");
  }
  public async observe(): Promise<CurrentSchematicWireIntentObservation> {
    await this.#current(); need(!this.#attempted && !this.#busy, "CONSUMED"); this.#attempted = true; this.#busy = true;
    try {
      const { context, lexical, holderObjectId: holder } = this.#bindings; const { variant, scriptId, sourceSha256 } = context;
      need(ACTION[variant].sha256 === sourceSha256 && MODEL[variant].sha256 === sourceSha256, "SOURCE_LINEAGE");
      const actionArray = await this.#array("idle", holder, 18, [lexical.noop.objectId]); const actionFunctions = decodeGeneratedSchematicDisplayActionPreflightCallees(await this.#properties(actionArray));
      for (const role of ROLES) { const fn = actionFunctions[role]; requireGeneratedSchematicDisplayActionDescription(fn.description, variant, role); const properties = await this.#properties(fn.objectId);
        if (role === "noop") { decodeCurrentSchematicRelevanceDisplayActionNoop(properties, variant, scriptId); } else { decodeGeneratedSchematicDisplayActionFunction(properties, variant, role, scriptId); } }
      truth.parse(await this.#call("idleSame", actionArray, [lexical.noop.objectId]));
      const monitorArray = await this.#array("monitors", holder, 6); const cells = decodeCurrentSchematicWireLexicalArray(await this.#properties(monitorArray), 6);
      for (const root of cells.slice(0, 3)) { need(root.type === "object" && root.subtype === undefined && root.objectId !== undefined && root.value === undefined, "MONITOR_ROOT"); }
      const monitorFunctions: Readonly<{ objectId: string; description: string }>[] = [];
      for (const [index, role] of (["modifyAttributeChange", "bboxAttributeChange", "watchAttributeChange"] as const).entries()) {
        need(index === 0 || index === 1 || index === 2, "FIXED_MONITOR_INDEX"); const fn = cells[index + 3];
        need(fn?.type === "function" && fn.subtype === undefined && fn.className === "Function" && fn.objectId !== undefined && fn.value === undefined && typeof fn.description === "string", "MONITOR_FUNCTION");
        requireCurrentSchematicRelevanceModelCalleeDescription(fn.description, variant, role); const metadata = decodeCurrentSchematicRelevanceModelCalleeFunction(await this.#properties(fn.objectId), variant, role, scriptId);
        await this.#monitorClosure(metadata.scopes, index); monitorFunctions.push(Object.freeze({ objectId: fn.objectId, description: fn.description }));
      }
      truth.parse(await this.#call("monitorsSame", monitorArray)); await this.#current();
      this.#values = Object.freeze({ actionArray, monitorArray, actionFunctions, monitorFunctions: Object.freeze(monitorFunctions) });
      const packet: CurrentSchematicWireIntentObservation = Object.freeze({ schema: "private.current-schematic-wire-intent-observation.v1", sourceSha256,
        originalIdleRunnerRecorderJoined: true, originalFrozenDefaultNoopJoined: true, originalWatchedMonitorFunctionsJoined: true, originalMonitorLexicalReceiversJoined: true,
        activeFirstSetterObserved: false, originalCallbackCompleted: false, workerCompletionVerified: false, executionAuthorized: false, saveAuthorized: false, selectedSqlAuthorized: false, persistenceVerified: false });
      this.#packet = packet; issued.set(packet, this); return packet;
    } catch (error) { this.#failed = true; this.#bindings.fail(); throw error; } finally { this.#busy = false; }
  }
  public requireOriginal(packet: CurrentSchematicWireIntentObservation, origin: CurrentSchematicWireIntentOrigin, owner: CurrentSchematicWireEditOwner, args: GeneratedSchematicWireEditNativeArguments): CurrentSchematicWireIntentValues {
    need(issued.get(packet) === this && packet === this.#packet && origin === this.#origin && owner === this.#owner && args === this.#args && this.#values !== null && !this.#failed && !this.#released && !this.#retired && requireOriginalCurrentSchematicWireIntentOrigin(origin, owner, args) === this.#bindings, "ORIGINAL_PACKET"); return this.#values;
  }
  public async retireAfterOriginalExit(): Promise<void> { need(!this.#busy && !this.#retired, "ORIGINAL_CALL_PENDING"); await this.#bindings.assertOriginalGenerationExited(); this.#retired = true; }
  public async release(): Promise<void> {
    await this.#current(); need(!this.#busy && this.#packet !== null && this.#cleanup < REQUESTS.cleanup, "RELEASE_CONSUMED"); this.#busy = true; this.#cleanup += 1;
    try { const command = validateCurrentSchematicWireIntentCommand({ phase: "wire-intent-release", method: "Runtime.releaseObjectGroup", params: { objectGroup: FLAGS.objectGroup } });
      z.strictObject({}).parse(captureCurrentPcbStringClockReply(await this.#bindings.request(command, true)).value); await this.#current(); this.#released = true;
    } catch (error) { this.#failed = true; this.#bindings.fail(); throw error; } finally { this.#busy = false; }
  }
}
export function requireOriginalCurrentSchematicWireIntentObservation(packet: CurrentSchematicWireIntentObservation, origin: CurrentSchematicWireIntentOrigin,
  owner: CurrentSchematicWireEditOwner, args: GeneratedSchematicWireEditNativeArguments): CurrentSchematicWireIntentValues {
  const observer = issued.get(packet); need(observer !== undefined, "ORIGINAL_PACKET"); return observer.requireOriginal(packet, origin, owner, args);
}
