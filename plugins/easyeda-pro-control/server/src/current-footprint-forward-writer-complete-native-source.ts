/** Distinct pre-I/O complete graph. The released six-role output function is
 * called unchanged; only this separately pinned seven-role variant is edited. */
import {currentFootprintForwardWriterMainMutationNativeSource,installCurrentFootprintForwardWriterMainMutationNativeSource,installCurrentFootprintForwardWriterMainMutationNativeTail} from "./current-footprint-forward-writer-main-mutation-native.ts";
import {createHash} from "node:crypto";
import {currentFootprintForwardWriterTicketTimerNativeSource} from "./current-footprint-forward-writer-ticket-timer-native.ts";
import {currentFootprintForwardWriterNativeOutputs} from "./current-footprint-forward-writer-native-source.ts";
import {currentFootprintForwardWriterProfile} from "./current-footprint-forward-writer-profile.ts";
import {currentFootprintForwardWriterCompleteProfile} from "./current-footprint-forward-writer-complete-profile.ts";
import {CURRENT_FOOTPRINT_FORWARD_WRITER_COMPLETE_NATIVE_GRAPH_LIMITS as LIMITS} from "./current-footprint-forward-writer-complete-native-limits.ts";
import {CURRENT_FOOTPRINT_FORWARD_WRITER_COMPLETE_TAIL_ACTIONS as ACTIONS,currentFootprintForwardWriterCompleteTailDispatch,currentFootprintForwardWriterCompleteTailNativeSource} from "./current-footprint-forward-writer-complete-tail-native.ts";
import {CURRENT_FOOTPRINT_COPY_MAIN_COMPLETION_REQUESTS as COMPLETION} from "./current-footprint-copy-main-completion-protocol.ts";

