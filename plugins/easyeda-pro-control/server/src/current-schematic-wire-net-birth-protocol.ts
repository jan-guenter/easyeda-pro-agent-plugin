/** Fixed reads while the selected page's original before-watch frame is held. */
import { z } from "zod";
import { captureCurrentPcbStringClockReply as capture } from "./current-pcb-string-clock-reply.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const CURRENT_SCHEMATIC_WIRE_NET_BIRTH_REQUESTS = Object.freeze({ frame: 2, properties: 1, helper: 1, helperSource: 1, total: 5 });
export const CURRENT_SCHEMATIC_WIRE_NET_BIRTH_FLAGS = Object.freeze({
  objectGroup: "easyeda-pro-control-wire-net-birth-v1", silent: true, generatePreview: false, throwOnSideEffect: true,
} as const);
export const CURRENT_SCHEMATIC_WIRE_NET_BIRTH_HELPER = String.raw`function(native,caller,projectUuid,pageUuid){
"use strict";
const get=native[0],proto=native[2],has=native[4],keys=native[5];
const bad=()=>{throw "WIRE_NET_BIRTH_ROOTS";};
const own=(o,k)=>{const d=get(o,k);if(!d||!has(d,"value"))bad();return d.value;};
const dense=(o,n)=>{if(!native[7](o)||proto(o)!==native[16]||own(o,"length")!==n||keys(o).length!==n+1)bad();for(let i=0;i<n;i++)own(o,i);};
dense(this,1);dense(caller,1);
const page=own(this,0);
if(page!==own(caller,0)||own(page,"uuid")!==pageUuid||own(page,"project_uuid")!==projectUuid)bad();
const shapes=own(page,"shapeManager"),net=own(shapes,"netPointManager"),bbox=own(shapes,"bboxMonitor");
if(own(shapes,"docManager")!==page||own(net,"shapeManager")!==shapes||own(bbox,"shapeManager")!==shapes)bad();
const dispatcher=own(bbox,"_onUpdate");
if(own(dispatcher,"_size")!==0)bad();
dense(own(dispatcher,"_listenerSubscriptions"),0);
return [page,shapes,net,bbox,dispatcher];
}`;
export const currentSchematicWireNetBirthHandle = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
export const currentSchematicWireNetBirthProject = z.string().regex(/^[a-f\d]{64}$/u);
export const currentSchematicWireNetBirthPage = z.string().regex(/^[a-f\d]{32}$/u);
const handle = currentSchematicWireNetBirthHandle;
const flags = {
  objectGroup: z.literal(CURRENT_SCHEMATIC_WIRE_NET_BIRTH_FLAGS.objectGroup), silent: z.literal(true), generatePreview: z.literal(false), throwOnSideEffect: z.literal(true),
};
const properties = z.strictObject({ objectId: handle, ownProperties: z.literal(true), accessorPropertiesOnly: z.literal(false), generatePreview: z.literal(false) });
const reference = z.strictObject({ objectId: handle });
const args = z.tuple([
  reference, reference, z.strictObject({ value: currentSchematicWireNetBirthProject }), z.strictObject({ value: currentSchematicWireNetBirthPage }),
]);
const helperParams = z.strictObject({
  ...flags, objectId: handle, arguments: args, functionDeclaration: z.literal(CURRENT_SCHEMATIC_WIRE_NET_BIRTH_HELPER),
  returnByValue: z.literal(false), awaitPromise: z.literal(false), userGesture: z.literal(false),
});
const frameParams = z.strictObject({ ...flags, callFrameId: handle, expression: z.literal("[this]"), returnByValue: z.literal(false), includeCommandLineAPI: z.literal(false) });
const schema = z.discriminatedUnion("phase", [
  z.strictObject({ phase: z.literal("wire-net-birth-frame"), role: z.enum(["page", "caller"]), method: z.literal("Debugger.evaluateOnCallFrame"), params: frameParams }),
  z.strictObject({ phase: z.literal("wire-net-birth-helper"), method: z.literal("Runtime.callFunctionOn"), params: helperParams }),
  z.strictObject({ phase: z.literal("wire-net-birth-helper-source"), method: z.literal("Debugger.getScriptSource"), params: z.strictObject({ scriptId: handle }) }),
  z.strictObject({ phase: z.literal("wire-net-birth-properties"), method: z.literal("Runtime.getProperties"), params: properties }),
]);
export type CurrentSchematicWireNetBirthCommand = z.infer<typeof schema>;
export function validateCurrentSchematicWireNetBirthCommand(input: unknown): CurrentSchematicWireNetBirthCommand {
  return freezeDeep(schema.parse(capture(input).value));
}
