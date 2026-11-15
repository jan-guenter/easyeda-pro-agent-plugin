/** Bounded history/bbox callback metadata and actual entry comparisons.
 * Source equality grants no listener, event, history or Save ownership. */
import { z } from "zod";
import { captureCurrentPcbStringClockReply as capture } from "./current-pcb-string-clock-reply.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

const guard = String.raw`"use strict";const get=native[0],proto=native[2],has=native[4],keys=native[5],isArray=native[7],bad=()=>{throw "SCH209_WIRE_FRONTIER";},own=(o,k)=>{const d=get(o,k);if(!d||!has(d,"value"))bad();return d.value;},dense=(o,n)=>{if(!isArray(o)||proto(o)!==native[16]||own(o,"length")!==n||keys(o).length!==n+1)bad();for(let i=0;i<n;i++)own(o,i);};const selected=(holder,status)=>{dense(holder,2);const b=own(holder,0),state=own(holder,1),before=own(state,"before"),shapes=own(b,"shapes"),line=own(b,"line"),group=own(b,"group"),action=own(own(b,"runner"),"_currentAction");if(own(state,"owner")!==holder||own(state,"failed")!==false||own(state,"modifyAttempted")!==true||own(state,"modifyAcknowledged")!==false||own(state,"saveAttempted")!==false||own(before,"line")!==line||own(before,"wire")!==group||own(line,"shapeManager")!==shapes||own(group,"shapeManager")!==shapes)bad();if(status==="idle"){if(action!==null)bad();}else if(action===null||typeof action!=="object"||own(action,"history")!=="add"||own(action,"status")!==status)bad();return[shapes,own(shapes,"bboxMonitor"),own(shapes,"historyRecorder"),own(shapes,"netPointManager"),own(b,"consistency")];};`;
export const CURRENT_SCHEMATIC_WIRE_FRONTIER_PROGRAMS = Object.freeze({
  historyBusStart: `function(native,holder,roots){${guard}dense(this,1);const s=selected(holder,"running");dense(roots,8);if(own(roots,0)!==s[1]||own(roots,1)!==s[2]||own(roots,2)!==s[3])bad();if(own(this,0)!==s[0])bad();return true;}`,
  historyBusEnd: `function(native,holder,roots){${guard}dense(this,1);const s=selected(holder,"willDidRun");dense(roots,8);if(own(roots,0)!==s[1]||own(roots,1)!==s[2]||own(roots,2)!==s[3])bad();if(own(this,0)!==s[0])bad();return true;}`,
  roots: `function(native){${guard}const s=selected(this,"idle"),bbox=s[1],history=s[2];return[bbox,history,s[3],own(bbox,"_onUpdate"),own(history,"_onBatchSaveStackWillRecord"),own(history,"_onBatchSaveEnd"),own(history,"_onBatchSaveWillEnd"),own(history,"_onBatchSaveStart")];}`,
  netPointUpdate: `function(native,holder,roots){${guard}dense(this,2);const s=selected(holder,"willDidRun");dense(roots,8);if(own(roots,0)!==s[1]||own(roots,1)!==s[2]||own(roots,2)!==s[3])bad();if(own(this,0)!==s[3]||own(own(this,0),"shapeManager")!==s[0]||own(this,1)!==own(s[1],"_modelTypesShouldUpdateBBox"))bad();return true;}`,
  historyStackWillRecord: `function(native,holder,roots){${guard}dense(this,1);const s=selected(holder,"willDidRun");dense(roots,8);if(own(roots,0)!==s[1]||own(roots,1)!==s[2]||own(roots,2)!==s[3])bad();if(own(this,0)!==s[2]||own(own(this,0),"shapeManager")!==s[0])bad();return true;}`,
  historyEnd: `function(native,holder,roots){${guard}dense(this,1);const s=selected(holder,"willDidRun");dense(roots,8);if(own(roots,0)!==s[1]||own(roots,1)!==s[2]||own(roots,2)!==s[3])bad();if(own(this,0)!==s[2]||own(own(this,0),"shapeManager")!==s[0])bad();return true;}`,
  historyWillEnd: `function(native,holder,roots){${guard}dense(this,1);const s=selected(holder,"willDidRun");dense(roots,8);if(own(roots,0)!==s[1]||own(roots,1)!==s[2]||own(roots,2)!==s[3])bad();if(own(this,0)!==s[2]||own(own(this,0),"shapeManager")!==s[0])bad();return true;}`,
  historyStart: `function(native,holder,roots){${guard}dense(this,2);const s=selected(holder,"running");dense(roots,8);if(own(roots,0)!==s[1]||own(roots,1)!==s[2]||own(roots,2)!==s[3])bad();if(own(this,0)!==s[2]||own(own(this,0),"shapeManager")!==s[0]||own(this,1)!==s[0])bad();return true;}`,
} as const);
export const CURRENT_SCHEMATIC_WIRE_FRONTIER_FRAMES = Object.freeze({ netPointUpdate: "[this,r]", historyStackWillRecord: "[this]", historyEnd: "[this]", historyWillEnd: "[this]", historyStart: "[this,t]", historyBusStart: "[e]", historyBusEnd: "[e]" } as const);
export type CurrentSchematicWireFrontierEntryRole = keyof typeof CURRENT_SCHEMATIC_WIRE_FRONTIER_FRAMES;
export const CURRENT_SCHEMATIC_WIRE_FRONTIER_METHODS = Object.freeze({ netPointRefresh: "refreshNetPoint", netPointAnalyze: "analyzeNetPointData", netPointBuild: "buildNetPointsIndexes", historyTransact: "transactionSuccessHandler", historyRecord: "_record" } as const);
export const CURRENT_SCHEMATIC_WIRE_FRONTIER_FLAGS = Object.freeze({ objectGroup: "easyeda-pro-control-schematic-wire-frontier-v1", silent: true, generatePreview: false, throwOnSideEffect: true } as const);
// Metadata: roots2 + object packets8 + two12-level searches + methods5
// +five listener arrays +seven subscription/function pairs =58.
// Entries: two five-read frames and five four-read frames total 30.
// All eight callFunctionOn invocations have their own source obligation.
export const CURRENT_SCHEMATIC_WIRE_FRONTIER_REQUESTS = Object.freeze({ metadataMaximum: 58, prototypeLimit: 12, entryTwo: 5, entryOne: 4, entries: 30, normalMaximum: 88, helperSourcesMaximum: 8, cleanup: 1, totalMaximum: 97 } as const);
const handle = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u), object = z.strictObject({ objectId: handle });
const flags = { objectGroup: z.literal(CURRENT_SCHEMATIC_WIRE_FRONTIER_FLAGS.objectGroup), silent: z.literal(true), generatePreview: z.literal(false), throwOnSideEffect: z.literal(true) };
const calls = Object.entries(CURRENT_SCHEMATIC_WIRE_FRONTIER_PROGRAMS).map(([role, program]) => {
  const params = z.strictObject({ ...flags, objectId: handle, functionDeclaration: z.literal(program), arguments: z.array(object).length(role === "roots" ? 1 : 3), returnByValue: z.literal(role !== "roots"), awaitPromise: z.literal(false), userGesture: z.literal(false) });
  return z.strictObject({ phase: z.literal("wire-frontier-call"), role: z.literal(role), method: z.literal("Runtime.callFunctionOn"), params });
});
const frames = Object.entries(CURRENT_SCHEMATIC_WIRE_FRONTIER_FRAMES).map(([role, expression]) => {
  const params = z.strictObject({ ...flags, callFrameId: handle, expression: z.literal(expression), returnByValue: z.literal(false), includeCommandLineAPI: z.literal(false) });
  return z.strictObject({ phase: z.literal("wire-frontier-frame"), role: z.literal(role), method: z.literal("Debugger.evaluateOnCallFrame"), params });
});
const propertyParams = z.strictObject({ objectId: handle, ownProperties: z.literal(true), accessorPropertiesOnly: z.literal(false), generatePreview: z.literal(false) });
const schema = z.union([...calls, ...frames,
  z.strictObject({ phase: z.literal("wire-frontier-properties"), method: z.literal("Runtime.getProperties"), params: propertyParams }),
  z.strictObject({ phase: z.literal("wire-frontier-release"), method: z.literal("Runtime.releaseObjectGroup"), params: z.strictObject({ objectGroup: flags.objectGroup }) }),
]);
export type CurrentSchematicWireFrontierCommand = z.infer<typeof schema>;
/** Admit exact fixed program/frame rows and ordinary selectors only. */
export function validateCurrentSchematicWireFrontierCommand(input: unknown): CurrentSchematicWireFrontierCommand { return freezeDeep(schema.parse(capture(input).value)); }
/** Enumerate inert rows for own native parity/admission. */
export function currentSchematicWireFrontierCases(): readonly CurrentSchematicWireFrontierCommand[] {
  return freezeDeep([
    ...Object.entries(CURRENT_SCHEMATIC_WIRE_FRONTIER_PROGRAMS).map(([role, program]) => ({ phase: "wire-frontier-call", role, method: "Runtime.callFunctionOn", params: { ...CURRENT_SCHEMATIC_WIRE_FRONTIER_FLAGS, objectId: "original_ref", functionDeclaration: program, arguments: Array.from({ length: role === "roots" ? 1 : 3 }, () => ({ objectId: "original_ref" })), returnByValue: role !== "roots", awaitPromise: false, userGesture: false } })),
    ...Object.entries(CURRENT_SCHEMATIC_WIRE_FRONTIER_FRAMES).map(([role, expression]) => ({ phase: "wire-frontier-frame", role, method: "Debugger.evaluateOnCallFrame", params: { ...CURRENT_SCHEMATIC_WIRE_FRONTIER_FLAGS, callFrameId: "original_frame", expression, returnByValue: false, includeCommandLineAPI: false } })),
    { phase: "wire-frontier-properties", method: "Runtime.getProperties", params: { objectId: "original_ref", ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } },
    { phase: "wire-frontier-release", method: "Runtime.releaseObjectGroup", params: { objectGroup: CURRENT_SCHEMATIC_WIRE_FRONTIER_FLAGS.objectGroup } },
  ].map(row => validateCurrentSchematicWireFrontierCommand(row)));
}
/** Substitute only original handles; keep all callback code and role bytes. */
export function currentSchematicWireFrontierTemplate(input: unknown): Readonly<{ phase: string; method: string; fields: Readonly<Record<string, "handle">>; values: Readonly<Record<string, string>>; template: string }> {
  const command = validateCurrentSchematicWireFrontierCommand(input), fields: Record<string, "handle"> = {}, values: Record<string, string> = {};
  const field = (name: string, value: string): string => { fields[name] = "handle"; values[name] = value; return `__schematic_wirefrontier_${name}__`; };
  const params: Record<string, unknown> = { ...command.params }; let phase: string = command.phase;
  if (command.phase === "wire-frontier-frame") { phase += `-${command.role}`; params["callFrameId"] = field("callFrameId", command.params.callFrameId); }
  else if (command.phase === "wire-frontier-call") { phase += `-${command.role}`; params["objectId"] = field("objectId", command.params.objectId); params["arguments"] = command.params.arguments.map((arg, index) => ({ objectId: field(`arg${String(index)}`, arg.objectId) })); }
  else if (command.phase === "wire-frontier-properties") { params["objectId"] = field("objectId", command.params.objectId); }
  return freezeDeep({ phase, method: command.method, fields, values, template: JSON.stringify({ method: command.method, params }) });
}
