import { currentPcbViaSaveTailDeleteControlTemplates } from "./current-pcb-via-save-tail-delete-control-wire.ts";
import { currentPcbViaSaveTailExtraObservationNativePhases } from "./current-pcb-via-save-tail-extra-observation-wire.ts";
/** Additional Via-only readonly observations on the same original worker. */
import { createHash } from "node:crypto";
import { currentPcbDiagnosticNativeHashVector } from "./current-pcb-diagnostic-fixed-table-native.ts";
import { gzipSync } from "node:zlib";
import { currentPcbViaSaveTailObservationTemplates } from "./current-pcb-via-save-tail-observation-wire.ts";
import { installOwnedNativeDispatch } from "./native-owned-dispatch.ts";
import { installNativeCompileOnlyHook } from "./native-compile-only-hook.ts";

const begin="// BEGIN ORIGINAL VIA TAIL OBSERVATION",end="// END ORIGINAL VIA TAIL OBSERVATION";
const hash=(value:Uint8Array):string=>createHash("sha256").update(value).digest("hex");
const quote=(text:string):string=>`@"${text.replaceAll('"','""')}"`;
function sample(_name:string):string { return "original_ref"; }
function controlNative():string {
  const rows=currentPcbViaSaveTailDeleteControlTemplates();const text=rows.map(row=>[row.phase,row.method,row.fields.join(","),row.template].join("\t")).join("\0");const bytes=Buffer.from(text);
  if(bytes.length>65_536) { throw new Error("VIA_TAIL_DELETE_TABLE_BOUND"); }
  // oxlint-disable-next-line node/no-sync -- Only immutable build-time protocol bytes use the existing bounded fixed-table codec.
  const packed=gzipSync(bytes,{level:9});
  const hashes=rows.map(row=>{const expanded=row.template.replaceAll(/"__via_tail_delete_([A-Za-z\d]+)__"/gu,(_match,name:string)=>JSON.stringify(name==="headUuid"?"a".repeat(32):sample(name)));return hash(Buffer.from(`{"id":79,${expanded.slice(1,-1)},"sessionId":"worker"}\0`));});
  return `public static class EasyedaPcbViaSaveTailDeleteControlProtocol {
static void Need(bool v){if(!v)throw new System.InvalidOperationException("via-tail-delete-wire");}
static readonly string[][] Rows=EasyedaDiagnosticFixedTable.Load(${quote(packed.toString("base64"))},${String(bytes.length)},${quote(hash(bytes))},${quote(hash(packed))},4,4);
static string Value(string name,object value){string text=value as string;Need(text!=null&&System.Text.RegularExpressions.Regex.IsMatch(text,name=="headUuid"?@"\\A[a-f0-9]{32}\\z":@"\\A[A-Za-z0-9_.:-]{1,256}\\z"));return text;}
public static string Phase(int index){Need(index>=0&&index<Rows.Length);return Rows[index][0];}
public static string Encode(int id,string session,string phase,string method,System.Collections.IDictionary fields){Need(id>0&&fields!=null);Value("session",session);string[] row=null;foreach(var r in Rows)if(r[0]==phase){Need(row==null);row=r;}Need(row!=null&&row[1]==method);string[] names=row[2].Length==0?new string[0]:row[2].Split(',');Need(fields.Count==names.Length);var data=new System.Collections.Generic.Dictionary<string,string>(System.StringComparer.Ordinal);foreach(string name in names){Need(fields.Contains(name));data.Add(name,Value(name,fields[name]));}string text=System.Text.RegularExpressions.Regex.Replace(row[3],"\\"__via_tail_delete_([A-Za-z0-9]+)__\\"",m=>{string value;Need(data.TryGetValue(m.Groups[1].Value,out value));return EasyedaDiagnosticOwner.SaveTailObservationQuote(value);});string encoded="{\\"id\\":"+id.ToString(System.Globalization.CultureInfo.InvariantCulture)+","+text.Substring(1,text.Length-2)+",\\"sessionId\\":"+EasyedaDiagnosticOwner.SaveTailObservationQuote(session)+"}\\0";Need(System.Text.Encoding.UTF8.GetByteCount(encoded)<=65536);return encoded;}
public static void VerifySmoke(){Need(Rows.Length==4);string[] hashes=${currentPcbDiagnosticNativeHashVector(hashes)};int index=0;foreach(var row in Rows){var fields=new System.Collections.Hashtable();foreach(string name in row[2].Length==0?new string[0]:row[2].Split(','))fields.Add(name,name=="headUuid"?new string('a',32):"original_ref");string encoded=Encode(79,"worker",row[0],row[1],fields);using(var sha=System.Security.Cryptography.SHA256.Create())Need(System.BitConverter.ToString(sha.ComputeHash(System.Text.Encoding.UTF8.GetBytes(encoded))).Replace("-","").ToLowerInvariant()==hashes[index++]);bool refused=false;try{Encode(79,"worker",row[0],"Runtime.evaluate",fields);}catch(System.InvalidOperationException){refused=true;}Need(refused);}}
}
`;
}
function native():string {
  const extraPhases=currentPcbViaSaveTailExtraObservationNativePhases();
  const rows=currentPcbViaSaveTailObservationTemplates();const text=rows.map(row=>[row.phase,row.method,row.fields.join(","),row.template].join("\t")).join("\0");const bytes=Buffer.from(text);
  if(bytes.length>65_536) { throw new Error("VIA_TAIL_TABLE_BOUND"); }
  // oxlint-disable-next-line node/no-sync -- Only immutable build-time protocol bytes use the existing bounded fixed-table codec.
  const packed=gzipSync(bytes,{level:9});
  const hashes=rows.map(row=>{const expanded=row.template.replaceAll(/"__via_tail_([A-Za-z\d]+)__"/gu,(_match,name:string)=>JSON.stringify(sample(name)));return hash(Buffer.from(`{"id":79,${expanded.slice(1,-1)},"sessionId":"worker"}\0`));});
  return `${controlNative()}\npublic static class EasyedaPcbViaSaveTailObservationProtocol {
static void Need(bool v){if(!v)throw new System.InvalidOperationException("via-tail-wire");}
static readonly string[][] Rows=EasyedaDiagnosticFixedTable.Load(${quote(packed.toString("base64"))},${String(bytes.length)},${quote(hash(bytes))},${quote(hash(packed))},10,4);
static string Value(string name,object value){string text=value as string;Need(text!=null&&System.Text.RegularExpressions.Regex.IsMatch(text,@"\\A[A-Za-z0-9_.:-]{1,256}\\z"));return text;}
public static string Phase(int index){Need(index>=0&&index<Rows.Length);return Rows[index][0];}
public static string Encode(int id,string session,string phase,string method,System.Collections.IDictionary fields){Need(id>0&&fields!=null);Value("session",session);string[] row=null;foreach(var r in Rows)if(r[0]==phase){Need(row==null);row=r;}Need(row!=null&&row[1]==method);string[] names=row[2].Length==0?new string[0]:row[2].Split(',');Need(fields.Count==names.Length);var data=new System.Collections.Generic.Dictionary<string,string>(System.StringComparer.Ordinal);foreach(string name in names){Need(fields.Contains(name));data.Add(name,Value(name,fields[name]));}string text=System.Text.RegularExpressions.Regex.Replace(row[3],"\\"__via_tail_([A-Za-z0-9]+)__\\"",m=>{string value;Need(data.TryGetValue(m.Groups[1].Value,out value));return EasyedaDiagnosticOwner.SaveTailObservationQuote(value);});string encoded="{\\"id\\":"+id.ToString(System.Globalization.CultureInfo.InvariantCulture)+","+text.Substring(1,text.Length-2)+",\\"sessionId\\":"+EasyedaDiagnosticOwner.SaveTailObservationQuote(session)+"}\\0";Need(System.Text.Encoding.UTF8.GetByteCount(encoded)<=65536);return encoded;}
public static void VerifySmoke(){Need(Rows.Length==10);string[] hashes=${currentPcbDiagnosticNativeHashVector(hashes)};int index=0;foreach(var row in Rows){var fields=new System.Collections.Hashtable();foreach(string name in row[2].Length==0?new string[0]:row[2].Split(','))fields.Add(name,"original_ref");string encoded=Encode(79,"worker",row[0],row[1],fields);using(var sha=System.Security.Cryptography.SHA256.Create())Need(System.BitConverter.ToString(sha.ComputeHash(System.Text.Encoding.UTF8.GetBytes(encoded))).Replace("-","").ToLowerInvariant()==hashes[index++]);bool refused=false;try{Encode(79,"worker",row[0],"Runtime.evaluate",fields);}catch(System.InvalidOperationException){refused=true;}Need(refused);}}
}
public sealed partial class EasyedaDiagnosticOwner {
int viaTailObservationStep,viaTailDeleteControlStep;bool viaTailDeleteCallResumed,viaTailDeleteReturnedResumed;
public static string SaveTailObservationQuote(string text){return JsonString(text);}
public void SendPcbViaSaveTailObservation(int id,string phase,string method,System.Collections.IDictionary fields){if(!pcbViaWrite209||viaAbortAttempted||viaWorkerSession==null||viaProducerContext==null||viaTailObservationStep>=10||phase!=EasyedaPcbViaSaveTailObservationProtocol.Phase(viaTailObservationStep))throw Error("via-tail-original-order");
if(viaTailObservationStep<3){if(viaWorkerStage!=6||!viaWorkerSourceRead||viaWorkerInstrumentRemoved||viaProducerObserveArms.Count!=27||fields["scriptId"] as string!=viaWorkerProjectScript)throw Error("via-tail-original-arm");}
else{if(viaWorkerStage!=7||!viaSaveGenerationAttempted||viaUploadRequestStep!=9||!viaStructureHistoryGranted||!viaSyncQuiesceCompleted)throw Error("via-tail-original-save");if(viaTailObservationStep>=7&&!viaTailDeleteCallResumed)throw Error("via-tail-original-delete-call");}
string encoded=EasyedaPcbViaSaveTailObservationProtocol.Encode(id,viaWorkerSession,phase,method,fields);AssertLive();viaTailObservationStep++;SendMessage(id,encoded);}


public void SendPcbViaSaveTailDelete(int id,string phase,string method,System.Collections.IDictionary fields){if(!pcbViaWrite209||viaAbortAttempted||viaWorkerStage!=7||viaWorkerSession==null||!viaSaveGenerationAttempted||viaUploadRequestStep!=9||!viaStructureHistoryGranted||!viaSyncQuiesceCompleted||viaTailDeleteControlStep>=4||phase!=EasyedaPcbViaSaveTailDeleteControlProtocol.Phase(viaTailDeleteControlStep)||(viaTailDeleteControlStep<2?viaTailObservationStep!=7:viaTailObservationStep!=10))throw Error("via-tail-delete-original-order");string encoded=EasyedaPcbViaSaveTailDeleteControlProtocol.Encode(id,viaWorkerSession,phase,method,fields);AssertLive();if(viaTailDeleteControlStep==1){if(viaTailDeleteCallResumed)throw Error("via-tail-delete-call-once");viaTailDeleteCallResumed=true;}if(viaTailDeleteControlStep==3){if(!viaTailDeleteCallResumed||viaTailDeleteReturnedResumed)throw Error("via-tail-delete-returned-once");viaTailDeleteReturnedResumed=true;}viaTailDeleteControlStep++;SendMessage(id,encoded);}

int viaTailExtraRequests;readonly System.Collections.Generic.Dictionary<string,int> viaTailExtraCounts=new System.Collections.Generic.Dictionary<string,int>(StringComparer.Ordinal);
public void SendPcbViaTailExtraObserve(int id,string phase,string method,System.Collections.IDictionary fields){if(!pcbViaWrite209||viaAbortAttempted||viaWorkerStage!=7||viaWorkerSession==null||viaProducerContext==null||viaTailObservationStep<3||!viaSaveGenerationAttempted||viaUploadRequestStep!=9||!viaStructureHistoryGranted||viaTailExtraRequests>=42||Array.IndexOf(new string[]{${extraPhases.map(value=>quote(value)).join(",")}},phase)<0)throw Error("via-tail-extra-original-owner");int count;viaTailExtraCounts.TryGetValue(phase,out count);if(count>=(phase=="project-save-producer-properties"?9:3))throw Error("via-tail-extra-original-count");string encoded=EasyedaProjectSaveProducerProtocol.Encode(id,viaWorkerSession,viaProducerContext,phase,method,fields);AssertLive();viaTailExtraRequests++;viaTailExtraCounts[phase]=count+1;SendMessage(id,encoded);}

}
`;
}
const dispatch=String.raw`        'pcb-via-tail-delete' {
          if(-not $PcbViaWrite209 -or -not $launched -or $request.phase -isnot [string] -or $request.method -isnot [string] -or ($request.requestId -isnot [int] -and $request.requestId -isnot [long])){throw 'via-tail-delete-fields'}
          $baseFields=@('action','helperInstance','id','jobId','rootCreated','rootPid','requestId','phase','method');$fields=New-Object Collections.Hashtable ([StringComparer]::Ordinal)
          foreach($field in $baseFields){if(@($request.PSObject.Properties.Name) -cnotcontains $field){throw 'via-tail-delete-field'}}
          foreach($property in $request.PSObject.Properties){if($baseFields -cnotcontains $property.Name){$fields.Add($property.Name,$property.Value)}}
          $owner.SendPcbViaSaveTailDelete([int]$request.requestId,$request.phase,$request.method,$fields);$result=@{written=$true}
        }
        'pcb-via-tail-extra-observe' {
          if(-not $PcbViaWrite209 -or -not $launched -or $request.phase -isnot [string] -or $request.method -isnot [string] -or ($request.requestId -isnot [int] -and $request.requestId -isnot [long])){throw 'via-tail-extra-fields'}
          $baseFields=@('action','helperInstance','id','jobId','rootCreated','rootPid','requestId','phase','method');$fields=New-Object Collections.Hashtable ([StringComparer]::Ordinal)
          foreach($field in $baseFields){if(@($request.PSObject.Properties.Name) -cnotcontains $field){throw 'via-tail-extra-field'}}
          foreach($property in $request.PSObject.Properties){if($baseFields -cnotcontains $property.Name){$fields.Add($property.Name,$property.Value)}}
          $owner.SendPcbViaTailExtraObserve([int]$request.requestId,$request.phase,$request.method,$fields);$result=@{written=$true}
        }
        'pcb-via-tail-observe' {
          if(-not $PcbViaWrite209 -or -not $launched -or $request.phase -isnot [string] -or $request.method -isnot [string] -or ($request.requestId -isnot [int] -and $request.requestId -isnot [long])){throw 'via-tail-fields'}
          $baseFields=@('action','helperInstance','id','jobId','rootCreated','rootPid','requestId','phase','method');$fields=New-Object Collections.Hashtable ([StringComparer]::Ordinal)
          foreach($field in $baseFields){if(@($request.PSObject.Properties.Name) -cnotcontains $field){throw 'via-tail-field'}}
          foreach($property in $request.PSObject.Properties){if($baseFields -cnotcontains $property.Name){$fields.Add($property.Name,$property.Value)}}
          $owner.SendPcbViaSaveTailObservation([int]$request.requestId,$request.phase,$request.method,$fields);$result=@{written=$true}
        }
`;
export function applyCurrentPcbViaSaveTailObservationNativeFragment(input:string):string {
  let source=input;const action='case "pcb-via-sdk":',expanded=`case "pcb-via-tail-delete":case "pcb-via-tail-extra-observe":case "pcb-via-tail-observe":${action}`;
  if(!source.includes(expanded)){if(source.split(action).length!==2) { throw new Error("VIA_TAIL_ACTION_ANCHOR"); }source=source.replace(action,expanded);}
  const sdkBefore='if((stage=="create"||stage=="save")&&!viaSyncQuiesceCompleted)throw Error("sync-quiesce-before-action");';
  const sdkAfter=`${sdkBefore}if((stage=="create"||stage=="save")&&viaTailObservationStep<3)throw Error("via-tail-before-action");`;
  if(!source.includes(sdkAfter)){if(source.split(sdkBefore).length!==2){throw new Error("VIA_TAIL_SDK_ANCHOR");}source=source.replace(sdkBefore,sdkAfter);}
  source=installOwnedNativeDispatch(source,dispatch,"        'pcb-via-upload-request' {");
  source=installNativeCompileOnlyHook(source,"    [EasyedaPcbViaSaveTailDeleteControlProtocol]::VerifySmoke()","    [EasyedaPcbViaUploadRequestProtocol]::VerifySmoke()");
  source=installNativeCompileOnlyHook(source,"    [EasyedaPcbViaSaveTailObservationProtocol]::VerifySmoke()","    [EasyedaPcbViaUploadRequestProtocol]::VerifySmoke()");
  const value=`${begin}\n${native()}\n${end}`;const start=source.indexOf(begin);const stop=source.indexOf(end);
  if(start!==-1||stop!==-1){if(start===-1||stop<start||source.includes(begin,start+1)||source.includes(end,stop+1)) { throw new Error("VIA_TAIL_MARKERS"); }return source.slice(0,start)+value+source.slice(stop+end.length);}
  const anchor="internal enum EasyedaPcbViaWriteBirth { Original }";if(source.split(anchor).length!==2) { throw new Error("VIA_TAIL_BODY_ANCHOR"); }return source.replace(anchor,`${value}\n${anchor}`);
}
