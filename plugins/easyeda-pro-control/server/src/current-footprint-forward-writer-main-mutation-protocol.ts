/** Complete-writer-only fixed selected SQL continuations. No caller SQL,
 * expression, target, actor or program enters this grammar. */
import { z } from "zod";
import { freezeDeep } from "./sqlite-inventory-core.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { CURRENT_FOOTPRINT_FORWARD_WRITER_MAIN_MUTATION_EXPRESSIONS as EXPRESSIONS, CURRENT_FOOTPRINT_FORWARD_WRITER_MAIN_MUTATION_ORDER as ORDER, CURRENT_FOOTPRINT_FORWARD_WRITER_MAIN_MUTATION_PROGRAM as PROGRAM } from "./current-footprint-forward-writer-main-mutation-programs.ts";
import { CURRENT_SELECTED_FILE_MAIN_SQL_CAPTURED_FRAME_EXPRESSIONS as RAW, CURRENT_SELECTED_FILE_MAIN_SQL_CAPTURED_FRAME_PROGRAM as READ, CURRENT_SELECTED_FILE_MAIN_SQL_FENCE_REQUIRE_PROGRAM as REQUIRE } from "./current-selected-file-main-sql-fence-programs.ts";
import { CURRENT_FOOTPRINT_COPY_MAIN_REQUEST_GROUP as GROUP } from "./current-footprint-copy-main-request-programs.ts";

export { CURRENT_FOOTPRINT_FORWARD_WRITER_MAIN_MUTATION_REQUESTS } from "./current-footprint-forward-writer-main-mutation-budget.ts";
export const CURRENT_FOOTPRINT_FORWARD_WRITER_MAIN_MUTATION_FRAME_FLAGS = Object.freeze({ objectGroup: GROUP, silent: true, returnByValue: false, generatePreview: false, throwOnSideEffect: true, includeCommandLineAPI: false } as const);
export const CURRENT_FOOTPRINT_FORWARD_WRITER_MAIN_MUTATION_CALL_FLAGS = Object.freeze({ objectGroup: GROUP, silent: true, generatePreview: false, throwOnSideEffect: true, awaitPromise: false, userGesture: false } as const);
const handle = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u), ref = z.strictObject({ objectId: handle });
const project = z.string().regex(/^[a-f0-9]{64}$/u), uuid = z.string().regex(/^[a-f0-9]{32}$/u);
export const currentFootprintForwardWriterMainMutationExpectedSchema = z.strictObject({ kind: z.enum(ORDER), projectUuid: project, branchUuid: uuid,
  path: z.string().min(1).max(4096).refine(value => value.isWellFormed() && !value.includes("\0")), priorHistoryUuid: uuid, historyUuid: uuid.nullable(), keyHex: uuid.nullable() });
const frameFlags = { objectGroup: z.literal(GROUP), silent: z.literal(true), returnByValue: z.literal(false), generatePreview: z.literal(false), throwOnSideEffect: z.literal(true), includeCommandLineAPI: z.literal(false) };
const callFlags = { objectGroup: z.literal(GROUP), silent: z.literal(true), generatePreview: z.literal(false), throwOnSideEffect: z.literal(true), awaitPromise: z.literal(false), userGesture: z.literal(false) };
const roles = ["run","begin","data","cipher","head","branch","commit","project","read"] as const;
const frame = z.strictObject({ phase: z.literal("forward-writer-sql-frame"), role: z.enum(roles), method: z.literal("Debugger.evaluateOnCallFrame"),
  params: z.strictObject({ ...frameFlags, callFrameId: handle, expression: z.string().max(256) }) });
const expectedArgument=z.strictObject({value:currentFootprintForwardWriterMainMutationExpectedSchema}), nullArgument = z.strictObject({value:z.null()});
const proofArguments=z.tuple([ref,ref,ref,ref,z.union([ref,nullArgument]),expectedArgument]);
const queryOneArgument=z.strictObject({value:z.literal("queryOne")});
const readArguments=z.tuple([ref,queryOneArgument]);
const proof = z.strictObject({ phase: z.literal("forward-writer-sql-proof"), role: z.enum(ORDER), method: z.literal("Runtime.callFunctionOn"),
  params: z.strictObject({ ...callFlags, objectId: handle, functionDeclaration: z.literal(PROGRAM), returnByValue: z.literal(true),
    arguments: proofArguments }) });
const read = z.strictObject({ phase: z.literal("forward-writer-sql-read"), method: z.literal("Runtime.callFunctionOn"),
  params: z.strictObject({ ...callFlags, throwOnSideEffect: z.literal(false), objectId: handle, functionDeclaration: z.literal(READ), returnByValue: z.literal(false),
    arguments: readArguments }) });
const requireCommand = z.strictObject({ phase: z.literal("forward-writer-sql-require"), method: z.literal("Runtime.callFunctionOn"),
  params: z.strictObject({ ...callFlags, objectId: handle, functionDeclaration: z.literal(REQUIRE), returnByValue: z.literal(true), arguments: z.tuple([]) }) });
