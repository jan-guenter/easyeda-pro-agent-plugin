/** Shared inert readonly syntax, separate original full-purpose Main state. */
import { currentFootprintInverseMainHistoryNativeSource } from "./current-footprint-inverse-main-history-native.ts";
import { CURRENT_FOOTPRINT_INVERSE_MAIN_HISTORY_REQUESTS as REQUESTS } from "./current-footprint-inverse-main-history-protocol.ts";
import { currentFootprintForwardWriterProfile } from "./current-footprint-forward-writer-profile.ts";

/** Do not import inverse owner state or loosen the Main WebSocket framing
 * contract. Exactly one terminal pipe NUL is removed at this fixed seam. */
export function currentFootprintForwardWriterHistoryNativeSource(): string {
  const marker = "public sealed partial class EasyedaDiagnosticOwner {", original = currentFootprintInverseMainHistoryNativeSource(), profile = currentFootprintForwardWriterProfile();
  if (original.split(marker).length !== 2 || !original.startsWith("public static class EasyedaFootprintInverseMainHistoryProtocol {")) { throw new Error("FORWARD_WRITER_HISTORY_CODEBOOK_SOURCE"); }
  const codec = original.slice(0, original.indexOf(marker)).replaceAll("EasyedaFootprintInverseMainHistoryProtocol", "EasyedaForwardWriterMainHistoryProtocol");
  return `${codec}
public sealed partial class EasyedaDiagnosticOwner {
int forwardWriterHistoryStep,forwardWriterHistoryNormal,forwardWriterHistoryCleanup;
static string ForwardWriterHistoryMessage(string framed){if(framed==null||framed.Length<3||framed[0]!='{'||framed[framed.Length-2]!='}'||framed[framed.Length-1]!=(char)0||framed.IndexOf((char)0)!=framed.Length-1)throw Error("forward-writer-history-frame");return framed.Substring(0,framed.Length-1);}
public void SendForwardWriterMainHistory(int id,string phase,string method,System.Collections.IDictionary fields){
RequireForwardWriterProducer();if(!forwardWriterProducerEnrolled||!forwardWriterCacheCompleted||!forwardHeadCompleted||originalMain==null||!originalMain.ForwardExecutionProfile||footprintCreateClockBegun||mainCompletionBegun)throw Error("forward-writer-history-original-owner");
string[] steps={"inverse-main-history-arm","inverse-main-history-frame","inverse-main-history-join-capture","inverse-main-history-properties-packet","inverse-main-history-properties-promise","inverse-main-history-join-resolved","inverse-main-history-properties-projectSql","inverse-main-history-properties-table","inverse-main-history-properties-branches","inverse-main-history-join-value","inverse-main-history-remove","inverse-main-history-step","inverse-main-history-release"};
if(id!=mainRequest+1||id-stockMainRequests>${String(profile.main.ordinaryNormalRequestLimit + profile.main.cleanupRequestLimit)}||forwardWriterHistoryStep>=${String(REQUESTS.repetitions)}*steps.Length||phase!=steps[forwardWriterHistoryStep%steps.Length])throw Error("forward-writer-history-order");
bool cleanup=phase=="inverse-main-history-remove"||phase=="inverse-main-history-release";if(cleanup?forwardWriterHistoryCleanup>=${String(REQUESTS.repetitions * REQUESTS.cleanup)}:forwardWriterHistoryNormal>=${String(REQUESTS.repetitions * REQUESTS.normal)})throw Error("forward-writer-history-class");
string message=ForwardWriterHistoryMessage(EasyedaForwardWriterMainHistoryProtocol.Encode(id,phase,method,fields));MainPurpose();AssertLive();forwardWriterHistoryStep++;if(cleanup)forwardWriterHistoryCleanup++;else forwardWriterHistoryNormal++;mainRequest=id;originalMain.SendFixed(message,cleanup);AssertLive();
}
public static void VerifyForwardWriterHistorySmoke(){EasyedaForwardWriterMainHistoryProtocol.VerifySmoke();string text="{\\"id\\":1}";if(ForwardWriterHistoryMessage(text+"\\0")!=text)throw Error("forward-writer-history-frame-smoke");bool denied=false;try{ForwardWriterHistoryMessage(text+"\\0\\0");}catch(InvalidOperationException){denied=true;}if(!denied)throw Error("forward-writer-history-double-frame-smoke");var o=CreateFootprintForwardWriter209();try{denied=false;try{o.SendForwardWriterMainHistory(1,"inverse-main-history-arm","Debugger.setBreakpoint",new System.Collections.Hashtable());}catch(InvalidOperationException){denied=true;}if(!denied||o.forwardWriterHistoryStep!=0)throw Error("forward-writer-history-unissued-smoke");}finally{o.originalMain.Release();}}
}
`;
}
