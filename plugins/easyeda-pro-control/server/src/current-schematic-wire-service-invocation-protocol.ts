/** Closed observations for actual service frames and retained native returns.
 * No recipe invokes an application method, Promise callback or resolver. */
import { z } from "zod";
import { freezeDeep } from "./sqlite-inventory-core.ts";
import { captureCurrentPcbStringClockReply as capture } from "./current-pcb-string-clock-reply.ts";
import { CURRENT_SCHEMATIC_WIRE_SERVICE_INVOCATION_FRAMES as FRAMES,CURRENT_SCHEMATIC_WIRE_SERVICE_INVOCATION_PROGRAMS as P } from "./current-schematic-wire-service-invocation-programs.ts";

export const CURRENT_SCHEMATIC_WIRE_SERVICE_INVOCATION_FLAGS=Object.freeze({objectGroup:"easyeda-schematic-wire-service-invocation-v1",silent:true,generatePreview:false,throwOnSideEffect:true}as const);
export const CURRENT_SCHEMATIC_WIRE_SERVICE_INVOCATION_CALLS=freezeDeep({
 parents:{program:P.parents,refs:7,values:0,byValue:false},
 entryClosing:{program:P.entryClosing,refs:8,values:0,byValue:false},entryLanguage:{program:P.entryLanguage,refs:8,values:0,byValue:false},entryTitles:{program:P.entryTitles,refs:8,values:0,byValue:false},
 targetClosingReturned:{program:P.targetClosingReturned,refs:4,values:0,byValue:true},targetLanguageReturned:{program:P.targetLanguageReturned,refs:4,values:0,byValue:true},targetTitlesReturned:{program:P.targetTitlesReturned,refs:4,values:0,byValue:true},current:{program:P.current,refs:3,values:0,byValue:true},
 targetClosing:{program:P.targetClosing,refs:3,values:0,byValue:false},targetLanguage:{program:P.targetLanguage,refs:3,values:0,byValue:false},targetTitles:{program:P.targetTitles,refs:3,values:0,byValue:false},
 query:{program:P.query,refs:4,values:0,byValue:false},queryReturned:{program:P.queryReturned,refs:5,values:0,byValue:true},
 postClosing:{program:P.postClosing,refs:3,values:0,byValue:false},postLanguage:{program:P.postLanguage,refs:3,values:1,byValue:false},postTitles:{program:P.postTitles,refs:3,values:0,byValue:false},
 callbackReturned:{program:P.callbackReturned,refs:3,values:0,byValue:true},
 published:{program:P.published,refs:5,values:0,byValue:false},
 replyClosing:{program:P.replyClosing,refs:4,values:0,byValue:false},replyLanguage:{program:P.replyLanguage,refs:4,values:0,byValue:false},replyTitles:{program:P.replyTitles,refs:5,values:0,byValue:false},
 replyReturned:{program:P.replyReturned,refs:4,values:0,byValue:true},
 same:{program:P.same,refs:1,values:0,byValue:true},retain:{program:P.retain,refs:0,values:0,byValue:false},
}as const);
const handle=z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u),object=z.strictObject({objectId:handle});
const scalar=z.strictObject({value:z.string().max(8192)});
const argument=z.union([object,scalar]);
const FLAGS=CURRENT_SCHEMATIC_WIRE_SERVICE_INVOCATION_FLAGS;
const flags={objectGroup:z.literal(FLAGS.objectGroup),silent:z.literal(true),generatePreview:z.literal(false),throwOnSideEffect:z.literal(true)};
const calls=Object.entries(CURRENT_SCHEMATIC_WIRE_SERVICE_INVOCATION_CALLS).map(([role,row])=>z.strictObject({
 phase:z.literal("wire-service-invocation-call"),role:z.literal(role),method:z.literal("Runtime.callFunctionOn"),
 params:z.strictObject({...flags,objectId:handle,functionDeclaration:z.literal(row.program),arguments:z.array(argument).length(row.refs+row.values),returnByValue:z.literal(row.byValue),awaitPromise:z.literal(false),userGesture:z.literal(false)}),
}));
const recipes=[...Object.entries(FRAMES.ui).map(([role,expression])=>({variant:2,role,expression})),...([0,1]as const).flatMap(variant=>Object.entries(FRAMES.sch[variant]).map(([role,expression])=>({variant,role,expression}))),
 {variant:2,role:"caught",expression:"[this,i,o,n,e,s]"},{variant:2,role:"rejected",expression:"[this,c,a,o,l]"}];
const frames=recipes.map(row=>z.strictObject({phase:z.literal("wire-service-invocation-frame"),variant:z.literal(row.variant),role:z.literal(row.role),method:z.literal("Debugger.evaluateOnCallFrame"),
 params:z.strictObject({...flags,callFrameId:handle,expression:z.literal(row.expression),returnByValue:z.literal(false),includeCommandLineAPI:z.literal(false)}),
}));
const properties=z.strictObject({phase:z.literal("wire-service-invocation-properties"),method:z.literal("Runtime.getProperties"),params:z.strictObject({objectId:handle,ownProperties:z.literal(true),accessorPropertiesOnly:z.literal(false),generatePreview:z.literal(false)})});
const release=z.strictObject({phase:z.literal("wire-service-invocation-release"),method:z.literal("Runtime.releaseObjectGroup"),params:z.strictObject({objectGroup:z.literal(FLAGS.objectGroup)})});
const schema=z.union([...calls,...frames,properties,release]);
export type CurrentSchematicWireServiceInvocationCommand=z.infer<typeof schema>;
export function validateCurrentSchematicWireServiceInvocationCommand(input:unknown):CurrentSchematicWireServiceInvocationCommand{
 const command=schema.parse(capture(input).value);
 if(command.phase==="wire-service-invocation-call"){
  const row=Object.entries(CURRENT_SCHEMATIC_WIRE_SERVICE_INVOCATION_CALLS).find(([role])=>role===command.role)?.[1];if(row===undefined){throw new Error("WIRE_SERVICE_CALL");}
  for(const[index,arg]of command.params.arguments.entries()){if(index<row.refs){object.parse(arg);}else{scalar.parse(arg);}}
 }
 return freezeDeep(command);
}