const step = z.strictObject({ phase: z.literal("forward-writer-sql-step"), method: z.literal("Debugger.resume"), params: z.strictObject({}) });
const schema = z.discriminatedUnion("phase",[frame,proof,read,requireCommand,step]);
export type CurrentFootprintForwardWriterMainMutationCommand = z.infer<typeof schema>;
export function validateCurrentFootprintForwardWriterMainMutationCommand(input: unknown): CurrentFootprintForwardWriterMainMutationCommand {
 const command = schema.parse(captureCurrentPcbStringClockReply(input).value);
 if (command.phase === "forward-writer-sql-frame" && command.params.expression !== (command.role === "read" ? RAW.queryOne : EXPRESSIONS[command.role])) { throw new Error("FORWARD_WRITER_SQL_FIXED_FRAME"); }
 if (command.phase === "forward-writer-sql-proof") { const expected=command.params.arguments[5].value;
  if (expected.kind!==command.role || (command.role==="data")!==("objectId" in command.params.arguments[4]) ||
    (command.role==="begin"||command.role==="data")!==(expected.historyUuid===null&&expected.keyHex===null) ||
    expected.historyUuid!==null&&(expected.keyHex===null||expected.historyUuid===expected.priorHistoryUuid)) { throw new Error("FORWARD_WRITER_SQL_FIXED_PROOF"); }
 }
 return freezeDeep(command);
}
export function currentFootprintForwardWriterMainMutationTemplate(input: unknown): Readonly<{phase:string;method:string;fields:readonly string[];values:Readonly<Record<string,string>>;template:string}> {
 const command=validateCurrentFootprintForwardWriterMainMutationCommand(input),fields:string[]=[],values:Record<string,string>={};
 const field=(name:string,value:string):string=>{if(fields.includes(name)){throw new Error("FORWARD_WRITER_SQL_ALIAS");}fields.push(name);values[name]=value;return `__forward_sql_${name}__`;};
 const params:Record<string,unknown>={...command.params};
 if(command.phase==="forward-writer-sql-frame"){params["callFrameId"]=field("callFrameId",command.params.callFrameId);}
 else if(command.phase!=="forward-writer-sql-step"){
  params["objectId"]=field("objectId",command.params.objectId);
  if(command.phase==="forward-writer-sql-read"){params["arguments"]=[{objectId:field("capture",command.params.arguments[0].objectId)},{value:"queryOne"}];}
  else if(command.phase==="forward-writer-sql-proof"){
   const args=command.params.arguments,expected=args[5].value;
   params["arguments"]=[...args.slice(0,4).map((arg,i)=>{if(!("objectId" in arg)){throw new Error("FORWARD_WRITER_SQL_REFERENCE");}return{objectId:field(`argument${String(i)}`,arg.objectId)};}),
    "objectId" in args[4]?{objectId:field("cipher",args[4].objectId)}:{value:null},
    {value:{kind:expected.kind,projectUuid:field("projectUuid",expected.projectUuid),branchUuid:field("branchUuid",expected.branchUuid),path:field("path",expected.path),
      priorHistoryUuid:field("priorHistoryUuid",expected.priorHistoryUuid),historyUuid:expected.historyUuid===null?null:field("historyUuid",expected.historyUuid),keyHex:expected.keyHex===null?null:field("keyHex",expected.keyHex)}}];
  }
 }
 return freezeDeep({phase:"role" in command?`${command.phase}-${command.role}`:command.phase,method:command.method,fields,values,template:JSON.stringify({method:command.method,params})});
}
export function currentFootprintForwardWriterMainMutationWire(input:unknown,requestId:number):Readonly<Record<string,string|number>> {
 if(!Number.isSafeInteger(requestId)||requestId<1){throw new Error("FORWARD_WRITER_SQL_ID");}
 const fixed=currentFootprintForwardWriterMainMutationTemplate(input);return freezeDeep({action:"footprint-forward-writer-main-sql",requestId,phase:fixed.phase,method:fixed.method,...fixed.values});
}
export function currentFootprintForwardWriterMainMutationTemplates():readonly ReturnType<typeof currentFootprintForwardWriterMainMutationTemplate>[] {
 const frames=roles.map(role=>({phase:"forward-writer-sql-frame",role,method:"Debugger.evaluateOnCallFrame",params:{...CURRENT_FOOTPRINT_FORWARD_WRITER_MAIN_MUTATION_FRAME_FLAGS,callFrameId:"live_frame",expression:role==="read"?RAW.queryOne:EXPRESSIONS[role]}}));
 const proofs=ORDER.map(role=>({phase:"forward-writer-sql-proof",role,method:"Runtime.callFunctionOn",params:{...CURRENT_FOOTPRINT_FORWARD_WRITER_MAIN_MUTATION_CALL_FLAGS,objectId:"live_run",functionDeclaration:PROGRAM,returnByValue:true,arguments:[
  {objectId:"live_capture"},{objectId:"live_actor"},{objectId:"live_sql"},{objectId:"live_caller"},role==="data"?{objectId:"live_cipher"}:{value:null},
  {value:{kind:role,projectUuid:"a".repeat(64),branchUuid:"b".repeat(32),path:"live_path",priorHistoryUuid:"c".repeat(32),historyUuid:role==="begin"||role==="data"?null:"d".repeat(32),keyHex:role==="begin"||role==="data"?null:"e".repeat(32)}}]}}));
 return freezeDeep([...frames,...proofs,{phase:"forward-writer-sql-read",method:"Runtime.callFunctionOn",params:{...CURRENT_FOOTPRINT_FORWARD_WRITER_MAIN_MUTATION_CALL_FLAGS,throwOnSideEffect:false,objectId:"live_read",functionDeclaration:READ,returnByValue:false,arguments:[{objectId:"live_capture"},{value:"queryOne"}]}},
  {phase:"forward-writer-sql-require",method:"Runtime.callFunctionOn",params:{...CURRENT_FOOTPRINT_FORWARD_WRITER_MAIN_MUTATION_CALL_FLAGS,objectId:"live_capture",functionDeclaration:REQUIRE,returnByValue:true,arguments:[]}},
  {phase:"forward-writer-sql-step",method:"Debugger.resume",params:{}}].map(value=>currentFootprintForwardWriterMainMutationTemplate(value)));
}
