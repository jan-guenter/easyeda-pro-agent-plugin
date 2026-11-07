/** Readonly reproof of retained original serial Promises. No resume exists. */
import { z } from "zod";
import { canonicalJson } from "./core.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { CURRENT_PROJECT_SAVE_STRUCTURE_CALL_FLAGS as FLAGS, currentProjectSaveStructureNativeCases, validateCurrentProjectSaveStructureCommand } from "./current-project-save-structure-protocol.ts";
import type { CurrentProjectSaveStructureCommand } from "./current-project-save-structure-protocol.ts";
import { currentPcbViaWorkerWire } from "./current-pcb-via-worker-wire.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

const observation=z.strictObject({schema:z.literal("private.current-footprint-inverse-startup-queue-observation.v1"),calls:z.number().int().min(1).max(512),finalizers:z.number().int().min(1).max(512),fulfilledPromiseReferences:z.number().int().min(1).max(1024),originalSerialSlotsNull:z.literal(true),completeProducerFrontierVerified:z.literal(false)});
export type CurrentFootprintInverseStartupQueueObservation=Readonly<z.infer<typeof observation>>;
export function qualifyCurrentFootprintInverseStartupQueueObservation(input:unknown):CurrentFootprintInverseStartupQueueObservation{const value=observation.parse(captureCurrentPcbStringClockReply(input).value);if(value.calls!==value.finalizers||value.fulfilledPromiseReferences<value.calls||value.fulfilledPromiseReferences>2*value.calls){throw new Error("FOOTPRINT_INVERSE_STARTUP_QUEUE_OBSERVATION");}return freezeDeep(value);}
export const CURRENT_FOOTPRINT_INVERSE_STARTUP_QUEUE_CALL=String.raw`function(project,wrapper,callback){"use strict";const bad=()=>{throw new Error("FOOTPRINT_INVERSE_STARTUP_QUEUE");},seen=[];const own=(o,k)=>{if(o===null||(typeof o!=="object"&&typeof o!=="function"))bad();const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,"value"))bad();seen.push([o,k,d]);return d.value;};if(own(globalThis,"PROJECT")!==project||own(project,"uploadStructure")!==wrapper||typeof wrapper!=="function"||typeof callback!=="function")bad();const scope=own(this,"object");if(own(scope,"e")!==callback||own(scope,"t")!==null||own(scope,"s")!==null)bad();for(const[o,k,d]of seen){const next=Object.getOwnPropertyDescriptor(o,k);if(!next||!Object.hasOwn(next,"value")||!Object.is(next.value,d.value)||next.writable!==d.writable||next.configurable!==d.configurable||next.enumerable!==d.enumerable)bad();}return true;}`;
const handle=z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u),ref=z.strictObject({objectId:handle});
const empty=z.strictObject({phase:z.literal("inverse-startup-queue-empty"),method:z.literal("Runtime.callFunctionOn"),params:z.strictObject({objectGroup:z.literal(FLAGS.objectGroup),silent:z.literal(true),generatePreview:z.literal(false),throwOnSideEffect:z.literal(true),awaitPromise:z.literal(false),userGesture:z.literal(false),objectId:handle,functionDeclaration:z.literal(CURRENT_FOOTPRINT_INVERSE_STARTUP_QUEUE_CALL),arguments:z.tuple([ref,ref,ref]),returnByValue:z.literal(true)})});
const helper = z.strictObject({ phase: z.literal("inverse-startup-queue-helper"), method: z.literal("Debugger.getScriptSource"), params: z.strictObject({ scriptId: z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u) }) });
export type CurrentFootprintInverseStartupQueueCommand = CurrentProjectSaveStructureCommand | z.infer<typeof helper> | z.infer<typeof empty>;
export function currentFootprintInverseStartupQueueBudget(records: number): Readonly<{ normal: number; helpers: 1; cdpRequests: number; controls: number }> {
  if (!Number.isSafeInteger(records) || records < 1 || records > 512) { throw new Error("FOOTPRINT_INVERSE_STARTUP_QUEUE_BOUND"); }
  // Each original finalizer array and at most two original Promise objects,
  // Two fresh closure reads, one serial projection and its Array2 properties.
  return Object.freeze({ normal: 3 * records + 3, helpers: 1, cdpRequests: 3 * records + 4, controls: 3 * records + 5 });
}
export const CURRENT_FOOTPRINT_INVERSE_STARTUP_QUEUE_REQUESTS = currentFootprintInverseStartupQueueBudget(512);
export function validateCurrentFootprintInverseStartupQueueCommand(input: unknown): CurrentFootprintInverseStartupQueueCommand {
  const value = captureCurrentPcbStringClockReply(input).value; const parsed = z.union([helper,empty]).safeParse(value); if (parsed.success) { return freezeDeep(parsed.data); }
  const command = validateCurrentProjectSaveStructureCommand(value);
  if (command.phase !== "project-save-structure-properties") { throw new Error("FOOTPRINT_INVERSE_STARTUP_QUEUE_READONLY"); } return command;
}
export function currentFootprintInverseStartupQueueCases(): readonly CurrentFootprintInverseStartupQueueCommand[] {
  return freezeDeep([...currentProjectSaveStructureNativeCases().filter(command => command.phase === "project-save-structure-properties"),{phase:"inverse-startup-queue-empty",method:"Runtime.callFunctionOn",params:{...FLAGS,objectId:"original_scope",functionDeclaration:CURRENT_FOOTPRINT_INVERSE_STARTUP_QUEUE_CALL,arguments:[{objectId:"original_project"},{objectId:"original_wrapper"},{objectId:"original_callback"}],returnByValue:true}}, { phase: "inverse-startup-queue-helper", method: "Debugger.getScriptSource", params: { scriptId: "original_helper" } }].map(command => validateCurrentFootprintInverseStartupQueueCommand(command)));
}
export function currentFootprintInverseStartupQueueWire(input: CurrentFootprintInverseStartupQueueCommand, id: number, sessionId: string): CurrentFootprintInverseStartupQueueCommand & Readonly<{ id: number; sessionId: string; inverseStartupQueue: true }> {
  if (!Number.isSafeInteger(id) || id < 1 || !/^[A-Za-z\d_.:-]{1,256}$/u.test(sessionId)) { throw new Error("FOOTPRINT_INVERSE_STARTUP_QUEUE_ENVELOPE"); }
  return freezeDeep({ ...validateCurrentFootprintInverseStartupQueueCommand(input), id, sessionId, inverseStartupQueue: true });
}
export function currentFootprintInverseStartupQueueNativeFrame(chunk: Buffer, input: CurrentFootprintInverseStartupQueueCommand, sessionId: string): Readonly<Record<string, string | number>> {
  if (chunk.length > 65_536 || chunk.at(-1) !== 0) { throw new Error("FOOTPRINT_INVERSE_STARTUP_QUEUE_FRAME"); }
  const command = validateCurrentFootprintInverseStartupQueueCommand(input), raw: unknown = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(chunk.subarray(0, -1)));
  const value = z.looseObject({ id: z.number().int().positive() }).parse(captureCurrentPcbStringClockReply(raw).value); const expected = currentFootprintInverseStartupQueueWire(command, value.id, sessionId);
  if (canonicalJson(value) !== canonicalJson(expected) || chunk.toString("utf8") !== `${JSON.stringify(expected)}\0`) { throw new Error("FOOTPRINT_INVERSE_STARTUP_QUEUE_FRAME"); }
  if (command.phase === "inverse-startup-queue-helper") { return freezeDeep({ action: "footprint-inverse-startup-queue", requestId: value.id, phase: command.phase, method: command.method, scriptId: command.params.scriptId }); }
  if(command.phase==="inverse-startup-queue-empty"){return freezeDeep({action:"footprint-inverse-startup-queue",requestId:value.id,phase:command.phase,method:command.method,objectId:command.params.objectId,argument0:command.params.arguments[0].objectId,argument1:command.params.arguments[1].objectId,argument2:command.params.arguments[2].objectId});}
  return freezeDeep({ ...currentPcbViaWorkerWire(command, value.id).request, action: "footprint-inverse-startup-queue" });
}
