/** Fixed native-inverse history syntax. Runtime callback IDs are compared by
 * its own original inventory-bound custody, never a generated-fixture literal.
 * The existing Via program table and all old native owners remain unchanged. */
import { CURRENT_PROJECT_HISTORY_MAIN_PROGRAMS as PREVIOUS } from "./current-project-history-main-programs.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

const oldIdChecks='||base.kind==="data"&&lastID!==2||base.kind==="head"&&base.mode==="append"&&lastID!==2';
function program(key:string,row:typeof PREVIOUS[keyof typeof PREVIOUS]):typeof PREVIOUS[keyof typeof PREVIOUS]{
 if(key==="callback"){if(row.program.includes(oldIdChecks)){throw new Error("INVERSE_NATIVE_MAIN_HISTORY_CALLBACK_ANCHOR");}return row;}
 if(row.program.split(oldIdChecks).length!==2){throw new Error("INVERSE_NATIVE_MAIN_HISTORY_PROGRAM_ANCHOR");}
 return {...row,program:row.program.replace(oldIdChecks,"")};
}
const rows=Object.entries(PREVIOUS).map(([key,value])=>[key,program(key,value)]);
// oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Object.entries preserves exactly the maintained immutable data-program keys; no token, callback, native owner or origin is cast.
export const CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_MAIN_HISTORY_PROGRAMS=freezeDeep(Object.fromEntries(rows) as Readonly<Record<keyof typeof PREVIOUS,typeof PREVIOUS[keyof typeof PREVIOUS]>>);
