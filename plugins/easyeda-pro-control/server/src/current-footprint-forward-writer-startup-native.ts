/** Original SQL/stock startup for the distinct full-writer birth. The old
 * forward codebook remains frozen; this role uses the maintained programs. */
import { currentFootprintForwardWriterSelectedFileMainSqlFenceNativeSource } from "./current-selected-file-main-sql-fence-native.ts";
import { currentFootprintForwardWriterMainStartupLibraryNativeFragment } from "./current-main-startup-library-v2-native.ts";
import { CURRENT_MAIN_STARTUP_LIBRARY_V2 as STOCK } from "./current-main-startup-library-v2-profile.ts";
import { currentFootprintForwardWriterProfile } from "./current-footprint-forward-writer-profile.ts";

/** Shared startup dispatch, bounded by original stock-await state and the
 * same physical Main ID. SQL calls cannot use the old backend codec. */
export const CURRENT_FOOTPRINT_FORWARD_WRITER_STARTUP_DISPATCH = `
    if(forwardWriterBirth){
      if(phase!=null&&phase.StartsWith("sql-stock-v2-",StringComparison.Ordinal)){SendStockMain(id,phase,method,fields);return;}
      if(phase!=null&&phase.StartsWith("sql-stock-readonly-",StringComparison.Ordinal)){SendStockReadonlyMain(id,phase,method,fields);return;}
      if(phase!=null&&phase.StartsWith("sql-fence-startup-registration-",StringComparison.Ordinal))ReserveStockRegistrationMain(id,phase,method,fields);
      if((phase=="sql-fence-startup-config-resume"||phase=="sql-fence-startup-read-owner"||phase=="sql-fence-startup-user-read-owner")&&!(stockMainRequests>0&&(stockMainStage==10||stockMainStage==13)))throw Error("stock-interleave-await-required");
      if(stockMainRequests>0&&stockMainStage!=19&&!StockReadonlyRejected()&&(phase=="resume"||phase=="remove"||phase=="sql-fence-resume"))throw Error("stock-unfinished-registration");
      if(id!=mainRequest+1||id-stockMainRequests>EasyedaFootprintForwardExecutionLimits.MainRequests-${String(STOCK.requests)})throw Error("forward-writer-ordinary-main-id");
      if(phase!=null&&phase.StartsWith("sql-fence-",StringComparison.Ordinal)){
        if(footprintClockRpcActive||footprintCreateClockActive||mainCompletionBegun)throw Error("forward-writer-startup-closed");
        MainPurpose();AssertLive();string startupText=EasyedaSelectedFileMainSqlFenceProtocol.Encode(id,phase,method,fields);mainRequest=id;originalMain.SendFixed(startupText,false);StockRegistrationMainComplete(phase);AssertLive();return;
      }
    }
`;

/** Exactly the common readonly SQL table and original2002-call stock state.
 * No constructor is exposed and no production owner is allocated here. */
export function currentFootprintForwardWriterStartupNativeSource(): string {
  const profile = currentFootprintForwardWriterProfile();
  return `${currentFootprintForwardWriterSelectedFileMainSqlFenceNativeSource()}\n${currentFootprintForwardWriterMainStartupLibraryNativeFragment()}
public sealed partial class EasyedaDiagnosticOwner {
public static void VerifyForwardWriterStartupSmoke(){
EasyedaSelectedFileMainSqlFenceProtocol.VerifySmoke();var o=CreateFootprintForwardWriter209();
try{if(!o.forwardWriterBirth||!o.stockMainEligible||o.stockMainRequests!=0||o.stockMainStage!=0)throw Error("forward-writer-startup-birth-smoke");
bool refused=false;try{o.SendMain(1,"sql-fence-startup-user-read-owner","Runtime.callFunctionOn",new System.Collections.Hashtable());}catch(InvalidOperationException){refused=true;}
if(!refused||o.mainRequest!=0||o.stockMainRequests!=0)throw Error("forward-writer-startup-await-smoke");
if(EasyedaFootprintForwardExecutionLimits.MainNormal!=${String(profile.main.normalRequestLimit)}||EasyedaFootprintForwardExecutionLimits.MainRequests!=${String(profile.main.requestLimit)})throw Error("forward-writer-startup-limits-smoke");
}finally{o.originalMain.Release();}}
}
`;
}
