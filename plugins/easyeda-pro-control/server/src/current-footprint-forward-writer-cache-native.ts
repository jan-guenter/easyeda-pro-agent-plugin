/** Shared inert cache syntax with a separate original full-writer ledger. */
import { currentFootprintInverseInitialCacheNativeSource } from "./current-footprint-inverse-initial-cache-native.ts";

/** Retain only the stateless codebook. Inverse owner fields, constructors,
 * controls and cleanup never enter this purpose's emitted role. */
export function currentFootprintForwardWriterCacheNativeSource(): string {
  const marker = "public sealed partial class EasyedaDiagnosticOwner{", original = currentFootprintInverseInitialCacheNativeSource();
  if (original.split(marker).length !== 2 || !original.startsWith("internal static class EasyedaFootprintInverseInitialCacheProtocol{")) { throw new Error("FORWARD_WRITER_CACHE_CODEBOOK_SOURCE"); }
  const codec = original.slice(0, original.indexOf(marker)).replaceAll("EasyedaFootprintInverseInitialCacheProtocol", "EasyedaForwardWriterInitialCacheProtocol");
  return `${codec}
public sealed partial class EasyedaDiagnosticOwner {
int forwardWriterCacheJobs,forwardWriterCacheRequests,forwardWriterCacheHolds,forwardWriterCacheSlot=-1;string forwardWriterCacheHeld;bool forwardWriterCacheCompleted;
readonly int[] forwardWriterCacheStages=new int[8],forwardWriterCacheSamples=new int[8];
public void BindForwardWriterInitialCache(int jobs){RequireForwardWriterProducer();if(forwardWriterProducerEnrolled||forwardWriterCacheJobs!=0||jobs<2||jobs>8)throw Error("forward-writer-cache-bind");AssertLive();forwardWriterCacheJobs=jobs;}
public void HoldForwardWriterInitialCache(string role){RequireForwardWriterProducer();if(!forwardWriterProducerEnrolled||forwardWriterCacheJobs<2||forwardWriterCacheCompleted||forwardWriterCacheHeld!=null||forwardWriterCacheHolds>=3*forwardWriterCacheJobs||(role!="headEntry"&&role!="headPromise"&&role!="headSuccess"))throw Error("forward-writer-cache-hold");AssertLive();forwardWriterCacheHolds++;forwardWriterCacheHeld=role;forwardWriterCacheSlot=-1;}
public void SendForwardWriterInitialCache(int id,string phase,string method,System.Collections.IDictionary fields){
RequireForwardWriterProducer();if(!forwardWriterProducerEnrolled||forwardWriterCacheJobs<2||forwardWriterCacheCompleted||forwardWriterCacheRequests>=8*forwardWriterCacheJobs||fields==null||EasyedaForwardWriterInitialCacheProtocol.Observation(phase))throw Error("forward-writer-cache-original");
int slot=phase.Length>1?phase[phase.Length-1]-'0':-1;if(slot<0||slot>=forwardWriterCacheJobs)throw Error("forward-writer-cache-slot");string action=phase.Substring(0,phase.Length-2);int stage=forwardWriterCacheStages[slot],next=-1;
if(action=="inverse-initial-cache-flow"||action=="inverse-initial-cache-head"){if(stage!=0||forwardWriterCacheHeld!="headEntry")throw Error("forward-writer-cache-entry");next=1;}
else if(action=="inverse-initial-cache-promise"){if(stage!=2||forwardWriterCacheHeld!="headPromise")throw Error("forward-writer-cache-promise");next=3;}
else if(action=="inverse-initial-cache-success"){if(stage!=4||forwardWriterCacheHeld!="headSuccess")throw Error("forward-writer-cache-success");next=5;}
else if(action.StartsWith("inverse-initial-cache-resume-",StringComparison.Ordinal)){string role=action.Substring("inverse-initial-cache-resume-".Length);if(forwardWriterCacheHeld!=role||forwardWriterCacheSlot!=slot||stage!=(role=="headEntry"?1:role=="headPromise"?3:role=="headSuccess"?5:-1))throw Error("forward-writer-cache-resume");next=stage+1;}
else if(action=="inverse-initial-cache-settled"){if(stage!=6||forwardWriterCacheSamples[slot]>=2)throw Error("forward-writer-cache-settlement");forwardWriterCacheSamples[slot]++;}else throw Error("forward-writer-cache-role");
string encoded=EasyedaForwardWriterInitialCacheProtocol.Encode(id,footprintCopyWorkerSession,phase,method,fields);CheckFootprintWork(id,false);AssertLive();forwardWriterCacheRequests++;
if(next>=0){forwardWriterCacheStages[slot]=next;if(method=="Debugger.resume"){forwardWriterCacheHeld=null;forwardWriterCacheSlot=-1;}else forwardWriterCacheSlot=slot;}SendMessage(id,encoded);
}
public void CompleteForwardWriterInitialCache(){RequireForwardWriterProducer();if(forwardWriterCacheJobs<2||forwardWriterCacheCompleted||forwardWriterCacheHeld!=null)throw Error("forward-writer-cache-complete");for(int i=0;i<forwardWriterCacheJobs;i++)if(forwardWriterCacheStages[i]!=6||forwardWriterCacheSamples[i]<1)throw Error("forward-writer-cache-pending");AssertLive();forwardWriterCacheCompleted=true;}
public static void VerifyForwardWriterCacheSmoke(){EasyedaForwardWriterInitialCacheProtocol.VerifySmoke();var o=CreateFootprintForwardWriter209();try{bool denied=false;try{o.CompleteForwardWriterInitialCache();}catch(InvalidOperationException){denied=true;}if(!denied||o.forwardWriterCacheCompleted)throw Error("forward-writer-cache-unissued-smoke");}finally{o.originalMain.Release();}}
}
`;
}
