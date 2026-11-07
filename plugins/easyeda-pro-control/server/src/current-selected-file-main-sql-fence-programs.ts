/** Pure fixed breakpoint conditions and descriptor joins. Conditions publish
 * no state, replace no primitive and invoke no application/SQL method. Every
 * unproved mutation remains paused for the original main collector. */
import { freezeDeep } from "./sqlite-inventory-core.ts";
import { CURRENT_SELECTED_FILE_MAIN_SQL_FENCE_SOURCE as SOURCE } from "./current-selected-file-main-sql-fence-source.ts";
import type { CurrentSelectedFileMainSqlFenceSite } from "./current-selected-file-main-sql-fence-source.ts";

export const CURRENT_SELECTED_FILE_MAIN_SQL_FENCE_GROUP = "easyeda-selected-file-main-sql-fence-v1";
export const CURRENT_SELECTED_FILE_MAIN_SQL_FENCE_MAXIMUM_MUTATIONS = 64;
const tables = [...SOURCE.literalTableConstructor.filter(name => !name.includes("_fts_")), "sqlite_master"];
const readonlySql = String.raw`const TABLES=${JSON.stringify(tables)};const readonly=sql=>{text(sql,65536);if(/[;\0]|--|\/\*|\*\//.test(sql))return false;const normalized=sql.trim();const tokens=[];let i=0;while(i<normalized.length){const c=normalized[i];if(/\s/.test(c)){i++;continue;}if(c==="'"){let done=false;for(i++;i<normalized.length;i++){if(normalized[i]==="'"){if(normalized[i+1]==="'"){i++;continue;}i++;done=true;break;}}if(!done)return false;tokens.push({kind:"literal",value:""});continue;}if(c==='"'){let value="",done=false;for(i++;i<normalized.length;i++){if(normalized[i]==='"'){if(normalized[i+1]==='"'){value+='"';i++;continue;}i++;done=true;break;}value+=normalized[i];}if(!done||!/^[A-Za-z_][A-Za-z\d_]*$/.test(value))return false;tokens.push({kind:"name",value:value.toLowerCase()});continue;}const name=/^[A-Za-z_][A-Za-z\d_]*/.exec(normalized.slice(i));if(name){tokens.push({kind:"word",value:name[0].toLowerCase()});i+=name[0].length;continue;}const num=/^(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?/.exec(normalized.slice(i));if(num){tokens.push({kind:"literal",value:""});i+=num[0].length;continue;}if("()?,.*=<>!+/%|-&~:".includes(c)){tokens.push({kind:"punctuation",value:c});i++;continue;}return false;}if(tokens.length===0||tokens.length>8192||tokens[0].kind!=="word"||tokens[0].value!=="select")return false;const denied=new Set(["insert","update","delete","replace","create","drop","alter","attach","detach","vacuum","reindex","analyze","pragma","begin","commit","end","rollback","savepoint","release","with","returning","into","collate","union","intersect","except","load_extension","writefile","readfile","eval","fts3_tokenizer"]),functions=new Set(["count","min","max"]),parenKeywords=new Set(["in","exists","not","and","or","on","where","select","as","case","when","then","else","distinct","having","by"]);let depth=0;for(let k=0;k<tokens.length;k++){const t=tokens[k];if(t.kind==="word"&&denied.has(t.value))return false;if(t.value==="("){depth++;if(depth>64)return false;const before=tokens[k-1];if(before&&(before.kind==="literal"||(before.kind==="word"||before.kind==="name")&&!functions.has(before.value)&&!parenKeywords.has(before.value)))return false;}if(t.value===")"&&--depth<0)return false;}if(depth!==0)return false;const tables=new Set(TABLES);let from=false;for(let k=0;k<tokens.length;k++){const t=tokens[k];if(t.kind==="word"&&(t.value==="from"||t.value==="join")){from=true;const table=tokens[k+1];if(!table||!["word","name"].includes(table.kind)||!tables.has(table.value)&&!/^project_history_[a-f\d]{32}$/.test(table.value))return false;}if(t.value==="?"&&tokens[k+1]?.kind==="literal")return false;}return from;};`;
const conditionalHelpers = String.raw`"use strict";const bad=()=>{throw new Error("SELECTED_FILE_MAIN_SQL_FENCE_CONDITION");};
const own=(o,k)=>{if(o===null||(typeof o!=="object"&&typeof o!=="function"))bad();const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,"value"))bad();return d.value;};
const text=(s,max)=>{if(typeof s!=="string"||s.length===0||s.length>max||!s.isWellFormed()||s.includes("\0"))bad();return s;};
const types=own(F5,"types"),isProxy=own(types,"isProxy");if(typeof isProxy!=="function"||Function.prototype.toString.call(isProxy)!=="function () { [native code] }"||!isProxy(new Proxy({},{}))||isProxy({}))bad();
const plain=o=>{if(o===null||(typeof o!=="object"&&typeof o!=="function")||isProxy(o))bad();return o;};
const native=(c)=>{plain(c);if(typeof c!=="function"||!/^function [A-Za-z\d_$]*\(\) \{ \[native code\] \}$/.test(Function.prototype.toString.call(c)))bad();return own(c,"prototype");};
const database=db=>{plain(db);if(Object.getPrototypeOf(db)!==native(own(sc,"Database")))bad();const d=Object.getOwnPropertyDescriptor(db,"filename");if(!d||!Object.hasOwn(d,"value")||d.writable||d.configurable||d.enumerable)bad();text(d.value,4096);for(const k of ["each","get","run","prepare","close","serialize"])if(Object.hasOwn(db,k))bad();return db;};
const wrapper=o=>{plain(o);if(Object.getPrototypeOf(o)!==own(Z2,"prototype"))bad();return database(own(o,"db"));};
const statement=o=>{plain(o);if(Object.getPrototypeOf(o)!==native(own(sc,"Statement")))bad();const d=Object.getOwnPropertyDescriptor(o,"sql");if(!d||!Object.hasOwn(d,"value")||d.writable||d.configurable||d.enumerable)bad();for(const k of ["each","get","run","finalize"])if(Object.hasOwn(o,k))bad();return text(d.value,65536);};
const parameters=p=>{plain(p);if(!Array.isArray(p)||Object.getPrototypeOf(p)!==Array.prototype)bad();const n=own(p,"length");if(!Number.isSafeInteger(n)||n<0||n>4096||Reflect.ownKeys(p).length!==n+1)bad();for(let i=0;i<n;i++){const v=own(p,String(i));if(v!==null&&typeof v!=="string"&&typeof v!=="number"&&typeof v!=="boolean")bad();if(typeof v==="string"&&(v.length>2097152||!v.isWellFormed())||typeof v==="number"&&(!Number.isFinite(v)||Object.is(v,-0)))bad();}};`;
const conditions = {
  keeperBirth: 'text(t,4096);native(own(sc,"Database"));return false;',
  contextBirth: 'text(t,4096);native(own(sc,"Database"));return false;',
  initializerBirth: 'text(t,4096);native(own(sc,"Database"));return false;',
  keeperBound: 'if(own(database(e),"filename")!==t)bad();return false;',
  contextBound: 'if(own(database(s),"filename")!==t)bad();return false;',
  initializerBound: 'if(own(database(a),"filename")!==t)bad();return false;',
  queryAll: 'wrapper(this);parameters(r);return !readonly(e)||(e.match(/\\?/g)||[]).length!==r.length;',
  queryOne: 'wrapper(this);parameters(r);return !readonly(e)||(e.match(/\\?/g)||[]).length!==r.length;',
  run: 'wrapper(this);parameters(r);return !readonly(e)||(e.match(/\\?/g)||[]).length!==r.length;',
  prepare: 'wrapper(this);return !readonly(e);',
  prepared: 'wrapper(this);const sql=statement(s);if(sql!==e)bad();return !readonly(sql);',
  statementEach: 'wrapper(this);parameters(r);const sql=statement(e);return !readonly(sql)||(sql.match(/\\?/g)||[]).length!==r.length;',
  statementRun: 'wrapper(this);parameters(r);const sql=statement(e);return !readonly(sql)||(sql.match(/\\?/g)||[]).length!==r.length;',
  finalize: 'wrapper(this);return !readonly(statement(e));',
  wrapClose: 'wrapper(this);return false;',
  keeperClose: 'if(own(database(e),"filename")!==t)bad();return false;',
  initializerClose: 'if(own(database(a),"filename")!==t)bad();return false;',
  initializerSerialize: 'database(a);return true;',
  initializerPragma: 'database(a);return true;',
  startupVersion: 'text(t,4096);return t===_;',
  startupJB: 'return true;',
  startupDC: 'return true;',
  driver: 'plain(r);const url=text(own(r,"pureUrl"),4096);return /^\\/api\\/v4\\/projects(?:\\/|$)/.test(url);',
} as const satisfies Record<Exclude<CurrentSelectedFileMainSqlFenceSite, "import" | "afterImports">, string>;
/** A condition exception must pause, since V8 otherwise ignores an exception
 * thrown by a breakpoint predicate. No readonly/unknown path can fail open. */
