/** New original-save selectors. Historical structure programs stay byte-exact.
 * The backend must separately join its genuine modern Fetch POST packet before
 * this body graph can authorize any per-call native SQL continuation. */
import { CURRENT_PROJECT_STRUCTURE_MAIN_PROGRAMS as HISTORICAL, CURRENT_PROJECT_STRUCTURE_MAIN_SHARED_PROGRAM_TEXT as LEGACY_COMMON } from "./current-project-structure-main-programs.ts";
import { CURRENT_SELECTED_FILE_MAIN_SQL_FENCE_JOIN_HELPERS as SQL_JOIN } from "./current-selected-file-main-sql-fence-programs.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

const obsoleteOwnMethodCheck = '||own(own(o,"9"),"method")!=="POST"';
function modern(source: string): string { if (source.split(obsoleteOwnMethodCheck).length !== 2) { throw new Error("SAVE_STRUCTURE_MAIN_REQUEST_SOURCE"); } return source.replace(obsoleteOwnMethodCheck, ""); }
const common = modern(LEGACY_COMMON);
const native = `
const rawNative=(q,f,capture)=>{const validate=(q,f,capture)=>{${SQL_JOIN}
const z=original(capture),sql=q.s,wrap=own(sql,"dbWrap"),native=own(sql,"db");arr(f,7);if(Object.getPrototypeOf(sql)!==own(own(capture,"2"),"prototype")||Object.getPrototypeOf(wrap)!==own(own(capture,"1"),"prototype")||own(wrap,"db")!==native||Object.getPrototypeOf(native)!==own(own(z.sc,"Database"),"prototype")||own(sql,"path")!==z.path||q.b.path!==z.path||own(sql,"transactionDepth")!==0||own(f,"0")!==wrap||own(f,"5")!==z.sc||own(f,"6")!==z.util)bad();const filename=Object.getOwnPropertyDescriptor(native,"filename");if(!filename||!Object.hasOwn(filename,"value")||filename.writable||filename.enumerable||filename.configurable||filename.value!==z.path)bad();for(const i of[3,4])if(typeof own(f,String(i))!=="function")bad();verify();return{z,sql,wrap,native};};return validate(q,f,capture);};
const run=packet=>{array(packet,4);const f=own(packet,"0"),caller=own(packet,"1"),exec=own(packet,"2"),capture=own(packet,"3"),q=executed(exec),identity=rawNative(q,f,capture);array(caller,4);const old=own(exec,"1");for(let i=0;i<4;i++)if(own(caller,String(i))!==own(old,String(i)))bad();const params=own(f,"2");array(params,3);const expected=[own(q.b.p,"ticket"),own(q.b.p,"structureText"),own(q.b.p,"branchUuid")];if(own(f,"1")!==UPDATE)bad();for(let i=0;i<3;i++)if(own(params,String(i))!==expected[i])bad();return{...q,identity,f,params,exec,capture};};
const callback=packet=>{array(packet,4);const f=own(packet,"0"),pending=own(packet,"1"),q=run(pending);array(f,8);const stmt=own(f,"0"),error=own(f,"1"),sql=Object.getOwnPropertyDescriptor(stmt,"sql"),changes=own(stmt,"changes"),lastID=own(stmt,"lastID");if(error!==null&&error!==undefined||Object.getPrototypeOf(stmt)!==own(own(q.identity.z.sc,"Statement"),"prototype")||!sql||!Object.hasOwn(sql,"value")||sql.writable||sql.enumerable||sql.configurable||sql.value!==UPDATE||own(f,"2")!==UPDATE||own(f,"3")!==q.params||own(f,"4")!==own(q.f,"3")||own(f,"5")!==own(q.f,"4")||own(f,"6")!==q.identity.z.sc||own(f,"7")!==q.identity.z.util||changes!==1||!Number.isSafeInteger(lastID)||lastID<0||own(packet,"2")!==changes||own(packet,"3")!==lastID)bad();return{...q,stmt,changes,lastID};};
const published=packet=>{array(packet,5);const c=own(packet,"0"),e=own(own(own(c,"0"),"0"),"0"),q=executed(e);if(own(packet,"2")!==q.b.req||own(packet,"3")!==q.b.res||own(packet,"4")!==q.s||own(q.b.ctx,"body")!==own(c,"2")||own(q.b.ctx,"matched")!==true)bad();object(own(q.b.ctx,"body"),[]);return q;};
const final=packet=>{array(packet,4);const publication=own(packet,"0"),res=own(packet,"1"),stream=own(packet,"2"),fn=own(packet,"3");published(publication);if(own(publication,"3")!==res||own(res,"writeStream")!==stream||own(stream,"_final")!==fn||typeof fn!=="function")bad();return{publication,res,stream,fn};};
const finalEntry=packet=>{array(packet,2);const f=own(packet,"0"),state=final(own(packet,"1"));array(f,7);if(own(f,"0")!==state.res||own(state.res,"initializedResponse")!==true||own(state.res,"statusCode")!==200||typeof own(f,"6")!=="function"||own(f,"3")===null||typeof own(f,"3")!=="object"||own(f,"4")===null||typeof own(f,"4")!=="object")bad();return{...state,f};};`;

