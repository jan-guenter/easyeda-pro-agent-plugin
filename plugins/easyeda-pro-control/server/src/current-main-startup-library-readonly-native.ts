import { CURRENT_MAIN_STARTUP_LIBRARY_READONLY_SOURCE as SOURCE } from "./current-main-startup-library-readonly-source.ts";
import { CURRENT_MAIN_STARTUP_LIBRARY_READONLY_PROGRAM as PROOF } from "./current-main-startup-library-readonly-program.ts";
import { validateCurrentMainStartupLibraryReadonlyCommand } from "./current-main-startup-library-readonly-protocol.ts";
import type { CurrentMainStartupLibraryReadonlyCommand as Command } from "./current-main-startup-library-readonly-protocol.ts";
import { CURRENT_SELECTED_FILE_MAIN_SQL_FENCE_CALL_FLAGS as CALL, CURRENT_SELECTED_FILE_MAIN_SQL_FENCE_FRAME_FLAGS as FRAME } from "./current-selected-file-main-sql-fence-protocol.ts";
import { CURRENT_SELECTED_FILE_MAIN_SQL_FENCE_REQUIRE_PROGRAM as REQUIRE } from "./current-selected-file-main-sql-fence-programs.ts";

import { CURRENT_MAIN_STARTUP_LIBRARY_READONLY_PROFILE as PROFILE } from "./current-main-startup-library-readonly-profile.ts";

const marker=(name:string):string=>`__selectedsql_${name}__`;
export function currentMainStartupLibraryReadonlyWire(input:unknown,id:number):Readonly<{command:Command & Readonly<{id:number}>;request:Readonly<Record<string,string|number>>}> {
  if(!Number.isSafeInteger(id)||id<1||id>2_147_483_647) { throw new Error("STOCK_READONLY_REQUEST_ID"); }
  const command=validateCurrentMainStartupLibraryReadonlyCommand(input),request:Record<string,string|number>={action:"main-send",requestId:id,phase:command.phase,method:command.method};
  if(command.method==="Debugger.evaluateOnCallFrame") { request["callFrameId"]=command.params.callFrameId; }
  else if(command.method==="Debugger.getPossibleBreakpoints") { request["scriptId"]=command.params.start.scriptId; }
  else if(command.method==="Debugger.setBreakpoint") { request["scriptId"]=command.params.location.scriptId; }
  else if(command.method==="Debugger.removeBreakpoint") { request["breakpointId"]=command.params.breakpointId; }
  else if(command.method==="Runtime.callFunctionOn") {
    request["objectId"]=command.params.objectId;
    for(const [index,argument] of command.params.arguments.entries()) { request[`argument${String(index)}`]=argument.objectId; }
  }
  return {command:{...command,id},request};
}
export function currentMainStartupLibraryReadonlyNativeCases():readonly Command[] {
  const callFrameId=marker("callFrameId"),objectId=marker("objectId"),scriptId=marker("scriptId");
  const ref=(index:number):Readonly<{objectId:string}>=>({objectId:marker(`argument${String(index)}`)});
  return [
    {phase:"sql-stock-readonly-points",method:"Debugger.getPossibleBreakpoints",params:{start:{scriptId,...SOURCE.start},end:{scriptId,...SOURCE.end},restrictToFunction:true}},
    {phase:"sql-stock-readonly-arm",method:"Debugger.setBreakpoint",params:{location:{scriptId,...SOURCE.point},condition:"true"}},
    {phase:"sql-stock-readonly-frame",method:"Debugger.evaluateOnCallFrame",params:{...FRAME,callFrameId,expression:SOURCE.frameExpression}},
    {phase:"sql-stock-readonly-proof",method:"Runtime.callFunctionOn",params:{...CALL,objectId,functionDeclaration:PROOF,arguments:[ref(0),ref(1),ref(2)],returnByValue:true}},
    ...(["remove-return","remove-failure","disarm-normal"] as const).map(phase=>({phase:`sql-stock-readonly-${phase}` as const,method:"Debugger.removeBreakpoint" as const,params:{breakpointId:marker("breakpointId")}})),
    {phase:"sql-stock-readonly-require",method:"Runtime.callFunctionOn",params:{...CALL,objectId,functionDeclaration:REQUIRE,arguments:[],returnByValue:true}},
    {phase:"sql-stock-readonly-resume",method:"Debugger.resume",params:{}},
  ];
}
export function currentMainStartupLibraryReadonlyNativeRows():readonly string[] {
  return currentMainStartupLibraryReadonlyNativeCases().map(command=>{
    const wire=currentMainStartupLibraryReadonlyWire(command,1);
    const fields=Object.keys(wire.request).filter(key=>!["action","requestId","phase","method"].includes(key)),template=JSON.stringify({method:command.method,params:command.params});
    if(fields.some(name=>wire.request[name]!==marker(name)||!template.includes(JSON.stringify(marker(name))))||Buffer.byteLength(template)>16_384) { throw new Error("STOCK_READONLY_NATIVE_ROW"); }
    return [command.phase,command.method,fields.join(","),template].join("\t");
  });
}

