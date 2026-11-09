/** Separate original seven-record STRUCTURE sender. Only the stateless fixed
 * protocol and source-defined continuation order are reused from the Via leaf. */
import { currentPcbViaMainStructureNativeSource } from "./current-pcb-via-main-structure-native-fragment.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_DISPLAY_WRITE_NATIVE_PROFILE as PROFILE } from "./current-schematic-relevance-display-write-native-profile.ts";
import { CURRENT_PCB_VIA_WRITE_NATIVE_PROFILE as VIA } from "./current-pcb-via-write-native-profile.ts";
import { installOwnedNativeDispatch } from "./native-owned-dispatch.ts";

const begin = "// BEGIN ORIGINAL RELEVANCE STRUCTURE PUBLICATION", end = "// END ORIGINAL RELEVANCE STRUCTURE PUBLICATION";
function one(source: string, before: string, after: string): string {
  if (source.includes(after)) { if (source.split(after).length !== 2) { throw new Error("RELEVANCE_STRUCTURE_NATIVE_DUPLICATE"); } return source; }
  if (source.split(before).length !== 2) { throw new Error(`RELEVANCE_STRUCTURE_NATIVE_ANCHOR:${before.slice(0, 60)}`); } return source.replace(before, after);
}
export function currentSchematicRelevanceDisplayStructureNativeSource(): string {
  const source = currentPcbViaMainStructureNativeSource(); const owner = "public sealed partial class EasyedaDiagnosticOwner {"; const stop = "public static void VerifyPcbViaMainStructureSmoke()";
  if (source.split(owner).length !== 2 || source.split(stop).length !== 2) { throw new Error("RELEVANCE_STRUCTURE_FIXED_SOURCE_BOUNDARY"); }
  let body = source.slice(source.indexOf(owner) + owner.length, source.indexOf(stop));
  const replacements: Readonly<Record<string, string>> = { pcbViaWrite209: "schematicRelevanceDisplayWrite209", viaAbortAttempted: "schematicDisplayAbort", viaConstructionComplete: "schematicDisplayConstructionComplete",
    viaWorkerStage: "schematicWorkerStage", viaWorkerParentRunning: "schematicWorkerParentRunning", viaSavePoints: "schematicSavePoints", viaClockBound: "schematicRelevanceClockBound",
    viaBeginStep: "relevanceBeginStep", viaHistoryStep: "relevanceHistoryStep", EnrollViaStructureBody: "EnrollRelevanceStructureBody", SendViaMainStructure: "SendRelevanceMainStructure", ViaStructureUtcMilliseconds: "RelevanceStructureUtcMilliseconds" };
  for (const [before, after] of Object.entries(replacements)) { if (!body.includes(before)) { throw new Error("RELEVANCE_STRUCTURE_FIXED_FIELD"); } body = body.replaceAll(before, after); }
  body = body.replaceAll("viaSdkStages[4]", "relevanceSaveGenerated").replaceAll(/\bviaStructureTransport(\w*)/gu, "schematicStructureTransport$1").replaceAll(/\bviaStructure(\w*)/gu, "relevanceStructure$1");
  body = one(body, `id-stockMainRequests>${String(VIA.main.total)}`, `id-stockMainRequests>${String(PROFILE.main.total)}`);
  const enroll = body.indexOf("public void EnrollRelevanceStructureBody("); const clock = body.indexOf("static long RelevanceStructureUtcMilliseconds(");
  if (enroll === -1 || clock <= enroll) { throw new Error("RELEVANCE_STRUCTURE_ENROLL_BOUNDARY"); }
  body = body.slice(0, enroll) + String.raw`public void AssertRelevanceStructureMainPrepared(){if(!schematicRelevanceDisplayWrite209||schematicDisplayAbort||relevanceStructureMainArms.Count!=9||relevanceStructureMainStep!=0||relevanceStructureExpected!=null||relevanceStructureBodyEnrollmentAttempted)throw Error("relevance-structure-original-main-prepared");}
public void EnrollRelevanceStructureBody(string project,string branch,long ticket,string tree){if(!schematicRelevanceDisplayWrite209||schematicDisplayAbort||relevanceStructureBodyEnrollmentAttempted||!schematicDisplayConstructionComplete||!relevanceSaveGenerated||!relevanceSaveBodyEnrolled||!schematicDisplayStages[6]||schematicWorkerStage!=7||!schematicWorkerParentRunning||schematicSavePoints.Count!=6||!schematicRelevanceClockBound||schematicStructureTransportContext==null||!schematicStructureTransportCaptured||schematicStructureTransportPoints.Count!=3||schematicWorkerProjectUuid!=project||schematicDisplayTarget==null||schematicDisplayTarget.IndexOf("\"branchUuid\":\""+branch+"\"",StringComparison.Ordinal)<0||relevanceStructureMainArms.Count!=9||relevanceBeginStep!=0||relevanceHistoryStep!=0)throw Error("relevance-structure-original-body");relevanceStructureBodyEnrollmentAttempted=true;MainPurpose();AssertLive();relevanceStructureExpected=EasyedaPcbViaMainStructureProtocol.Expected(project,branch,ticket,tree);schematicStructureTransportBodyReserved=true;AssertLive();}
` + body.slice(clock);
  body = one(body, "string relevanceStructureNativeProject=null,relevanceStructureNativeBranch=null,relevanceStructureExpected;", "string relevanceStructureExpected;");
  if (/\b(?:via|Via)[A-Z]\w*|\bpcbViaWrite209\b/u.test(body) || body.includes("SendViaMain") || body.includes("CreatePcbVia")) { throw new Error("RELEVANCE_STRUCTURE_FOREIGN_OWNER_STATE"); }
  return `${begin}\npublic sealed partial class EasyedaDiagnosticOwner {${body}}\n${end}`;
}
const dispatch = String.raw`        'schematic-relevance-display-structure-body-enroll' {
          $fields=@('action','helperInstance','id','jobId','rootCreated','rootPid','projectUuid','branchUuid','ticket','structureText')
          if (-not $SchematicRelevanceDisplayWrite209 -or -not $launched -or @($request.PSObject.Properties.Name).Count -ne $fields.Count -or $request.projectUuid -isnot [string] -or $request.branchUuid -isnot [string] -or $request.structureText -isnot [string] -or ($request.ticket -isnot [int] -and $request.ticket -isnot [long])) {throw 'relevance-structure-body-fields'}
          foreach ($field in $fields) {if (@($request.PSObject.Properties.Name) -cnotcontains $field) {throw 'relevance-structure-body-field'}}
          $owner.EnrollRelevanceStructureBody($request.projectUuid,$request.branchUuid,[long]$request.ticket,$request.structureText);$result=@{reserved=$true}
        }
        'schematic-relevance-display-main-structure' {
          if (-not $SchematicRelevanceDisplayWrite209 -or -not $launched -or $request.phase -isnot [string] -or $request.method -isnot [string] -or ($request.requestId -isnot [int] -and $request.requestId -isnot [long])) {throw 'relevance-structure-fields'}
          $baseFields=@('action','helperInstance','id','jobId','rootCreated','rootPid','requestId','phase','method');$fields=New-Object Collections.Hashtable ([StringComparer]::Ordinal)
          foreach ($field in $baseFields) {if (@($request.PSObject.Properties.Name) -cnotcontains $field) {throw 'relevance-structure-field'}}
          foreach ($property in $request.PSObject.Properties) {if ($baseFields -cnotcontains $property.Name) {$fields.Add($property.Name,$property.Value)}}
          $clock=$owner.SendRelevanceMainStructure([int]$request.requestId,$request.phase,$request.method,$fields);$result=@{written=$true}
          if ($clock.Length -eq 2) {$result.beforeEpochMs=$clock[0];$result.afterEpochMs=$clock[1]}
        }
`;
export function applyCurrentSchematicRelevanceDisplayStructureNativeFragment(input: string): string {
  let source = input;
  const admission = "public void AdmitSchematicRelevanceDisplayAction(string action)", stop = "public static string SchematicRelevanceDisplayProtocolMessage(";
  if (source.split(admission).length !== 2 || source.split(stop).length !== 2) { throw new Error("RELEVANCE_STRUCTURE_ORIGINAL_BIRTH_REQUIRED"); }
  const from = source.indexOf(admission); const to = source.indexOf(stop, from); const cases = 'case "schematic-relevance-display-structure-body-enroll":case "schematic-relevance-display-main-structure":';
  if (to < from) { throw new Error("RELEVANCE_STRUCTURE_ADMISSION_ORDER"); } const body = source.slice(from, to);
  if (!body.includes(cases)) { if (body.includes('case "schematic-relevance-display-structure-body') || body.split('case "identity":').length !== 2) { throw new Error("RELEVANCE_STRUCTURE_PARTIAL_ADMISSION"); } source = source.slice(0, from) + body.replace('case "identity":', `${cases}case "identity":`) + source.slice(to); }
  else if (body.split(cases).length !== 2) { throw new Error("RELEVANCE_STRUCTURE_ADMISSION_DUPLICATE"); }
  source = one(source, 'throw Error("relevance-main-prepared-original");MainPurpose();AssertLive();}', 'throw Error("relevance-main-prepared-original");AssertRelevanceStructureMainPrepared();MainPurpose();AssertLive();}');
  source = installOwnedNativeDispatch(source, dispatch, "        'schematic-relevance-display-main-observe' {");
  const large = " -or $SchematicRelevanceDisplayWrite209 -and @('schematic-relevance-display-main-structure','schematic-relevance-display-structure-body-enroll') -ccontains $request.action";
  if (source.includes(large)) { if (source.split(large).length !== 2) { throw new Error("RELEVANCE_STRUCTURE_LARGE_REQUEST_DUPLICATE"); } }
  else { const lines = [...source.matchAll(/^ +\$largeMainRequest=.*$/gmu)]; if (lines.length !== 1 || lines[0] === undefined) { throw new Error("RELEVANCE_STRUCTURE_LARGE_REQUEST_ANCHOR"); } source = source.replace(lines[0][0], `${lines[0][0]}${large}`); }
  const start = source.indexOf(begin); const finish = source.indexOf(end);
  if (start !== -1 || finish !== -1) { if (start === -1 || finish < start || source.includes(begin, start + begin.length) || source.includes(end, finish + end.length)) { throw new Error("RELEVANCE_STRUCTURE_NATIVE_MARKERS"); } return source.slice(0, start) + currentSchematicRelevanceDisplayStructureNativeSource() + source.slice(finish + end.length); }
  return one(source, "// BEGIN GENERATED SCHEMATIC RELEVANCE DISPLAY BIRTH209", `${currentSchematicRelevanceDisplayStructureNativeSource()}\n// BEGIN GENERATED SCHEMATIC RELEVANCE DISPLAY BIRTH209`);
}
