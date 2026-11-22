/** V4-only pure source composition fork of current-pcb-via-main-captured-rebase.ts
 * at 28d147dfca3370efc5134646898c9c8808670d16. Only the actual join, callback
 * join and bookkeeping implementation closure is retained. Published Via
 * catalogues, capture guards and owner registries remain independent. */
import { CURRENT_MAIN_CAPTURED_SCOPE_FRAMES as FRAMES } from "./current-main-captured-scope-frames.ts";

interface Join { readonly program: string; readonly arguments: number; readonly length: number; readonly returnByValue: false }
interface Bookkeeping { readonly program: string; readonly arguments: number; readonly length: number; readonly returnByValue: boolean }
const copies = Object.freeze([
  ["z", "input,save:o"], ["z", "callback,enter:o"], ["z", "branch,callbackPacket:o"], ["z", "head,kind,branchPacket:o"], ["z", "append:o"], ["z", "history,returned:o"],
  ["z", "committing:o"], ["z", "committed:o"], ["z", "transactionReturned:o"], ["z", "post:o"], ["z", "table,time,modifier,projectQuery:o"], ["z", "projectReturned:o"], ["z", "saveReturned:o"],
  ["bound", "frame,params,resolve,reject,capture,tx"], ["bound", "pending"],
  ["base", "branchPacket:packet,head,copy,mode"], ["base", "writerPacket:packet,writerFrame:f"], ["base", "entryPacket:packet,entry:f,arg,snapshot,history,chunk"],
  ["base", 'capture,z,cipherPacket:packet,cipherBytes:own(f,"5"),key,encrypted'], ["base,observed", "runPacket:packet,runFrame:f,kind,value,expected,caller"], ["base", "changes,lastID"],
  ["q", "row"], ["q", "rows,table"], ["q", "identity,f,params,exec,capture"], ["q", "stmt,changes,lastID"], ["state", "f"],
] as const);
/** Fresh defineProperty is also rejected by V8 readonly evaluation. This
 * assignment refuses inherited hooks/read-only fields and proves the exact
 * own standard data slot afterward; it writes no prototype or app object. */
const scratchWrite = 'const writeCapturedField=(result,key,value)=>{if(Object.getPrototypeOf(result)!==Object.prototype||Object.getPrototypeOf(Object.prototype)!==null)throw new Error("PCB_VIA_CAPTURED_SCRATCH_PROTOTYPE");const inherited=Object.getOwnPropertyDescriptor(Object.prototype,key);if(inherited&&(!Object.hasOwn(inherited,"value")||!inherited.writable))throw new Error("PCB_VIA_CAPTURED_SCRATCH_INHERITED");result[key]=value;const d=Object.getOwnPropertyDescriptor(result,key);if(!d||!Object.hasOwn(d,"value")||!Object.is(d.value,value)||!d.writable||!d.enumerable||!d.configurable)throw new Error("PCB_VIA_CAPTURED_SCRATCH_DESCRIPTOR");};';
const scratchCopy = `${scratchWrite}const copyCapturedState=(parts,fields)=>{const result={};for(const part of [...parts,fields])for(const key of Reflect.ownKeys(part)){const d=Object.getOwnPropertyDescriptor(part,key);if(typeof key!=="string"||key==="__proto__"||!d||!Object.hasOwn(d,"value")||d.enumerable!==true)throw new Error("PCB_VIA_CAPTURED_SCRATCH_COPY");writeCapturedField(result,key,d.value);}return result;};`;
/** V8 refuses object-spread copies under throwOnSideEffect:true, including
 * fresh scratch objects. Replace only this closed catalogue of internal
 * return copies. Descriptor copying invokes no accessor and changes only a
 * fresh local result; any unrecognized copy or source census refuses. */