/** Separate ordinary transport ledger. A readonly rethrow leaves every V2
 * success counter untouched, including its unfinished first native call. */
export function currentMainStartupLibraryReadonlyNativeFragment():string {
  return `public sealed partial class EasyedaDiagnosticOwner {
int stockReadonlyStage,stockReadonlyRequests;
bool StockReadonlyRejected(){return stockReadonlyStage==8&&stockReadonlyRequests==${String(PROFILE.rejectionPathRequests)}&&stockMainStage==10&&stockMainCalls==1&&stockMainRequests==10;}
void SendStockReadonlyMain(int id,string phase,string method,System.Collections.IDictionary fields){
MainPurpose();AssertLive();if(!stockMainEligible||id!=mainRequest+1||stockReadonlyRequests>=${String(PROFILE.maximumRequests)})throw Error("stock-readonly-original-owner");
bool normal=stockReadonlyStage==2&&phase=="sql-stock-readonly-disarm-normal";
if(stockReadonlyStage<2){if(stockMainStage!=7||stockMainCalls!=0||stockMainRequests!=7)throw Error("stock-readonly-original-first-run");}
else if(normal){if(stockMainStage!=17||stockMainCalls!=332||stockMainRequests!=2000)throw Error("stock-readonly-original-normal-return");}
else if(stockMainStage!=10||stockMainCalls!=1||stockMainRequests!=10)throw Error("stock-readonly-original-first-rejection");
string[] phases={"points","arm","frame","proof","remove-return","remove-failure","require","resume"};
if(!normal&&(stockReadonlyStage>=8||phase!="sql-stock-readonly-"+phases[stockReadonlyStage]))throw Error("stock-readonly-phase-order");
string text=EasyedaSelectedFileMainSqlFenceProtocol.Encode(id,phase,method,fields);stockReadonlyRequests++;stockReadonlyStage=normal?9:stockReadonlyStage+1;mainRequest=id;originalMain.SendFixed(text,false);AssertLive();
}
public static void VerifyStockReadonlyLedgerSmoke(){var o=new EasyedaDiagnosticOwner(false,false,true);try{
if(o.StockReadonlyRejected())throw Error("stock-readonly-unborn-smoke");o.stockReadonlyStage=8;o.stockReadonlyRequests=8;o.stockMainStage=10;o.stockMainCalls=1;o.stockMainRequests=10;
if(!o.StockReadonlyRejected())throw Error("stock-readonly-barrier-smoke");o.stockMainStage=19;if(o.StockReadonlyRejected())throw Error("stock-readonly-not-normal-smoke");
}finally{if(o.originalMain!=null)o.originalMain.Release();}}
}
`;
}
