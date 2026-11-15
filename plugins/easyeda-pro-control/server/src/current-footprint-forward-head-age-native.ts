/** A separate forward owner maps its 23 local requests to physical Main IDs.
 * The historical head-age encoder and its 45-ID bound remain unchanged. */
import { CURRENT_FOOTPRINT_FORWARD_HEAD_AGE_PHASES as PHASES, validateCurrentFootprintForwardHeadAgeCommand } from "./current-footprint-forward-head-age.ts";
import { currentFootprintHeadAgeNativeWire } from "./current-footprint-head-age-native.ts";
import { currentFootprintCopyMainBackendWire } from "./current-footprint-copy-main-backend-wire.ts";
import { CURRENT_FOOTPRINT_FORWARD_COLD_NATIVE_MAIN_LIMITS as MAIN } from "./current-footprint-forward-cold-native-limits.ts";

export function currentFootprintForwardHeadAgeNativeWire(input: unknown, id: number): Readonly<Record<string, string | number>> {
  if (!Number.isSafeInteger(id) || id < 1 || id > MAIN.requestLimit || Object.is(id, -0)) { throw new Error("FORWARD_HEAD_AGE_NATIVE_ID"); }
  const { command } = validateCurrentFootprintForwardHeadAgeCommand(input);
  const original = command.phase.startsWith("head-age-") ? currentFootprintHeadAgeNativeWire(command, 1) : currentFootprintCopyMainBackendWire(command, 1).request;
  return Object.freeze({ ...original, action: "footprint-forward-head-age-main", requestId: id, method: command.method });
}
export function currentFootprintForwardHeadAgeNativeSource(): string {
  return `public static class EasyedaFootprintForwardHeadAgeProtocol {
static void Need(bool value){if(!value)throw new System.InvalidOperationException("forward-head-age");}
static readonly string[] Names={${PHASES.map(value => JSON.stringify(value)).join(",")}};
public sealed class Phases {
int ordinal;bool failed;readonly EasyedaFootprintHeadAgeProtocol.Phases original=new EasyedaFootprintHeadAgeProtocol.Phases();
public void Fail(){failed=true;original.Fail();}
public string Compile(int physical,string phase,string method,System.Collections.IDictionary fields,uint root){try{
Need(!failed&&ordinal<Names.Length&&phase==Names[ordinal]&&physical>0&&physical<=EasyedaFootprintForwardExecutionLimits.MainRequests&&fields!=null&&root>0);int local=++ordinal;string encoded;
if(phase=="require"||phase=="properties")encoded=EasyedaFootprintCopyMainBackendProtocol.Encode(local,phase,method,fields);
else{Need(method==(phase=="head-age-context-source"?"Debugger.getScriptSource":"Runtime.callFunctionOn"));original.Admit(phase,fields,root);encoded=EasyedaFootprintHeadAgeProtocol.Encode(local,phase,fields);}
string prefix="{\\"id\\":"+local.ToString(System.Globalization.CultureInfo.InvariantCulture)+",";Need(encoded.StartsWith(prefix,System.StringComparison.Ordinal));return "{\\"id\\":"+physical.ToString(System.Globalization.CultureInfo.InvariantCulture)+","+encoded.Substring(prefix.Length);
}catch{Fail();throw;}}
}
public static void VerifySmoke(){var p=new Phases();int id=50;foreach(string phase in Names){var f=new System.Collections.Hashtable();string method="Runtime.callFunctionOn";f["objectId"]="native_handle";
if(phase=="properties")method="Runtime.getProperties";
else if(phase=="require"||phase=="head-age-context-capture")f["argument0"]="original_handle";
else if(phase=="head-age-context-source"){method="Debugger.getScriptSource";f.Clear();f["scriptId"]="bootstrap_script";}
else if(phase=="head-age-context-bind"){for(int i=0;i<4;i++)f["argument"+i]="original_handle";f["nativeRootPid"]=1234;}
else if(phase=="head-age-capture"){f["argument0"]="original_handle";f["argument1"]="context_handle";}
else{f["createdAtLiteral"]="2026-01-15 12:34:56";f["wallEpochMs"]=1700000000000L;}
string text=p.Compile(id,phase,method,f,1234);Need(text.StartsWith("{\\"id\\":"+id.ToString(System.Globalization.CultureInfo.InvariantCulture)+",",System.StringComparison.Ordinal));id++;}
bool refused=false;try{p.Compile(id,"require","Runtime.callFunctionOn",new System.Collections.Hashtable(),1234);}catch(System.InvalidOperationException){refused=true;}Need(refused);}
}
public sealed partial class EasyedaDiagnosticOwner {
readonly EasyedaFootprintForwardHeadAgeProtocol.Phases forwardHeadAgePhases=new EasyedaFootprintForwardHeadAgeProtocol.Phases();
public object SendForwardHeadAgeMain(int id,string phase,string method,System.Collections.IDictionary fields){
if(!forwardExecution||originalMain==null||!originalMain.ForwardExecutionProfile||!forwardHeadCompleted||!forwardHeadReadReleased||!forwardHeadSqlReleased||footprintCreateClockActive||footprintClockRpcActive||mainCompletionBegun||id!=mainRequest+1||id>EasyedaFootprintForwardExecutionLimits.MainRequests)throw Error("forward-head-age-owner");
MainPurpose();AssertLive();try{string message=forwardHeadAgePhases.Compile(id,phase,method,fields,rootPid);mainRequest=id;
if(phase!="head-age-observe"){originalMain.SendFixed(message,false);AssertLive();return new Dictionary<string,object>{{"written",true}};}
var elapsed=Stopwatch.StartNew();var before=EasyedaStringClockObservation.Read();AssertLive();if(!before.tzAbsent||before.reason!=null||before.sample==null)throw Error("forward-head-age-before");
originalMain.SendFixed(message,false);var bytes=new List<byte>();var current=new List<byte>();bool matched=false;int polls=0;
while(!matched){if(elapsed.ElapsedMilliseconds>=10000||++polls>1024)throw Error("forward-head-age-deadline");byte[] part=Convert.FromBase64String(PollMain(false));if(bytes.Count+part.Length>65536)throw Error("forward-head-age-bytes");bytes.AddRange(part);foreach(byte value in part){if(value==0){string row=new UTF8Encoding(false,true).GetString(current.ToArray());current.Clear();if(new HeadAgeReplyJson(row).Matches(id))matched=true;}else current.Add(value);}if(!matched)Thread.Sleep(1);}
var after=EasyedaStringClockObservation.Read();AssertLive();if(!after.tzAbsent||after.reason!=null||after.sample==null||elapsed.ElapsedMilliseconds>10000)throw Error("forward-head-age-after");
return new Dictionary<string,object>{{"written",true},{"bytes",Convert.ToBase64String(bytes.ToArray())},{"before",HeadAgeClock("before",1,before)},{"after",HeadAgeClock("after",2,after)}};
}catch{forwardHeadAgePhases.Fail();throw;}}
}
`;
}
