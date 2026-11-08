/** Exact current original query frame; asynchronous parent history is data
 * only and never supplies a missing synchronous caller. */
import{z}from"zod";
import{captureCurrentFootprintInversePreferenceReply as capture}from"./current-footprint-inverse-public-preferences-replies.ts";
import{CURRENT_FOOTPRINT_INVERSE_REFERENCE_UI_ROUTES as ROUTES}from"./current-footprint-inverse-reference-ui-programs.ts";
import type{CurrentFootprintInverseReferenceUiKind as Kind}from"./current-footprint-inverse-reference-ui-programs.ts";

const handle=z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);const point=z.strictObject({scriptId:handle,lineNumber:z.number().int().nonnegative(),columnNumber:z.number().int().nonnegative()});
const remote=z.strictObject({type:z.string(),subtype:z.string().optional(),className:z.string().optional(),description:z.string().optional(),objectId:handle.optional(),value:z.unknown().optional()});
const frame=z.strictObject({callFrameId:handle,functionName:z.string(),functionLocation:point,location:point,url:z.string(),scopeChain:z.array(z.unknown()).max(16),this:remote,returnValue:remote.optional(),canBeRestarted:z.boolean().optional()});
function need(value:boolean):asserts value{if(!value){throw new Error("INVERSE_REFERENCE_UI_PAUSE");}}
export function currentFootprintInverseReferenceUiPause(input:unknown,sessionId:string,scripts:Readonly<{ui:string;manager:string}>,profile:"ui"|"manager",breakpoint:string,kind:Kind):Readonly<{frame:string;caller:string;yw:string}>{
 const raw=z.strictObject({method:z.literal("Debugger.paused"),sessionId:handle,params:z.strictObject({callFrames:z.array(frame).min(3).max(64),reason:z.enum(["other","debugCommand"]),hitBreakpoints:z.tuple([handle]),asyncStackTrace:z.unknown().optional(),asyncStackTraceId:z.unknown().optional()})}).parse(capture(input));need(raw.sessionId===sessionId&&raw.params.hitBreakpoints[0]===breakpoint);const route=ROUTES[kind];const expected=[profile==="ui"?{name:"rpcCall",line:1033,fnLine:1033,fn:30_110,pc:30_128,script:scripts.ui}:{name:"rpcCall",line:0,fnLine:0,fn:7412,pc:7429,script:scripts.manager},{...route.caller,fnLine:route.caller.line,script:scripts.ui},...route.chain.map(row=>({name:row.name,line:row.line,fn:row.fn,pc:row.pc,fnLine:"fnLine"in row?row.fnLine:row.line,script:scripts.ui}))];if(kind==="pcb-all"){expected.push({name:"delete",line:2657,fnLine:2657,fn:140_826,pc:141_020,script:scripts.ui});}need(raw.params.callFrames.length===expected.length);
 for(const[index,row]of expected.entries()){const actual=raw.params.callFrames[index];need(actual!==undefined&&actual.functionName===row.name&&actual.functionLocation.scriptId===row.script&&actual.functionLocation.lineNumber===row.fnLine&&actual.functionLocation.columnNumber===row.fn&&actual.location.scriptId===row.script&&actual.location.lineNumber===row.line&&actual.location.columnNumber===row.pc);}const caller=raw.params.callFrames[1],top=raw.params.callFrames[0],yw=raw.params.callFrames[expected.length-(kind==="pcb-all"?2:1)];need(top!==undefined&&caller!==undefined&&yw!==undefined);return Object.freeze({frame:top.callFrameId,caller:caller.callFrameId,yw:yw.callFrameId});
}

/** Node/V8 SetIterator metadata, separate from ordinary-object evidence. */
const setIteratorPrototype=z.strictObject({type:z.literal("object"),className:z.literal("Set Iterator"),description:z.literal("Set Iterator"),objectId:handle});
const setIteratorEntries=z.strictObject({type:z.literal("object"),subtype:z.literal("array"),className:z.literal("Array"),description:z.literal("Array(1)"),objectId:handle});
const index=z.strictObject({type:z.literal("number"),value:z.literal(0),description:z.literal("0")}),kind=z.strictObject({type:z.literal("string"),value:z.literal("values")}),more=z.strictObject({type:z.literal("boolean"),value:z.literal(true)});
const setIteratorFields=z.tuple([z.strictObject({name:z.literal("[[Prototype]]"),value:setIteratorPrototype}),z.strictObject({name:z.literal("[[IteratorHasMore]]"),value:more}),z.strictObject({name:z.literal("[[IteratorIndex]]"),value:index}),z.strictObject({name:z.literal("[[IteratorKind]]"),value:kind}),z.strictObject({name:z.literal("[[Entries]]"),value:setIteratorEntries})]);
const setIteratorPacket=z.strictObject({result:z.tuple([]),internalProperties:setIteratorFields});
export function currentFootprintInverseReferenceSetIterator(input:unknown):void{setIteratorPacket.parse(capture(input));}
