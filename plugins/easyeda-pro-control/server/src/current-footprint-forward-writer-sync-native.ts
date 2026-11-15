/** Exact shared readonly sync syntax with an independent full-purpose
 * nine-hold ledger. Inverse native state and helper selectors are excluded. */
import { currentFootprintInverseInitialSyncNativeSource } from "./current-footprint-inverse-initial-sync-native.ts";

export function currentFootprintForwardWriterSyncNativeSource(): string {
  const marker = "public sealed partial class EasyedaDiagnosticOwner{", original = currentFootprintInverseInitialSyncNativeSource();
  if (original.split(marker).length !== 2 || !original.startsWith("internal static class EasyedaFootprintInverseInitialSyncProtocol{")) { throw new Error("FORWARD_WRITER_SYNC_CODEBOOK_SOURCE"); }
  const codec = original.slice(0, original.indexOf(marker)).replaceAll("EasyedaFootprintInverseInitialSyncProtocol", "EasyedaForwardWriterInitialSyncProtocol");
  return `${codec}
public sealed partial class EasyedaDiagnosticOwner {
int forwardWriterInitialSyncStage,forwardWriterInitialSyncHolds;string forwardWriterInitialSyncHeld;bool forwardWriterInitialSyncComplete,forwardWriterInitialSyncFailed;
static readonly string[] ForwardWriterInitialSyncRoles={"syncEntry","syncFull","syncHistory","syncHistory","syncHistory","syncHistory","syncMerged","syncFinalizing","syncReturned"};
void RequireForwardWriterInitialSync(){RequireForwardWriterProducer();if(!forwardWriterProducerEnrolled||!forwardWriterCacheCompleted||!forwardHeadCompleted||forwardWriterInitialSyncFailed||forwardWriterInitialSyncComplete||footprintCreateClockBegun)throw Error("forward-writer-sync-original-owner");}
public void HoldForwardWriterInitialSync(string role){RequireForwardWriterInitialSync();if(forwardWriterInitialSyncHeld!=null||forwardWriterInitialSyncHolds>=9||ForwardWriterInitialSyncRoles[forwardWriterInitialSyncHolds]!=role)throw Error("forward-writer-sync-hold");AssertLive();forwardWriterInitialSyncHolds++;forwardWriterInitialSyncHeld=role;}
public void SendForwardWriterInitialSync(int id,string phase,string method,System.Collections.IDictionary fields){
RequireForwardWriterInitialSync();if(fields==null||EasyedaForwardWriterInitialSyncProtocol.Observation(phase)||phase=="inverse-initial-sync-helper")throw Error("forward-writer-sync-fixed-cursor");
int expected=forwardWriterInitialSyncStage<45?forwardWriterInitialSyncStage:forwardWriterInitialSyncStage-2;
if(forwardWriterInitialSyncStage>=47||EasyedaForwardWriterInitialSyncProtocol.Index(phase)!=expected||forwardWriterInitialSyncStage<43&&forwardWriterInitialSyncHeld==null)throw Error("forward-writer-sync-once-order");
if(phase.StartsWith("inverse-initial-sync-history-",StringComparison.Ordinal)){int ordinal=phase[phase.Length-1]-'0';if(ordinal<1||ordinal>4||forwardWriterHistoryStep<ordinal*13)throw Error("forward-writer-sync-main-history-required");}
string encoded=EasyedaForwardWriterInitialSyncProtocol.Encode(id,footprintCopyWorkerSession,phase,method,fields);CheckFootprintWork(id,false);AssertLive();forwardWriterInitialSyncStage++;if(method=="Debugger.resume")forwardWriterInitialSyncHeld=null;try{SendMessage(id,encoded);}catch{forwardWriterInitialSyncFailed=true;throw;}
}
public void CompleteForwardWriterInitialSync(){RequireForwardWriterInitialSync();if(forwardWriterInitialSyncHeld!=null||forwardWriterInitialSyncHolds!=9||forwardWriterHistoryStep!=52||forwardWriterInitialSyncStage!=45&&forwardWriterInitialSyncStage!=47)throw Error("forward-writer-sync-complete");AssertLive();forwardWriterInitialSyncComplete=true;}
public static void VerifyForwardWriterSyncSmoke(){EasyedaForwardWriterInitialSyncProtocol.VerifySmoke();var o=CreateFootprintForwardWriter209();try{bool refused=false;try{o.CompleteForwardWriterInitialSync();}catch(InvalidOperationException){refused=true;}if(!refused||o.forwardWriterInitialSyncComplete)throw Error("forward-writer-sync-unissued-smoke");}finally{o.originalMain.Release();}}
}
`;
}
