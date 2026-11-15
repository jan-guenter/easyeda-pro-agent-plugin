/** Closed full-purpose callback/queue/timer codebook and original-instance
 * ledgers. Historical inverse and shared worker-purpose senders stay separate. */
import { createHash } from "node:crypto";
import { gzipSync } from "node:zlib";
import { currentFootprintForwardWriterFrontierCases, currentFootprintForwardWriterFrontierTemplate } from "./current-footprint-forward-writer-frontier-protocol.ts";
import { currentProjectSyncQuiesceNativeCases } from "./current-project-sync-quiesce-protocol.ts";
import { CURRENT_FOOTPRINT_FORWARD_WRITER_STARTUP_FRONTIER_REQUESTS as LIMITS } from "./current-footprint-forward-writer-frontier-budget.ts";

const hash = (value: string | Uint8Array): string => createHash("sha256").update(value).digest("hex");
/** Enumerate complete fixed templates; no caller source enters this table. */
export function currentFootprintForwardWriterFrontierNativeSource(): string {
  const cases = currentFootprintForwardWriterFrontierCases().map(command => currentFootprintForwardWriterFrontierTemplate(command));
  const rows: string[] = [], seen = new Set<string>();
  for (const row of cases) {
    const key = `${row.lane}:${row.phase}`; if (seen.has(key) || Buffer.byteLength(row.template) > 16_384) { throw new Error("FORWARD_WRITER_FRONTIER_NATIVE_ROW"); } seen.add(key);
    rows.push([row.lane, row.phase, row.method, row.fields.join(","), row.template].join("\t"));
  }
  const groups: string[][] = [[]];
  for (const row of rows) {
    let selected = groups.at(-1); if (selected === undefined || Buffer.byteLength(row) > 60_000) { throw new Error("FORWARD_WRITER_FRONTIER_NATIVE_BOUND"); }
    if (Buffer.byteLength([...selected, row].join("\0")) > 60_000) { selected = []; groups.push(selected); } selected.push(row);
  }
  const loaders = groups.map(group => {
    const bytes = Buffer.from(group.join("\0"));
    // oxlint-disable-next-line node/no-sync -- Deterministic in-memory fixed-table packing; no runtime compression or supplied bytes.
    const packed = gzipSync(bytes, { level: 9 });
    return `rows.AddRange(EasyedaDiagnosticFixedTable.Load(${JSON.stringify(packed.toString("base64"))},${String(bytes.length)},${JSON.stringify(hash(bytes))},${JSON.stringify(hash(packed))},${String(group.length)},5));`;
  }).join("");
  const timer = currentProjectSyncQuiesceNativeCases().map(command => currentFootprintForwardWriterFrontierTemplate({ phase: "forward-startup-frontier", lane: "timer", command }).phase);
  const golden = cases.map(row => hash(`{"id":79,${row.template.replaceAll(/__fwf_[A-Za-z\d]+__/gu, "original_handle").slice(1, -1)},"sessionId":"original_handle"}\0`));
  return `internal static class EasyedaForwardWriterFrontierProtocol {
static void Need(bool value){if(!value)throw new System.InvalidOperationException("forward-writer-frontier-codebook");}
static readonly string[][] Cases=Load();static string[][] Load(){var rows=new System.Collections.Generic.List<string[]>();${loaders}return rows.ToArray();}
static string Handle(object input){string value=input as string;Need(value!=null&&System.Text.RegularExpressions.Regex.IsMatch(value,@"\\A[A-Za-z0-9_.:-]{1,256}\\z"));return "\\""+value+"\\"";}
internal static string Encode(int id,string session,string context,string lane,string phase,string method,System.Collections.IDictionary fields){Need(id>0&&fields!=null);string[] row=null;foreach(var candidate in Cases)if(candidate[0]==lane&&candidate[1]==phase){Need(row==null);row=candidate;}Need(row!=null&&row[2]==method);string[] names=row[3].Length==0?new string[0]:row[3].Split(',');Need(fields.Count==names.Length);foreach(var name in names)Need(fields.Contains(name));string text=System.Text.RegularExpressions.Regex.Replace(row[4],"\\"__fwf_([A-Za-z0-9]+)__\\"",match=>Handle(match.Groups[1].Value=="boundContext"?context:fields[match.Groups[1].Value]));text="{\\"id\\":"+id.ToString(System.Globalization.CultureInfo.InvariantCulture)+","+text.Substring(1,text.Length-2)+",\\"sessionId\\":"+Handle(session)+"}\\0";Need(System.Text.Encoding.UTF8.GetByteCount(text)<=65536);return text;}
internal static void VerifySmoke(){string[] hashes={${golden.map(value => JSON.stringify(value)).join(",")}};for(int i=0;i<Cases.Length;i++){var row=Cases[i];var fields=new System.Collections.Hashtable();foreach(var name in row[3].Split(','))if(name.Length>0)fields.Add(name,"original_handle");string text=Encode(79,"original_handle","original_handle",row[0],row[1],row[2],fields);using(var sha=System.Security.Cryptography.SHA256.Create())Need(System.BitConverter.ToString(sha.ComputeHash(System.Text.Encoding.UTF8.GetBytes(text))).Replace("-","").ToLowerInvariant()==hashes[i]);}}
}
public sealed partial class EasyedaDiagnosticOwner {
int forwardWriterFrontierRecords,forwardWriterFrontierCalls,forwardWriterFrontierReturns,forwardWriterFrontierFinalizers,forwardWriterFrontierCallbackRequests,forwardWriterFrontierQueueRequests,forwardWriterFrontierTimerStep,forwardWriterFrontierTimerHolds;
string forwardWriterFrontierCallbackHeld,forwardWriterFrontierTimerHeld;bool forwardWriterFrontierQueueOpened,forwardWriterFrontierQueueSeen,forwardWriterFrontierTimerComplete,forwardWriterFrontierComplete;
readonly System.Collections.Generic.HashSet<string> forwardWriterFrontierArms=new System.Collections.Generic.HashSet<string>(StringComparer.Ordinal);
static readonly string[] ForwardWriterFrontierTimerPhases={${timer.map(value => JSON.stringify(value)).join(",")}};
void RequireForwardWriterFrontier(){RequireForwardWriterProducer();if(forwardWriterFrontierRecords<1||forwardWriterFrontierComplete||footprintCreateClockBegun)throw Error("forward-writer-frontier-original-owner");}
public void BindForwardWriterFrontier(int records){RequireForwardWriterProducer();if(forwardWriterProducerEnrolled||forwardWriterFrontierRecords!=0||records<1||records>${String(LIMITS.records)})throw Error("forward-writer-frontier-bind");AssertLive();forwardWriterFrontierRecords=records;}
public void ControlForwardWriterFrontier(string operation,string role){RequireForwardWriterFrontier();AssertLive();
if(operation=="callback-held"){if(!forwardWriterProducerEnrolled||forwardWriterFrontierCallbackHeld!=null||forwardWriterFrontierTimerHeld!=null||forwardWriterFrontierQueueOpened)throw Error("forward-writer-frontier-held");if(role=="startupEntry"){if(forwardWriterFrontierCalls!=forwardWriterFrontierReturns||forwardWriterFrontierCalls>=forwardWriterFrontierRecords)throw Error("forward-writer-frontier-entry");forwardWriterFrontierCalls++;}else if(role=="startupReturn"){if(forwardWriterFrontierCalls!=forwardWriterFrontierReturns+1)throw Error("forward-writer-frontier-return");forwardWriterFrontierReturns++;}else if(role=="initialFinally"||role=="queuedFinally"){if(forwardWriterFrontierCalls!=forwardWriterFrontierReturns||forwardWriterFrontierFinalizers>=forwardWriterFrontierReturns)throw Error("forward-writer-frontier-finalizer");forwardWriterFrontierFinalizers++;}else throw Error("forward-writer-frontier-role");forwardWriterFrontierCallbackHeld=role;}
else if(operation=="timer-held"){if(!forwardWriterProducerEnrolled||forwardWriterFrontierCallbackHeld!=null||forwardWriterFrontierTimerHeld!=null||forwardWriterFrontierTimerHolds>=2||role!=(forwardWriterFrontierTimerHolds==0?"entry":"returned")||forwardWriterFrontierTimerStep!=(forwardWriterFrontierTimerHolds==0?17:22))throw Error("forward-writer-frontier-timer-held");forwardWriterFrontierTimerHolds++;forwardWriterFrontierTimerHeld=role;}
else if(operation=="timer-complete"){if(role!=null||forwardWriterFrontierTimerHeld!=null||forwardWriterFrontierTimerHolds!=2||forwardWriterFrontierTimerStep!=28||forwardWriterFrontierTimerComplete)throw Error("forward-writer-frontier-timer-complete");forwardWriterFrontierTimerComplete=true;}
else if(operation=="queue-open"){if(role!=null||!forwardWriterInitialSyncComplete||!forwardWriterFrontierTimerComplete||forwardWriterFrontierCallbackHeld!=null||forwardWriterFrontierCalls<1||forwardWriterFrontierCalls!=forwardWriterFrontierReturns||forwardWriterFrontierCalls!=forwardWriterFrontierFinalizers||forwardWriterFrontierQueueOpened)throw Error("forward-writer-frontier-original-queue");forwardWriterFrontierQueueOpened=true;}
else if(operation=="complete"){if(role!=null||!forwardWriterCacheCompleted||!forwardWriterInitialSyncComplete||!forwardWriterFrontierTimerComplete||!forwardWriterFrontierQueueOpened||!forwardWriterFrontierQueueSeen||forwardWriterFrontierCallbackHeld!=null||forwardWriterFrontierTimerHeld!=null||forwardWriterFrontierQueueRequests<2*forwardWriterFrontierCalls+3)throw Error("forward-writer-frontier-complete");forwardWriterFrontierComplete=true;}
else throw Error("forward-writer-frontier-control");}
static bool ForwardWriterFrontierCallbackPhase(string phase,string role){return phase=="project-save-structure-properties"||phase=="project-save-structure-frame-"+role||phase=="project-save-structure-resume-"+role||role=="startupEntry"&&(phase=="project-save-structure-frame-startupCaller"||phase=="project-save-structure-startupEntry")||role=="startupReturn"&&phase=="project-save-structure-startupReturn"||(role=="initialFinally"||role=="queuedFinally")&&phase=="project-save-structure-startupFinalizer";}
public void SendForwardWriterFrontier(int id,string lane,string phase,string method,System.Collections.IDictionary fields){RequireForwardWriterFrontier();if(fields==null)throw Error("forward-writer-frontier-fields");
if(lane=="callback"){if(phase.StartsWith("project-save-structure-arm-",StringComparison.Ordinal)){if(forwardWriterProducerEnrolled||forwardWriterFrontierArms.Count>=4||fields["scriptId"] as string!=forwardWriterProducerScript||!forwardWriterFrontierArms.Add(phase))throw Error("forward-writer-frontier-arm");}else{if(!forwardWriterProducerEnrolled||forwardWriterFrontierCallbackHeld==null||!ForwardWriterFrontierCallbackPhase(phase,forwardWriterFrontierCallbackHeld)||++forwardWriterFrontierCallbackRequests>18*forwardWriterFrontierRecords)throw Error("forward-writer-frontier-callback");if(method=="Debugger.resume")forwardWriterFrontierCallbackHeld=null;}}
else if(lane=="timer"){if(forwardWriterFrontierTimerStep>=28||ForwardWriterFrontierTimerPhases[forwardWriterFrontierTimerStep]!=phase||(forwardWriterFrontierTimerStep<17?forwardWriterProducerEnrolled:forwardWriterFrontierTimerHeld==null))throw Error("forward-writer-frontier-timer-sequence");if(phase.StartsWith("sync-quiesce-arm-",StringComparison.Ordinal)&&fields["scriptId"] as string!=forwardWriterProducerScript)throw Error("forward-writer-frontier-timer-script");forwardWriterFrontierTimerStep++;if(method=="Debugger.resume")forwardWriterFrontierTimerHeld=null;}
else if(lane=="queue"){if(!forwardWriterFrontierQueueOpened||forwardWriterFrontierCallbackHeld!=null||forwardWriterFrontierTimerHeld!=null||++forwardWriterFrontierQueueRequests>3*forwardWriterFrontierRecords+3||(phase!="project-save-structure-properties"&&phase!="inverse-startup-queue-empty"))throw Error("forward-writer-frontier-queue");if(phase=="inverse-startup-queue-empty"){if(forwardWriterFrontierQueueSeen)throw Error("forward-writer-frontier-queue-once");forwardWriterFrontierQueueSeen=true;}}
else throw Error("forward-writer-frontier-lane");
string encoded=EasyedaForwardWriterFrontierProtocol.Encode(id,footprintCopyWorkerSession,forwardWriterProducerContext,lane,phase,method,fields);CheckFootprintWork(id,false);AssertLive();SendMessage(id,encoded);}
public static void VerifyForwardWriterFrontierSmoke(){EasyedaForwardWriterFrontierProtocol.VerifySmoke();var o=CreateFootprintForwardWriter209();try{bool refused=false;try{o.ControlForwardWriterFrontier("complete",null);}catch(InvalidOperationException){refused=true;}if(!refused||o.forwardWriterFrontierComplete)throw Error("forward-writer-frontier-unissued-smoke");}finally{o.originalMain.Release();}}
}
`;
}