export const CURRENT_PROJECT_SAVE_STRUCTURE_MAIN_PROGRAMS = freezeDeep({
  controller: modern(HISTORICAL.controller), query: modern(HISTORICAL["query-one"]), connection: modern(HISTORICAL.connection), selected: modern(HISTORICAL.selected), update: modern(HISTORICAL.update), exec: modern(HISTORICAL.exec),
  updateReturned: modern(HISTORICAL["update-return"]), serviceReturned: modern(HISTORICAL["service-return"]), controllerReturned: modern(HISTORICAL["controller-return"]), response: modern(HISTORICAL.response),
  selectedValue: `function(){${common}\nconst q=selected(this);verify();return{ticket:own(q.row,"ticket"),structureText:own(q.row,"structure")};}`,
  rowsValue: `function(){${common}\nconst q=update(this);verify();return{rows:own(q.rows,"length"),ticket:own(q.row,"ticket"),structureText:own(q.row,"structure")};}`,
  run: `function(caller,execPacket,capture){${common}${native}\nconst packet=[this,caller,execPacket,capture];run(packet);verify();return packet;}`,
  runValue: `function(){${common}${native}\nconst q=run(this);verify();return{ticket:own(q.b.p,"ticket"),structureText:own(q.b.p,"structureText"),branchUuid:own(q.b.p,"branchUuid")};}`,
  callback: `function(pending){${common}${native}\narray(this,8);const stmt=own(this,"0"),packet=[this,pending,own(stmt,"changes"),own(stmt,"lastID")];callback(packet);verify();return packet;}`,
  callbackValue: `function(){${common}${native}\nconst q=callback(this);verify();return{changes:q.changes,lastID:q.lastID};}`,
  responseValue: modern(HISTORICAL.value),
  finalSelect: `function(){${common}${native}\narray(this,5);const res=own(this,"3"),stream=own(res,"writeStream"),fn=own(stream,"_final"),packet=[this,res,stream,fn];final(packet);verify();return packet;}`,
  finalEntry: `function(publication){${common}${native}\nconst packet=[this,publication];finalEntry(packet);verify();return packet;}`,
  finalReturned: `function(entryPacket){${common}${native}\nconst q=finalEntry(entryPacket);array(this,7);for(let i=0;i<7;i++)if(own(this,String(i))!==own(q.f,String(i)))bad();verify();return[this,entryPacket];}`,
  finalValue: `function(){${common}${native}\narray(this,2);const q=finalEntry(own(this,"1")),f=own(this,"0");array(f,7);for(let i=0;i<7;i++)if(own(f,String(i))!==own(q.f,String(i)))bad();verify();return{originalResponseFinalizerReturned:true,statusCode:200};}`,
});
