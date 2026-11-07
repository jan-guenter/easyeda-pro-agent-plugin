/** Actual idle action/recorder metadata from the original SCH holder. The
 * active first-setter callback and writer completion remain separately held. */
/* oxlint-disable import/max-dependencies -- The original origin, exact protocol and independent full-source/function decoders remain separate. */
import { z } from "zod";
import { requireOriginalCurrentSchematicDisplayActionOrigin } from "./current-pcb-diagnostic-owner.ts";
import type { CurrentSchematicDisplayWriteOwner } from "./current-schematic-display-write-owner.ts";
import type { GeneratedSchematicDisplayNativeArguments } from "./generated-schematic-display-source.ts";
import type { CurrentSchematicDisplayActionBindings, CurrentSchematicDisplayActionOrigin } from "./current-schematic-display-action-origin.ts";
import { CURRENT_SCHEMATIC_DISPLAY_ACTION_CALLS as CALLS, CURRENT_SCHEMATIC_DISPLAY_ACTION_GROUP as GROUP } from "./current-schematic-display-action-programs.ts";
import { CURRENT_SCHEMATIC_DISPLAY_ACTION_FLAGS as FLAGS, CURRENT_SCHEMATIC_DISPLAY_ACTION_REQUESTS as REQUESTS, validateCurrentSchematicDisplayActionCommand } from "./current-schematic-display-action-protocol.ts";
import { GENERATED_SCHEMATIC_DISPLAY_ACTION_PREFLIGHT_CALLEES as ROLES, GENERATED_SCHEMATIC_DISPLAY_ACTION_SOURCE as SOURCES } from "./generated-schematic-display-action-source.ts";
import { decodeGeneratedSchematicDisplayActionFunction, decodeGeneratedSchematicDisplayActionPreflightCallees, qualifyGeneratedSchematicDisplayActionSource, requireGeneratedSchematicDisplayActionDescription } from "./generated-schematic-display-action-replies.ts";
import { captureCurrentSchematicDisplayAccessorSource, currentSchematicDisplayAccessorFunctionScriptId } from "./current-schematic-display-accessor-replies.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";

