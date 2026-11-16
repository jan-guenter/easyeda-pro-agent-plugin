/** Pure fixed join on the original first run tuple and its original catch frame.
 * It modifies neither the native Error nor any vendor receiver/SQL/cursor. */
import { CURRENT_MAIN_STARTUP_LIBRARY_V2_CALLS as CALLS } from "./current-main-startup-library-v2-programs.ts";

const marker="const binding=invocationRetained(tracker,configTracker),old=binding.old,z=old.z;";
const program=CALLS.select,split=program.indexOf(marker);
if(split===-1 || program.includes(marker,split+1) || !program.startsWith("function(configTracker,tracker,caller){")) { throw new Error("STOCK_READONLY_FIXED_PROGRAM"); }
const prelude=program.slice(program.indexOf("{")+1,split);
export const CURRENT_MAIN_STARTUP_LIBRARY_READONLY_PROGRAM=String.raw`function(configTracker,tracker,rejected){${prelude}
const binding=invocationRetained(tracker,configTracker),old=binding.old,z=old.z;
checked(this,z.proxy);arr(this,5);checked(rejected,z.proxy);arr(rejected,4);
for(let i=0;i<3;i++)if(own(this,String(i))!==own(rejected,String(i)))bad();
const parameters=checked(own(this,"2"),z.proxy);arr(parameters,0);
if(own(this,"0")!==old.current.wrap||own(this,"3")!==z.sc||own(this,"4")!==z.util||own(old.state,"next")!==1||own(this,"1")!==own(old.chunks,"0")||own(binding.raw,"0")!==own(this,"1"))bad();
const legacy=binding.legacy,path=canonical(own(own(old.frame,"0"),"path")),app=canonical(own(legacy,"8"));
if(path!==app+"\\assets\\db\\easyeda-std.elib")bad();
const error=checked(own(rejected,"3"),z.proxy),isNativeError=own(own(z.util,"types"),"isNativeError");
if(typeof isNativeError!=="function"||z.proxy(isNativeError)||Function.prototype.toString.call(isNativeError)!=="function () { [native code] }"||!isNativeError(error)||own(error,"code")!=="SQLITE_READONLY"||own(error,"errno")!==8)bad();
verify();return{observed:true,failureCode:"SQLITE_READONLY",errno:8,scriptIndex:0,installedStockOnly:true,originalRethrowPending:true,normalReturnProven:false,nativeCompletionProven:false,successfulInitializationProven:false,selectedProjectWriteGrant:false,retryAllowed:false};}`;
