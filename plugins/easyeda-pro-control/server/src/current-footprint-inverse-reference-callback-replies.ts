/** Exact original first RPC callback stack; caller ancestry comes from the
 * existing fixed reference frame decoder, never an asynchronous stack. */
import{z}from"zod";
import{captureCurrentFootprintInversePreferenceReply as capture}from"./current-footprint-inverse-public-preferences-replies.ts";
import{currentFootprintInverseReferenceUiPause}from"./current-footprint-inverse-reference-ui-replies.ts";

const handle=z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u),point=z.strictObject({scriptId:handle,lineNumber:z.number().int().nonnegative(),columnNumber:z.number().int().nonnegative()});
const remote=z.strictObject({type:z.string(),subtype:z.string().optional(),className:z.string().optional(),description:z.string().optional(),objectId:handle.optional(),value:z.unknown().optional()});
const frame=z.strictObject({callFrameId:handle,functionName:z.string(),functionLocation:point,location:point,url:z.string(),scopeChain:z.array(z.unknown()).max(16),this:remote,returnValue:remote.optional(),canBeRestarted:z.boolean().optional()});
function need(value:boolean):asserts value{if(!value){throw new Error("INVERSE_REFERENCE_CALLBACK_PAUSE");}}
export function currentFootprintInverseReferenceCallbackPause(input:unknown,session:string,scripts:Readonly<{ui:string;manager:string}>,profile:"ui"|"manager",breakpoint:string):Readonly<{callback:string;caller:string}>{
 const raw=z.strictObject({method:z.literal("Debugger.paused"),sessionId:handle,params:z.strictObject({callFrames:z.array(frame).length(9),reason:z.enum(["other","debugCommand"]),hitBreakpoints:z.tuple([handle]),asyncStackTrace:z.unknown().optional(),asyncStackTraceId:z.unknown().optional()})}).parse(capture(input));need(raw.sessionId===session&&raw.params.hitBreakpoints[0]===breakpoint);
 const expected=profile==="ui"?[{name:"",fn:29_836,pc:29_858},{name:"execute",fn:28_690,pc:28_722},{name:"publish",fn:29_000,pc:29_076},{name:"",fn:30_140,pc:30_178}]:[{name:"",fn:7139,pc:7161},{name:"execute",fn:6004,pc:6035},{name:"publish",fn:6311,pc:6387},{name:"",fn:7441,pc:7479}];const script=profile==="ui"?scripts.ui:scripts.manager,line=profile==="ui"?1033:0;
 for(const[index,row]of expected.entries()){const actual=raw.params.callFrames[index];need(actual!==undefined&&actual.functionName===row.name&&actual.functionLocation.scriptId===script&&actual.functionLocation.lineNumber===line&&actual.functionLocation.columnNumber===row.fn&&actual.location.scriptId===script&&actual.location.lineNumber===line&&actual.location.columnNumber===row.pc);}
 const caller=currentFootprintInverseReferenceUiPause({...raw,params:{...raw.params,callFrames:raw.params.callFrames.slice(4)}},session,scripts,profile,breakpoint,"pcb-all"),top=raw.params.callFrames[0];need(top!==undefined);return Object.freeze({callback:top.callFrameId,caller:caller.frame});
}
