/** V3-only physical natural Main read ledger. Backend consumes the exact
 * original command separately. There is no JSON readiness setter. */
import{currentFootprintInverseNativeDeleteFlowCases,currentFootprintInverseNativeDeleteFlowTemplate}from"./current-footprint-inverse-native-delete-flow-protocol.ts";
import{currentFootprintInverseNativeDeleteMainReadCases as cases,currentFootprintInverseNativeDeleteMainReadTemplate as template}from"./current-footprint-inverse-native-delete-main-read-protocol.ts";

const quote=(v:string):string=>`@"${v.replaceAll('"','""')}"`;
export function currentFootprintInverseNativeDeleteMainReadLedger(mainTotal:number):string{
 if(!Number.isSafeInteger(mainTotal)||mainTotal<78||mainTotal>4096){throw new Error("INVERSE_NATIVE_DELETE_MAIN_READ_LEDGER_BOUND");}
 const uploads=currentFootprintInverseNativeDeleteFlowCases().filter(c=>c.phase==="inverse-native-delete-flow"&&c.kind==="local"&&c.command.method==="Debugger.resume"&&c.command.role==="localIngress");const upload=uploads[0];if(uploads.length!==1||upload===undefined){throw new Error("INVERSE_NATIVE_DELETE_MAIN_READ_UPLOAD_ROSTER");}const firstUpload=currentFootprintInverseNativeDeleteFlowTemplate(upload).key;
 const commands=cases();const order=["arm","driver-step","frame","join-capture","properties-packet","properties-promise","join-resolved","join-value","remove","step","release"];
 const orders=(["branch","history","body"]as const).map(kind=>{
  const selected=kind==="history"?[...order.slice(0,7),"properties-projectSql","properties-table","properties-branches",...order.slice(7)]:order;
  return `new[]{${selected.map(part=>{const matches=commands.filter(c=>c.kind===kind&&c.phase.replace("inverse-native-delete-main-read-","")+("role"in c?"-"+c.role:"")===part);const command=matches[0];if(matches.length!==1||command===undefined){throw new Error("INVERSE_NATIVE_DELETE_MAIN_READ_LEDGER_ROSTER");}return quote(template(command).phase);}).join(",")}}`;
 });
 return String.raw`public sealed partial class EasyedaDiagnosticOwner{
readonly int[] dnmrStage=new int[3];int dnmrNormal,dnmrCleanup;bool dnmrFailed,dnmrPrearmed;bool dnwtReady=false;string dnmrScript;
static readonly string[][] DnmrOrders={__ORDERS__};
public void SendNativeDeleteMainRead(int id,string phase,string method,System.Collections.IDictionary fields){try{
AssertDsg();MainPurpose();AssertLive();if(!dsgReady||dnmrFailed||originalMain==null||fields==null||id!=mainRequest+1||id-stockMainRequests>__TOTAL__)throw Error("inverse-native-delete-main-read-original");
int kind=-1;for(int i=0;i<3;i++){string[] candidate=DnmrOrders[i];if(dnmrStage[i]<candidate.Length&&phase==candidate[dnmrStage[i]]){if(kind!=-1)throw Error("inverse-native-delete-main-read-alias");kind=i;}}
if(kind<0)throw Error("inverse-native-delete-main-read-order");bool arm=dnmrStage[kind]==0;
if(arm){if(kind==0){if(dflBound||dnmPre!=16||!dflMainRequestReady)throw Error("inverse-native-delete-main-read-preupload");dnmrScript=InverseDeleteBindingHandle(fields["scriptId"]);if(dnmrScript!=dnmScript)throw Error("inverse-native-delete-main-read-script");}
else{int previous=kind-1;string[] before=DnmrOrders[previous];if(dnmrStage[previous]!=before.Length-3)throw Error("inverse-native-delete-main-read-successor-arm");}
if(fields["scriptId"] as string!=dnmrScript)throw Error("inverse-native-delete-main-read-script");
}else{if(!dflBound||!dflLocalReady||dflLocalHolds==0&&dflPending!="local:localIngress"||dnmSteps!=3||dnmBegin!=DnmBegin.Length||dnmHistory!=DnmHistory.Length)throw Error("inverse-native-delete-main-read-original-upload");}
bool cleanup=method=="Debugger.removeBreakpoint"||method=="Runtime.releaseObjectGroup";
if(cleanup?dnmrCleanup>=6:dnmrNormal>=30)throw Error("inverse-native-delete-main-read-capacity");
string encoded=NativeDeleteMainReadMessage(id,phase,method,fields);if(cleanup)dnmrCleanup++;else dnmrNormal++;dnmrStage[kind]++;mainRequest=id;originalMain.SendFixed(encoded,cleanup);AssertLive();if(arm&&kind==0){if(dnmrPrearmed)throw Error("inverse-native-delete-main-read-prearmed-once");dnmrPrearmed=true;}
}catch{dnmrFailed=true;throw;}}
public void SendNativeDeleteFlowV3(int id,string phase,string method,System.Collections.IDictionary fields){
try{if(dnmrFailed||dsgFailed)throw Error("inverse-native-delete-flow-v3-failed");
if(method=="Debugger.resume"&&phase==__FIRST_UPLOAD__&&(!dnmrPrearmed||!dsgReady||!dnwtReady))throw Error("inverse-native-delete-flow-v3-tail-unarmed");
SendNativeDeleteFlow(id,phase,method,fields);
}catch{dnmrFailed=true;throw;}}
}
`.replace("__FIRST_UPLOAD__",quote(firstUpload)).replace("__TOTAL__",String(mainTotal)).replace("__ORDERS__",orders.join(","));
}