const condition = (body: string): string => `(function(){try{${conditionalHelpers}\n${readonlySql}\n${body}}catch{return true;}}).call(this)`;
export const CURRENT_SELECTED_FILE_MAIN_SQL_FENCE_CONDITIONS = freezeDeep({
  keeperBirth: condition(conditions.keeperBirth),
  contextBirth: condition(conditions.contextBirth),
  initializerBirth: condition(conditions.initializerBirth),
  keeperBound: condition(conditions.keeperBound),
  contextBound: condition(conditions.contextBound),
  initializerBound: condition(conditions.initializerBound),
  queryAll: condition(conditions.queryAll),
  queryOne: condition(conditions.queryOne),
  run: condition(conditions.run),
  prepare: condition(conditions.prepare),
  prepared: condition(conditions.prepared),
  statementEach: condition(conditions.statementEach),
  statementRun: condition(conditions.statementRun),
  finalize: condition(conditions.finalize),
  wrapClose: condition(conditions.wrapClose),
  keeperClose: condition(conditions.keeperClose),
  initializerClose: condition(conditions.initializerClose),
  initializerSerialize: condition(conditions.initializerSerialize),
  initializerPragma: condition(conditions.initializerPragma),
  startupVersion: condition(conditions.startupVersion),
  startupJB: condition(conditions.startupJB),
  startupDC: condition(conditions.startupDC),
  driver: condition(conditions.driver),
});

