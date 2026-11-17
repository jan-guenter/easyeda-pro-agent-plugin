/** Original Backend-owned pause algorithm. Fixed passive reads precede each
 * one-shot native continuation; a failed proof never advances SQL. */
import { z } from "zod";
import type { NativeSqlInventory } from "./sqlite-inventory-core.ts";
import { decodeNativeHistoryChunk } from "./native-history.ts";
import { CURRENT_FOOTPRINT_FORWARD_WRITER_MAIN_MUTATION_EXPRESSIONS as EXPRESSIONS, CURRENT_FOOTPRINT_FORWARD_WRITER_MAIN_MUTATION_ORDER as ORDER, CURRENT_FOOTPRINT_FORWARD_WRITER_MAIN_MUTATION_PROGRAM as PROGRAM } from "./current-footprint-forward-writer-main-mutation-programs.ts";
import { CURRENT_FOOTPRINT_FORWARD_WRITER_MAIN_MUTATION_CALL_FLAGS as CALL, CURRENT_FOOTPRINT_FORWARD_WRITER_MAIN_MUTATION_FRAME_FLAGS as FRAME } from "./current-footprint-forward-writer-main-mutation-protocol.ts";
import type { CurrentFootprintForwardWriterMainMutationCommand as Command } from "./current-footprint-forward-writer-main-mutation-protocol.ts";
import { CURRENT_SELECTED_FILE_MAIN_SQL_CAPTURED_FRAME_EXPRESSIONS as RAW, CURRENT_SELECTED_FILE_MAIN_SQL_CAPTURED_FRAME_PROGRAM as READ, CURRENT_SELECTED_FILE_MAIN_SQL_FENCE_REQUIRE_PROGRAM as REQUIRE } from "./current-selected-file-main-sql-fence-programs.ts";
import { decodeCurrentFootprintCopyMainRequestArrayCapture } from "./current-footprint-copy-main-request-protocol.ts";

const handle=z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
const location=z.looseObject({scriptId:handle,lineNumber:z.number().int().nonnegative(),columnNumber:z.number().int().nonnegative()});
const frame=z.looseObject({callFrameId:handle,functionName:z.string().max(128),location,functionLocation:location});
export const currentFootprintForwardWriterMainMutationPauseSchema=z.looseObject({reason:z.literal("other"),hitBreakpoints:z.array(handle).min(1).max(2),callFrames:z.array(frame).min(1).max(64)});
export type CurrentFootprintForwardWriterMainMutationPause=z.infer<typeof currentFootprintForwardWriterMainMutationPauseSchema>;
interface Host{readonly scriptId:string;readonly capture:string;readonly assertCurrent:()=>void;readonly request:(command:Command)=>Promise<unknown>;readonly resume:()=>Promise<void>}
interface Input{readonly before:NativeSqlInventory;readonly actorObjectId:string;readonly sqlObjectId:string;readonly plan:Readonly<{projectUuid:string;branchUuid:string;path:string;dataStr:string}>;
 readonly actor:Readonly<{uuid:string;username:string;nickname:string;updateTime:number}>;readonly priorHistoryUuid:string}
const SOURCE=Object.freeze({
 begin:{name:"begin",line:1025,column:2040,start:2035,end:2187},commit:{name:"commit",line:1025,column:2199,start:2199,end:2350},
 data:{name:"DB",line:8572,column:26_228,start:26_211,end:26_506},cipher:{name:"x4",line:8572,column:25_950,start:25_933,end:26_211},
 head:{name:"bB",line:8572,column:24_479,start:24_462,end:24_765},branch:{name:"D4",line:8572,column:25_719,start:25_702,end:25_933},
 project:{name:"xB",line:8572,column:26_523,start:26_506,end:26_682},
 actorRead:{name:"L3",line:8573,column:31,start:14,end:367},branchRead:{name:"j4",line:8572,column:14_179,start:14_162,end:14_385},headRead:{name:"hB",line:8572,column:21_796,start:21_779,end:22_129},
});
function need(value:boolean,code:string):asserts value{if(!value){throw new Error(`FORWARD_WRITER_SQL_${code}`);}}
function sourceFrame(pause:CurrentFootprintForwardWriterMainMutationPause,scriptId:string,role:keyof typeof SOURCE):string{
 const site=SOURCE[role];const matches=pause.callFrames.filter(value=>value.functionName===site.name&&value.functionLocation.scriptId===scriptId&&value.functionLocation.lineNumber===site.line&&value.functionLocation.columnNumber===site.column&&
 value.location.scriptId===scriptId&&value.location.lineNumber===site.line&&value.location.columnNumber>=site.start&&value.location.columnNumber<site.end);
 need(matches.length===1&&matches[0]!==undefined,`ORIGINAL_CALLER_${role}`);return matches[0].callFrameId;
}
async function capturedFrame(host:Host,frameId:string,role:keyof typeof EXPRESSIONS|"read"):Promise<string>{
 host.assertCurrent();const expression=role==="read"?RAW.queryOne:EXPRESSIONS[role];
 const result=decodeCurrentFootprintCopyMainRequestArrayCapture(await host.request({phase:"forward-writer-sql-frame",role,method:"Debugger.evaluateOnCallFrame",params:{...FRAME,callFrameId:frameId,expression}}),expression.slice(1,-1).split(",").length);
 host.assertCurrent();return result;
}
export async function continueCurrentFootprintForwardWriterReadonlySql(host:Host,pause:CurrentFootprintForwardWriterMainMutationPause,ordinal:number):Promise<void>{
 const role=(["actorRead","branchRead","headRead"]as const)[ordinal-1];need(role!==undefined,"READ_BOUND");sourceFrame(pause,host.scriptId,role);
 const first=pause.callFrames[0];need(first!==undefined,"READ_FRAME");const raw=await capturedFrame(host,first.callFrameId,"read");host.assertCurrent();
 const result=z.strictObject({result:z.strictObject({type:z.literal("boolean"),value:z.literal(true)})}).parse(await host.request({phase:"forward-writer-sql-read",method:"Runtime.callFunctionOn",params:{...CALL,throwOnSideEffect:false,objectId:raw,functionDeclaration:READ,arguments:[{objectId:host.capture},{value:"queryOne"}],returnByValue:false}}));
 host.assertCurrent();need(result.result.value,"READ_GUARD");await host.resume();host.assertCurrent();
}
const proofBase={kind:z.enum(ORDER),selectedOriginalDatabaseReproved:z.literal(true)};
const proof=z.strictObject(proofBase);
const dataProof=z.strictObject({...proofBase,historyUuid:z.string().regex(/^[a-f0-9]{32}$/u),chunkUuid:z.string().regex(/^[a-f0-9]{32}$/u),keyHex:z.string().regex(/^[a-f0-9]{32}$/u),
 cipherHex:z.string().min(34).max(65_536).regex(/^(?:[a-f0-9]{2})+$/u),dataBase64:z.string().min(24).max(65_536)});