const handle = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
const array = z.strictObject({ result: z.strictObject({ type: z.literal("object"), subtype: z.literal("array"), className: z.literal("Array"), description: z.literal("Array(18)"), objectId: handle }) });
const truth = z.strictObject({ result: z.strictObject({ type: z.literal("boolean"), value: z.literal(true) }) });
function need(value: boolean, code: string): asserts value { if (!value) { throw new Error(`SCHEMATIC_ACTION_PREFLIGHT_${code}`); } }
export interface CurrentSchematicDisplayActionObservation {
  readonly schema: "private.current-schematic-display-action-preflight-observation.v1"; readonly sourceSha256: string; readonly originalFunctions: 18;
  readonly originalIdleRunnerRecorderObserved: true; readonly originalUnspentModifyIntentRetained: true;
  readonly activeFirstSetterObserved: false; readonly completeActionFrontierQualified: false; readonly modifyAuthorized: false; readonly saveAuthorized: false; readonly persistenceVerified: false;
}
const packets = new WeakMap<CurrentSchematicDisplayActionObservation, CurrentSchematicDisplayActionObserver>();
export class CurrentSchematicDisplayActionObserver {
  readonly #origin: CurrentSchematicDisplayActionOrigin; readonly #owner: CurrentSchematicDisplayWriteOwner; readonly #arguments: GeneratedSchematicDisplayNativeArguments; readonly #bindings: CurrentSchematicDisplayActionBindings;
  #attempted = false; #busy = false; #failed = false; #released = false; #normal = 0; #cleanup = 0; #packet: CurrentSchematicDisplayActionObservation | null = null;
  public constructor(origin: CurrentSchematicDisplayActionOrigin, owner: CurrentSchematicDisplayWriteOwner, argumentsValue: GeneratedSchematicDisplayNativeArguments) {
    this.#origin = origin; this.#owner = owner; this.#arguments = argumentsValue; this.#bindings = requireOriginalCurrentSchematicDisplayActionOrigin(origin, owner, argumentsValue); Object.freeze(this);
  }
  async #current(): Promise<void> {
    need(!this.#failed && !this.#released && requireOriginalCurrentSchematicDisplayActionOrigin(this.#origin, this.#owner, this.#arguments) === this.#bindings, "ORIGINAL"); await this.#bindings.assertCurrent();
    need(!this.#failed && !this.#released && requireOriginalCurrentSchematicDisplayActionOrigin(this.#origin, this.#owner, this.#arguments) === this.#bindings, "CHANGED");
  }
  async #send(input: unknown, cleanup = false): Promise<unknown> {
    await this.#current(); const command = validateCurrentSchematicDisplayActionCommand(input);
    if (cleanup) { this.#cleanup += 1; need(this.#cleanup <= REQUESTS.cleanup, "CLEANUP_BOUND"); } else { this.#normal += 1; need(this.#normal <= REQUESTS.normal, "NORMAL_BOUND"); }
    const raw = await this.#bindings.request(command, cleanup); const value = command.phase === "schematic-action-source" ? captureCurrentSchematicDisplayAccessorSource(raw) : captureCurrentPcbStringClockReply(raw).value;
    await this.#current(); return value;
  }
  #properties(objectId: string): Promise<unknown> { return this.#send({ phase: "schematic-action-properties", method: "Runtime.getProperties", params: { objectId, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } }); }
  public async observe(): Promise<CurrentSchematicDisplayActionObservation> {
    need(!this.#attempted && !this.#busy, "CONSUMED"); this.#attempted = true; this.#busy = true;
    try {
      const args = [{ value: this.#bindings.targetJson }, { value: this.#bindings.operationJson }];
      const original = array.parse(await this.#send({ phase: "schematic-action-preflight", method: "Runtime.callFunctionOn", params: { ...FLAGS, objectId: this.#bindings.holderObjectId, functionDeclaration: CALLS.preflight, arguments: args, returnByValue: false } })).result.objectId;
      const functions = decodeGeneratedSchematicDisplayActionPreflightCallees(await this.#properties(original)); const first = await this.#properties(functions.runnerConstructor.objectId);
      const scriptId = currentSchematicDisplayAccessorFunctionScriptId(first); const source = qualifyGeneratedSchematicDisplayActionSource(await this.#send({ phase: "schematic-action-source", method: "Debugger.getScriptSource", params: { scriptId } }));
      for (const role of ROLES) { const fn = functions[role]; requireGeneratedSchematicDisplayActionDescription(fn.description, source, role); decodeGeneratedSchematicDisplayActionFunction(role === "runnerConstructor" ? first : await this.#properties(fn.objectId), source, role, scriptId); }
      truth.parse(await this.#send({ phase: "schematic-action-same", method: "Runtime.callFunctionOn", params: { ...FLAGS, objectId: original, functionDeclaration: CALLS.same,
        arguments: [{ objectId: this.#bindings.holderObjectId }, ...args], returnByValue: true } }));
      const packet: CurrentSchematicDisplayActionObservation = Object.freeze({ schema: "private.current-schematic-display-action-preflight-observation.v1", sourceSha256: SOURCES[source].sha256, originalFunctions: 18,
        originalIdleRunnerRecorderObserved: true, originalUnspentModifyIntentRetained: true, activeFirstSetterObserved: false, completeActionFrontierQualified: false, modifyAuthorized: false, saveAuthorized: false, persistenceVerified: false });
      this.#packet = packet; packets.set(packet, this); return packet;
    } catch (error) { this.#failed = true; this.#bindings.fail(); throw error; } finally { this.#busy = false; }
  }
  public requireData(packet: CurrentSchematicDisplayActionObservation, owner: CurrentSchematicDisplayWriteOwner, argumentsValue: GeneratedSchematicDisplayNativeArguments): void {
    need(packets.get(packet) === this && this.#packet === packet && owner === this.#owner && argumentsValue === this.#arguments && !this.#failed && !this.#released, "ORIGINAL_PACKET");
  }
  public async retireAfterOriginalExit(): Promise<void> { need(!this.#busy, "ORIGINAL_CALL_PENDING"); await this.#bindings.assertOriginalGenerationExited(); }
  public async release(): Promise<void> {
    need(!this.#busy && !this.#released && this.#packet !== null, "ORIGINAL_OBSERVATION_REQUIRED"); this.#busy = true;
    try { z.strictObject({}).parse(await this.#send({ phase: "schematic-action-release", method: "Runtime.releaseObjectGroup", params: { objectGroup: GROUP } }, true)); this.#released = true; }
    catch (error) { this.#failed = true; this.#bindings.fail(); throw error; } finally { this.#busy = false; }
  }
}