const joins = String.raw`"use strict";const bad=()=>{throw new Error("SELECTED_FILE_MAIN_SQL_FENCE_BINDING");},seen=[];
const own=(o,k)=>{if(o===null||(typeof o!=="object"&&typeof o!=="function"))bad();const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,"value"))bad();seen.push([o,k,d]);return d.value;};
const arr=(o,n)=>{if(!Array.isArray(o)||Object.getPrototypeOf(o)!==Array.prototype||own(o,"length")!==n||Reflect.ownKeys(o).length!==n+1)bad();for(let i=0;i<n;i++)own(o,String(i));return o;};
const descriptors=o=>Reflect.ownKeys(o).map(k=>{const d=Object.getOwnPropertyDescriptor(o,k);if(!d)bad();return[o,k,d];});
const verify=()=>{for(const[o,k,d]of seen){const n=Object.getOwnPropertyDescriptor(o,k);if(!n||Reflect.ownKeys(n).length!==Reflect.ownKeys(d).length||Reflect.ownKeys(d).some(k=>!Object.is(n[k],d[k])))bad();}};
const original=o=>{arr(o,11);const frame=own(o,"0");arr(frame,4);for(let i=0;i<4;i++)if(own(frame,String(i))!==own(o,String(i+1)))bad();for(const[item,key,d]of own(o,"5")){const n=Object.getOwnPropertyDescriptor(item,key);if(!n||Reflect.ownKeys(n).length!==Reflect.ownKeys(d).length||Reflect.ownKeys(d).some(k=>!Object.is(n[k],d[k])))bad();}return{sc:own(o,"3"),util:own(o,"4"),proxy:own(o,"6"),path:own(o,"7"),date:own(o,"9"),now:own(o,"10")};};`;
export const CURRENT_SELECTED_FILE_MAIN_SQL_FENCE_JOIN_HELPERS = joins;
/** Capture only after the actual sqlite3/util imports; both prototypes and
 * exports remain original. The immutable target is comparison data only. */
export const CURRENT_SELECTED_FILE_MAIN_SQL_FENCE_CAPTURE_PROGRAM = `function(expectedPath){${joins}\narr(this,4);const z2=own(this,"0"),yo=own(this,"1"),sqlite=own(this,"2"),util=own(this,"3"),types=own(util,"types"),proxy=own(types,"isProxy"),db=own(sqlite,"Database"),stmt=own(sqlite,"Statement"),date=own(globalThis,"Date"),now=own(date,"now");if(typeof expectedPath!=="string"||expectedPath.length===0||expectedPath.length>4096||!expectedPath.isWellFormed()||expectedPath.includes("\\0")||typeof proxy!=="function")bad();const held=[...descriptors(own(z2,"prototype")),...descriptors(own(yo,"prototype")),...descriptors(sqlite),...descriptors(util),...descriptors(types),...descriptors(db),...descriptors(stmt),...descriptors(own(db,"prototype")),...descriptors(own(stmt,"prototype")),...descriptors(date),...descriptors(now)];verify();return[this,z2,yo,sqlite,util,held,proxy,expectedPath,new Map,date,now];}`;
export const CURRENT_SELECTED_FILE_MAIN_SQL_FENCE_REQUIRE_PROGRAM = `function(){${joins}\noriginal(this);verify();return true;}`;
/** Retain the actual original frame/connection/SQL/parameter identities. This
 * packet is descriptive and grants no resume; the existing source collector
 * must independently prove its originating request before the one native call. */
