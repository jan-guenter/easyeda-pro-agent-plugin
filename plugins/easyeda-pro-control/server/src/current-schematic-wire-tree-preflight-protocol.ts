/** Fixed before-Modify parser/tree scope and method reads. */
import{z}from"zod";
import{captureCurrentPcbStringClockReply as capture}from"./current-pcb-string-clock-reply.ts";
import{freezeDeep}from"./sqlite-inventory-core.ts";
import{CURRENT_SCHEMATIC_WIRE_SERVICE_INVOCATION_FLAGS as FLAGS}from"./current-schematic-wire-service-invocation-protocol.ts";
import{CURRENT_SCHEMATIC_WIRE_TREE_PREFLIGHT_PROGRAMS as P}from"./current-schematic-wire-tree-preflight-programs.ts";

export const CURRENT_SCHEMATIC_WIRE_TREE_PREFLIGHT_REQUESTS=Object.freeze({scopeLimit:8,ordinary:98,sources:76}as const);
export const CURRENT_SCHEMATIC_WIRE_TREE_PREFLIGHT_CALLS=freezeDeep({
 seed0:{program:P.seed0,refs:5,length:2},seed1:{program:P.seed1,refs:5,length:2},
 scopeHost:{program:P.scopeHost,refs:1,length:null},scopeSheet0:{program:P.scopeSheet0,refs:1,length:null},scopeSheet1:{program:P.scopeSheet1,refs:1,length:null},
 scopeAst:{program:P.scopeAst,refs:1,length:null},scopeInfo:{program:P.scopeInfo,refs:1,length:null},scopeTabs:{program:P.scopeTabs,refs:1,length:null},
 scopeOn0:{program:P.scopeOn0,refs:1,length:null},scopeOn1:{program:P.scopeOn1,refs:1,length:null},scopeCounter0:{program:P.scopeCounter0,refs:1,length:null},scopeCounter1:{program:P.scopeCounter1,refs:1,length:null},scopeProject:{program:P.scopeProject,refs:1,length:null},scopeSameAst:{program:P.scopeSameAst,refs:2,length:null},
 ast:{program:P.ast,refs:8,length:10},serial:{program:P.serial,refs:1,length:4},complete0:{program:P.complete0,refs:11,length:4},complete1:{program:P.complete1,refs:11,length:4},
}as const);
const handle=z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
const reference=z.strictObject({objectId:handle});
const flags={objectGroup:z.literal(FLAGS.objectGroup),silent:z.literal(true),generatePreview:z.literal(false),throwOnSideEffect:z.literal(true)};
const calls=Object.entries(CURRENT_SCHEMATIC_WIRE_TREE_PREFLIGHT_CALLS).map(([role,row])=>z.strictObject({phase:z.literal("wire-tree-preflight-call"),role:z.literal(role),method:z.literal("Runtime.callFunctionOn"),params:z.strictObject({...flags,objectId:handle,functionDeclaration:z.literal(row.program),arguments:z.array(reference).length(row.refs),returnByValue:z.literal(false),awaitPromise:z.literal(false),userGesture:z.literal(false)})}));
const properties=z.strictObject({phase:z.literal("wire-tree-preflight-properties"),method:z.literal("Runtime.getProperties"),params:z.strictObject({objectId:handle,ownProperties:z.literal(true),accessorPropertiesOnly:z.literal(false),generatePreview:z.literal(false)})});
const schema=z.union([...calls,properties]);
export type CurrentSchematicWireTreePreflightCommand=z.infer<typeof schema>;
export function validateCurrentSchematicWireTreePreflightCommand(input:unknown):CurrentSchematicWireTreePreflightCommand{return freezeDeep(schema.parse(capture(input).value));}
