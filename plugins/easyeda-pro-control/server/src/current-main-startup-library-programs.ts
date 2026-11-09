/** Fixed READONLY preparation on original inspector-held references. The
 * parent supplies its original SQL/config capture and the actual JL frame.
 * bind/select mutate only newly allocated or retained inspector-private
 * bookkeeping. Their fixed protocol pins throwOnSideEffect:false for that
 * reason. They call no vendor/SQL body and grant no continuation. */
import { CURRENT_MAIN_STARTUP_LIBRARY_CHUNKS as CHUNKS, CURRENT_MAIN_STARTUP_LIBRARY_SOURCE as SOURCE } from "./current-main-startup-library-catalog.ts";
import { CURRENT_MAIN_STARTUP_CONFIG_JOIN_HELPERS as CONFIG } from "./current-main-startup-config-programs.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

/** JL uses precisely these bindings. SQLite provider aliases and startup path
 * globals belong to other lexical scopes and must not be looked up here. */
export const CURRENT_MAIN_STARTUP_LIBRARY_FRAME_EXPRESSION = SOURCE.invocation.frameExpression;
const lengths = JSON.stringify(CHUNKS.map(row => row.utf16));
const helpers = `${CONFIG}\n${String.raw`
const canonical=s=>{if(typeof s!=="string"||s.length===0||s.length>4096||!s.isWellFormed()||!/^[A-Z]:\\/.test(s))bad();const parts=s.slice(3).split("\\");if(parts.length===0||parts.some(p=>p.length===0||p==="."||p===".."||/[<>:"/\\|?*\u0000-\u001F\u007F]/.test(p)||/[. ]$/.test(p)||/^(?:CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])(?:\.|$)/i.test(p)))bad();return s;};
const stock=(frame,config,appDirectory)=>{const z=config.z;checked(frame,z.proxy);arr(frame,3);const documents=canonical(own(config.frame,"5")),root=canonical(own(config.frame,"6")),app=canonical(appDirectory),yo=checked(own(frame,"0"),z.proxy),path=canonical(own(yo,"path"));if(own(frame,"1")!==false||own(config.frame,"8")!=="EasyEDA-Pro"||root!==documents+"\\EasyEDA-Pro"||path!==root+"\\libraries\\easyeda-std.elib"&&path!==app+"\\assets\\db\\easyeda-std.elib"||path===z.path||path===config.path)bad();const current=owner(yo,path,config.capture);if(own(yo,"transactionDepth")!==0)bad();for(const k of["runScripts","begin","commit","rollback"])if(Object.hasOwn(yo,k))bad();for(const k of["run","prepare","stmtRun"])if(Object.hasOwn(current.wrap,k))bad();for(const k of["run","prepare","close","serialize"])if(Object.hasOwn(current.db,k))bad();return{path,current};};
`}
const lengths=${lengths};
const libraryRetained=(tracker,configTracker)=>{const config=retained(configTracker),z=config.z;checked(tracker,z.proxy);arr(tracker,10);if(own(tracker,"1")!==configTracker)bad();const frame=own(tracker,"0"),bound=stock(frame,config,own(tracker,"8")),state=plain(own(tracker,"9"),z.proxy),chunks=checked(own(tracker,"7"),z.proxy),script=own(frame,"2");arr(chunks,${SOURCE.script.chunkCount});if(bound.path!==own(tracker,"2")||bound.current.yo!==own(tracker,"3")||bound.current.db!==own(tracker,"4")||bound.current.wrap!==own(tracker,"5")||script!==own(tracker,"6")||typeof script!=="string"||script.length!==${SOURCE.script.utf16}||!script.isWellFormed()||own(state,"owner")!==tracker||Reflect.ownKeys(state).length!==2||!Number.isSafeInteger(own(state,"next"))||own(state,"next")<0||own(state,"next")>${SOURCE.script.chunkCount})bad();for(let i=0;i<${SOURCE.script.chunkCount};i++){const chunk=own(chunks,String(i));if(typeof chunk!=="string"||chunk.length!==lengths[i]||!chunk.isWellFormed())bad();}return{config,z,frame,current:bound.current,state,chunks};};`;

export const CURRENT_MAIN_STARTUP_LIBRARY_JOIN_HELPERS = helpers;

export const CURRENT_MAIN_STARTUP_LIBRARY_CALLS = freezeDeep({
  /** Pause at the original JL English call. configTracker must be the existing
   * original startup tracker. App directory comparison comes from the separately
   * admitted app.js URL; this leaf cannot select an installation or a caller. */
  bind: `function(configTracker,expectedAppDirectory){${helpers}
const config=retained(configTracker),bound=stock(this,config,expectedAppDirectory),current=bound.current,script=own(this,"2");if(typeof script!=="string"||script.length!==${SOURCE.script.utf16}||!script.isWellFormed())bad();const chunks=script.replace(/^--.*$/g,"").split(/\\r?\\n\\r?\\n/m).filter(v=>!/^\\s*$/.test(v));if(chunks.length!==${SOURCE.script.chunkCount}||chunks.some((s,i)=>s.length!==lengths[i]))bad();Object.freeze(chunks);const state={owner:null,next:0},tracker=[this,configTracker,bound.path,current.yo,current.db,current.wrap,script,chunks,expectedAppDirectory,state];state.owner=tracker;Object.freeze(tracker);libraryRetained(tracker,configTracker);verify();return tracker;}`,
  /** Use the original cached [wrap,sql,parameters,sc,F5] tuple, rebased from its
   * original capture. Only the current SQL string is returned for independent
   * parent SHA/byte/index checks. The complete yE string stays remote. */
  select: `function(configTracker,tracker){${helpers}
const old=libraryRetained(tracker,configTracker),z=old.z;checked(this,z.proxy);arr(this,5);const wrap=checked(own(this,"0"),z.proxy),parameters=checked(own(this,"2"),z.proxy);arr(parameters,0);if(own(this,"3")!==z.sc||own(this,"4")!==z.util)bad();if(wrap!==old.current.wrap){verify();return{recognized:false};}const sql=own(this,"1"),index=own(old.state,"next");if(index>=${SOURCE.script.chunkCount}||typeof sql!=="string"||sql.length===0||sql.length>${SOURCE.script.maximumChunkUtf16}||!sql.isWellFormed()||sql!==own(old.chunks,String(index)))bad();verify();old.state.next=index+1;return{recognized:true,role:"jl",site:"run",scriptIndex:index,sql,parametersEmpty:true,transactionDepth:0,designWriteGrant:false,nativeCompletionProven:false,normalReturnProven:false};}`,
});
