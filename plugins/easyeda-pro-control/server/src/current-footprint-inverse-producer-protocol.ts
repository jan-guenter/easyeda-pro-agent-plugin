/** Distinct inverse pre-EP producer enrollment. Shared source templates are
 * inert; no generated origin, observer, resume or upload permission transfers. */
import { CURRENT_FOOTPRINT_INVERSE_NO_PUBLICATION_ORDER, currentFootprintInverseNoPublicationCases, validateCurrentFootprintInverseNoPublicationCommand } from "./current-footprint-inverse-no-publication-programs.ts";
import type { CurrentFootprintInverseNoPublicationCommand } from "./current-footprint-inverse-no-publication-programs.ts";
import { z } from "zod";
import { canonicalJson } from "./core.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { currentProjectSaveProducerGuardCases, validateCurrentProjectSaveProducerGuardCommand } from "./current-project-save-producer-guard-protocol.ts";
import type { CurrentProjectSaveProducerGuardCommand } from "./current-project-save-producer-guard-protocol.ts";
import { currentProjectSaveProducerNativeCases, validateCurrentProjectSaveProducerCommand } from "./current-project-save-producer-protocol.ts";
import type { CurrentProjectSaveProducerCommand } from "./current-project-save-producer-protocol.ts";
import { currentProjectSaveProducerTemplate } from "./current-project-save-producer-wire.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const CURRENT_FOOTPRINT_INVERSE_PRODUCER_ARM_REQUESTS = Object.freeze({ intrinsics: 28, intrinsicHelpers: 3, gateAssociation: 5, gateHelpers: 2, guards: 10, producerArms: 27, normal: 70, helperSources: 5, cdpRequests: 75 });
const handle = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
const helper = z.strictObject({ phase: z.literal("inverse-producer-helper"), method: z.literal("Debugger.getScriptSource"), params: z.strictObject({ scriptId: handle }) });
export type CurrentFootprintInverseProducerArmCommand = Extract<CurrentProjectSaveProducerCommand, Readonly<{ phase: "project-save-producer-arm" | `project-save-producer-intrinsics-${string}` }>> | CurrentProjectSaveProducerGuardCommand | CurrentFootprintInverseNoPublicationCommand | z.infer<typeof helper>;
export function validateCurrentFootprintInverseProducerArmCommand(input: unknown): CurrentFootprintInverseProducerArmCommand {
  const value = captureCurrentPcbStringClockReply(input).value;
  if (value !== null && typeof value === "object" && "phase" in value && value.phase === "inverse-producer-helper") { return freezeDeep(helper.parse(value)); }
  if(value!==null&&typeof value==="object"&&"phase" in value&&typeof value.phase==="string"&&value.phase.startsWith("inverse-producer-gate-")){return validateCurrentFootprintInverseNoPublicationCommand(value);}
  if (value !== null && typeof value === "object" && "phase" in value && value.phase === "project-save-producer-guard") { return validateCurrentProjectSaveProducerGuardCommand(value); }
  const command = validateCurrentProjectSaveProducerCommand(value);
  if(command.phase === "project-save-producer-arm" || command.phase === "project-save-producer-intrinsics-constructors" || command.phase === "project-save-producer-intrinsics-members" || command.phase === "project-save-producer-intrinsics-reprove" || command.phase === "project-save-producer-intrinsics-properties" || command.phase === "project-save-producer-intrinsics-metadata"){return command;}
  throw new Error("FOOTPRINT_INVERSE_PRODUCER_ARM_ONLY");
}
export function currentFootprintInverseProducerArmCases(): readonly CurrentFootprintInverseProducerArmCommand[] {
  return freezeDeep([...currentProjectSaveProducerNativeCases().filter(command => command.phase === "project-save-producer-arm" || command.phase.startsWith("project-save-producer-intrinsics-")), ...currentProjectSaveProducerGuardCases("original_script"), ...currentFootprintInverseNoPublicationCases(), { phase: "inverse-producer-helper", method: "Debugger.getScriptSource", params: { scriptId: "original_helper" } }].map(command => validateCurrentFootprintInverseProducerArmCommand(command)));
}
export function currentFootprintInverseProducerArmOrder(): readonly string[] {
  return Object.freeze(["project-save-producer-intrinsics-constructors", "project-save-producer-intrinsics-properties-constructors", ...[1,2,3].map(index => `project-save-producer-intrinsics-metadata-${String(index)}`), "project-save-producer-intrinsics-members", "project-save-producer-intrinsics-properties-members", ...Array.from({length:20},(_,index)=>`project-save-producer-intrinsics-metadata-${String(index+8)}`), "project-save-producer-intrinsics-reprove", ...CURRENT_FOOTPRINT_INVERSE_NO_PUBLICATION_ORDER, ...currentProjectSaveProducerGuardCases("original_script").map(command=>`${command.phase}-${command.role}`), ...currentProjectSaveProducerNativeCases().filter(command=>command.phase==="project-save-producer-arm").map(command=>`${command.phase}-${command.role}`)]);
}
export function currentFootprintInverseProducerArmWire(input: CurrentFootprintInverseProducerArmCommand, id: number, sessionId: string): CurrentFootprintInverseProducerArmCommand & Readonly<{ id: number; sessionId: string; inverseProducerArm: true }> {
  if (!Number.isSafeInteger(id) || id < 1) { throw new Error("FOOTPRINT_INVERSE_PRODUCER_ID"); } handle.parse(sessionId);
  return freezeDeep({ ...validateCurrentFootprintInverseProducerArmCommand(input), id, sessionId, inverseProducerArm: true });
}
export function currentFootprintInverseProducerArmNativeFrame(chunk: Buffer, input: CurrentFootprintInverseProducerArmCommand, sessionId: string): Readonly<Record<string,string|number>> {
  if(chunk.length>65_536||chunk.at(-1)!==0){throw new Error("FOOTPRINT_INVERSE_PRODUCER_FRAME");}
  const raw:unknown=JSON.parse(new TextDecoder("utf-8",{fatal:true}).decode(chunk.subarray(0,-1))), value=captureCurrentPcbStringClockReply(raw).value;
  if(value===null||typeof value!=="object"||!("id" in value)||typeof value.id!=="number"){throw new Error("FOOTPRINT_INVERSE_PRODUCER_FRAME");}
  const command=validateCurrentFootprintInverseProducerArmCommand(input),expected=currentFootprintInverseProducerArmWire(command,value.id,sessionId);
  if(canonicalJson(expected)!==canonicalJson(value)||chunk.toString("utf8")!==`${JSON.stringify(expected)}\0`){throw new Error("FOOTPRINT_INVERSE_PRODUCER_FRAME");}
  const base={action:"footprint-inverse-producer-arm",requestId:value.id,phase:command.phase,method:command.method};
  if(command.phase==="inverse-producer-helper"){return freezeDeep({...base,scriptId:command.params.scriptId});}
  if(command.phase.startsWith("inverse-producer-gate-")){
    const gate=validateCurrentFootprintInverseNoPublicationCommand(command);return freezeDeep({...base,objectId:gate.params.objectId,...(gate.phase==="inverse-producer-gate-reprove"?{argument0:gate.params.arguments[0].objectId}:{})});
  }
  if(command.phase==="project-save-producer-guard"){return freezeDeep({...base,phase:`${command.phase}-${command.role}`,scriptId:command.params.location.scriptId});}
  const row=currentProjectSaveProducerTemplate(validateCurrentProjectSaveProducerCommand(command));return freezeDeep({...base,phase:row.phase,...row.values});
}
