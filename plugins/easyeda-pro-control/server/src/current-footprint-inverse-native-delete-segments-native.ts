/** V3-only readonly segment receipt ledger. Historical V2 codebooks and
 * native counters are unchanged; this module is not a purpose or issuer. */
import{createHash}from"node:crypto";
import{gzipSync}from"node:zlib";
import{CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_SEGMENTS_ORDER as ORDER,currentFootprintInverseNativeDeleteSegmentsCases as cases,currentFootprintInverseNativeDeleteSegmentsTemplate as template}from"./current-footprint-inverse-native-delete-segments-protocol.ts";

const sha=(v:Uint8Array|string):string=>createHash("sha256").update(v).digest("hex");
const quote=(v:string):string=>`@"${v.replaceAll('"','""')}"`;
export function currentFootprintInverseNativeDeleteSegmentsNativeSource():string{
 const rows=cases().map(c=>{const r=template(c);return[r.key,r.method,r.names.join(","),r.template];});const raw=Buffer.from(rows.map(r=>r.join("\t")).join("\0"));
 if(rows.length!==26||raw.length>60_000||new Set(rows.map(r=>r[0])).size!==26){throw new Error("INVERSE_NATIVE_DELETE_SEGMENTS_TABLE");}
 // oxlint-disable-next-line node/no-sync -- Immutable bounded build data, independently restored by the fixed codec checks.
 const packed=gzipSync(raw,{level:9});
 const smoke=sha(rows.map(r=>`{"id":79,${r[3]?.slice(1,-1)},"sessionId":"original_session"}\0`.replaceAll(/"__inverse_native_delete_segments_([A-Za-z\d]+)__"/gu,(_match,name:unknown)=>name==="rows"?"2":'"original_ref"')).join(""));
 return String.raw`public sealed partial class EasyedaDiagnosticOwner{
static class DsgBook{internal static readonly string[][] Rows=EasyedaDiagnosticFixedTable.Load(__PACKED__,__BYTES__,__SHA__,__PACKED_SHA__,26,4);}
static readonly string[] DsgOrder={__ORDER__};
bool dsgBound,dsgReady,dsgFailed;int dsgStep,dsgRows;string dsgHelper;
void AssertDsg(){AssertDfl();if(dsgFailed)throw Error("inverse-native-delete-segments-failed");}
static string DsgScalar(string name,object input){if(name!="rows")return null;if(!(input is int)&&!(input is long))throw Error("inverse-native-delete-segments-rows");long value=Convert.ToInt64(input,System.Globalization.CultureInfo.InvariantCulture);if(value<1||value>7)throw Error("inverse-native-delete-segments-rows");return value.ToString(System.Globalization.CultureInfo.InvariantCulture);}
public static string NativeDeleteSegmentsMessage(int id,string session,string phase,string method,System.Collections.IDictionary fields){return InverseFixedMessage(id,session,"inverse-native-delete-segments-"+phase,null,method,fields,"inverse-native-delete-segments-","inverse_native_delete_segments_",DsgBook.Rows,false,"program_",DsgScalar);}
public void ControlNativeDeleteSegments(string phase){try{AssertDsg();if(dflBound||dsgReady)throw Error("inverse-native-delete-segments-closed");if(phase=="bind"){if(dsgBound||dsgStep!=0||dnmPre!=0)throw Error("inverse-native-delete-segments-bind");dsgBound=true;return;}if(phase!="complete"||!dsgBound||dsgStep!=26||dsgHelper!=null)throw Error("inverse-native-delete-segments-incomplete");dsgReady=true;}catch{dsgFailed=true;throw;}}
public void SendNativeDeleteSegments(int id,string phase,string method,System.Collections.IDictionary fields){try{AssertDsg();if(!dsgBound||dsgReady||dflBound||dsgStep>=26||phase!=DsgOrder[dsgStep])throw Error("inverse-native-delete-segments-order");string encoded=NativeDeleteSegmentsMessage(id,footprintInversePageSession,phase,method,fields);
if(method=="Debugger.getScriptSource"){if(dsgHelper==null||phase!="helper-"+dsgHelper)throw Error("inverse-native-delete-segments-helper");dsgHelper=null;}else{if(dsgHelper!=null)throw Error("inverse-native-delete-segments-helper-pending");if(method=="Runtime.callFunctionOn"||method=="Debugger.evaluateOnCallFrame")dsgHelper=phase;}
if(fields.Contains("rows")){if(dsgStep!=5&&dsgStep!=24)throw Error("inverse-native-delete-segments-row-slot");int rows=Convert.ToInt32(fields["rows"],System.Globalization.CultureInfo.InvariantCulture);if(dsgStep==5){if(dsgRows!=0)throw Error("inverse-native-delete-segments-rows-once");dsgRows=rows;}else if(rows!=dsgRows)throw Error("inverse-native-delete-segments-rows-changed");}dsgStep++;SendMessage(id,encoded);
}catch{dsgFailed=true;throw;}}
public static void VerifyNativeDeleteSegmentsSmoke(){var all=new System.Text.StringBuilder();int count=0;foreach(string[] r in DsgBook.Rows){var fields=new System.Collections.Hashtable();foreach(string name in r[2].Length==0?new string[0]:r[2].Split(','))fields.Add(name,name=="rows"?(object)2:"original_ref");all.Append(NativeDeleteSegmentsMessage(79,"original_session",r[0],r[1],fields));count++;}if(count!=26)throw Error("inverse-native-delete-segments-count");using(var h=System.Security.Cryptography.SHA256.Create())if(BitConverter.ToString(h.ComputeHash(System.Text.Encoding.UTF8.GetBytes(all.ToString()))).Replace("-","").ToLowerInvariant()!=__SMOKE__)throw Error("inverse-native-delete-segments-smoke");}
}
`.replace("__PACKED__",quote(packed.toString("base64"))).replace("__BYTES__",String(raw.length)).replace("__SHA__",quote(sha(raw))).replace("__PACKED_SHA__",quote(sha(packed))).replace("__ORDER__",ORDER.map(value=>quote(value)).join(",")).replace("__SMOKE__",quote(smoke));
}
export const CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_SEGMENTS_DISPATCH=String.raw`        'footprint-inverse-native-delete-segments' {
 if(-not $FootprintInverseNativeLifecycle209 -or -not $FootprintInverse209 -or -not $launched){throw 'inverse-native-delete-segments-purpose'}
 $base=@('action','id','helperInstance','jobId','rootPid','rootCreated','requestId','phase','method');foreach($n in $base){if(@($request.PSObject.Properties.Name) -cnotcontains $n){throw 'inverse-native-delete-segments-field'}}
 if($request.phase -isnot [string] -or $request.method -isnot [string] -or ($request.requestId -isnot [int] -and $request.requestId -isnot [long])){throw 'inverse-native-delete-segments-type'}
 $fields=New-Object Collections.Hashtable ([StringComparer]::Ordinal);foreach($p in $request.PSObject.Properties){if($base -cnotcontains $p.Name -and $p.Name -cne 'role'){$fields.Add($p.Name,$p.Value)}}
 if($request.method -ceq 'control'){if($request.requestId -ne 0 -or $fields.Count -ne 0 -or $request.PSObject.Properties.Name -ccontains 'role'){throw 'inverse-native-delete-segments-control'};$owner.ControlNativeDeleteSegments($request.phase)}
 else{$phase=$request.phase.Replace('inverse-native-delete-segments-','');if($request.PSObject.Properties.Name -ccontains 'role'){if($request.role -isnot [string]){throw 'inverse-native-delete-segments-role'};$phase+='-'+$request.role};$owner.SendNativeDeleteSegments([int]$request.requestId,$phase,$request.method,$fields)}
 $result=@{written=$true}
        }
`;