function readonlyProgram(original: string, expected: number): string {
  if (["copyCapturedState", "copyCapturedFields", "writeCapturedField"].some(name => original.includes(name))) { throw new Error("PCB_VIA_CAPTURED_COPY_COLLISION"); } let changed = 0, program = original;
  for (const [parts, fields] of copies) { const before = `return{${parts.split(",").map(part => `...${part}`).join(",")},${fields}};`; const count = program.split(before).length - 1; if (count > 1) { throw new Error("PCB_VIA_CAPTURED_COPY_DUPLICATE"); } changed += count; program = program.replace(before, `return copyCapturedState([${parts}],{${fields}});`); }
  if (changed !== expected || /\{\s*\.\.\./u.test(program)) { throw new Error("PCB_VIA_CAPTURED_COPY_CENSUS"); } return program;
}
/** Compose immutable reviewed functions with only the fixed scratch-copy
 * substitutions above. Legacy exports remain unchanged. Callback variants
 * add the original capture before their pending packet. */
function join(frame: typeof FRAMES.beginRun, original: string, args: readonly string[], capture: string, length: number): Readonly<Join> {
  let expected = 5; if (args.length === 2) { expected = 15; } else if (frame === FRAMES.historyRun) { expected = 19; }
  const fixed = readonlyProgram(original, expected);
  const program = `function(${args.join(",")}){${scratchCopy}const normalized=(${frame.program}).call(this,${capture});return (${fixed}).call(normalized,${args.join(",")});}`;
  if (Buffer.byteLength(program) > 60_000) { throw new Error("PCB_VIA_CAPTURED_REBASE_BOUND"); }
  return Object.freeze({ program, arguments: args.length, length, returnByValue: false });
}
/** Explicit legacy argument order avoids inferring a callback's capture from
 * packet contents. Custody separately binds every argument to its original ID. */
function callbackJoin(frame: typeof FRAMES.beginCallback, original: string): Readonly<Join> {
  let expected = 5; if (frame === FRAMES.beginCallback) { expected = 15; } else if (frame === FRAMES.historyCallback) { expected = 19; }
  const fixed = readonlyProgram(original, expected);
  const program = `function(capture,pending){${scratchCopy}const normalized=(${frame.program}).call(this,capture);return (${fixed}).call(normalized,pending);}`;
  if (Buffer.byteLength(program) > 60_000) { throw new Error("PCB_VIA_CAPTURED_REBASE_BOUND"); }
  return Object.freeze({ program, arguments: 2, length: 4, returnByValue: false });
}
const scratchFields = 'const copyCapturedFields=(keys,read)=>{const result={};for(const key of keys){if(typeof key!=="string"||key==="__proto__")throw new Error("PCB_VIA_CAPTURED_FIELDS");writeCapturedField(result,key,read(key));}return result;};';
/** Adapt only fixed bookkeeping bodies. The two exact fromEntries forms keep
 * their original own() reads and final descriptor verification. All copies
 * allocate fresh scratch; source drift, unknown forms or count drift refuses. */
function bookkeeping(fixed: Readonly<Bookkeeping>, expectedCopies: number, fields: "branch" | "encrypt" | null = null): Readonly<Bookkeeping> {
  let body = readonlyProgram(fixed.program, expectedCopies);
  if (body.includes("copyCapturedFields")) { throw new Error("PCB_VIA_CAPTURED_FIELDS_COLLISION"); }
  if (fields !== null) {
    const before = fields === "branch" ? 'Object.fromEntries(names.map(k=>[k,own(head,k)]))' : 'Object.fromEntries(fields.map(k=>[k,own(arg,k)]))';
    const after = fields === "branch" ? 'copyCapturedFields(names,k=>own(head,k))' : 'copyCapturedFields(fields,k=>own(arg,k))';
    if (body.split(before).length !== 2) { throw new Error("PCB_VIA_CAPTURED_FIELDS_CENSUS"); } body = body.replace(before, after);
  }
  if (body.includes("Object.fromEntries")) { throw new Error("PCB_VIA_CAPTURED_FIELDS_UNKNOWN"); }
  const match = /^function\(([\w,]*)\)\{/u.exec(body), names = match?.[1];
  if (names === undefined || (names === "" ? 0 : names.split(",").length) !== fixed.arguments) { throw new Error("PCB_VIA_CAPTURED_ARGUMENT_CENSUS"); }
  const program = `function(${names}){${scratchCopy}${fields === null ? "" : scratchFields}return (${body}).call(this${names === "" ? "" : `,${names}`});}`;
  if (Buffer.byteLength(program) > 60_000) { throw new Error("PCB_VIA_CAPTURED_BOOKKEEPING_BOUND"); } return Object.freeze({ ...fixed, program });
}
/** Pure source compilation only. A runtime sender must still select its own
 * immutable program catalogue and original owner; these return no authority. */
export const currentMainCapturedRebaseProgram=join;
export const currentMainCapturedCallbackRebaseProgram=callbackJoin;
export const currentMainCapturedBookkeepingProgram=bookkeeping;
