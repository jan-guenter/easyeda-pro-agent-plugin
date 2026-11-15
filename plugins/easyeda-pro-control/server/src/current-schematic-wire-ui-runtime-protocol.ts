/** Closed actual provider frame/call/control vocabulary and source bounds. */
import {z}from"zod";
import {captureCurrentPcbStringClockReply as capture}from"./current-pcb-string-clock-reply.ts";
import {freezeDeep}from"./sqlite-inventory-core.ts";
import {CURRENT_SCHEMATIC_WIRE_SERVICE_INVOCATION_FLAGS as FLAGS}from"./current-schematic-wire-service-invocation-protocol.ts";
import {CURRENT_SCHEMATIC_WIRE_UI_RUNTIME_ALIASES as ALIASES,CURRENT_SCHEMATIC_WIRE_UI_RUNTIME_CALLS as CALLS,CURRENT_SCHEMATIC_WIRE_UI_RUNTIME_FRAMES as FRAMES,CURRENT_SCHEMATIC_WIRE_UI_RUNTIME_RETAIN as RETAIN}from"./current-schematic-wire-ui-runtime-programs.ts";
import {CURRENT_SCHEMATIC_WIRE_UI_RUNTIME_KINDS as KINDS,CURRENT_SCHEMATIC_WIRE_UI_RUNTIME_POINTS as POINTS}from"./current-schematic-wire-ui-runtime-source.ts";
// Twelve callee/caller pairs: sixty reads. Trim: three. Three retained object
// Cells: six. The post-resume cell comparison: four. Seventeen generated calls.
export const CURRENT_SCHEMATIC_WIRE_UI_RUNTIME_REQUESTS=Object.freeze({ordinary:73,sources:17,normal:116,cleanup:13,pauseCount:13,pointCount:13}as const);
const handle=z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u),reference=z.strictObject({objectId:handle});
const flags={objectGroup:z.literal(FLAGS.objectGroup),silent:z.literal(true),generatePreview:z.literal(false),throwOnSideEffect:z.literal(true)};
const rows=[...CALLS,{role:"retain",program:RETAIN,refs:0,byValue:false}as const,{role:"aliases",program:ALIASES,refs:10,byValue:true}as const];
const calls=rows.map(row=>z.strictObject({phase:z.literal("wire-ui-runtime-call"),role:z.literal(row.role),method:z.literal("Runtime.callFunctionOn"),params:z.strictObject({...flags,objectId:handle,functionDeclaration:z.literal(row.program),arguments:z.array(reference).length(row.refs),returnByValue:z.literal(row.byValue),awaitPromise:z.literal(false),userGesture:z.literal(false)})}));
const frames=Object.entries(FRAMES).map(([role,expression])=>z.strictObject({phase:z.literal("wire-ui-runtime-frame"),role:z.literal(role),method:z.literal("Debugger.evaluateOnCallFrame"),params:z.strictObject({...flags,callFrameId:handle,expression:z.literal(expression),returnByValue:z.literal(false),includeCommandLineAPI:z.literal(false)})}));
const arms=KINDS.map(point=>{const row=POINTS[point];const location=z.strictObject({scriptId:handle,lineNumber:z.literal(row.point.lineNumber),columnNumber:z.literal(row.point.columnNumber)});return z.strictObject({phase:z.literal("wire-ui-runtime-arm"),point:z.literal(point),method:z.literal("Debugger.setBreakpoint"),params:z.strictObject({location})});});
const properties=z.strictObject({phase:z.literal("wire-ui-runtime-properties"),method:z.literal("Runtime.getProperties"),params:z.strictObject({objectId:handle,ownProperties:z.literal(true),accessorPropertiesOnly:z.literal(false),generatePreview:z.literal(false)})});
const source=z.strictObject({phase:z.literal("wire-ui-runtime-source"),method:z.literal("Debugger.getScriptSource"),params:z.strictObject({scriptId:handle})});
const resume=z.strictObject({phase:z.literal("wire-ui-runtime-resume"),method:z.literal("Debugger.resume"),params:z.strictObject({})});
const remove=z.strictObject({phase:z.literal("wire-ui-runtime-remove"),method:z.literal("Debugger.removeBreakpoint"),params:z.strictObject({breakpointId:handle})});
const schema=z.union([...calls,...frames,...arms,properties,source,resume,remove]);
export type CurrentSchematicWireUiRuntimeCommand=z.infer<typeof schema>;
export function validateCurrentSchematicWireUiRuntimeCommand(input:unknown):CurrentSchematicWireUiRuntimeCommand{return freezeDeep(schema.parse(capture(input).value));}
