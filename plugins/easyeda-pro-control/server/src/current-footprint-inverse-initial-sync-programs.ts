/** Separate saved multi-head startup sync. The original sole-head generated
 * programs stay unchanged; these fixed projections admit at most eight heads. */
import { CURRENT_GENERATED_INITIAL_SYNC_PROGRAMS as GENERATED } from "./current-generated-initial-sync-programs.ts";
import { CURRENT_GENERATED_INITIAL_CACHE_PROGRAMS as GENERATED_CACHE } from "./current-generated-initial-cache-programs.ts";
import { CURRENT_FOOTPRINT_INVERSE_INITIAL_CACHE_PROGRAMS as CACHE } from "./current-footprint-inverse-initial-cache-programs.ts";

function once(source: string, before: string, after: string): string {
  const at = source.indexOf(before); if (at === -1 || source.includes(before, at + before.length)) { throw new Error("FOOTPRINT_INVERSE_INITIAL_SYNC_TEMPLATE"); }
  return source.slice(0, at) + after + source.slice(at + before.length);
}
let capture = once(GENERATED.capture, "function(module,project,head,caller,key,body){", "function(module,project,head,caller,key,body,nodes,depthLimit,arrayLimit,keyLimit,stringLimit,rows){");
capture = once(capture, "const retained=[];", 'if(!Number.isSafeInteger(rows)||rows<1||rows>8)bad();const retained=[];');
capture = once(capture, "nodes=0;", "retainedNodes=0;");
capture = once(capture, "++nodes>128||depth>7", "++retainedNodes>nodes||depth>depthLimit");
capture = once(capture, GENERATED_CACHE.head, CACHE.head);
capture = once(capture, 'head,[key,body])', 'head,[key,body,nodes,depthLimit,arrayLimit,keyLimit,stringLimit])');
capture = once(capture, 'array(history,1);', 'array(history,rows);');
const history = once(once(GENERATED.history, 'own(this,"6")!==undefined', 'own(this,"6")!==(own(index,"length")>1?own(index,"1"):undefined)'), 'array(result,1);const row=own(result,"0"),keys=', 'const n=own(index,"length");if(!Number.isSafeInteger(n)||n<1||n>8)bad();array(result,n);const keys=');
const responseStart = 'if(Object.getPrototypeOf(row)!==Object.prototype||Reflect.ownKeys(row).length!==keys.length)bad();for(let j=0;j<keys.length;j++){if(Reflect.ownKeys(row)[j]!==keys[j])bad();const v=own(row,keys[j]);if(v!==null&&!["string","number","boolean"].includes(typeof v))bad();if(!Object.is(v,own(head,keys[j])))bad();}return true;';
const response = once(history, responseStart, 'for(let i=0;i<n;i++){const row=own(result,String(i)),previous=own(index,String(i));if(Object.getPrototypeOf(row)!==Object.prototype||Reflect.ownKeys(row).length!==keys.length)bad();for(let j=0;j<keys.length;j++){if(Reflect.ownKeys(row)[j]!==keys[j])bad();const v=own(row,keys[j]);if(v!==null&&!["string","number","boolean"].includes(typeof v))bad();if(!Object.is(v,own(previous,keys[j])))bad();}}return true;');
let merged = once(GENERATED.merged, 'own(this,"6")!==undefined', 'own(this,"6")!==(own(own(original,"4"),"length")>1?own(own(original,"4"),"1"):undefined)');
merged = once(merged, 'array(result,1);const row=own(result,"0"),head=own(own(original,"4"),"0"),keys=', 'const baseline=own(original,"4"),n=own(baseline,"length");if(!Number.isSafeInteger(n)||n<1||n>8)bad();array(result,n);const keys=');
merged = once(merged, 'if(Object.getPrototypeOf(row)!==Object.prototype||Reflect.ownKeys(row).length!==keys.length)bad();for(let j=0;j<keys.length;j++){const k=keys[j];if(Reflect.ownKeys(row)[j]!==k||!Object.is(own(row,k),own(head,k)))bad();}', 'for(let i=0;i<n;i++){const row=own(result,String(i)),head=own(baseline,String(i));if(Object.getPrototypeOf(row)!==Object.prototype||Reflect.ownKeys(row).length!==keys.length)bad();for(let j=0;j<keys.length;j++){const k=keys[j];if(Reflect.ownKeys(row)[j]!==k||!Object.is(own(row,k),own(head,k)))bad();}}');
let baselineObjects = once(GENERATED.baselineObjects, 'function(){', 'function(nodes,depthLimit){');
baselineObjects = once(baselineObjects, 'depth>7||objects.length>=128', 'depth>depthLimit||objects.length>=nodes');
const responseObjects = once(GENERATED.responseObjects, 'return[reply,result,own(result,"0")];', 'const n=own(result,"length");if(!Number.isSafeInteger(n)||n<1||n>8)throw new Error("FOOTPRINT_INVERSE_INITIAL_SYNC_RESPONSE");const all=[reply,result];for(let i=0;i<n;i++)all.push(own(result,String(i)));return all;');
export const CURRENT_FOOTPRINT_INVERSE_INITIAL_SYNC_PROGRAMS = Object.freeze({ capture, baselineObjects, responseObjects, full: GENERATED.full, history: response, merged, finalizing: GENERATED.finalizing, returned: GENERATED.returned });

// V8 returns this fixed newly-created closure's complete source in the capture
// Tuple. The larger saved-head guard has its own exact description admission.
const guardStart = capture.indexOf("const guard=()=>{"); const guardEnd = capture.indexOf(";\nguard();", guardStart);
if (guardStart === -1 || guardEnd <= guardStart || capture.includes("const guard=()=>{", guardStart + 1)) { throw new Error("FOOTPRINT_INVERSE_INITIAL_SYNC_GUARD_SOURCE"); }
export const CURRENT_FOOTPRINT_INVERSE_INITIAL_SYNC_GUARD_DESCRIPTION = capture.slice(guardStart + "const guard=".length, guardEnd);
