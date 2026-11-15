/** One primitive read from the original held startup callback. This table
 * cannot supply a source/frame owner or a nonprivate deployment receipt. */
import {createHash} from "node:crypto";
import {z} from "zod";
import {captureCurrentPcbStringClockReply} from "./current-pcb-string-clock-reply.ts";
import {freezeDeep} from "./sqlite-inventory-core.ts";

export const CURRENT_FOOTPRINT_FORWARD_WRITER_STARTUP_WS_FLAGS=Object.freeze({objectGroup:"easyeda-forward-writer-ticket-timer-v1",silent:true,generatePreview:false,throwOnSideEffect:true,returnByValue:true,includeCommandLineAPI:false}as const);
const handle=z.string().regex(/^[A-Za-z0-9_.:-]{1,256}$/u);
const schema=z.strictObject({phase:z.literal("forward-writer-startup-ws"),method:z.literal("Debugger.evaluateOnCallFrame"),params:z.strictObject({objectGroup:z.literal(CURRENT_FOOTPRINT_FORWARD_WRITER_STARTUP_WS_FLAGS.objectGroup),silent:z.literal(true),generatePreview:z.literal(false),throwOnSideEffect:z.literal(true),returnByValue:z.literal(true),includeCommandLineAPI:z.literal(false),callFrameId:handle,expression:z.literal("jr")})});
export type CurrentFootprintForwardWriterStartupWsCommand=Readonly<z.infer<typeof schema>>;
export function validateCurrentFootprintForwardWriterStartupWsCommand(input:unknown):CurrentFootprintForwardWriterStartupWsCommand{return freezeDeep(schema.parse(captureCurrentPcbStringClockReply(input).value));}
export function currentFootprintForwardWriterStartupWsWire(input:unknown,id:number):Readonly<{command:CurrentFootprintForwardWriterStartupWsCommand;request:Readonly<Record<string,string|number>>}>{
 if(!Number.isSafeInteger(id)||id<1||id>2_147_483_647){throw new Error("FORWARD_STARTUP_WS_ID");}
 const command=validateCurrentFootprintForwardWriterStartupWsCommand(input);return freezeDeep({command,request:{action:"footprint-forward-startup-ws",requestId:id,callFrameId:command.params.callFrameId}});
}
export function decodeCurrentFootprintForwardWriterStartupWs(input:unknown):false{return z.strictObject({result:z.strictObject({type:z.literal("boolean"),value:z.literal(false)})}).parse(captureCurrentPcbStringClockReply(input).value).result.value;}
export function currentFootprintForwardWriterStartupWsNativeSource():string{
 const params=JSON.stringify({...CURRENT_FOOTPRINT_FORWARD_WRITER_STARTUP_WS_FLAGS,callFrameId:"__frame__",expression:"jr"});
 const prefix=JSON.stringify(',"method":"Debugger.evaluateOnCallFrame","params":');
 const literal=JSON.stringify(params);
 const sample=`${JSON.stringify({id:79,method:"Debugger.evaluateOnCallFrame",params:{...CURRENT_FOOTPRINT_FORWARD_WRITER_STARTUP_WS_FLAGS,callFrameId:"frame27",expression:"jr"},sessionId:"session29"})}\0`;
 const golden=createHash("sha256").update(sample).digest("hex");
 return `public sealed partial class EasyedaDiagnosticOwner {
bool fullStartupWsConsumed;
static string ForwardWriterStartupWsMessage(int id,string frame,string session){if(id<1||!ForwardWriterProducerHandle(frame)||!ForwardWriterProducerHandle(session))throw Error("forward-startup-ws-fields");string parameters=${literal}.Replace("\\"__frame__\\"",ForwardWriterCopyLocalQuote(frame));return "{\\"id\\":"+id.ToString(CultureInfo.InvariantCulture)+${prefix}+parameters+",\\"sessionId\\":"+ForwardWriterCopyLocalQuote(session)+"}\\0";}
public void SendForwardWriterStartupWs(int id,string frame){RequireForwardWriterProducer();if(!forwardWriterCompleteBirth||fullStartupWsConsumed||footprintCreateClockBegun||!forwardWriterProducerEnrolled||forwardWriterFrontierComplete||forwardWriterFrontierCallbackHeld!="startupEntry"||forwardWriterFrontierCalls!=1||forwardWriterFrontierCallbackRequests!=0)throw Error("forward-startup-ws-original-first-callback");
string text=ForwardWriterStartupWsMessage(id,frame,footprintCopyWorkerSession);fullStartupWsConsumed=true;SendForwardWriterNormalMessage(id,text);}
public static void VerifyForwardWriterStartupWsSmoke(){string text=ForwardWriterStartupWsMessage(79,"frame27","session29");using(var sha=System.Security.Cryptography.SHA256.Create())if(BitConverter.ToString(sha.ComputeHash(System.Text.Encoding.UTF8.GetBytes(text))).Replace("-","").ToLowerInvariant()!=${JSON.stringify(golden)})throw Error("forward-startup-ws-golden");}
}
`;
}
