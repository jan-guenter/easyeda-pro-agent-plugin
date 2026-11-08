import { applyNativeFixedProtocolProjection } from "./native-fixed-protocol-projection.ts";
/** New Via-only changed-head cursor. Original Save/body receivers are retained by native custody, never selected on its replay wire. */
import { currentProjectCanvasPendingNativeTemplate } from "./current-project-canvas-pending-native.ts";
import { createHash } from "node:crypto";
import { gzipSync } from "node:zlib";
import { currentPcbDiagnosticNativeHashVector } from "./current-pcb-diagnostic-fixed-table-native.ts";
import { currentPcbViaPostHistorySyncTemplates } from "./current-pcb-via-post-history-sync-wire.ts";
import { installOwnedNativeDispatch } from "./native-owned-dispatch.ts";
import { installNativeCompileOnlyHook } from "./native-compile-only-hook.ts";

const begin="// BEGIN ORIGINAL VIA POST HISTORY SYNC",end="// END ORIGINAL VIA POST HISTORY SYNC";
const quote=(text:string):string=>`@"${text.replaceAll('"','""')}"`;
const hash=(bytes:Uint8Array):string=>createHash("sha256").update(bytes).digest("hex");
const phases=(...values:string[]):string[]=>values.map(value=>`via-post-sync-${value}`);
function native():string{const rows=currentPcbViaPostHistorySyncTemplates();const groups:string[][]=[[]];for(const row of rows){const text=[row.phase,row.method,row.fields.join(","),currentProjectCanvasPendingNativeTemplate(row.template)].join("\t");let group=groups.at(-1);if(group===undefined||Buffer.byteLength(text)>60_000){throw new Error("VIA_POST_SYNC_ROW_BOUND");}if(Buffer.byteLength([...group,text].join("\0"))>60_000){group=[];groups.push(group);}group.push(text);}const loaders=groups.map(group=>{const bytes=Buffer.from(group.join("\0"));
// oxlint-disable-next-line node/no-sync -- Immutable generated rows use the existing bounded fixed-program decoder.
const packed=gzipSync(bytes,{level:9});return`all.AddRange(EasyedaDiagnosticFixedTable.Load(${quote(packed.toString("base64"))},${String(bytes.length)},${quote(hash(bytes))},${quote(hash(packed))},${String(group.length)},4));`;}).join("\n");
const requirements=[phases("frame-module","frame-caller","call-capture","properties-module-0","properties-capture-0",...Array.from({length:12},(_,i)=>`properties-callee-${String(i)}`)),phases("properties-full-0","call-full"),phases("properties-frame-0","properties-reply-0","call-branch"),phases("properties-frame-0","properties-reply-0","properties-result-0","call-history"),phases("call-merged","replay"),phases("call-index","call-finalizing","properties-graph-0"),phases("call-returned","call-retain"),phases("properties-task-0","properties-outer-0")];const allowed=requirements.map((value,index)=>index===5?phases("call-index","call-finalizing",...Array.from({length:24},(_,i)=>`properties-graph-${String(i)}`)):value);const stageBytes=Buffer.from(requirements.map((required,index)=>`${allowed[index]?.join(",")??""}\t${required.join(",")}`).join("\0"));
// oxlint-disable-next-line node/no-sync -- Exact new-stage phase rosters only, using the unchanged bounded table decoder.
const stagePacked=gzipSync(stageBytes,{level:9});const stageLoader=`EasyedaDiagnosticFixedTable.Load(${quote(stagePacked.toString("base64"))},${String(stageBytes.length)},${quote(hash(stageBytes))},${quote(hash(stagePacked))},8,2)`;
const hashes=rows.map(row=>hash(Buffer.from(`{"id":79,${row.template.replaceAll(/"__via_post_sync_([A-Za-z\d]+)__"/gu,'"original_ref"').slice(1,-1)},"sessionId":"worker"}\0`)));
return`public static class EasyedaPcbViaPostHistorySyncProtocol {
static void Need(bool value){if(!value)throw new System.InvalidOperationException("via-post-sync-wire");}
static string[][] Load(){var all=new System.Collections.Generic.List<string[]>();${loaders}foreach(var row in all)row[3]=EasyedaCurrent209PendingPrograms.Expand(row[3]);return all.ToArray();}static readonly string[][] Rows=Load();
static string Value(string name,object value){string text=value as string;Need(text!=null);if(name.StartsWith("text",StringComparison.Ordinal))Need(text.Length>0&&text.Length<=8192&&System.Text.Encoding.UTF8.GetByteCount(text)<=8192);else Need(System.Text.RegularExpressions.Regex.IsMatch(text,@"\\A[A-Za-z0-9_.:-]{1,256}\\z"));return text;}
public static string Encode(int id,string session,string phase,string method,System.Collections.IDictionary fields){Need(id>0&&fields!=null);Value("session",session);string[] row=null;foreach(var item in Rows)if(item[0]==phase){Need(row==null);row=item;}Need(row!=null&&row[1]==method);string[] names=row[2].Length==0?new string[0]:row[2].Split(',');Need(fields.Count==names.Length);var data=new System.Collections.Generic.Dictionary<string,string>(StringComparer.Ordinal);foreach(string name in names){Need(fields.Contains(name));data.Add(name,Value(name,fields[name]));}string text=System.Text.RegularExpressions.Regex.Replace(row[3],"\\"__via_post_sync_([A-Za-z0-9]+)__\\"",m=>{string value;Need(data.TryGetValue(m.Groups[1].Value,out value));return EasyedaDiagnosticOwner.PostSyncQuote(value);});string encoded="{\\"id\\":"+id.ToString(CultureInfo.InvariantCulture)+","+text.Substring(1,text.Length-2)+",\\"sessionId\\":"+EasyedaDiagnosticOwner.PostSyncQuote(session)+"}\\0";Need(System.Text.Encoding.UTF8.GetByteCount(encoded)<=65536);return encoded;}
public static void VerifySmoke(){Need(Rows.Length==63);string[] hashes=${currentPcbDiagnosticNativeHashVector(hashes)};for(int i=0;i<Rows.Length;i++){var row=Rows[i];var fields=new System.Collections.Hashtable();foreach(string name in row[2].Length==0?new string[0]:row[2].Split(','))fields.Add(name,"original_ref");string encoded=Encode(79,"worker",row[0],row[1],fields);using(var sha=System.Security.Cryptography.SHA256.Create())Need(System.BitConverter.ToString(sha.ComputeHash(System.Text.Encoding.UTF8.GetBytes(encoded))).Replace("-","").ToLowerInvariant()==hashes[i]);bool refused=false;try{Encode(79,"worker",row[0],"Runtime.evaluate",fields);}catch(InvalidOperationException){refused=true;}Need(refused);}}
}
public sealed partial class EasyedaDiagnosticOwner {
string viaPostSyncSaveEntry,viaPostSyncSaveBody,viaPostSyncMerged;int viaPostSyncStep,viaPostSyncRequests;bool viaPostSyncCompleted;
readonly System.Collections.Generic.HashSet<string> viaPostSyncSeen=new System.Collections.Generic.HashSet<string>(StringComparer.Ordinal);
static readonly string[] ViaPostSyncRoles={"syncEntry","syncFull","syncLast","syncHistory","syncMerged","syncFinalizing","syncReturned"};
public static string PostSyncQuote(string text){return JsonString(text);}
bool ViaPostSyncHas(string phase){return viaPostSyncSeen.Contains(viaPostSyncStep.ToString(CultureInfo.InvariantCulture)+":"+phase);}
void ViaPostSyncReady(){if(!pcbViaWrite209||viaAbortAttempted||viaWorkerStage!=7||viaWorkerSession==null||!viaSaveGenerationAttempted||viaUploadRequestStep!=9||!viaStructureHistoryGranted||!viaSyncQuiesceCompleted||!viaDrainResumed.Contains("cloudFinally")||viaLiveHistoryStep<1||viaPostSyncSaveEntry==null||viaPostSyncSaveBody==null||viaPostSyncCompleted)throw Error("via-post-sync-original-owner");AssertLive();}
static readonly string[][] ViaPostSyncStages=${stageLoader};
bool ViaPostSyncAllowed(string phase){return viaPostSyncStep>=0&&viaPostSyncStep<ViaPostSyncStages.Length&&Array.IndexOf(ViaPostSyncStages[viaPostSyncStep][0].Split(','),phase)>=0;}
void RequireViaPostSyncStage(){if(viaPostSyncStep<0||viaPostSyncStep>=7)throw Error("via-post-sync-source-stage");foreach(string phase in ViaPostSyncStages[viaPostSyncStep][1].Split(','))if(!ViaPostSyncHas(phase))throw Error("via-post-sync-required-proof");}
public void SendPcbViaPostSync(int id,string phase,string method,System.Collections.IDictionary fields){ViaPostSyncReady();if(viaPostSyncRequests>=67)throw Error("via-post-sync-budget");bool resume=phase=="via-post-sync-resume-"+(viaPostSyncStep<7?ViaPostSyncRoles[viaPostSyncStep]:"none");if(!resume&&!ViaPostSyncAllowed(phase))throw Error("via-post-sync-fixed-stage");if(resume)RequireViaPostSyncStage();if(phase=="via-post-sync-replay"){if(fields==null||fields.Count!=0||viaPostSyncMerged==null)throw Error("via-post-sync-private-replay");fields=new System.Collections.Hashtable();fields.Add("body",viaPostSyncSaveBody);fields.Add("entry",viaPostSyncSaveEntry);fields.Add("merged",viaPostSyncMerged);}string encoded=EasyedaPcbViaPostHistorySyncProtocol.Encode(id,viaWorkerSession,phase,method,fields);string key=viaPostSyncStep.ToString(CultureInfo.InvariantCulture)+":"+phase;if(!viaPostSyncSeen.Add(key)){if(viaPostSyncStep!=7||!viaPostSyncSeen.Add(key+":retry"))throw Error("via-post-sync-once");}if(phase=="via-post-sync-call-merged")viaPostSyncMerged=fields["objectId"] as string;viaPostSyncRequests++;if(resume)viaPostSyncStep++;SendMessage(id,encoded);}
public void CompletePcbViaPostSync(){ViaPostSyncReady();if(viaPostSyncStep!=7||viaLiveHistoryStep!=13||!ViaPostSyncHas("via-post-sync-properties-task-0")||!ViaPostSyncHas("via-post-sync-properties-outer-0"))throw Error("via-post-sync-original-settlement");viaPostSyncCompleted=true;}
}
`;}
function one(source:string,before:string,after:string):string{if(source.includes(after)){if(source.split(after).length!==2){throw new Error("VIA_POST_SYNC_DUPLICATE");}return source;}if(source.split(before).length!==2){throw new Error("VIA_POST_SYNC_ANCHOR");}return source.replace(before,after);}
const dispatch=String.raw`        'pcb-via-post-sync-complete' {
          if(-not $PcbViaWrite209 -or -not $launched -or (@($request.PSObject.Properties.Name | Sort-Object) -join ',') -cne 'action,helperInstance,id,jobId,rootCreated,rootPid'){throw 'via-post-sync-complete-fields'}
          $owner.CompletePcbViaPostSync();$result=@{completed=$true}
        }
        'pcb-via-post-sync' {
          if(-not $PcbViaWrite209 -or -not $launched -or $request.phase -isnot [string] -or $request.method -isnot [string] -or ($request.requestId -isnot [int] -and $request.requestId -isnot [long])){throw 'via-post-sync-fields'}
          $baseFields=@('action','helperInstance','id','jobId','rootCreated','rootPid','requestId','phase','method');$fields=New-Object Collections.Hashtable ([StringComparer]::Ordinal)
          foreach($field in $baseFields){if(@($request.PSObject.Properties.Name) -cnotcontains $field){throw 'via-post-sync-field'}}
          foreach($property in $request.PSObject.Properties){if($baseFields -cnotcontains $property.Name){$fields.Add($property.Name,$property.Value)}}
          $owner.SendPcbViaPostSync([int]$request.requestId,$request.phase,$request.method,$fields);$result=@{written=$true}
        }
`;
export function applyCurrentPcbViaPostHistorySyncNativeFragment(input:string):string{let source=one(input,'case "pcb-via-sdk":','case "pcb-via-post-sync":case "pcb-via-post-sync-complete":case "pcb-via-sdk":');const anchor='if(phase!="via-save-source"&&!viaSdkStages[4])throw Error("via-save-original-attempt");';source=one(source,anchor,`${anchor}if(phase=="via-save-value"){if(viaPostSyncSaveEntry!=null||viaPostSyncSaveBody!=null)throw Error("via-post-sync-original-save-once");viaPostSyncSaveEntry=fields["argument0"] as string;viaPostSyncSaveBody=fields["objectId"] as string;}`);source=installOwnedNativeDispatch(source,dispatch,"        'pcb-via-tail-delete' {");source=installNativeCompileOnlyHook(source,"    [EasyedaPcbViaPostHistorySyncProtocol]::VerifySmoke()","    [EasyedaPcbViaSaveTailObservationProtocol]::VerifySmoke()");const value=`${begin}\n${native()}\n${end}`;const start=source.indexOf(begin);const stop=source.indexOf(end);if(start!==-1||stop!==-1){if(start===-1||stop<start||source.includes(begin,start+1)||source.includes(end,stop+1)){throw new Error("VIA_POST_SYNC_MARKERS");}return source.slice(0,start)+value+source.slice(stop+end.length);}return one(source,"internal enum EasyedaPcbViaWriteBirth { Original }",`${value}\ninternal enum EasyedaPcbViaWriteBirth { Original }`);}

/** Fixed build-time state-machine syntax only; no native owner is issued. */
export function currentPcbViaPostHistorySyncOwnerNative():string{const source=native();const anchor="public sealed partial class EasyedaDiagnosticOwner {";if(source.split(anchor).length!==2){throw new Error("FIXED_OWNER_NATIVE_ANCHOR");}return anchor+source.split(anchor)[1];}

/** Retain the exact shared immutable codecs, without this Via owner's state,
 * sender, action admission or dispatch. The closed schematic build uses it. */
export function applyCurrentPcbViaPostHistorySyncCodecNativeFragment(input:string):string{return applyNativeFixedProtocolProjection(input,{begin,end,protocols:["EasyedaPcbViaPostHistorySyncProtocol"],quoteMethod:"PostSyncQuote"},native());}
