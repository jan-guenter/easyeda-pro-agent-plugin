import { applyNativeFixedProtocolProjection } from "./native-fixed-protocol-projection.ts";
/** Separate after-bootstrap source correlation, bounded by the original finite lanes. Source-held helpers keep their existing budget. */
import { createHash } from "node:crypto";
import { CURRENT_PCB_VIA_OBSERVED_WORKER_SOURCE_REQUESTS as REQUESTS } from "./current-pcb-via-observed-worker-programs.ts";
import { installOwnedNativeDispatch } from "./native-owned-dispatch.ts";
import { installNativeCompileOnlyHook } from "./native-compile-only-hook.ts";

const begin="// BEGIN ORIGINAL VIA OBSERVED SOURCES",end="// END ORIGINAL VIA OBSERVED SOURCES";
const sample='{"id":79,"method":"Debugger.getScriptSource","params":{"scriptId":"original_script"},"sessionId":"worker"}\0';
function native():string{return`public static class EasyedaPcbViaObservedSourceProtocol {
public static string Encode(int id,string session,string script){if(id<1||!System.Text.RegularExpressions.Regex.IsMatch(session??"",@"\\A[A-Za-z0-9_.:-]{1,256}\\z")||!System.Text.RegularExpressions.Regex.IsMatch(script??"",@"\\A[A-Za-z0-9_.:-]{1,256}\\z"))throw new InvalidOperationException("via-observed-source-wire");return "{\\"id\\":"+id.ToString(CultureInfo.InvariantCulture)+",\\"method\\":\\"Debugger.getScriptSource\\",\\"params\\":{\\"scriptId\\":"+EasyedaDiagnosticOwner.ObservedSourceQuote(script)+"},\\"sessionId\\":"+EasyedaDiagnosticOwner.ObservedSourceQuote(session)+"}\\0";}
public static void VerifySmoke(){using(var sha=System.Security.Cryptography.SHA256.Create())if(System.BitConverter.ToString(sha.ComputeHash(System.Text.Encoding.UTF8.GetBytes(Encode(79,"worker","original_script")))).Replace("-","").ToLowerInvariant()!=@"${createHash("sha256").update(sample).digest("hex")}")throw new InvalidOperationException("via-observed-source-smoke");}
}
public sealed partial class EasyedaDiagnosticOwner {
readonly System.Collections.Generic.HashSet<string> viaObservedSourceScripts=new System.Collections.Generic.HashSet<string>(StringComparer.Ordinal);
public static string ObservedSourceQuote(string text){return JsonString(text);}
public void SendPcbViaObservedSource(int id,string script){if(!pcbViaWrite209||viaAbortAttempted||viaWorkerStage!=7||viaWorkerSession==null||!viaWorkerParentRunning||viaProducerObserveArms.Count!=27||script==viaWorkerProjectScript||viaObservedSourceScripts.Count>=${String(REQUESTS)})throw Error("via-observed-source-original");string encoded=EasyedaPcbViaObservedSourceProtocol.Encode(id,viaWorkerSession,script);AssertLive();if(!viaObservedSourceScripts.Add(script))throw Error("via-observed-source-once");SendMessage(id,encoded);}
}
`;}
function one(source:string,before:string,after:string):string{if(source.includes(after)){if(source.split(after).length!==2){throw new Error("VIA_OBSERVED_SOURCE_DUPLICATE");}return source;}if(source.split(before).length!==2){throw new Error("VIA_OBSERVED_SOURCE_ANCHOR");}return source.replace(before,after);}
const dispatch=String.raw`        'pcb-via-observed-source' {
          if(-not $PcbViaWrite209 -or -not $launched -or $request.scriptId -isnot [string] -or ($request.requestId -isnot [int] -and $request.requestId -isnot [long]) -or (@($request.PSObject.Properties.Name | Sort-Object) -join ',') -cne 'action,helperInstance,id,jobId,requestId,rootCreated,rootPid,scriptId'){throw 'via-observed-source-fields'}
          $owner.SendPcbViaObservedSource([int]$request.requestId,$request.scriptId);$result=@{written=$true}
        }
`;
export function applyCurrentPcbViaObservedSourceNativeFragment(input:string):string{let source=one(input,'case "pcb-via-sdk":','case "pcb-via-observed-source":case "pcb-via-sdk":');source=installOwnedNativeDispatch(source,dispatch,"        'pcb-via-save-drain-complete' {");source=installNativeCompileOnlyHook(source,"    [EasyedaPcbViaObservedSourceProtocol]::VerifySmoke()","    [EasyedaPcbViaSaveDrainProtocol]::VerifySmoke()");const value=`${begin}\n${native()}\n${end}`;const start=source.indexOf(begin);const stop=source.indexOf(end);if(start!==-1||stop!==-1){if(start===-1||stop<start||source.includes(begin,start+1)||source.includes(end,stop+1)){throw new Error("VIA_OBSERVED_SOURCE_MARKERS");}return source.slice(0,start)+value+source.slice(stop+end.length);}return one(source,"internal enum EasyedaPcbViaWriteBirth { Original }",`${value}\ninternal enum EasyedaPcbViaWriteBirth { Original }`);}

/** Retain the exact shared immutable codecs, without this Via owner's state,
 * sender, action admission or dispatch. The closed schematic build uses it. */
export function applyCurrentPcbViaObservedSourceCodecNativeFragment(input:string):string{return applyNativeFixedProtocolProjection(input,{begin,end,protocols:["EasyedaPcbViaObservedSourceProtocol"],quoteMethod:"ObservedSourceQuote"},native());}
