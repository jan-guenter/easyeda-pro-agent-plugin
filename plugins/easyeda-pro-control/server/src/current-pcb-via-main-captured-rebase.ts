/** Fixed Via joins consume F5-free frames in the existing join request slot.
 * Capture handles remain private original-owner provenance; these programs
 * neither create a capture nor authorize a SQL call, clock sample or resume. */
import { CURRENT_MAIN_CAPTURED_SCOPE_FRAMES as FRAMES } from "./current-main-captured-scope-frames.ts";
import { CURRENT_PCB_VIA_MAIN_BEGIN_CALLS as BEGIN } from "./current-pcb-via-main-begin-programs.ts";
import { CURRENT_PROJECT_HISTORY_MAIN_PROGRAMS as HISTORY } from "./current-project-history-main-programs.ts";
import { CURRENT_PROJECT_SAVE_STRUCTURE_MAIN_PROGRAMS as STRUCTURE } from "./current-project-save-structure-main-programs.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";
import { types } from "node:util";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";

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
export const CURRENT_PCB_VIA_MAIN_BEGIN_REBASE = freezeDeep({
  run: join(FRAMES.beginRun, BEGIN.run.program, ["capture", "transactionPacket"], "capture", BEGIN.run.length),
  callback: callbackJoin(FRAMES.beginCallback, BEGIN.callback.program),
});
export const CURRENT_PCB_VIA_MAIN_HISTORY_REBASE = freezeDeep({
  runData: join(FRAMES.historyRun, HISTORY.runData.program, ["caller", "cipherPacket", "capture"], "capture", HISTORY.runData.length),
  runHead: join(FRAMES.historyRun, HISTORY.runHead.program, ["caller", "cipherPacket", "capture"], "capture", HISTORY.runHead.length),
  runBranch: join(FRAMES.historyRun, HISTORY.runBranch.program, ["caller", "cipherPacket", "capture"], "capture", HISTORY.runBranch.length),
  runCommit: join(FRAMES.historyRun, HISTORY.runCommit.program, ["caller", "cipherPacket", "capture"], "capture", HISTORY.runCommit.length),
  runProject: join(FRAMES.historyRun, HISTORY.runProject.program, ["caller", "cipherPacket", "capture"], "capture", HISTORY.runProject.length),
  sqlCallback: callbackJoin(FRAMES.historyCallback, HISTORY.sqlCallback.program),
});
export const CURRENT_PCB_VIA_MAIN_STRUCTURE_REBASE = freezeDeep({
  run: join(FRAMES.structureRun, STRUCTURE.run, ["caller", "execPacket", "capture"], "capture", 4),
  callback: callbackJoin(FRAMES.structureCallback, STRUCTURE.callback),
});
/** Preserve the original own() read callbacks so final descriptor verification
 * covers exactly the fields previously consumed by Object.fromEntries. */
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
export const CURRENT_PCB_VIA_MAIN_BEGIN_BOOKKEEPING = freezeDeep({
  save: bookkeeping(BEGIN.save, 13), transaction: bookkeeping(BEGIN.transaction, 13), returned: bookkeeping(BEGIN.returned, 15),
});
export const CURRENT_PCB_VIA_MAIN_HISTORY_BOOKKEEPING = freezeDeep({
  callback: bookkeeping(HISTORY.callback, 13), branch: bookkeeping(HISTORY.branch, 19, "branch"), branchValue: bookkeeping(HISTORY.branchValue, 19), writer: bookkeeping(HISTORY.writer, 19),
  encryptEntry: bookkeeping(HISTORY.encryptEntry, 19, "encrypt"), cipher: bookkeeping(HISTORY.cipher, 19), cipherValue: bookkeeping(HISTORY.cipherValue, 19), sqlValue: bookkeeping(HISTORY.sqlValue, 19),
  sqlCallbackValue: bookkeeping(HISTORY.sqlCallbackValue, 19), commitReturned: bookkeeping(HISTORY.commitReturned, 19), projectReturned: bookkeeping(HISTORY.projectReturned, 19),
  saveReturned: bookkeeping(HISTORY.saveReturned, 19), controllerReturned: bookkeeping(HISTORY.controllerReturned, 19),
});
/** Fixed metadata matches the unchanged structure protocol. Keep these pure
 * source rows here so the protocol can import them without a module cycle. */
