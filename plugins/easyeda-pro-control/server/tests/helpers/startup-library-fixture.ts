/** Inert separate-realm original-reference peers. Provider aliases stay private. */
import { types } from "node:util";
import { createContext, runInContext } from "node:vm";
import { CURRENT_MAIN_STARTUP_LIBRARY_CHUNKS as CHUNKS } from "../../src/current-main-startup-library-catalog.ts";
import { CURRENT_MAIN_STARTUP_LIBRARY_CALLS as CALLS, CURRENT_MAIN_STARTUP_LIBRARY_FRAME_EXPRESSION as FRAME } from "../../src/current-main-startup-library-programs.ts";
import { CURRENT_MAIN_STARTUP_CONFIG_CALLS as CONFIG } from "../../src/current-main-startup-config-programs.ts";
import { CURRENT_SELECTED_FILE_MAIN_SQL_FENCE_CAPTURE_PROGRAM as CAPTURE } from "../../src/current-selected-file-main-sql-fence-programs.ts";

export function fixture(packaged = false, blankRawIndex = 332): ReturnType<typeof createContext> {
  const context = createContext({ nativeProxy: types.isProxy, nativePromise: types.isPromise, lengths: CHUNKS.map(row => row.utf16), packaged, blankRawIndex });
  runInContext(String.raw`let calls=0;const forbidden=()=>{calls++;throw Error("application/native call");};
const rawScript=lengths.map(n=>"X".repeat(n));rawScript.splice(blankRawIndex,0,"");const W0=false,yE=rawScript.join("\n\n");
function jlFrame(t){return ${FRAME};}
const kit=(()=>{class Z2{constructor(db){this.db=db;}run(){forbidden();}}class Yo{constructor(path,db){this.path=path;this.db=db;this.dbWrap=new Z2(db);this.transactionDepth=0;}runScripts(){forbidden();}}
const F5={types:{isProxy:nativeProxy,isPromise:nativePromise}},sc={Database:Map,Statement:Set},documents="C:\\Synthetic\\Documents",root=documents+"\\EasyEDA-Pro",directory=root+"\\database",web=directory+"\\web.db",app="C:\\Program Files\\easyeda-pro\\resources\\app",path=packaged?app+"\\assets\\db\\easyeda-std.elib":root+"\\libraries\\easyeda-std.elib";
const db=path=>{const value=new Map;Object.defineProperty(value,"filename",{value:path});return value;},init=new Yo(web,db(web)),libraryOwner=new Yo(path,db(path)),foreign=new Yo(path,db(path)),row={key:"sqlite",value:"25.10.31.1"},configFrame=[web,init.db,init,row,web,documents,root,directory,"EasyEDA-Pro",sc,F5,Date,Date.now];
const capture=(${CAPTURE}).call([Z2,Yo,sc,F5],"C:\\Synthetic\\selected.eprj2"),configTracker=(${CONFIG.version}).call(configFrame,capture),chunks=yE.split(/\r?\n\r?\n/m).filter(v=>!/^\s*$/.test(v));
return{libraryOwner,app,path,configFrame,configTracker,tuple:(index,params,other=false)=>[other?foreign.dbWrap:libraryOwner.dbWrap,chunks[index],params,sc,F5]};})();
let frame=jlFrame(kit.libraryOwner),tracker,params=[];`, context);
  return context;
}
export function bind(context: ReturnType<typeof createContext>): void { runInContext(`tracker=(${CALLS.bind}).call(frame,kit.configTracker,kit.app)`, context); }
export function select(context: ReturnType<typeof createContext>, index: number): unknown {
  return runInContext(`(${CALLS.select}).call(kit.tuple(${String(index)},params),kit.configTracker,tracker)`, context);
}
