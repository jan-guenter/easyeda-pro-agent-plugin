/** Exact descriptor-only selected-write comparisons. The original Backend
 * owns each held pause and consumes its independent native resume reservation. */
import {CURRENT_FOOTPRINT_COPY_MAIN_COMPLETION_JOIN_HELPERS as SEED} from "./current-footprint-copy-main-completion-programs.ts";
import {CURRENT_SELECTED_FILE_MAIN_SQL_FENCE_JOIN_HELPERS as JOIN} from "./current-selected-file-main-sql-fence-programs.ts";
import {CURRENT_PROJECT_HISTORY_SQL as SQL,currentProjectSelectedHistorySql} from "./current-project-history-sql-data.ts";

export const CURRENT_FOOTPRINT_FORWARD_WRITER_MAIN_MUTATION_ORDER=Object.freeze(["begin","data","head","branch","commit","project"] as const);
export type CurrentFootprintForwardWriterMainMutationRole=typeof CURRENT_FOOTPRINT_FORWARD_WRITER_MAIN_MUTATION_ORDER[number];
export const CURRENT_FOOTPRINT_FORWARD_WRITER_MAIN_MUTATION_EXPRESSIONS=Object.freeze({
 run:"[this,e,r,a,n,sc]",begin:"[this,this.transactionDepth]",data:"[t,e,r,i,s,a,n,o,c,A]",cipher:"[t,e,r,i,s,a]",
 head:"[t,e,r,i,s,a,o]",branch:"[t,e,r,i,s,a,n,o]",commit:"[this,this.transactionDepth]",project:"[t,e,r,i,Date,Date.now]",
});
const helpers=`${JOIN}
const seedProof=(actor,sql)=>{const value=(function(a,q){${SEED}const z=seed(a,q);verify();return z;})(actor,sql);return value;};
const checked=(o,z)=>{if(o===null||(typeof o!=="object"&&typeof o!=="function")||z.proxy(o))bad();return o;};
const exactKeys=(o,names)=>{if(Reflect.ownKeys(o).length!==names.length||names.some(k=>!Object.hasOwn(o,k)))bad();};
const plain=o=>{if(o===null||typeof o!=="object"||Object.getPrototypeOf(o)!==Object.prototype)bad();};
const bounded=(v,n)=>{if(typeof v!=="string"||v.length>n||!v.isWellFormed())bad();return v;};
const uuid=v=>{if(typeof v!=="string"||!/^[a-f0-9]{32}$/.test(v))bad();return v;};
const octets=(value,min,max,z)=>{checked(value,z);if(!ArrayBuffer.isView(value))bad();const names=Reflect.ownKeys(value),n=names.length;if(n<min||n>max)bad();let hex="";const digits="0123456789abcdef";for(let i=0;i<n;i++){if(names[i]!==String(i))bad();const v=own(value,String(i));if(!Number.isInteger(v)||v<0||v>255)bad();hex+=digits[v>>4]+digits[v&15];}return hex;};
const input=(candidate,base,expected)=>{plain(candidate);exactKeys(candidate,["projectUuid","branchUuid","dataStr"]);if(own(candidate,"projectUuid")!==expected.projectUuid||own(candidate,"branchUuid")!==expected.branchUuid)bad();const v=base.v,body=JSON.stringify({type:"EDIT_HEAD"})+"||"+JSON.stringify({uuid:own(v,"uuid"),username:own(v,"username"),nickname:own(v,"nickname"),updateTime:own(v,"updateTime")})+"|\\n"+own(base.p,"dataStr");if(own(candidate,"dataStr")!==body)bad();return body;};
const scope=(capture,actor,sql,expected)=>{const z=original(capture),seeded=seedProof(actor,sql),base={...seeded,wrap:own(seeded.q,"4")};plain(expected);exactKeys(expected,["kind","projectUuid","branchUuid","path","priorHistoryUuid","historyUuid","keyHex"]);
if(!["begin","data","head","branch","commit","project"].includes(expected.kind)||!/^[a-f0-9]{64}$/.test(expected.projectUuid))bad();uuid(expected.branchUuid);uuid(expected.priorHistoryUuid);
if(expected.path!==z.path||base.path!==z.path||own(base.p,"projectUuid")!==expected.projectUuid||own(base.p,"branchUuid")!==expected.branchUuid||own(base.p,"path")!==z.path||own(base.sql,"dbWrap")!==base.wrap||own(base.sql,"db")!==own(base.wrap,"db")||Object.getPrototypeOf(base.sql)!==own(own(capture,"2"),"prototype")||Object.getPrototypeOf(base.wrap)!==own(own(capture,"1"),"prototype"))bad();
if(base.wrap!==own(base.q,"4")||own(base.wrap,"db")!==own(base.q,"3")||own(own(base.wrap,"db"),"filename")!==z.path||Object.getPrototypeOf(own(base.wrap,"db"))!==own(own(z.sc,"Database"),"prototype"))bad();
if(expected.kind==="begin"||expected.kind==="data"){if(expected.historyUuid!==null||expected.keyHex!==null)bad();}else{uuid(expected.historyUuid);uuid(expected.keyHex);if(expected.historyUuid===expected.priorHistoryUuid)bad();}
return{base,z};};`;
export const CURRENT_FOOTPRINT_FORWARD_WRITER_MAIN_MUTATION_PROGRAM=`function(capture,actor,sql,caller,cipherFrame,expected){${helpers}
const{base,z}=scope(capture,actor,sql,expected);checked(this,z);checked(caller,z);arr(this,6);
const params=checked(own(this,"2"),z),resolve=checked(own(this,"3"),z),reject=checked(own(this,"4"),z);
if(own(this,"0")!==base.wrap||own(this,"5")!==z.sc||typeof resolve!=="function"||typeof reject!=="function"||resolve===reject||!Array.isArray(params))bad();
const count=own(params,"length");if(!Number.isSafeInteger(count)||count<0||count>4)bad();arr(params,count);
for(let i=0;i<count;i++){const p=own(params,String(i));if(p!==null&&typeof p!=="string"&&typeof p!=="number")bad();if(typeof p==="string")bounded(p,65536);if(typeof p==="number"&&(!Number.isSafeInteger(p)||Object.is(p,-0)))bad();}
const kind=expected.kind;let statement,want,value={kind,selectedOriginalDatabaseReproved:true};
if(kind==="begin"||kind==="commit"){arr(caller,2);const depth=kind==="begin"?1:0;if(own(caller,"0")!==base.sql||own(caller,"1")!==depth||own(base.sql,"transactionDepth")!==depth)bad();statement=kind==="begin"?"begin immediate transaction":${JSON.stringify(SQL.commit)};want=[];}
else if(kind==="data"){checked(cipherFrame,z);arr(caller,10);arr(cipherFrame,6);
if(own(caller,"0")!==base.ctx||own(caller,"1")!==base.path||own(caller,"5")!==""||own(caller,"7")!==base.sql||own(cipherFrame,"0")!==base.ctx||own(cipherFrame,"1")!==base.path||own(cipherFrame,"3")!==true||own(caller,"2")!==own(cipherFrame,"5"))bad();
const argument=own(cipherFrame,"2");plain(argument);exactKeys(argument,["dataStr","uuid"]);const history=uuid(own(argument,"uuid"));if(history===expected.priorHistoryUuid||own(caller,"3")!==history||own(caller,"4")!==history||own(caller,"8")!==history)bad();
const v=base.v,plaintext=JSON.stringify({type:"EDIT_HEAD"})+"||"+JSON.stringify({uuid:own(v,"uuid"),username:own(v,"username"),nickname:own(v,"nickname"),updateTime:own(v,"updateTime")})+"|\\n"+own(base.p,"dataStr");
if(own(argument,"dataStr")!==plaintext||own(base.sql,"transactionDepth")!==1)bad();const keyHex=octets(own(cipherFrame,"4"),16,16,z),cipherHex=octets(own(cipherFrame,"5"),17,32768,z),dataBase64=bounded(own(caller,"9"),65536);
statement=${JSON.stringify(SQL.historyData)};want=[history,history,dataBase64,dataBase64];value={...value,historyUuid:history,chunkUuid:history,keyHex,cipherHex,dataBase64};}
else if(kind==="head"){arr(caller,7);if(own(caller,"0")!==base.ctx||own(caller,"1")!==base.path||own(caller,"4")!==expected.historyUuid||own(caller,"5")!==expected.keyHex)bad();input(own(caller,"2"),base,expected);const branch=own(caller,"3");plain(branch);exactKeys(branch,["node","uuid","delete_status","history_uuid"]);if(own(branch,"uuid")!==expected.branchUuid||own(branch,"delete_status")!==0||own(branch,"history_uuid")!==expected.priorHistoryUuid||own(base.sql,"transactionDepth")!==1)bad();statement="insert into project_history_"+expected.branchUuid+${JSON.stringify(currentProjectSelectedHistorySql("a".repeat(32),"append").slice("insert into project_history_".length+32))};want=[expected.historyUuid,expected.priorHistoryUuid,null,expected.keyHex];}
else if(kind==="branch"){arr(caller,8);if(own(caller,"0")!==base.ctx||own(caller,"1")!==base.path||own(caller,"2")!=="project"||own(caller,"3")!==expected.branchUuid||own(caller,"4")!==expected.historyUuid||own(caller,"5")!==expected.projectUuid||own(caller,"6")!==base.sql||own(base.sql,"transactionDepth")!==1)bad();statement=${JSON.stringify(SQL.branch)};want=[expected.historyUuid,expected.branchUuid];}
else{arr(caller,6);if(own(caller,"0")!==base.ctx||own(caller,"1")!==base.path||own(caller,"2")!==expected.projectUuid||own(caller,"4")!==base.d||own(caller,"5")!==base.now||own(base.sql,"transactionDepth")!==0)bad();const when=own(params,"0");if(typeof when!=="string"||!/^\\d{4}-\\d{2}-\\d{2} \\d{2}:\\d{2}:\\d{2}$/.test(when))bad();statement=${JSON.stringify(SQL.project)};want=[when,own(base.v,"uuid")];}
if(kind!=="data"&&cipherFrame!==null)bad();if(own(this,"1")!==statement||count!==want.length)bad();for(let i=0;i<want.length;i++)if(own(params,String(i))!==want[i])bad();verify();return value;
}`;
