/** Original invocation collector. Its actual run pause never resumes here. */
import { z } from "zod";
import { requireOriginalCurrentSchematicRelevanceDisplayModifyEntryOrigin } from "./current-schematic-relevance-display-write-owner.ts";
import type { CurrentSchematicRelevanceDisplayWriteOwner } from "./current-schematic-relevance-display-write-owner.ts";
import type { GeneratedSchematicRelevanceDisplayNativeArguments } from "./generated-schematic-relevance-display-source.ts";
import type { CurrentSchematicRelevanceDisplayModifyEntryBindings, CurrentSchematicRelevanceDisplayModifyEntryOrigin } from "./current-schematic-relevance-display-modify-entry-origin.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_DISPLAY_MODIFY_ENTRY_EXPRESSION as EXPRESSION, CURRENT_SCHEMATIC_RELEVANCE_DISPLAY_MODIFY_ENTRY_FLAGS as FLAGS,
  CURRENT_SCHEMATIC_RELEVANCE_DISPLAY_MODIFY_ENTRY_PROOF as PROOF, CURRENT_SCHEMATIC_RELEVANCE_DISPLAY_MODIFY_ENTRY_REQUESTS as REQUESTS, validateCurrentSchematicRelevanceDisplayModifyEntryCommand } from "./current-schematic-relevance-display-modify-entry-protocol.ts";
import type { CurrentSchematicRelevanceDisplayModifyEntryCommand } from "./current-schematic-relevance-display-modify-entry-protocol.ts";
import { decodeCurrentSchematicRelevanceDisplayModifyEntryCallback, decodeCurrentSchematicRelevanceDisplayModifyEntryTuple, requireCurrentSchematicRelevanceDisplayModifyCallbackSource } from "./current-schematic-relevance-display-modify-entry-replies.ts";
import { decodeCurrentFootprintCopyClockRpcV2ArrayCapture } from "./current-footprint-copy-clock-rpc-v2-protocol.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";

