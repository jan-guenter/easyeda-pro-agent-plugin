/** Original seven-record Save generation and body custody. Selector-only
 * controls use retained native fields; no caller body, handle or code is accepted. */
import { CURRENT_SCHEMATIC_DISPLAY_CLOCK_REQUESTS as CLOCK } from "./current-schematic-display-clock-protocol.ts";
import { installOwnedNativeDispatch } from "./native-owned-dispatch.ts";

const begin = "// BEGIN ORIGINAL RELEVANCE DISPLAY SAVE", end = "// END ORIGINAL RELEVANCE DISPLAY SAVE";
function native(): string { return `${begin}
public sealed partial class EasyedaDiagnosticOwner {
bool relevanceSavePrepared,relevanceSaveGenerated,relevanceSaveBodyEnrolled;string relevanceSaveBodyCapture;
public void PrepareRelevanceSaveGeneration(){if(!schematicRelevanceDisplayWrite209||schematicDisplayAbort||relevanceSavePrepared||relevanceSaveGenerated||!schematicDisplayStages[4]||!schematicDisplayStages[5]||schematicDisplayStages[6]||!schematicProducerPrefixEnrolled||schematicWorkerStage!=7||!schematicRelevanceClockBound||schematicRelevanceClockPoints.Count!=5||schematicRelevanceClockNormal!=36||schematicRelevanceClockCleanup!=0||schematicSavePoints.Count!=6||schematicSaveCleanup!=0)throw Error("relevance-save-original-preparation");AssertLive();AssertRelevanceSaveMainPrepared();relevanceSavePrepared=true;}
public void GenerateRelevanceSave(int id){if(!schematicRelevanceDisplayWrite209||schematicDisplayAbort||!relevanceSavePrepared||relevanceSaveGenerated||!schematicDisplayStages[4]||!schematicDisplayStages[5]||schematicDisplayStages[6])throw Error("relevance-save-original-once");AssertLive();AssertRelevanceSaveMainPrepared();var fields=new System.Collections.Hashtable(System.StringComparer.Ordinal);fields.Add("objectId",schematicDisplayTuple);fields.Add("targetJson",schematicDisplayTarget);fields.Add("operationJson",schematicDisplayOperation);string message=SchematicRelevanceDisplayProtocolMessage(id,schematicDisplaySession,"save",fields);relevanceSaveGenerated=true;schematicDisplayStages[6]=true;SendMessage(id,message);}
void ObserveRelevanceSaveBodyRequest(string phase,System.Collections.IDictionary fields){if(!schematicRelevanceDisplayWrite209||phase!="schematic-save-value")return;if(schematicDisplayAbort||!relevanceSaveGenerated||!schematicDisplayStages[6]||relevanceSaveBodyCapture!=null||fields==null)throw Error("relevance-save-body-original-capture");string capture=fields["objectId"] as string;if(capture==null||!System.Text.RegularExpressions.Regex.IsMatch(capture,@"\\A[A-Za-z0-9_.:-]{1,256}\\z"))throw Error("relevance-save-body-original-handle");relevanceSaveBodyCapture=capture;}
public void EnrollRelevanceSaveBody(){if(!schematicRelevanceDisplayWrite209||schematicDisplayAbort||!relevanceSaveGenerated||!schematicDisplayStages[6]||relevanceSaveBodyEnrolled||relevanceSaveBodyCapture==null||!schematicRelevanceClockBound||schematicRelevanceClockPoints.Count!=5||schematicRelevanceClockNormal!=${String(CLOCK.normal)}||schematicRelevanceClockCleanup!=10)throw Error("relevance-save-body-original-enrollment");AssertLive();relevanceSaveBodyEnrolled=true;}
}
${end}`; }
const dispatch = String.raw`        'schematic-relevance-display-save-prepare' {
          if (-not $SchematicRelevanceDisplayWrite209 -or -not $launched -or (@($request.PSObject.Properties.Name | Sort-Object) -join ',') -cne 'action,helperInstance,id,jobId,rootCreated,rootPid') {throw 'relevance-save-prepare-fields'}
          $owner.PrepareRelevanceSaveGeneration();$result=@{prepared=$true}
        }
        'schematic-relevance-display-save-generate' {
          if (-not $SchematicRelevanceDisplayWrite209 -or -not $launched -or ($request.requestId -isnot [int] -and $request.requestId -isnot [long]) -or (@($request.PSObject.Properties.Name | Sort-Object) -join ',') -cne 'action,helperInstance,id,jobId,requestId,rootCreated,rootPid') {throw 'relevance-save-generate-fields'}
          $owner.GenerateRelevanceSave([int]$request.requestId);$result=@{written=$true}
        }
        'schematic-relevance-display-save-body-enroll' {
          if (-not $SchematicRelevanceDisplayWrite209 -or -not $launched -or (@($request.PSObject.Properties.Name | Sort-Object) -join ',') -cne 'action,helperInstance,id,jobId,rootCreated,rootPid') {throw 'relevance-save-body-enroll-fields'}
          $owner.EnrollRelevanceSaveBody();$result=@{enrolled=$true}
        }
`;
export function applyCurrentSchematicRelevanceDisplaySaveNativeFragment(input: string): string {
  if (!input.includes("void AssertRelevanceSaveMainPrepared()")) { throw new Error("RELEVANCE_SAVE_MAIN_NATIVE_PREREQUISITE_REQUIRED"); }
  let source = input;
  const admission = "public void AdmitSchematicRelevanceDisplayAction(string action)", stop = "public static string SchematicRelevanceDisplayProtocolMessage(";
  if (source.split(admission).length !== 2 || source.split(stop).length !== 2) { throw new Error("RELEVANCE_SAVE_ORIGINAL_BIRTH_REQUIRED"); }
  const from = source.indexOf(admission), to = source.indexOf(stop, from); if (to < from) { throw new Error("RELEVANCE_SAVE_ADMISSION_ORDER"); }
  const body = source.slice(from, to); const cases = 'case "schematic-relevance-display-save-prepare":case "schematic-relevance-display-save-generate":case "schematic-relevance-display-save-body-enroll":';
  if (!body.includes(cases)) {
    if (body.includes('case "schematic-relevance-display-save-') || body.split('case "identity":').length !== 2) { throw new Error("RELEVANCE_SAVE_PARTIAL_ADMISSION"); }
    source = source.slice(0, from) + body.replace('case "identity":', `${cases}case "identity":`) + source.slice(to);
  } else if (body.split(cases).length !== 2) { throw new Error("RELEVANCE_SAVE_DUPLICATE_ADMISSION"); }
  const before = "AdmitSchematicDisplaySaveObserver(phase,fields);if(cleanup)"; const after = "AdmitSchematicDisplaySaveObserver(phase,fields);ObserveRelevanceSaveBodyRequest(phase,fields);if(cleanup)";
  if (!source.includes(after)) { if (source.split(before).length !== 2) { throw new Error("RELEVANCE_SAVE_BODY_ORIGINAL_SENDER_REQUIRED"); } source = source.replace(before, after); }
  else if (source.split(after).length !== 2) { throw new Error("RELEVANCE_SAVE_BODY_SENDER_DUPLICATE"); }
  source = installOwnedNativeDispatch(source, dispatch, "        'schematic-relevance-display-native' {");
  const finish = source.indexOf(end), start = source.indexOf(begin);
  if (start !== -1 || finish !== -1) {
    if (start === -1 || finish < start || source.includes(begin, start + begin.length) || source.includes(end, finish + end.length)) { throw new Error("RELEVANCE_SAVE_NATIVE_MARKERS"); }
    return source.slice(0, start) + native() + source.slice(finish + end.length);
  }
  const anchor = "// BEGIN GENERATED SCHEMATIC RELEVANCE DISPLAY BIRTH209";
  if (source.split(anchor).length !== 2) { throw new Error("RELEVANCE_SAVE_NATIVE_ANCHOR"); }
  return source.replace(anchor, `${native()}\n${anchor}`);
}
