/** Finite original UI provider reads; no application method is invoked. */
import {z}from"zod";
import {freezeDeep}from"./sqlite-inventory-core.ts";
import {captureCurrentPcbStringClockReply as capture}from"./current-pcb-string-clock-reply.ts";
import {CURRENT_SCHEMATIC_WIRE_SERVICE_INVOCATION_FLAGS as FLAGS}from"./current-schematic-wire-service-invocation-protocol.ts";
import {CURRENT_SCHEMATIC_WIRE_UI_PROVIDER_PROGRAMS as P}from"./current-schematic-wire-ui-provider-programs.ts";

export const CURRENT_SCHEMATIC_WIRE_UI_PROVIDER_REQUESTS=Object.freeze({scopeLimit:8,ordinary:67,sources:51}as const);
export const CURRENT_SCHEMATIC_WIRE_UI_PROVIDER_CALLS=freezeDeep({
 scopeW:{program:P.scopeW,refs:1,byValue:false},scopeLookup:{program:P.scopeLookup,refs:1,byValue:false},scopeLocale:{program:P.scopeLocale,refs:1,byValue:false},scopeBrand:{program:P.scopeBrand,refs:1,byValue:false},scopeRegistry:{program:P.scopeRegistry,refs:2,byValue:false},scopeClass:{program:P.scopeClass,refs:1,byValue:false},
 registry:{program:P.registry,refs:7,byValue:false},locale:{program:P.locale,refs:6,byValue:false},complete:{program:P.complete,refs:10,byValue:true},
}as const);
const handle=z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
const flags={objectGroup:z.literal(FLAGS.objectGroup),silent:z.literal(true),generatePreview:z.literal(false),throwOnSideEffect:z.literal(true)};
const reference=z.strictObject({objectId:handle});
const calls=Object.entries(CURRENT_SCHEMATIC_WIRE_UI_PROVIDER_CALLS).map(([role,row])=>z.strictObject({phase:z.literal("wire-ui-provider-call"),role:z.literal(role),method:z.literal("Runtime.callFunctionOn"),params:z.strictObject({...flags,objectId:handle,functionDeclaration:z.literal(row.program),arguments:z.array(reference).length(row.refs),returnByValue:z.literal(row.byValue),awaitPromise:z.literal(false),userGesture:z.literal(false)})}));
const properties=z.strictObject({phase:z.literal("wire-ui-provider-properties"),method:z.literal("Runtime.getProperties"),params:z.strictObject({objectId:handle,ownProperties:z.literal(true),accessorPropertiesOnly:z.literal(false),generatePreview:z.literal(false)})});
const schema=z.union([...calls,properties]);
export type CurrentSchematicWireUiProviderCommand=z.infer<typeof schema>;
export function validateCurrentSchematicWireUiProviderCommand(input:unknown):CurrentSchematicWireUiProviderCommand{return freezeDeep(schema.parse(capture(input).value));}
