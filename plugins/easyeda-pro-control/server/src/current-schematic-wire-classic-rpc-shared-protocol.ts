/** Separate shared-UI-bus branch. The released schematic-bus reader and its identity gates remain unchanged. */
/** Closed three-role classic RPC observations. No resolver, timer or app
 * method can be invoked through these fixed recipes. */
import { z } from "zod";
import { captureCurrentPcbStringClockReply as capture } from "./current-pcb-string-clock-reply.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";
import { CURRENT_SCHEMATIC_WIRE_CLASSIC_RPC_SHARED_FRAMES as FRAMES, CURRENT_SCHEMATIC_WIRE_CLASSIC_RPC_SHARED_PROGRAMS as P } from "./current-schematic-wire-classic-rpc-shared-programs.ts";

export const CURRENT_SCHEMATIC_WIRE_CLASSIC_RPC_SHARED_FLAGS = Object.freeze({
  objectGroup: "easyeda-schematic-wire-shared-ui-rpc-v1", silent: true, generatePreview: false, throwOnSideEffect: true,
} as const);
export const CURRENT_SCHEMATIC_WIRE_CLASSIC_RPC_SHARED_REQUESTS = Object.freeze({
  approvedSlots: 64, entry: 83, request: 4, timer: 9, returned: 10, earlyReply:10, earlyReplyReturned:3,
  reply: 6, replyReturned: 6, settled: 2,
  selector: 3, ordinaryPerRole: 124, generatedSourcesPerRole: 16, roles: 3,
  normal: 3 * (124 + 16), cleanup: 1, total: 3 * (124 + 16) + 1,
} as const);
export const CURRENT_SCHEMATIC_WIRE_CLASSIC_RPC_SHARED_CALLS = freezeDeep({
  earlyQueue:{program:P.earlyQueue,refs:3,byValue:false},
  earlyReply:{program:P.earlyReply,refs:7,byValue:false},earlyReturned:{program:P.earlyReturned,refs:3,byValue:true},
  earlyResult:{program:P.earlyResult,refs:3,byValue:true},returnedEarly:{program:P.returnedEarly,refs:7,byValue:false},
  selectReply: {program:P.selectReply,refs:5,byValue:true},
  approved: { program:P.approved,refs:65,byValue:false }, rootBus: {program:P.rootBus,refs:3,byValue:false},
  parts: {program:P.parts,refs:3,byValue:false},
  entryClosing: {program:P.entryClosing,refs:4,byValue:false},entryLanguage: {program:P.entryLanguage,refs:4,byValue:false},
  entryTitles: {program:P.entryTitles,refs:4,byValue:false},
  request: {program:P.request,refs:3,byValue:false},timer:{program:P.timer,refs:4,byValue:false},
  task:{program:P.task,refs:3,byValue:false},returned:{program:P.returned,refs:9,byValue:false},
  reply:{program:P.reply,refs:4,byValue:false},result:{program:P.result,refs:4,byValue:false},
  settled:{program:P.settled,refs:4,byValue:true},retain:{program:P.retain,refs:0,byValue:false},
} as const);
const FLAGS=CURRENT_SCHEMATIC_WIRE_CLASSIC_RPC_SHARED_FLAGS;
const handle=z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
const object=z.strictObject({objectId:handle});
const flags={objectGroup:z.literal(FLAGS.objectGroup),silent:z.literal(true),generatePreview:z.literal(false),throwOnSideEffect:z.literal(true)};
const calls=Object.entries(CURRENT_SCHEMATIC_WIRE_CLASSIC_RPC_SHARED_CALLS).map(([role,row])=>z.strictObject({
  phase:z.literal("classic-rpc-call"),role:z.literal(role),method:z.literal("Runtime.callFunctionOn"),
  params:z.strictObject({...flags,objectId:handle,functionDeclaration:z.literal(row.program),
    arguments:z.array(object).length(row.refs),returnByValue:z.literal(row.byValue),awaitPromise:z.literal(false),userGesture:z.literal(false)}),
}));
const frames=([2]as const).flatMap(variant=>Object.entries(FRAMES[variant]).map(([role,expression])=>z.strictObject({
  phase:z.literal("classic-rpc-frame"),variant:z.literal(variant),role:z.literal(role),method:z.literal("Debugger.evaluateOnCallFrame"),
  params:z.strictObject({...flags,callFrameId:handle,expression:z.literal(expression),returnByValue:z.literal(false),includeCommandLineAPI:z.literal(false)}),
})));
const fields=z.strictObject({phase:z.literal("classic-rpc-properties"),kind:z.literal("fields"),method:z.literal("Runtime.getProperties"),
 params:z.strictObject({objectId:handle,ownProperties:z.literal(true),accessorPropertiesOnly:z.literal(false),generatePreview:z.literal(false)})});
const large=z.strictObject({phase:z.literal("classic-rpc-properties"),kind:z.literal("large"),method:z.literal("Runtime.getProperties"),
 params:z.strictObject({objectId:handle,ownProperties:z.literal(true),accessorPropertiesOnly:z.literal(false),generatePreview:z.literal(false)})});
const wait=z.strictObject({phase:z.literal("classic-rpc-await"),method:z.literal("Runtime.awaitPromise"),
 params:z.strictObject({promiseObjectId:handle,returnByValue:z.literal(false),generatePreview:z.literal(false)})});
const release=z.strictObject({phase:z.literal("classic-rpc-release"),method:z.literal("Runtime.releaseObjectGroup"),
 params:z.strictObject({objectGroup:z.literal(FLAGS.objectGroup)})});
const schema=z.union([...calls,...frames,fields,large,wait,release]);
export type CurrentSchematicWireClassicRpcSharedCommand=z.infer<typeof schema>;
/** Parsing cannot issue an original request, frame or native Promise token. */
export function validateCurrentSchematicWireClassicRpcSharedCommand(input:unknown):CurrentSchematicWireClassicRpcSharedCommand {
  return freezeDeep(schema.parse(capture(input).value));
}