function structureBookkeeping(program: string, args: number, length: number, returnByValue: boolean, expectedCopies: number): Readonly<Bookkeeping> { return bookkeeping({ program, arguments: args, length, returnByValue }, expectedCopies); }
export const CURRENT_PCB_VIA_MAIN_STRUCTURE_BOOKKEEPING = freezeDeep({
  selected: structureBookkeeping(STRUCTURE.selected, 1, 3, false, 2), selectedValue: structureBookkeeping(STRUCTURE.selectedValue, 0, 0, true, 2), update: structureBookkeeping(STRUCTURE.update, 1, 4, false, 2),
  rowsValue: structureBookkeeping(STRUCTURE.rowsValue, 0, 0, true, 2), exec: structureBookkeeping(STRUCTURE.exec, 1, 2, false, 2), runValue: structureBookkeeping(STRUCTURE.runValue, 0, 0, true, 5),
  callbackValue: structureBookkeeping(STRUCTURE.callbackValue, 0, 0, true, 5), updateReturned: structureBookkeeping(STRUCTURE.updateReturned, 1, 2, false, 2), serviceReturned: structureBookkeeping(STRUCTURE.serviceReturned, 1, 2, false, 2),
  controllerReturned: structureBookkeeping(STRUCTURE.controllerReturned, 1, 3, false, 2), response: structureBookkeeping(STRUCTURE.response, 1, 5, false, 2), responseValue: structureBookkeeping(STRUCTURE.responseValue, 0, 0, true, 2),
  finalSelect: structureBookkeeping(STRUCTURE.finalSelect, 0, 4, false, 5), finalEntry: structureBookkeeping(STRUCTURE.finalEntry, 1, 2, false, 5), finalReturned: structureBookkeeping(STRUCTURE.finalReturned, 1, 2, false, 5), finalValue: structureBookkeeping(STRUCTURE.finalValue, 0, 0, true, 5),
});
/** Reject Proxy/accessor containers before inspecting a closed program pair. */
function plain(value: unknown): value is Record<string, unknown> { return value !== null && typeof value === "object" && !types.isProxy(value) && !Array.isArray(value) && (Object.getPrototypeOf(value) === Object.prototype || Object.getPrototypeOf(value) === null); }
/** Only new closed phase/program pairs may substitute their immutable source
 * while the ordinary inert capture runs. Unknown source and every legacy
 * command retain the shared 16KiB scalar bound. Metadata is checked before
 * descriptor traversal, so an accessor or Proxy cannot supply this exception. */
export function captureCurrentPcbViaMainRebaseCommand(input: unknown): unknown {
  if (!plain(input)) { return captureCurrentPcbStringClockReply(input).value; }
  const phase = Object.getOwnPropertyDescriptor(input, "phase"); const params = Object.getOwnPropertyDescriptor(input, "params"); const raw: unknown = params?.value;
  if (phase === undefined || !Object.hasOwn(phase, "value") || params === undefined || !Object.hasOwn(params, "value") || !plain(raw)) { return captureCurrentPcbStringClockReply(input).value; }
  let fixed: Readonly<Record<string, Readonly<{ program: string }>>> | null = null;
  if (phase.value === "via-main-begin-rebase") { fixed = CURRENT_PCB_VIA_MAIN_BEGIN_REBASE; } else if (phase.value === "via-main-history-rebase") { fixed = CURRENT_PCB_VIA_MAIN_HISTORY_REBASE; } else if (phase.value === "via-main-structure-rebase") { fixed = CURRENT_PCB_VIA_MAIN_STRUCTURE_REBASE; }
  else if (phase.value === "via-main-begin-bookkeeping") { fixed = CURRENT_PCB_VIA_MAIN_BEGIN_BOOKKEEPING; } else if (phase.value === "via-main-history-bookkeeping") { fixed = CURRENT_PCB_VIA_MAIN_HISTORY_BOOKKEEPING; } else if (phase.value === "via-main-structure-bookkeeping") { fixed = CURRENT_PCB_VIA_MAIN_STRUCTURE_BOOKKEEPING; }
  const declaration = Object.getOwnPropertyDescriptor(raw, "functionDeclaration"); const source: unknown = declaration?.value;
  if (fixed === null || declaration === undefined || !Object.hasOwn(declaration, "value") || typeof source !== "string" || !Object.values(fixed).some(row => row.program === source)) { return captureCurrentPcbStringClockReply(input).value; }
  const inner = Object.getOwnPropertyDescriptors(raw), outer = Object.getOwnPropertyDescriptors(input);
  inner["functionDeclaration"] = { ...declaration, value: "fixed-original-via-captured-rebase" }; outer["params"] = { ...params, value: Object.create(null, inner) as unknown };
  const captured = captureCurrentPcbStringClockReply(Object.create(null, outer)).value;
  if (!plain(captured) || !plain(captured["params"])) { throw new Error("PCB_VIA_CAPTURED_FIXED_CAPTURE"); }
  return { ...captured, params: { ...captured["params"], functionDeclaration: source } };
}