export class CurrentFootprintForwardWriterMainMutationController{
 readonly #host:Host;readonly #input:Input;#step=0;#busy=false;#failed=false;#history:string|null=null;#key:string|null=null;
 public constructor(host:Host,input:Input){this.#host=Object.freeze({...host});this.#input=Object.freeze({...input});Object.freeze(this);}
 public get next():typeof ORDER[number]|null{return ORDER[this.#step]??null;}
 public requireComplete():void{need(!this.#busy&&!this.#failed&&this.#step===ORDER.length&&this.#history!==null&&this.#key!==null,"INCOMPLETE");}
 public async continue(pause:CurrentFootprintForwardWriterMainMutationPause):Promise<void>{
  need(!this.#busy&&!this.#failed&&this.next!==null,"CONSUMED");this.#busy=true;const host=this.#host,input=this.#input,kind=this.next;
  try{host.assertCurrent();need(kind!==null,"ROLE");const first=pause.callFrames[0];need(first!==undefined,"FRAME");
   const run=await capturedFrame(host,first.callFrameId,"run");const caller=await capturedFrame(host,sourceFrame(pause,host.scriptId,kind),kind);
   const cipher=kind==="data"?await capturedFrame(host,sourceFrame(pause,host.scriptId,"cipher"),"cipher"):null;
   const expected={kind,projectUuid:input.plan.projectUuid,branchUuid:input.plan.branchUuid,path:input.plan.path,priorHistoryUuid:input.priorHistoryUuid,historyUuid:this.#history,keyHex:this.#key};
   const raw=z.strictObject({result:z.strictObject({type:z.literal("object"),value:z.unknown()})}).parse(await host.request({phase:"forward-writer-sql-proof",role:kind,method:"Runtime.callFunctionOn",params:{...CALL,objectId:run,functionDeclaration:PROGRAM,
    arguments:[{objectId:host.capture},{objectId:input.actorObjectId},{objectId:input.sqlObjectId},{objectId:caller},cipher===null?{value:null}:{objectId:cipher},{value:expected}],returnByValue:true}}));host.assertCurrent();
   if(kind==="data"){const value=dataProof.parse(raw.result.value);const bytes=Buffer.from(value.dataBase64,"base64");
    const encodedHistory=Buffer.from(value.historyUuid,"utf8").toString("hex");need(!input.before.tables.some(table=>table.rows.some(row=>row.cells.some(cell=>cell.kind==="text"&&cell.hex===encodedHistory))),"FRESH_HISTORY_UUID");need(value.kind===kind&&value.chunkUuid===value.historyUuid&&bytes.toString("base64")===value.dataBase64&&bytes.toString("hex")===value.cipherHex,"CIPHER_ENCODING");
    const plaintext=await decodeNativeHistoryChunk(value);host.assertCurrent();need(plaintext===`${JSON.stringify({type:"EDIT_HEAD"})}||${JSON.stringify(input.actor)}|\n${input.plan.dataStr}`,"CIPHER_PLAINTEXT");
    this.#history=value.historyUuid;this.#key=value.keyHex;
   }else{need(proof.parse(raw.result.value).kind===kind,"PROOF_ROLE");}
   z.strictObject({result:z.strictObject({type:z.literal("boolean"),value:z.literal(true)})}).parse(await host.request({phase:"forward-writer-sql-require",method:"Runtime.callFunctionOn",params:{...CALL,objectId:host.capture,functionDeclaration:REQUIRE,arguments:[],returnByValue:true}}));host.assertCurrent();
   await host.resume();host.assertCurrent();this.#step+=1;
  }catch(error){this.#failed=true;throw error;}finally{this.#busy=false;}
 }
}

// This private continuation has no extension surface. Freeze only this module's
// Own class/instances; the original Backend retains its sole production host.
Object.freeze(CurrentFootprintForwardWriterMainMutationController.prototype);
Object.freeze(CurrentFootprintForwardWriterMainMutationController);
