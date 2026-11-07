/* oxlint-disable unicorn/prefer-string-raw -- Retain complete AST-extracted vendor source as escaped JSON strings with exact hashes. */
/** Exact branch GET and its readonly initial-row projection. No source or
 * metadata string can issue a live worker, clock, SQL or writer capability. */
/* oxlint-disable eslint/no-template-curly-in-string -- Pinned complete vendor functions are reviewed literal source data. */
import { createHash } from "node:crypto";
import { qualifyCurrentFootprintCopyMainBackendSource } from "./current-footprint-copy-main-backend-source.ts";
import { qualifyCurrentProjectSaveProducerSource } from "./current-project-save-producer-source.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const CURRENT_GENERATED_INITIAL_BRANCH_SOURCE = freezeDeep({
  "te": {
    "realm": "main",
    "start": 1_321_439,
    "end": 1_321_897,
    "bytes": 458,
    "sha256": "d4a14191d044d4226cee41f54884dff5b7dfa9cea7118b004fc6e7243c3e2988",
    "source": "function te(t=new Date,e=\"yyyy-MM-dd HH:ii:ss\"){let r={\"M+\":t.getMonth()+1,\"d+\":t.getDate(),\"H+\":t.getHours(),\"h+\":t.getHours(),\"i+\":t.getMinutes(),\"s+\":t.getSeconds(),\"q+\":Math.floor((t.getMonth()+3)/3),S:t.getMilliseconds()};/(y+)/.test(e)&&(e=e.replace(RegExp.$1,(t.getFullYear()+\"\").substr(4-RegExp.$1.length)));for(let i in r)new RegExp(\"(\"+i+\")\").test(e)&&(e=e.replace(RegExp.$1,RegExp.$1.length==1?r[i]:(\"00\"+r[i]).substr((\"\"+r[i]).length)));return e}"
  },
  "j4": {
    "realm": "main",
    "start": 2_588_764,
    "end": 2_588_987,
    "bytes": 223,
    "sha256": "1ea28cd4ea3a0af937f09958da4c8d6b25c24bd9ac8eb8b7ec1d61dc9bca7d22",
    "source": "async function j4(t,e,r,i=!1){let s=gt.instance(),a=await y(t,e),n=[{JOIN:s},{EQ:[s.uuid,new d(r)]},{EQ:[s.delete_status,new d(0)]},{PROJECTION:[s.node,s.uuid,s.delete_status,s.history_uuid]}];return await a.queryOne(...n)}"
  },
  "ls": {
    "realm": "main",
    "start": 2_589_188,
    "end": 2_589_272,
    "bytes": 84,
    "sha256": "e2b6ffe1e323fb6a3c9cc340df70fc7b47f4161bb094cc500e4953622fcee0a3",
    "source": "async function ls(t,e,r,i){let s=await MC(t,e,r,i);return!s||s.length===0?null:s[0]}"
  },
  "MC": {
    "realm": "main",
    "start": 2_589_272,
    "end": 2_590_791,
    "bytes": 1519,
    "sha256": "99fdae0c5fdc2886807707d2870f17577f56bf3762ca2372461a2bdcc8782b7e",
    "source": "async function MC(t,e,r,i,s=!1,a=1,n=50){let o=gt.instance(),c=fe.instance(\"creator_\"),A=fe.instance(\"modifier_\"),u=dt.instance(),l=gt.instance(\"parent_\"),f=await y(t,e);try{let L=[{JOIN:o},{LJOIN:[c,{EQ:[o.creator_uuid,c.uuid]}]},{LJOIN:[A,{EQ:[o.modifier_uuid,A.uuid]}]},{LJOIN:[u,{EQ:[1,1]}]},{LJOIN:[l,{EQ:[o.parent_uuid,l.uuid]}]},{EQ:[1,1]}];i&&(L=[...L,{EQ:[o.uuid,new d(i)]}]),s||(L=[...L,{NE:[o.name,new d(\"start\")]}]);let T={ORDERBYA:[o.created_at]},g={LIMIT:[(a-1)*n,n]},S=await f.queryAll(...L,{PROJECTION:[o.uuid,o.delete_status,o.name,o.project_uuid,u.branch_uuid,o.history_uuid,o.description,o.node,o.created_at,o.updated_at,o.parent_uuid,l.name,c.nickname,c.uuid,A.nickname]},T,g),m=new Map,C=S.filter(h=>h.history_uuid);for(let h of C){let w=(await Or(t,e,h.uuid)).instance(),U=await f.queryOne({JOIN:w},{EQ:[w.uuid,new d(h.history_uuid)]},{PROJECTION:[w.id]});U&&m.set(h.uuid,U.id)}return S.map(h=>{let p=h.uuid===h.branch_uuid,w=m.get(h.uuid),U={...h,default:p,updated_at:te(new Date(new Date(h.updated_at).getTime()-new Date().getTimezoneOffset()*1e3*60)),created_at:te(new Date(new Date(h.created_at).getTime()-new Date().getTimezoneOffset()*1e3*60)),project_histories_id:w||null,parent_name:h.parent_name||null,node:!!h.node};return Object.fromEntries(Object.entries(U).filter(([R])=>R!==\"id\"))})}catch(L){throw t.logger.error(\"\\u67E5\\u8BE2\\u5206\\u652F\\u4FE1\\u606F\\u5931\\u8D25\",{projectUuid:r,branchUuid:i,error:L}),new Error(\"\\u67E5\\u8BE2\\u5206\\u652F\\u4FE1\\u606F\\u65F6\\u53D1\\u751F\\u9519\\u8BEF\")}}"
  },
  "branchShow": {
    "realm": "main",
    "start": 2_606_772,
    "end": 2_606_983,
    "bytes": 211,
    "sha256": "2fdbf7f8f2d194a987f61c820698c4c88357eada948c294e73697a1cd8fb734b",
    "source": "async show(){let e=this.ctx.routerParams.projectUuid,r=this.ctx.routerParams.branchUuid,i=await ls(this.ctx,this.path,e,r);if(i)this.ctx.body=i;else throw new Error(\"\\u5DE5\\u7A0B\\u5206\\u652F\\u4E0D\\u5B58\\u5728\")}"
  },
  "getLastHistoryUuid": {
    "realm": "worker",
    "start": 2_020_230,
    "end": 2_020_325,
    "bytes": 95,
    "sha256": "d5f02079bd8ba7735ac9288c5d3de48bb0bf30fc30081e9d48d46e0ac875970b",
    "source": "async getLastHistoryUuid(t){return Re.getInstance().branch.get({uuid:this.uuid,branch_uuid:t})}"
  },
  "checkProject": {
    "realm": "worker",
    "start": 2_127_005,
    "end": 2_127_208,
    "bytes": 203,
    "sha256": "10deedd359565cfcdecc0e55394276f91fd77011bd8a0432f40c61e9f3da413e",
    "source": "checkProject(){this.isEstablished||this.projectTimer||(this.projectTimer=setTimeout(()=>{this.updateProjectInNet(),this.syncCloud().catch(()=>{}),this.projectTimer=null,this.checkProject()},Fe?1e3:3e3))}"
  },
  "Q": {
    "realm": "main",
    "start": 1_291_956,
    "end": 1_292_305,
    "bytes": 349,
    "sha256": "a0927d35f5ff09abd9efc7a90bdd8439f70255a74591e37996f94f9c709e0d22",
    "source": "Q=class{constructor(e,r){this.tableName=e;this.example=r}instance(e=\"\"){let r=Symbol(this.tableName),i={};for(let s in this.example)this.example.hasOwnProperty(s)&&(i[s]=new Jr(r,e,s));return i}refInstance(){let e={};for(let r in this.example)this.example.hasOwnProperty(r)&&(e[r]=new d);return e}drop(){return{DROP:new rc(this.tableName),[j5]:!0}}}"
  },
  "Jr": {
    "realm": "main",
    "start": 1_292_306,
    "end": 1_292_376,
    "bytes": 70,
    "sha256": "fc6f935bef409dd79dce408922bb80327ccba04b79a4048b9cf228014008b613",
    "source": "Jr=class{constructor(e,r,i){this.tbSymbol=e;this.alias=r;this.name=i}}"
  },
  "d": {
    "realm": "main",
    "start": 1_292_377,
    "end": 1_292_429,
    "bytes": 52,
    "sha256": "07a8b421bacebf42aaf849386aa3d9fe1bcba1ad2346c3a10b65916ed0a1d408",
    "source": "d=class{constructor(e){this.value=e}symbol=Symbol()}"
  },
  "D5": {
    "realm": "main",
    "start": 1_292_791,
    "end": 1_299_105,
    "bytes": 6314,
    "sha256": "c3e085daa38ff281385c20e22c1faea33a4a5ad2052265a4ac56e9c6c158ddb9",
    "source": "function D5(t,e,r){let i=e.tableIndex,s=e.refIndex;if(t===null)return\"\";if(t instanceof Jr){let A=i.get(t.tbSymbol);if(typeof A>\"u\")throw new Error(`table ${t.tbSymbol.toString()} not joined`);return o(`t${A}.\"${t.name}\"`)}else if(t instanceof d){let A=s.get(t.symbol);return typeof A>\"u\"&&(A=s.size,s.set(t.symbol,A),e.refs.push(t)),o(`<#${A}#>`)}else{if(typeof t==\"number\")return o(t.toString());if(typeof t==\"string\")return o(`'${t}'`);if(typeof t==\"boolean\")return o(t.toString());if(t instanceof Date)return o(t.toISOString());if(\"AND\"in t){let A=t.AND.map(u=>n(u)).join(\" AND \");return o(A,\"filter\")}else if(\"OR\"in t){let A=t.OR.map(u=>n(u)).join(\" OR \");return o(A,\"filter\")}else if(\"EQ\"in t){let[A,u]=t.EQ,l=`${n(A)} = ${n(u)}`;return o(l,\"filter\")}else if(\"NE\"in t){let[A,u]=t.NE,l=`${n(A)} <> ${n(u)}`;return o(l,\"filter\")}else if(\"LT\"in t){let[A,u]=t.LT,l=`${n(A)} < ${n(u)}`;return o(l,\"filter\")}else if(\"GT\"in t){let[A,u]=t.GT,l=`${n(A)} > ${n(u)}`;return o(l,\"filter\")}else if(\"LET\"in t){let[A,u]=t.LET,l=`${n(A)} <= ${n(u)}`;return o(l,\"filter\")}else if(\"GET\"in t){let[A,u]=t.GET,l=`${n(A)} >= ${n(u)}`;return o(l,\"filter\")}else if(\"LIKE\"in t){let[A,u]=t.LIKE,l=`${n(A)} LIKE ${n(u)}`;return o(l,\"filter\")}else if(\"REGEX\"in t){let[A,u]=t.REGEX,l=`${n(A)} ~ ${n(u)}`;return o(l,\"filter\")}else if(\"ISNULL\"in t){let A=`${n(t.ISNULL)} IS NULL`;return o(A,\"filter\")}else if(\"NOTNULL\"in t){let A=`${n(t.NOTNULL)} IS NOT NULL`;return o(A,\"filter\")}else if(\"ADD\"in t){let[A,u]=t.ADD,l=`${n(A)} + ${n(u)}`;return o(l,\"filter\")}else if(\"MINUS\"in t){let[A,u]=t.MINUS,l=`${n(A)} - ${n(u)}`;return o(l)}else if(\"TIMES\"in t){let[A,u]=t.TIMES,l=`${n(A)} * ${n(u)}`;return o(l)}else if(\"DIV\"in t){let[A,u]=t.DIV,l=`${n(A)} / ${n(u)}`;return o(l)}else{if(\"COUNT\"in t)return o(`count(${n(t.COUNT)})`);if(\"MIN\"in t)return o(`min(${n(t.MIN)})`);if(\"MAX\"in t)return o(`max(${n(t.MAX)})`);if(\"FUNC\"in t){let[A,...u]=t.FUNC.map(f=>n(f)),l=`${A}(${u.join(\",\")})`;return o(l)}else if(\"JOIN\"in t){a();let A=t.JOIN,u=c(A),l=`join ${Da(u)} t${i.get(u)} `;return Array.isArray(A)&&(l+=`on ${n(A[1])}`),o(l,\"sql\")}else if(\"LJOIN\"in t){a();let A=t.LJOIN,u=c(A),l=`left join ${Da(u)} t${i.get(u)} `;if(Array.isArray(A)){let f=A[1],T=Object.keys(f)[0];if([\"AND\",\"OR\"].includes(T)){let S=Object.values(f)[0].map(m=>{var C=n(m);return C});l+=` on (${S.join(` ${T} `)})`}else l+=`on ${n(A[1])}`}return o(l,\"sql\")}else if(\"RJOIN\"in t){a();let A=t.RJOIN,u=c(A),l=`right join ${Da(u)} t${i.get(u)} `;return Array.isArray(A)&&(l+=`on ${n(A[1])}`),o(l,\"sql\")}else if(\"FJOIN\"in t){a();let A=t.FJOIN,u=c(A),l=`full join ${Da(u)} t${i.get(u)} `;return Array.isArray(A)&&(l+=`on ${n(A[1])}`),o(l,\"sql\")}else if(\"AGGREGATE\"in t){let A=new Array,u=ji(t.AGGREGATE).map(g=>{if(Array.isArray(g)&&g[0]&&typeof g[0]==\"object\"&&\"COUNT\"in g[0]&&g[0].COUNT&&typeof g[0].COUNT==\"object\"&&\"DISTINCT\"in g[0].COUNT){let S=g[0].COUNT.DISTINCT;return`COUNT(DISTINCT ${n(S)}) as ${g[1]}`}else return g instanceof Jr?(A.push(g),`${n(g)} as \"${g.alias+g.name}\"`):(g[0]instanceof Jr&&A.push(g[0]),`${n(g[0])} as \"${g[1]}\"`)}).join(\",\"),l=e.sqls.join(`\n`).replace(\"join\",\"from\"),f=e.filters.join(\" AND \"),L=A.map(g=>n(g)).join(\",\");e.sqls.length=0,e.filters.length=0;let T=L?`group by ${L}`:\"\";return o(`select ${u} ${l} where ${f} ${T}`,\"sql\")}else if(\"EXIST\"in t){let A=n({JOIN:t.EXIST[0]}).replace(\"join\",\"select * from\"),u=\"where\"+t.EXIST[1].map(l=>n(l)).join(\" and \");return o(`exists (${A} ${u})`,\"filter\")}else if(\"GROUPBY\"in t){let A=new Array;ji(t.GROUPBY).map(L=>{if(L instanceof Jr)return A.push(L),`${n(L)}`});let u=A.map(L=>n(L)).join(\",\"),l=u?`group by ${u}`:\"\",f=e.filters.pop();return o(`${f} ${l} `,\"filter\")}else if(\"PROJECTION\"in t){let A=ji(t.PROJECTION).map(f=>f instanceof Jr?`${n(f)} as \"${f.alias+f.name}\"`:`${n(f[0])} as ${f[1]}`).join(\",\"),u=e.sqls.join(`\n`).replace(\"join\",\"from\"),l=e.filters.join(\" AND \");return e.sqls.length=0,e.filters.length=0,o(`select ${A} ${u} where ${l}`,\"sql\")}else if(\"UPDATE\"in t){let A=\"\",u=ji(t.UPDATE).map(L=>(A=Da(L[0].tbSymbol),n(L[0]),`${L[0].name} = ${n(L[1])}`)).join(\",\"),l=e.sqls.join(`\n`).replace(\"join\",\"from\"),f=e.filters.join(\" AND \");return e.sqls.length=0,e.filters.length=0,o(`update ${A} set ${u} where ${f}`.replace(/\\bt1\\./g,\"\"),\"sql\")}else if(\"INSERT\"in t){let A=new Array,u=new Array;for(let[f,L]of ji(t.INSERT)){if(typeof i.get(f.tbSymbol)>\"u\"){let g=i.size+1;i.set(f.tbSymbol,g)}A.push(`\"${f.name}\"`),u.push(n(L))}if(i.size!==1)throw new Error(\"insert support only 1 table\");let l=Da(i.keys().next().value);return o(`insert into ${l} (${A.join(\",\")}) values (${u.join(\",\")})`,\"sql\")}else if(\"UPSERT\"in t){let A=t.UPSERT,u=n({INSERT:A.INSERT}),l=ji(A.CONFLICT).map(L=>(n(L),`\"${L.name}\"`)).join(\",\"),f=ji(A.UPDATE).map(L=>(n(L[0]),`\"${L[0].name}\" = ${n(L[1]).replace(/^\\s*t1./,\"\")}`)).join(\",\");return o(`${u} on conflict (${l}) do update set ${f}`,\"sql\")}else if(\"DELETE\"in t){let A=e.sqls.join(`\n`).replace(\"join\",\"from\"),u=e.filters.join(\" AND \").replace(/\\bt1\\./g,\"\");return e.sqls.length=0,e.filters.length=0,o(`delete ${A.replace(/\\bt1\\b/g,\"\")} where ${u}`,\"sql\")}else if(\"LIMIT\"in t){if(e.sqls.length!==1)throw new Error(\"limit should follow only one sql\");let A=e.sqls.pop(),u=t.LIMIT;return o(`${A} limit ${u[1]} offset ${u[0]}`,\"sql\")}else if(\"IN\"in t){let[A,u]=t.IN;return o(`${n(A)} in (${u.map(l=>n(l)).join(\",\")})`,\"filter\")}else if(\"NOTIN\"in t){let[A,u]=t.NOTIN;return o(`${n(A)} not in (${u.map(l=>n(l)).join(\",\")})`,\"filter\")}else if(\"ORDERBYA\"in t){if(e.sqls.length!==1)throw new Error(\"limit should follow only one sql\");let A=e.sqls.pop();return o(`${A} order by ${t.ORDERBYA.map(n)} `,\"sql\")}else if(\"ORDERBYD\"in t){if(e.sqls.length!==1)throw new Error(\"limit should follow only one sql\");let A=e.sqls.pop();return o(`${A} order by ${t.ORDERBYD.map(n)} desc`,\"sql\")}else R5()}}function a(){if(e.filters.length>0)throw new Error(\"join should before filter\")}function n(A){return D5(A,e,r+1)}function o(A,u){return r===0?(u===\"filter\"?e.filters.push(A):u===\"sql\"&&e.sqls.push(A),A):`\n${\" \".repeat(r*4)}${A}`}function c(A){let u=Array.isArray(A)?A[0]:A,l=null;for(let f in u)if(u.hasOwnProperty(f)){l=u[f].tbSymbol;break}if(l!==null){if(i.has(l))throw new Error(`join duplicated table ${l}`);{let f=i.size+1;i.set(l,f)}return l}else throw new Error(\"missing fields\")}}"
  },
  "fe": {
    "realm": "main",
    "start": 2_217_243,
    "end": 2_217_374,
    "bytes": 131,
    "sha256": "494518933e062a96e7c8200fbe1f6d456196106930c304a4adf9d60080500b6a",
    "source": "fe=new Q(\"users\",{uuid:\"string\",username:\"string\",nickname:\"string\",password:\"string\",preference:\"string\",avatar:\"string\",team:!1})"
  },
  "dt": {
    "realm": "main",
    "start": 2_217_379,
    "end": 2_217_719,
    "bytes": 340,
    "sha256": "72c94a1259fd3b47d6d1aa0a6a0459c089ba5c3467b7ba7e18ceadf13f929d0a",
    "source": "dt=new Q(\"projects\",{uuid:\"string\",owner_uuid:\"string\",creator_uuid:\"string\",modifier_uuid:\"string\",name:\"string\",boards:\"string\",block_symbol_attrs_groups:\"string\",content:\"string\",cbb_project:!1,archive:!1,ticket:5,pcb_count:2,g_ticket:6,thumb:\"string\",created_at:\"string\",updated_at:\"string\",default_sheet:\"string\",branch_uuid:\"string\"})"
  },
  "gt": {
    "realm": "main",
    "start": 2_584_670,
    "end": 2_584_919,
    "bytes": 249,
    "sha256": "4178d4175a3767a50c95ac8c020931c383a374958ce3944eb554a2611beb42a8",
    "source": "gt=new Q(\"branches\",{id:1,uuid:\"string\",project_uuid:\"string\",name:\"string\",history_uuid:\"string\",creator_uuid:\"string\",description:\"string\",parent_uuid:\"string\",modifier_uuid:\"string\",node:0,created_at:\"string\",updated_at:\"string\",delete_status:0})"
  }
} );
export const CURRENT_GENERATED_INITIAL_BRANCH_API_FIELDS = Object.freeze(["uuid", "delete_status", "name", "project_uuid", "branch_uuid", "history_uuid", "description", "node", "created_at", "updated_at", "parent_uuid", "parent_name", "creator_nickname", "creator_uuid", "modifier_nickname", "default", "project_histories_id"] as const);
export function qualifyCurrentGeneratedInitialBranchSource(worker: string, main: string): void {
  qualifyCurrentProjectSaveProducerSource(worker); qualifyCurrentFootprintCopyMainBackendSource(main);
  for (const row of Object.values(CURRENT_GENERATED_INITIAL_BRANCH_SOURCE)) {
    const text = (row.realm === "worker" ? worker : main).slice(row.start, row.end);
    if (text !== row.source || Buffer.byteLength(text) !== row.bytes || createHash("sha256").update(text).digest("hex") !== row.sha256) { throw new Error("GENERATED_INITIAL_BRANCH_SOURCE"); }
  }
}
