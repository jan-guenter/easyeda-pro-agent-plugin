/** Separate native DELETE_DOC catalogue over unchanged pure capture syntax.
 * No Via source, owner, result or continuation registry is enrolled here. */
import { types } from "node:util";
import { CURRENT_MAIN_CAPTURED_SCOPE_FRAMES as FRAMES } from "./current-main-captured-scope-frames.ts";
import { CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_MAIN_BEGIN_CALLS as BEGIN } from "./current-footprint-inverse-native-delete-main-begin-programs.ts";
import { CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_MAIN_HISTORY_PROGRAMS as HISTORY } from "./current-footprint-inverse-native-delete-main-history-programs.ts";
import { currentMainCapturedBookkeepingProgram as bookkeeping, currentMainCapturedCallbackRebaseProgram as callbackJoin, currentMainCapturedRebaseProgram as join } from "./current-footprint-inverse-native-delete-main-captured-rebase.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";

export const CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_MAIN_BEGIN_REBASE=freezeDeep({
 run:join(FRAMES.beginRun,BEGIN.run.program,["capture","transactionPacket"],"capture",BEGIN.run.length),
 callback:callbackJoin(FRAMES.beginCallback,BEGIN.callback.program),
});
export const CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_MAIN_BEGIN_BOOKKEEPING=freezeDeep({
 save:bookkeeping(BEGIN.save,13),transaction:bookkeeping(BEGIN.transaction,13),returned:bookkeeping(BEGIN.returned,15),
});
export const CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_MAIN_HISTORY_REBASE=freezeDeep({
 runData:join(FRAMES.historyRun,HISTORY.runData.program,["caller","cipherPacket","capture"],"capture",HISTORY.runData.length),
 runHead:join(FRAMES.historyRun,HISTORY.runHead.program,["caller","cipherPacket","capture"],"capture",HISTORY.runHead.length),
 runBranch:join(FRAMES.historyRun,HISTORY.runBranch.program,["caller","cipherPacket","capture"],"capture",HISTORY.runBranch.length),
 runCommit:join(FRAMES.historyRun,HISTORY.runCommit.program,["caller","cipherPacket","capture"],"capture",HISTORY.runCommit.length),
 runProject:join(FRAMES.historyRun,HISTORY.runProject.program,["caller","cipherPacket","capture"],"capture",HISTORY.runProject.length),
 sqlCallback:callbackJoin(FRAMES.historyCallback,HISTORY.sqlCallback.program),
});
export const CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_MAIN_HISTORY_BOOKKEEPING=freezeDeep({
 callback:bookkeeping(HISTORY.callback,13),branch:bookkeeping(HISTORY.branch,19,"branch"),branchValue:bookkeeping(HISTORY.branchValue,19),writer:bookkeeping(HISTORY.writer,19),
 encryptEntry:bookkeeping(HISTORY.encryptEntry,19,"encrypt"),cipher:bookkeeping(HISTORY.cipher,19),cipherValue:bookkeeping(HISTORY.cipherValue,19),sqlValue:bookkeeping(HISTORY.sqlValue,19),
 sqlCallbackValue:bookkeeping(HISTORY.sqlCallbackValue,19),commitReturned:bookkeeping(HISTORY.commitReturned,19),projectReturned:bookkeeping(HISTORY.projectReturned,19),
 saveReturned:bookkeeping(HISTORY.saveReturned,19),controllerReturned:bookkeeping(HISTORY.controllerReturned,19),
});
function plain(value:unknown):value is Record<string,unknown>{return value!==null&&typeof value==="object"&&!types.isProxy(value)&&!Array.isArray(value)&&(Object.getPrototypeOf(value)===Object.prototype||Object.getPrototypeOf(value)===null);}
export function captureCurrentFootprintInverseNativeDeleteMainCommand(input:unknown):unknown{
 if(!plain(input)){return captureCurrentPcbStringClockReply(input).value;}
 const phase=Object.getOwnPropertyDescriptor(input,"phase");const params=Object.getOwnPropertyDescriptor(input,"params");const raw:unknown=params?.value;
 if(phase===undefined||!Object.hasOwn(phase,"value")||params===undefined||!Object.hasOwn(params,"value")||!plain(raw)){return captureCurrentPcbStringClockReply(input).value;}
 let fixed:Readonly<Record<string,Readonly<{program:string}>>>|null=null;
 if(phase.value==="inverse-native-delete-main-begin-rebase"){fixed=CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_MAIN_BEGIN_REBASE;}
 else if(phase.value==="inverse-native-delete-main-history-rebase"){fixed=CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_MAIN_HISTORY_REBASE;}
 else if(phase.value==="inverse-native-delete-main-begin-bookkeeping"){fixed=CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_MAIN_BEGIN_BOOKKEEPING;}
 else if(phase.value==="inverse-native-delete-main-history-bookkeeping"){fixed=CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_MAIN_HISTORY_BOOKKEEPING;}
 const declaration=Object.getOwnPropertyDescriptor(raw,"functionDeclaration");const source:unknown=declaration?.value;
 if(fixed===null||declaration===undefined||!Object.hasOwn(declaration,"value")||typeof source!=="string"||!Object.values(fixed).some(row=>row.program===source)){return captureCurrentPcbStringClockReply(input).value;}
 const inner=Object.getOwnPropertyDescriptors(raw),outer=Object.getOwnPropertyDescriptors(input);
 inner["functionDeclaration"]={...declaration,value:"fixed-original-native-delete-main-capture"};outer["params"]={...params,value:Object.create(null,inner) as unknown};
 const captured=captureCurrentPcbStringClockReply(Object.create(null,outer)).value;
 if(!plain(captured)||!plain(captured["params"])){throw new Error("INVERSE_NATIVE_DELETE_MAIN_CAPTURE");}
 return{...captured,params:{...captured["params"],functionDeclaration:source}};
}
