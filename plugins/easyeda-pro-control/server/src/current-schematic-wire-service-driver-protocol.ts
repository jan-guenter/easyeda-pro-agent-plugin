/** Fixed source holds and finite observations for original service delivery. */
import {z}from"zod";
import {captureCurrentPcbStringClockReply as capture}from"./current-pcb-string-clock-reply.ts";
import {freezeDeep}from"./sqlite-inventory-core.ts";
import {CURRENT_SCHEMATIC_WIRE_SERVICE_INVOCATION_KINDS as KINDS,CURRENT_SCHEMATIC_WIRE_SERVICE_INVOCATION_POINTS as POINTS}from"./current-schematic-wire-service-invocation-source.ts";
// Per-role cursor maxima 43 + 43 + 82, 38 generated-source reads,
// Seventeen allocations and twenty-five resumes. One caught/rejected frame
// Contributes at most two reads on a failing prefix, separately reserved.
export const CURRENT_SCHEMATIC_WIRE_SERVICE_DRIVER_REQUESTS=Object.freeze({normal:250,cleanup:18,pauseCount:25,pointCount:17}as const);
const handle=z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
const rows=([0,1]as const).flatMap(variant=>KINDS.map(point=>{const row=POINTS[variant].points[point];const location=z.strictObject({scriptId:handle,lineNumber:z.literal(row.lineNumber),columnNumber:z.literal(row.columnNumber)});return z.strictObject({
 phase:z.literal("wire-service-driver-arm"),point:z.literal(point),variant:z.literal(variant),method:z.literal("Debugger.setBreakpoint"),
 params:z.strictObject({location}),
});}));
const source=z.strictObject({phase:z.literal("wire-service-driver-source"),method:z.literal("Debugger.getScriptSource"),params:z.strictObject({scriptId:handle})});
const resume=z.strictObject({phase:z.literal("wire-service-driver-resume"),method:z.literal("Debugger.resume"),params:z.strictObject({})});
const remove=z.strictObject({phase:z.literal("wire-service-driver-remove"),method:z.literal("Debugger.removeBreakpoint"),params:z.strictObject({breakpointId:handle})});
const schema=z.union([...rows,source,resume,remove]);
export type CurrentSchematicWireServiceDriverControl=z.infer<typeof schema>;
export function validateCurrentSchematicWireServiceDriverControl(input:unknown):CurrentSchematicWireServiceDriverControl{return freezeDeep(schema.parse(capture(input).value));}
