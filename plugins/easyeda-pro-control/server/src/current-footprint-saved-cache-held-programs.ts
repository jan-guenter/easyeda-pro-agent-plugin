/** Fixed unmounted programs retain one original native getter/match tuple.
 * Receiver creation is separate from descriptor capture and happens only after
 * the original runner qualifies its complete function rosters.
 */
import { CURRENT_FOOTPRINT_SAVED_CACHE_ACCESSOR_PROBE_CALLS } from "./current-footprint-saved-cache-accessor-probe.ts";
import { CURRENT_FOOTPRINT_COPY_SAVED_QUEUE_FUNCTION } from "./current-footprint-copy-saved-queue.ts";
import { CURRENT_FOOTPRINT_SAVED_CACHE_HELD_DESCRIPTORS } from "./current-footprint-saved-cache-held-profile.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

const baseline = JSON.stringify(CURRENT_FOOTPRINT_SAVED_CACHE_HELD_DESCRIPTORS);
const select = CURRENT_FOOTPRINT_SAVED_CACHE_ACCESSOR_PROBE_CALLS.capture;
const helpers = String.raw`const fail=()=>{throw Error("SAVED_CACHE_HELD_IDENTITY");};
const field=(tuple,key)=>{const d=Object.getOwnPropertyDescriptor(tuple,key);if(!d||!Object.hasOwn(d,"value"))fail();return d;};
const tupleCheck=(tuple,held,phase)=>{
const targeted=held&&phase>0;
if(!Array.isArray(tuple)||Object.getPrototypeOf(tuple)!==Array.prototype||Reflect.ownKeys(tuple).length!==(held?(targeted?9:8):6))fail();
const length=field(tuple,"length");if(length.value!==(held?(targeted?8:7):5)||length.writable!==true||length.enumerable!==false||length.configurable!==false)fail();
const selected=(${select})();if(selected[4]!==${JSON.stringify(baseline)})fail();
for(let i=0;i<5;i++){const d=field(tuple,String(i));if(d.value!==selected[i]||d.writable!==true||d.enumerable!==true||d.configurable!==true)fail();}
if(held){const receiver=field(tuple,"5"),state=field(tuple,"6");if(receiver.value===null||typeof receiver.value!=="object"||Object.getPrototypeOf(receiver.value)!==selected[1]||Object.getOwnPropertyDescriptor(receiver.value,"match")!==undefined||receiver.writable!==false||receiver.enumerable!==true||receiver.configurable!==false||state.value!==phase||state.writable!==true||state.enumerable!==true||state.configurable!==false)fail();}
if(targeted){const scope=field(tuple,"7");if(typeof scope.value!=="string"||scope.value.length!==97||!/^[a-f0-9]{64}\/[a-f0-9]{32}$/.test(scope.value)||scope.writable!==false||scope.enumerable!==true||scope.configurable!==false)fail();}
return selected;};`;

/** Substitute one reviewed fixed fragment and refuse template drift. Input never
 * comes from a caller, and this helper neither compiles nor dispatches a program.
 */
function replaceOnce(program: string, before: string, after: string): string {
  const parts = program.split(before);
  if (parts.length !== 2) { throw new Error("SAVED_CACHE_HELD_TEMPLATE"); }
  return parts.join(after);
}

/** Preserve the reviewed three inactive-target RPCs and both noncreating cache
 * namespace reads. Replace only global cache lookup with the held native tuple;
 * consume the private phase before asynchronous work and reprove it at each old
 * check. The later observation is freshness, not another namespace.
 */
function queueProgram(expected: 0 | 1): string {
  let program = replaceOnce(CURRENT_FOOTPRINT_COPY_SAVED_QUEUE_FUNCTION,
    "const target={projectUuid,branchUuid},root=globalThis,apply=Reflect.apply;",
    `const target={projectUuid,branchUuid},root=globalThis,apply=Reflect.apply;${helpers}\nconst tuple=this;tupleCheck(tuple,true,${String(expected)});if(typeof projectUuid!=="string"||typeof branchUuid!=="string"||projectUuid.length!==64||branchUuid.length!==32||!/^[a-f0-9]{64}$/.test(projectUuid)||!/^[a-f0-9]{32}$/.test(branchUuid))fail();const sealed=projectUuid+"/"+branchUuid;${expected === 0 ?
      'Object.defineProperty(tuple,"7",{value:sealed,writable:false,enumerable:true,configurable:false});' :
      'if(field(tuple,"7").value!==sealed)fail();'}tuple[6]=${String(expected + 1)};`);
  program = replaceOnce(program, "const storage=root.caches,constructor=root.CacheStorage,prototype=constructor?.prototype;",
    "const constructor=field(tuple,'0').value,prototype=field(tuple,'1').value,storage=field(tuple,'5').value;");
  program = replaceOnce(program, "const match=own(prototype,'match');", "const match=field(tuple,'2').value;");
  program = replaceOnce(program, "if(root.caches!==storage||root.CacheStorage!==constructor||constructor.prototype!==prototype||Object.getPrototypeOf(storage)!==prototype||Object.hasOwn(storage,'match')||own(prototype,'match')!==match||own(root,'setTimeout')!==set||own(root,'clearTimeout')!==clear)bad();",
    `tupleCheck(tuple,true,${String(expected + 1)});if(own(root,'setTimeout')!==set||own(root,'clearTimeout')!==clear)bad();`);
  return program;
}

export const CURRENT_FOOTPRINT_SAVED_CACHE_HELD_CALLS = freezeDeep({
  capture: select,
  recheckBeforeGetter: `function(){${helpers}tupleCheck(this,false,0);return true;}`,
  retainReceiver: `function(){${helpers}const selected=tupleCheck(this,false,0),storage=Reflect.apply(selected[3],globalThis,[]);tupleCheck(this,false,0);if(storage===null||typeof storage!=="object"||Object.getPrototypeOf(storage)!==selected[1])fail();Object.defineProperty(this,"5",{value:storage,writable:false,enumerable:true,configurable:false});Object.defineProperty(this,"6",{value:0,writable:true,enumerable:true,configurable:false});tupleCheck(this,true,0);return true;}`,
  first: queueProgram(0), fresh: queueProgram(1),
  recheckFirst: `function(){${helpers}tupleCheck(this,true,1);return true;}`,
  recheckFresh: `function(){${helpers}tupleCheck(this,true,2);return true;}`,
});