export interface CurrentSchematicRelevanceDisplayModifyEntryObservation {
  readonly profile: "private.current-schematic-relevance-display-modify-entry-observation.v1";
  readonly originalRunEntryHeld: true; readonly originalGeneratedCallbackObserved: true; readonly originalReceiverReproved: true;
  readonly actionStarted: false; readonly firstSetterEntered: false; readonly continuationAuthorized: false; readonly modifyAcknowledged: false; readonly saveAuthorized: false;
}
const packets = new WeakMap<CurrentSchematicRelevanceDisplayModifyEntryObservation, CurrentSchematicRelevanceDisplayModifyEntryObserver>();
export interface CurrentSchematicRelevanceDisplayRawSceneObservation {
  readonly profile: "private.current-schematic-relevance-display-raw-scene-observation.v1";
  readonly originalRunStillHeld: true; readonly originalReferenceSlots: number; readonly nativeFunctions: 15; readonly prototypeDepth: 12;
  readonly allOwnDescriptorsRetained: true; readonly prototypeDescriptorsRetained: true; readonly nativeCollectionsRetained: true;
  readonly applicationGetterInvoked: false; readonly encoderInvoked: false; readonly continuationAuthorized: false; readonly persistenceVerified: false;
}
const rawPackets = new WeakMap<CurrentSchematicRelevanceDisplayRawSceneObservation, CurrentSchematicRelevanceDisplayModifyEntryObserver>();
export class CurrentSchematicRelevanceDisplayModifyEntryObserver {
  readonly #origin: CurrentSchematicRelevanceDisplayModifyEntryOrigin; readonly #owner: CurrentSchematicRelevanceDisplayWriteOwner; readonly #arguments: GeneratedSchematicRelevanceDisplayNativeArguments; readonly #bindings: CurrentSchematicRelevanceDisplayModifyEntryBindings;
  #attempted = false; #failed = false; #packet: CurrentSchematicRelevanceDisplayModifyEntryObservation | null = null;
  #rawAttempted = false; #rawPacket: CurrentSchematicRelevanceDisplayRawSceneObservation | null = null;
  public constructor(origin: CurrentSchematicRelevanceDisplayModifyEntryOrigin, owner: CurrentSchematicRelevanceDisplayWriteOwner, argumentsValue: GeneratedSchematicRelevanceDisplayNativeArguments) {
    this.#origin = origin; this.#owner = owner; this.#arguments = argumentsValue; this.#bindings = requireOriginalCurrentSchematicRelevanceDisplayModifyEntryOrigin(origin, owner, argumentsValue); Object.freeze(this);
  }
  async #current(): Promise<void> { if (this.#failed || requireOriginalCurrentSchematicRelevanceDisplayModifyEntryOrigin(this.#origin, this.#owner, this.#arguments) !== this.#bindings) { throw new Error("SCHEMATIC_MODIFY_ENTRY_ORIGINAL"); } await this.#bindings.assertCurrent(); if (this.#failed || requireOriginalCurrentSchematicRelevanceDisplayModifyEntryOrigin(this.#origin, this.#owner, this.#arguments) !== this.#bindings) { throw new Error("SCHEMATIC_MODIFY_ENTRY_CHANGED"); } }
  async #send(input: CurrentSchematicRelevanceDisplayModifyEntryCommand): Promise<unknown> { await this.#current(); const raw = await this.#bindings.request(validateCurrentSchematicRelevanceDisplayModifyEntryCommand(input)); await this.#current(); return raw; }
  #properties(objectId: string): Promise<unknown> { return this.#send({ phase: "schematic-modify-entry-properties", method: "Runtime.getProperties", params: { objectId, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } }); }
  public async observe(): Promise<CurrentSchematicRelevanceDisplayModifyEntryObservation> {
    if (this.#attempted) { throw new Error("SCHEMATIC_MODIFY_ENTRY_CONSUMED"); } this.#attempted = true;
    try {
      const { callFrameId } = await this.#bindings.waitOriginalRunEntry(); await this.#current();
      const tuple = decodeCurrentFootprintCopyClockRpcV2ArrayCapture(await this.#send({ phase: "schematic-modify-entry-frame", method: "Debugger.evaluateOnCallFrame", params: { ...FLAGS, callFrameId, expression: EXPRESSION, returnByValue: false, includeCommandLineAPI: false } }), 3);
      const callback = decodeCurrentSchematicRelevanceDisplayModifyEntryTuple(await this.#properties(tuple)), scriptId = decodeCurrentSchematicRelevanceDisplayModifyEntryCallback(await this.#properties(callback));
      requireCurrentSchematicRelevanceDisplayModifyCallbackSource(await this.#send({ phase: "schematic-modify-entry-source", method: "Debugger.getScriptSource", params: { scriptId } }));
      const result = await this.#send({ phase: "schematic-modify-entry-proof", method: "Runtime.callFunctionOn", params: { ...FLAGS, objectId: tuple, functionDeclaration: PROOF,
        arguments: [{ objectId: this.#bindings.holderObjectId }, { value: this.#bindings.targetJson }, { value: this.#bindings.operationJson }, { objectId: this.#bindings.idleActionObjectId }, { objectId: callback }], returnByValue: true, awaitPromise: false, userGesture: false } });
      z.strictObject({ result: z.strictObject({ type: z.literal("boolean"), value: z.literal(true) }) }).parse(captureCurrentPcbStringClockReply(result).value);
      const packet: CurrentSchematicRelevanceDisplayModifyEntryObservation = Object.freeze({ profile: "private.current-schematic-relevance-display-modify-entry-observation.v1", originalRunEntryHeld: true, originalGeneratedCallbackObserved: true, originalReceiverReproved: true, actionStarted: false, firstSetterEntered: false, continuationAuthorized: false, modifyAcknowledged: false, saveAuthorized: false });
      this.#packet = packet; packets.set(packet, this); return packet;
    } catch (error) { this.#failed = true; this.#bindings.fail(); throw error; }
  }
  public requireData(packet: CurrentSchematicRelevanceDisplayModifyEntryObservation, owner: CurrentSchematicRelevanceDisplayWriteOwner, argumentsValue: GeneratedSchematicRelevanceDisplayNativeArguments): void {
    if (packets.get(packet) !== this || this.#packet !== packet || this.#failed || owner !== this.#owner || argumentsValue !== this.#arguments) { throw new Error("SCHEMATIC_MODIFY_ENTRY_ORIGINAL_PACKET"); }
    requireOriginalCurrentSchematicRelevanceDisplayModifyEntryOrigin(this.#origin, owner, argumentsValue);
  }
  /** The owner supplies every next command from its original private cursor.
   * The complete baseline is retained before any vendor prefix may proceed. */
  public async observeRawScene(): Promise<CurrentSchematicRelevanceDisplayRawSceneObservation> {
    if (this.#rawAttempted || this.#packet === null) { throw new Error("SCHEMATIC_RAW_ORIGINAL_ENTRY_REQUIRED"); } this.#rawAttempted = true;
    try {
      for (let count = 0; count < REQUESTS.rawObservation; count += 1) {
        await this.#current(); const command = this.#bindings.nextRawCommand(); if (command === null) { throw new Error("SCHEMATIC_RAW_PREMATURE_COMPLETION"); }
        await this.#bindings.request(command); await this.#current();
      }
      if (this.#bindings.nextRawCommand() !== null) { throw new Error("SCHEMATIC_RAW_REQUEST_BOUND"); } const original = this.#bindings.requireRawCapture();
      const packet: CurrentSchematicRelevanceDisplayRawSceneObservation = Object.freeze({ profile: "private.current-schematic-relevance-display-raw-scene-observation.v1", originalRunStillHeld: true,
        originalReferenceSlots: original.originalReferenceSlots, nativeFunctions: 15, prototypeDepth: 12, allOwnDescriptorsRetained: true, prototypeDescriptorsRetained: true, nativeCollectionsRetained: true,
        applicationGetterInvoked: false, encoderInvoked: false, continuationAuthorized: false, persistenceVerified: false });
      this.#rawPacket = packet; rawPackets.set(packet, this); return packet;
    } catch (error) { this.#failed = true; this.#bindings.fail(); throw error; }
  }
  public requireRawData(packet: CurrentSchematicRelevanceDisplayRawSceneObservation, owner: CurrentSchematicRelevanceDisplayWriteOwner, argumentsValue: GeneratedSchematicRelevanceDisplayNativeArguments): void {
    if (rawPackets.get(packet) !== this || this.#rawPacket !== packet || this.#failed || owner !== this.#owner || argumentsValue !== this.#arguments) { throw new Error("SCHEMATIC_RAW_ORIGINAL_PACKET"); }
    requireOriginalCurrentSchematicRelevanceDisplayModifyEntryOrigin(this.#origin, owner, argumentsValue); this.#bindings.requireRawCapture();
  }
}
