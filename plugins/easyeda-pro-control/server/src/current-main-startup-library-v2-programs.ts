/** Original runScripts invocation identity across its awaits. The caller
 * frame is inspector-private; its r array remains application-owned/read-only. */
import { CURRENT_MAIN_STARTUP_LIBRARY_JOIN_HELPERS as HELPERS, CURRENT_MAIN_STARTUP_LIBRARY_CALLS as V1 } from "./current-main-startup-library-programs.ts";
import { CURRENT_MAIN_STARTUP_LIBRARY_RETURN_PROGRAM as RETURN_V1 } from "./current-main-startup-library-return-program.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const CURRENT_MAIN_STARTUP_LIBRARY_V2_CALLER_EXPRESSION = "[this,r,i]";
/** V1 code stays byte-exact. Reuse only its fixed shared prelude and private
 * legacy tracker under a new original-invocation wrapper and protocol. */
function body(program: string): string {
  const start = program.indexOf(`${HELPERS}\n`);
  if (start === -1 || program.includes(`${HELPERS}\n`, start + 1) || !program.endsWith("}")) { throw new Error("STOCK_V2_FIXED_BODY"); }
  return program.slice(start + HELPERS.length + 1, -1);
}
function replaceOnce(source: string, before: string, after: string): string {
  if (source.split(before).length !== 2) { throw new Error("STOCK_V2_FIXED_REPLACEMENT"); } return source.replace(before, after);
}
const invocation = String.raw`
const invocationRetained=(tracker,configTracker)=>{const config=retained(configTracker),proxy=config.z.proxy;checked(tracker,proxy);arr(tracker,4);const legacy=own(tracker,"0"),old=libraryRetained(legacy,configTracker),first=checked(own(tracker,"1"),proxy),raw=checked(own(tracker,"2"),proxy),held=checked(own(tracker,"3"),proxy);arr(first,3);arr(raw,333);arr(held,334);if(own(first,"0")!==old.current.yo||own(first,"1")!==raw||own(first,"2")!==own(old.chunks,"0"))bad();for(let i=0;i<334;i++){const entry=checked(own(held,String(i)),proxy);arr(entry,3);if(own(entry,"0")!==raw)bad();const key=own(entry,"1"),before=own(entry,"2"),after=Object.getOwnPropertyDescriptor(raw,key);if(!after||Reflect.ownKeys(after).length!==Reflect.ownKeys(before).length||Reflect.ownKeys(before).some(k=>!Object.is(after[k],before[k])))bad();}return{legacy,old,raw};};
`;
const bindBody = replaceOnce(body(V1.bind),"verify();return tracker;", String.raw`const first=checked(caller,config.z.proxy);arr(first,3);const raw=checked(own(first,"1"),config.z.proxy),expected=script.replace(/^--.*$/g,"").split(/\r?\n\r?\n/m);arr(raw,333);if(expected.length!==333||own(first,"0")!==current.yo||own(first,"2")!==own(chunks,"0"))bad();for(let i=0;i<333;i++)if(own(raw,String(i))!==expected[i])bad();const held=descriptors(raw);for(const row of held){Object.freeze(row[2]);Object.freeze(row);}Object.freeze(held);const invocation=[tracker,first,raw,held];Object.freeze(invocation);invocationRetained(invocation,configTracker);verify();return invocation;`);
if (bindBody === body(V1.bind)) { throw new Error("STOCK_V2_BIND_BODY"); }
const selectBody = replaceOnce(replaceOnce(body(V1.select),"const old=libraryRetained(tracker,configTracker),z=old.z;", String.raw`const binding=invocationRetained(tracker,configTracker),old=binding.old,z=old.z;checked(caller,z.proxy);arr(caller,3);if(own(caller,"0")!==old.current.yo||own(caller,"1")!==binding.raw)bad();`),'verify();old.state.next=index+1;', String.raw`const rawIndex=index>=320?index+1:index;if(own(caller,"2")!==sql||own(binding.raw,String(rawIndex))!==sql)bad();verify();old.state.next=index+1;`);
const returnBody = replaceOnce(body(RETURN_V1),"const old=libraryRetained(tracker,configTracker),z=old.z;", "const old=invocationRetained(tracker,configTracker).old,z=old.z;");
export const CURRENT_MAIN_STARTUP_LIBRARY_V2_CALLS = freezeDeep({
  bind: `function(configTracker,expectedAppDirectory,caller){${HELPERS}\n${invocation}\n${bindBody}}`,
  select: `function(configTracker,tracker,caller){${HELPERS}\n${invocation}\n${selectBody}}`,
  returned: `function(configTracker,tracker,returnPromise,returned){${HELPERS}\n${invocation}\n${returnBody}}`,
});