export const CURRENT_SELECTED_FILE_MAIN_SQL_FENCE_SELECT_PROGRAM = `function(capture){${joins}\nconst z=original(capture),proxy=z.proxy;if(proxy(this))bad();arr(this,5);const wrap=own(this,"0"),sql=own(this,"1"),params=own(this,"2");if(proxy(wrap)||proxy(params)||own(this,"3")!==z.sc||own(this,"4")!==z.util||Object.getPrototypeOf(wrap)!==own(own(capture,"1"),"prototype")||typeof sql!=="string"||sql.length===0||sql.length>65536||!Array.isArray(params))bad();const db=own(wrap,"db");if(proxy(db)||Object.getPrototypeOf(db)!==own(own(z.sc,"Database"),"prototype")||own(db,"filename")!==z.path)bad();const n=own(params,"length");if(!Number.isSafeInteger(n)||n<0||n>4096)bad();arr(params,n);verify();return[this,capture,wrap,db,sql,params];}`;
/** A prepare-return join retains the native statement itself and the exact
 * original Promise resolver/rejector. SQL equality alone cannot mint it. */
export const CURRENT_SELECTED_FILE_MAIN_SQL_FENCE_PREPARE_RETURN_PROGRAM = `function(capture,pending){${joins}\nconst z=original(capture),proxy=z.proxy;if(proxy(this)||proxy(pending))bad();arr(this,7);arr(pending,6);const frame=own(pending,"0");arr(frame,6);for(let i=0;i<4;i++)if(own(frame,String(i))!==own(this,String(i)))bad();if(own(frame,"4")!==z.sc||own(frame,"5")!==z.util||own(this,"5")!==z.sc||own(this,"6")!==z.util||own(pending,"1")!==capture)bad();const stmt=own(this,"4");if(proxy(stmt)||Object.getPrototypeOf(stmt)!==own(own(z.sc,"Statement"),"prototype")||own(stmt,"sql")!==own(pending,"4"))bad();verify();return[this,pending,stmt];}`;

/** The source's Sy serialize/run pair is configuration, never readonly SQL or
 * a project write grant. Only this capture's actual DB/sql-owner pair can use
 * each half once; bookkeeping changes only the inspector's private Map. */
export const CURRENT_SELECTED_FILE_MAIN_SQL_FENCE_CONFIGURATION_PROGRAM = `function(capture,stage){${joins}\nconst z=original(capture),proxy=z.proxy;if(proxy(this))bad();arr(this,5);const path=own(this,"0"),db=own(this,"1"),owner=own(this,"2"),configs=own(capture,"8");if(proxy(db)||proxy(owner)||own(this,"3")!==z.sc||own(this,"4")!==z.util||typeof path!=="string"||path.length===0||path.length>4096||Object.getPrototypeOf(db)!==own(own(z.sc,"Database"),"prototype")||own(db,"filename")!==path||Object.getPrototypeOf(owner)!==own(own(capture,"2"),"prototype")||own(owner,"path")!==path||own(owner,"db")!==db||own(own(owner,"dbWrap"),"db")!==db||Object.getPrototypeOf(own(owner,"dbWrap"))!==own(own(capture,"1"),"prototype")||Object.getPrototypeOf(configs)!==Map.prototype||configs.size>32)bad();const previous=configs.get(db);if(stage==="serialize"){if(previous!==undefined||configs.size>=32)bad();}else if(stage==="pragma"){if(previous===undefined||previous.owner!==owner||previous.stage!=="serialize")bad();}else bad();verify();configs.set(db,{owner,stage});return{schema:"private.selected-file-main-sql-initializer-config.v1",stage,path,selectedFile:path===z.path,readonlySql:false,nativeCompletionProven:false,designWriteGrant:false};}`;
