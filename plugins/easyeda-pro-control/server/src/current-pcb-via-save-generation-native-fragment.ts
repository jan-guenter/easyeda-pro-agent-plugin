/** One original Save request generation, with all later SQL/publication and
 * producer continuations still governed by their separate original ledgers. */
import { installNativeCompileOnlyHook } from "./native-compile-only-hook.ts";

const begin = "// BEGIN ORIGINAL VIA SAVE REQUEST GENERATION", end = "// END ORIGINAL VIA SAVE REQUEST GENERATION";
const native = `public sealed partial class EasyedaDiagnosticOwner {
bool viaSaveGenerationAttempted,viaSaveBodyPrepared;
bool ViaSaveGenerationReady(){return pcbViaWrite209&&!viaAbortAttempted&&!viaSaveGenerationAttempted&&viaConstructionComplete&&originalMain!=null&&viaMainPrecreateEnrolled&&viaSdkStages[0]&&viaSdkStages[1]&&viaSdkStages[2]&&viaSdkStages[3]&&!viaSdkStages[4]&&viaSpatial[0].released&&viaSpatial[0].reads==1&&viaSpatial[1].released&&viaSpatial[1].reads==1&&viaWorkerStage==7&&viaWorkerParentRunning&&viaSavePoints.Count==6&&viaClockBound&&viaClockRegistration&&viaClockWorker&&viaClockOffsets==1&&viaClockPoints.Count==5&&viaClockCleanup==0&&viaStructurePoints.Count==14&&viaStructureBootstrapResumed&&!viaStartupActive&&viaStartupFinalizers==0&&viaProducerPrefixEnrolled&&viaProducerIntrinsicsReproved&&viaProducerObserveArms.Count==27&&viaInitialCacheCompleted&&viaInitialSyncCompleted&&viaPeriodicSyncStage==0&&viaStructureTransportCaptured&&viaStructureTransportPoints.Count==3&&!viaStructureTransportFailed&&viaBeginArms.Count==4&&viaBeginStep==0&&viaHistoryArms.Count==9&&viaHistoryStep==0&&viaStructureMainArms.Count==9&&viaStructureMainStep==0&&!viaStructureBodyEnrollmentAttempted;}
void ConsumeViaSaveGeneration(){if(!ViaSaveGenerationReady())throw Error("via-save-original-generation-required");AssertLive();viaSaveGenerationAttempted=true;}
public static void VerifyViaSaveGenerationSmoke(){foreach(var owner in new[]{new EasyedaDiagnosticOwner(),CreateLayers209(),CreateSpatial209(),CreateGeneratedFixture209(),CreatePcbViaWrite209()}){try{bool refused=false;try{owner.ConsumeViaSaveGeneration();}catch(InvalidOperationException){refused=true;}if(!refused||owner.viaSaveGenerationAttempted||owner.viaSdkStages[4])throw Error("via-save-unissued-generation-smoke");}finally{if(owner.originalMain!=null)owner.originalMain.Release();}}}
}
`;
function one(source: string, before: string, after: string): string {
  if (source.includes(after)) { if (source.split(after).length !== 2) { throw new Error("PCB_VIA_SAVE_GENERATION_DUPLICATE"); } return source; }
  if (source.split(before).length !== 2) { throw new Error("PCB_VIA_SAVE_GENERATION_ANCHOR"); } return source.replace(before, after);
}
export function applyCurrentPcbViaSaveGenerationNativeFragment(input: string): string {
  let source = one(input, '||stage=="save"||stage=="create"&&!viaProducerPrefixEnrolled)throw Error("via-sdk-stage-eligibility");', '||stage=="save"&&viaSaveGenerationAttempted||stage=="create"&&!viaProducerPrefixEnrolled)throw Error("via-sdk-stage-eligibility");');
  source = one(source, 'viaSdkStages[index]=true;SendMessage(id,message);', 'if(stage=="save")ConsumeViaSaveGeneration();viaSdkStages[index]=true;SendMessage(id,message);');
  source = one(source, 'if(phase!="via-save-source"&&!viaSdkStages[4])throw Error("via-save-original-attempt");', 'if(phase=="via-save-body")viaSaveBodyPrepared=true;if(phase=="via-save-resume"&&viaSaveBodyPrepared&&!viaStructureTransportBodyReserved)throw Error("via-save-body-original-reservation");if(phase!="via-save-source"&&!viaSdkStages[4])throw Error("via-save-original-attempt");');
  source = installNativeCompileOnlyHook(source, "    [EasyedaDiagnosticOwner]::VerifyViaSaveGenerationSmoke()", "    [EasyedaGeneratedInitialSyncProtocol]::VerifyPeriodicSmoke()");
  const value = `${begin}\n${native}\n${end}`; const start = source.indexOf(begin), stop = source.indexOf(end);
  if (start !== -1 || stop !== -1) { if (start === -1 || stop < start || source.includes(begin, start + begin.length) || source.includes(end, stop + end.length)) { throw new Error("PCB_VIA_SAVE_GENERATION_MARKERS"); } source = source.slice(0, start) + value + source.slice(stop + end.length); }
  else { source = one(source, "internal enum EasyedaPcbViaWriteBirth { Original }", `${value}\ninternal enum EasyedaPcbViaWriteBirth { Original }`); } return source;
}
