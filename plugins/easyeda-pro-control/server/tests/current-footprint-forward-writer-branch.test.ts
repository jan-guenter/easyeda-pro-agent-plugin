/** Production fixed branch programs on inert objects only; no application,
 * native process, request or database is created. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { types } from "node:util";
import { runInNewContext } from "node:vm";
import { CURRENT_FOOTPRINT_FORWARD_WRITER_BRANCH_PROGRAMS as PROGRAMS } from "../src/current-footprint-forward-writer-branch-programs.ts";
import { currentFootprintForwardWriterBranchNativeCases, validateCurrentFootprintForwardWriterBranchCommand } from "../src/current-footprint-forward-writer-branch-protocol.ts";
import { currentFootprintForwardWriterBranchWire } from "../src/current-footprint-forward-writer-branch-wire.ts";
import { CURRENT_SELECTED_FILE_MAIN_SQL_FENCE_CAPTURE_PROGRAM as SQL_CAPTURE } from "../src/current-selected-file-main-sql-fence-programs.ts";
import { validateCurrentFootprintInverseMainHistoryCommand } from "../src/current-footprint-inverse-main-history-protocol.ts";

function observe(scenario: string): unknown {
 return runInNewContext(`(()=>{let getters=0,applications=0;class SqlWrap{}class Sql{}class Database{}class Statement{};const sqlite={Database,Statement},util={types:{isProxy}},path="synthetic-selected",db=new Database,wrap=new SqlWrap,sql=new Sql;
Object.defineProperty(db,"filename",{value:path});Object.assign(wrap,{db});Object.assign(sql,{path,db,dbWrap:wrap,transactionDepth:0});const capture=Reflect.apply(eval("("+sqlCaptureProgram+")"),[SqlWrap,Sql,sqlite,util],[path]);
const row={uuid:"b".repeat(32),delete_status:0,name:"disposable",project_uuid:"a".repeat(64),branch_uuid:"b".repeat(32),history_uuid:"c".repeat(32),description:"",node:false,created_at:"2026-11-14 10:00:00",updated_at:"2026-11-14 10:00:00",parent_uuid:null,parent_name:null,creator_nickname:null,creator_uuid:null,modifier_nickname:null,default:true,project_histories_id:1};
const request={},response=()=>{},requestFrame=[null,request,response,sqlite,util,null,null],requestCapture=[requestFrame,capture,request,null,null,null,null,null,null],ctx={projectUuid:"a".repeat(64),routerParams:{projectUuid:"a".repeat(64),branchUuid:"b".repeat(32)},req:request,res:response,db:{[path]:Promise.resolve(sql)}},controller={ctx,path};
let selected=row;if(scenario==="proxy")selected=new Proxy(row,{getPrototypeOf(){getters++;throw Error("trap")},ownKeys(){getters++;throw Error("trap")}});if(scenario==="getter")Object.defineProperty(row,"name",{enumerable:true,get(){getters++;return"disposable"}});if(scenario==="extra")row.extra=true;if(scenario==="foreign-response")ctx.res={};
const frame=[controller,"a".repeat(64),"b".repeat(32),selected];let refused=false,value=null;try{const packet=Reflect.apply(eval("("+programs.capture.program+")"),frame,[capture,requestCapture]);Reflect.apply(eval("("+programs.resolved.program+")"),packet,[sql]);if(scenario==="drift")row.description="changed";if(scenario==="promise-drift")ctx.db[path]=Promise.resolve(sql);value=Reflect.apply(eval("("+programs.value.program+")"),packet,[]);}catch{refused=true}return{refused,value,getters,applications}})()`,{programs:PROGRAMS,sqlCaptureProgram:SQL_CAPTURE,isProxy:types.isProxy,scenario});
}
void test("fixed branch selectors retain the real API row and refuse traps, foreign responses and drift",()=>{
 const positive=observe("positive");assert.ok(positive!==null&&typeof positive==="object"&&"refused" in positive);assert.equal(positive.refused,false);
 for(const scenario of ["proxy","getter","extra","foreign-response","drift","promise-drift"]){const result=observe(scenario);assert.ok(result!==null&&typeof result==="object"&&"refused" in result&&"getters" in result&&"applications" in result);assert.equal(result.refused,true,scenario);assert.equal(result.getters,0,scenario);assert.equal(result.applications,0,scenario);}
});
void test("all ten branch commands are finite and absent from the historical inverse grammar",()=>{
 const cases=currentFootprintForwardWriterBranchNativeCases();assert.equal(cases.length,10);
 for(const [i,command] of cases.entries()){assert.deepEqual(validateCurrentFootprintForwardWriterBranchCommand(command),command);const wire=currentFootprintForwardWriterBranchWire(command,i+1);assert.equal(wire["action"],"footprint-forward-writer-branch");assert.throws(()=>validateCurrentFootprintInverseMainHistoryCommand(command));assert.throws(()=>validateCurrentFootprintForwardWriterBranchCommand({...command,extra:true}));}
});