const hash=(source:string):string=>createHash("sha256").update(source).digest("hex");
const previous=currentFootprintForwardWriterProfile();
const profile=currentFootprintForwardWriterCompleteProfile();
function one(source:string,before:string,after:string):string{if(source.split(before).length!==2){throw new Error("FORWARD_COMPLETE_NATIVE_ANCHOR");}return source.replace(before,after);}
function check(variable:string,source:string):string{return `if($${variable} -isnot [byte[]] -or $${variable}.Length -ne ${String(Buffer.byteLength(source))}){throw 'forward-complete-role-size'};$h=[Security.Cryptography.SHA256]::Create();try{$d=([BitConverter]::ToString($h.ComputeHash($${variable}))).Replace('-','').ToLowerInvariant()}finally{$h.Dispose()};if($d -cne '${hash(source)}'){throw 'forward-complete-role-hash'};\n`;}
function rename(source:string):string{return source.replaceAll("CreateFootprintForwardWriter209","CreateFootprintForwardWriterComplete209").replaceAll("WorkerStartupFootprintForwardWriter209","WorkerStartupFootprintForwardWriterComplete209").replaceAll("WriterV1","WriterCompleteV2");}
function capacity(normal:number,cleanup:number):string{const total=normal+cleanup;return `value.requests=${String(total)};value.normalRequests=${String(normal)};value.cleanupRequests=${String(cleanup)};value.RequireCompletionCapacity(${String(total)});\nNeed(value.requests==${String(total)}&&value.normalRequests==${String(normal)}&&value.cleanupRequests==${String(cleanup)},"forward-execution-capacity-no-consume");\nvalue.requests=${String(total+1)};value.cleanupRequests=${String(cleanup+1)};bool refused=false;try{value.RequireCompletionCapacity(${String(total+1)});}`;}
export interface CurrentFootprintForwardWriterCompleteNativeOutput{readonly role:"driver"|"core"|"phase"|"producer"|"startup"|"sync"|"tail";readonly relativePath:string;readonly source:string;readonly bytes:number;readonly sha256:string;readonly maximumBytes:number}
export function currentFootprintForwardWriterCompleteNativeOutputs(shared:string):readonly CurrentFootprintForwardWriterCompleteNativeOutput[]{
 const old=currentFootprintForwardWriterNativeOutputs(shared);
 if(old.map(row=>row.role).join(",")!=="driver,core,phase,producer,startup,sync"||new Set(ACTIONS).size!==ACTIONS.length){throw new Error("FORWARD_COMPLETE_NATIVE_ROLES");}
 const rows=new Map(old.map(row=>[row.role,row.source]));
 function get(role:typeof old[number]["role"]):string{const source=rows.get(role);if(source===undefined){throw new Error("FORWARD_COMPLETE_NATIVE_MISSING_ROLE");}return rename(source);}
 const timer=rename(currentFootprintForwardWriterTicketTimerNativeSource());
 if(Buffer.byteLength(timer)>LIMITS.timerSource){throw new Error("FORWARD_COMPLETE_NATIVE_TIMER_SOURCE");}
 if(Buffer.byteLength(currentFootprintForwardWriterMainMutationNativeSource())>LIMITS.sqlSource){throw new Error("FORWARD_COMPLETE_NATIVE_SQL_SOURCE");}
 const core=installCurrentFootprintForwardWriterMainMutationNativeSource(`${get("core")}\n${timer}`);
 let phase=one(get("phase"),"forwardWriterBirth=true;stockMainEligible=true;","forwardWriterCompleteBirth=true;forwardWriterBirth=true;stockMainEligible=true;");
 phase=one(phase,`public const int Requests=${String(previous.renderer.requestLimit)},NormalRequests=${String(previous.renderer.requestLimit)},NormalClass=${String(previous.renderer.normalClassLimit)},CleanupClass=${String(previous.renderer.cleanupClassLimit)};`,
  `public const int Requests=${String(profile.renderer.requestLimit)},NormalRequests=${String(profile.renderer.requestLimit)},NormalClass=${String(profile.renderer.normalClassLimit)},CleanupClass=${String(profile.renderer.cleanupClassLimit)};`);
 phase=one(phase,`public const int MainNormal=${String(previous.main.normalRequestLimit)},MainCleanup=${String(previous.main.cleanupRequestLimit)},MainRequests=${String(previous.main.requestLimit)};`,
  `public const int MainNormal=${String(profile.main.normalRequestLimit)},MainCleanup=${String(profile.main.cleanupRequestLimit)},MainRequests=${String(profile.main.requestLimit)};`);
 phase=one(phase,`normalLimit=${String(previous.main.ordinaryNormalRequestLimit)};`,`normalLimit=${String(profile.main.ordinaryNormalRequestLimit)};`);
 phase=one(phase,`value.normalLimit==${String(previous.main.ordinaryNormalRequestLimit)}&&value.cleanupLimit==${String(previous.main.cleanupRequestLimit)}&&value.normalLimit+value.cleanupLimit==${String(previous.main.ordinaryNormalRequestLimit+previous.main.cleanupRequestLimit)}`,
  `value.normalLimit==${String(profile.main.ordinaryNormalRequestLimit)}&&value.cleanupLimit==${String(profile.main.cleanupRequestLimit)}&&value.normalLimit+value.cleanupLimit==${String(profile.main.ordinaryNormalRequestLimit+profile.main.cleanupRequestLimit)}`);
 phase=one(phase,capacity(previous.main.ordinaryNormalRequestLimit-COMPLETION.normal,previous.main.cleanupRequestLimit-COMPLETION.cleanup-1),capacity(profile.main.ordinaryNormalRequestLimit-COMPLETION.normal,profile.main.cleanupRequestLimit-COMPLETION.cleanup-1));
 phase=one(phase,'case "footprint-forward-producer-bind":',`${ACTIONS.map(action=>`case "${action}":`).join("")}case "footprint-forward-producer-bind":`);
 const producer=get("producer");
 let startup=get("startup");
 startup=one(startup,`EasyedaFootprintForwardExecutionLimits.MainNormal!=${String(previous.main.normalRequestLimit)}||EasyedaFootprintForwardExecutionLimits.MainRequests!=${String(previous.main.requestLimit)}`,`EasyedaFootprintForwardExecutionLimits.MainNormal!=${String(profile.main.normalRequestLimit)}||EasyedaFootprintForwardExecutionLimits.MainRequests!=${String(profile.main.requestLimit)}`);
 let sync=one(get("sync"),"string encoded=EasyedaForwardWriterFrontierProtocol.Encode(","string encoded=EasyedaForwardWriterCompleteFrontierProtocol.Encode(");
 sync=one(sync,"public void BeginForwardWriterAllocatedClock(int first){","public void BeginForwardWriterAllocatedClock(int first){\nRequireForwardWriterCompletePrecreate();");
 const tail=installCurrentFootprintForwardWriterMainMutationNativeTail(rename(currentFootprintForwardWriterCompleteTailNativeSource()));
 let driver=get("driver");
 const dispatch=currentFootprintForwardWriterCompleteTailDispatch();
 const actual=[...dispatch.matchAll(/^ {8}'([^']+)' \{/gmu)].map(match=>match[1]);
 if(actual.length!==ACTIONS.length||ACTIONS.some(action=>!actual.includes(action))||new Set(actual).size!==actual.length){throw new Error("FORWARD_COMPLETE_NATIVE_DISPATCH_ROSTER");}
 driver=one(driver,"\n        default {throw 'pcb-diagnostic-action'}",`\n${dispatch}        default {throw 'pcb-diagnostic-action'}`);
 const start=driver.indexOf("if ($forwardWriterCoreBytes -isnot");
 const end=driver.indexOf("Add-Type -TypeDefinition $graphNative\n",start);
 if(start===-1||end<=start){throw new Error("FORWARD_COMPLETE_NATIVE_COMPILE_SECTION");}
 const units=[["forwardWriterCoreBytes",core],["forwardWriterPhaseBytes",phase],["forwardWriterProducerBytes",producer],["forwardWriterStartupBytes",startup],["forwardWriterSyncBytes",sync],["forwardWriterTailBytes",tail]] as const;
 const compiledBytes=units.reduce((sum,[,source])=>sum+Buffer.byteLength(source),units.length-1);
 const compile=`${units.map(([variable,source])=>check(variable,source)).join("")}$graphDecoder=[Text.Encoding]::GetEncoding(20127,[Text.EncoderFallback]::ExceptionFallback,[Text.DecoderFallback]::ExceptionFallback)\n$graphNative=${units.map(([variable])=>`$graphDecoder.GetString($${variable})`).join('+"`n"+')}
if([Text.Encoding]::UTF8.GetByteCount($graphNative) -ne ${String(compiledBytes)} -or [Text.Encoding]::UTF8.GetByteCount($graphNative) -gt ${String(LIMITS.compiled)}){throw 'forward-complete-compiled-size'}
Add-Type -TypeDefinition $graphNative
`;
 driver=driver.slice(0,start)+compile+driver.slice(end+"Add-Type -TypeDefinition $graphNative\n".length);
 driver=one(driver,"    [EasyedaDiagnosticOwner]::VerifyForwardWriterClockSmoke()","    [EasyedaDiagnosticOwner]::VerifyForwardWriterClockSmoke()\n    [EasyedaDiagnosticOwner]::VerifyForwardWriterCompleteTailSmoke()\n    [EasyedaDiagnosticOwner]::VerifyForwardWriterMainSqlSmoke()\n    [EasyedaDiagnosticOwner]::VerifyForwardWriterCompleteTailLedgerSmoke()");
 driver=driver.replaceAll("easyeda-pro-control.footprint-forward-writer-compile.v1","easyeda-pro-control.footprint-forward-writer-complete-compile.v2");
 const sources=[["driver","owner.ps1",driver,LIMITS.driver],["core","native-core.cs",core,LIMITS.core],["phase","native-phase.cs",phase,LIMITS.phase],["producer","native-producer.cs",producer,LIMITS.phase],["startup","native-startup.cs",startup,LIMITS.startup],["sync","native-sync.cs",sync,LIMITS.sync],["tail","native-tail.cs",tail,LIMITS.tail]] as const;
 const outputs=sources.map(([role,name,source,maximumBytes])=>{const bytes=Buffer.byteLength(source);if(bytes<1||bytes>maximumBytes||bytes>LIMITS.file||Buffer.from(source).some(byte=>byte>127)){throw new Error(`FORWARD_COMPLETE_NATIVE_ROLE_${role}`);}return Object.freeze({role,relativePath:`scripts/footprint-forward-writer-complete/${name}`,source,bytes,sha256:hash(source),maximumBytes});});
 if(compiledBytes>LIMITS.compiled){throw new Error(`FORWARD_COMPLETE_NATIVE_COMPILED_${String(compiledBytes)}_GT_${String(LIMITS.compiled)}`);}
 const aggregateBytes=outputs.reduce((sum,row)=>sum+row.bytes,0);
 if(aggregateBytes>LIMITS.aggregate){throw new Error(`FORWARD_COMPLETE_NATIVE_AGGREGATE_${String(aggregateBytes)}_GT_${String(LIMITS.aggregate)}`);}return Object.freeze(outputs);
}
export function currentFootprintForwardWriterCompleteNativePins(outputs:readonly CurrentFootprintForwardWriterCompleteNativeOutput[]):string{
 return `/** Generated by generate-footprint-forward-writer-complete-native.ts. */\n/* oxlint-disable unicorn/numeric-separators-style -- Exact generated JSON byte pins. */\nexport const CURRENT_FOOTPRINT_FORWARD_WRITER_COMPLETE_NATIVE_GRAPH=Object.freeze({schema:"private.footprint-forward-writer-complete-native-graph.v2",aggregateBytes:${String(outputs.reduce((sum,row)=>sum+row.bytes,0))},files:Object.freeze(${JSON.stringify(outputs.map(({source:_source,...row})=>row),null,2)}.map(row=>Object.freeze(row)))});\n`;
}
