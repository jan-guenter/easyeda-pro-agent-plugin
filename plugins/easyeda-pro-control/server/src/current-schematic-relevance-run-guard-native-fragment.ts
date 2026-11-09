/** Separate original continuation codec and native state. The readonly
 * prefix codec retains no resume row and cannot enter this lane. */
import { createHash } from "node:crypto";
import { gzipSync } from "node:zlib";
import { currentPcbDiagnosticNativeHashVector } from "./current-pcb-diagnostic-fixed-table-native.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_DISPLAY_MODIFY_ENTRY_REQUESTS as ENTRY } from "./current-schematic-relevance-display-modify-entry-protocol.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_RUN_GUARD_REQUESTS as REQUESTS } from "./current-schematic-relevance-run-guard-controller.ts";
import { currentSchematicRelevanceRunGuardCases, currentSchematicRelevanceRunGuardTemplate } from "./current-schematic-relevance-run-guard-wire.ts";
import { installNativeCompileOnlyHook } from "./native-compile-only-hook.ts";
import { installOwnedNativeDispatch } from "./native-owned-dispatch.ts";

const hash = (bytes: Uint8Array): string => createHash("sha256").update(bytes).digest("hex");
const quote = (value: string): string => `@"${value.replaceAll('"', '""')}"`;
const begin = "// BEGIN ORIGINAL SCHEMATIC RUN GUARD", end = "// END ORIGINAL SCHEMATIC RUN GUARD";
export function currentSchematicRelevanceRunGuardNativeSource(): string {
  const cases = currentSchematicRelevanceRunGuardCases();
  const rows = cases.map(step => { const row = currentSchematicRelevanceRunGuardTemplate(step); return [row.phase, row.method, row.names.join(","), row.template].join("\t"); });
  const bytes = Buffer.from(rows.join("\0")); if (bytes.length > 65_536) { throw new Error("SCHEMATIC_RUN_GUARD_TABLE_BOUND"); }
  // oxlint-disable-next-line node/no-sync -- Immutable in-memory fixed table; both compressed and original hashes stay under the unchanged decoder bounds.
  const packed = gzipSync(bytes, { level: 9 });
  const hashes = cases.map(step => hash(Buffer.from(`${JSON.stringify({ id: 89, method: step.command.method, params: step.command.params, sessionId: "original_ui" })}\0`)));
  const protocol = [
    `public static class EasyedaSchematicRelevanceRunGuardProtocol{`,
    `static void Need(bool value){if(!value)throw new System.InvalidOperationException("schematic-run-guard-codec");}`,
    `static readonly string[][] Rows=EasyedaDiagnosticFixedTable.Load(${quote(packed.toString("base64"))},${String(bytes.length)},${quote(hash(bytes))},${quote(hash(packed))},${String(rows.length)},4);`,
    `public static string Encode(int id,string session,string phase,string method,System.Collections.IDictionary fields){return EasyedaSchematicUiFixedCodec.Encode(id,session,phase,method,fields,Rows,new string[0][],"run_guard",Need);}`,
    `public static void VerifySmoke(){string[] hashes=${currentPcbDiagnosticNativeHashVector(hashes)};for(int index=0;index<Rows.Length;index++){string[] row=Rows[index];var fields=new System.Collections.Hashtable(System.StringComparer.Ordinal);foreach(string name in row[2].Length==0?new string[0]:row[2].Split(','))fields.Add(name,"original_ref");string text=Encode(89,"original_ui",row[0],row[1],fields);using(var sha=System.Security.Cryptography.SHA256.Create())Need(System.BitConverter.ToString(sha.ComputeHash(System.Text.Encoding.UTF8.GetBytes(text))).Replace("-","").ToLowerInvariant()==hashes[index]);fields.Add("functionDeclaration","caller");bool refused=false;try{Encode(89,"original_ui",row[0],row[1],fields);}catch(System.InvalidOperationException){refused=true;}Need(refused);}}`,
    `}`,
  ].join("");
  return `${protocol}
public sealed partial class EasyedaDiagnosticOwner{
bool relevanceRunGuardBound,relevanceRunGuardCompleted;int relevanceRunGuardStep;
public void BindSchematicRelevanceRunGuard(){if(!schematicRelevanceDisplayWrite209||schematicDisplayAbort||!relevanceRunPrefixCompleted||!relevanceCallbackBound||relevanceCallbackArms.Count!=3||relevanceRunGuardBound||!relevanceModifyGenerated||relevanceModifyEntryRequests!=${String(ENTRY.observation + ENTRY.rawObservation + ENTRY.underlineEligibility)}||schematicDisplayStages[4]||schematicDisplayStages[6])throw Error("schematic-run-guard-original-bind");AssertLive();relevanceRunGuardBound=true;}
static bool SchematicRelevanceRunGuardExpected(int step,string phase){string[] roles={"first-start","will-end","first-end"};if(step<3)return phase==roles[step]+"-prefix-arm";if(step==3)return phase=="run-prefix-resume";int index=(step-4)/6,part=(step-4)%6;if(index<0||index>2)return false;string role=roles[index];if(part==0)return phase==role+"-prefix-frame-0"||phase==role+"-prefix-frame-1";return phase==role+new[]{"","-prefix-properties","-prefix-properties","-prefix-call","-prefix-remove","-prefix-resume"}[part];}
public void SendSchematicRelevanceRunGuard(int id,string phase,string method,System.Collections.IDictionary fields){if(!schematicRelevanceDisplayWrite209||schematicDisplayAbort||!relevanceRunGuardBound||relevanceRunGuardCompleted||relevanceRunGuardStep>=${String(REQUESTS.total)}||!SchematicRelevanceRunGuardExpected(relevanceRunGuardStep,phase)||schematicDisplayStages[4]||schematicDisplayStages[6])throw Error("schematic-run-guard-order");AssertLive();string text=EasyedaSchematicRelevanceRunGuardProtocol.Encode(id,schematicDisplaySession,phase,method,fields);relevanceRunGuardStep++;SendMessage(id,text);}
public void CompleteSchematicRelevanceRunGuard(){if(!schematicRelevanceDisplayWrite209||schematicDisplayAbort||!relevanceRunGuardBound||relevanceRunGuardCompleted||relevanceRunGuardStep!=${String(REQUESTS.total)}||schematicDisplayStages[4]||schematicDisplayStages[6])throw Error("schematic-run-guard-complete");AssertLive();relevanceRunGuardCompleted=true;}
}`;
}
const dispatch = String.raw`        'schematic-relevance-run-guard' {
          if(-not $SchematicRelevanceDisplayWrite209 -or -not $launched -or $request.phase -isnot [string] -or $request.method -isnot [string] -or ($request.requestId -isnot [int] -and $request.requestId -isnot [long])){throw 'schematic-run-guard-fields'}
          $base=@('action','id','helperInstance','jobId','rootPid','rootCreated','requestId','phase','method');foreach($field in $base){if(@($request.PSObject.Properties.Name) -cnotcontains $field){throw 'schematic-run-guard-field'}}
          $fields=New-Object Collections.Hashtable ([StringComparer]::Ordinal);foreach($property in $request.PSObject.Properties){if($base -cnotcontains $property.Name){$fields.Add($property.Name,$property.Value)}}
          if($request.phase -ceq 'bind' -or $request.phase -ceq 'complete'){if($request.requestId -ne 0 -or $request.method -cne 'control' -or $fields.Count -ne 0){throw 'schematic-run-guard-control'};if($request.phase -ceq 'bind'){$owner.BindSchematicRelevanceRunGuard()}else{$owner.CompleteSchematicRelevanceRunGuard()}}else{$owner.SendSchematicRelevanceRunGuard([int]$request.requestId,$request.phase,$request.method,$fields)}
          $result=@{written=$true}
        }
`;
export function applyCurrentSchematicRelevanceRunGuardNativeFragment(input: string): string {
  const native = `${begin}\n${currentSchematicRelevanceRunGuardNativeSource()}\n${end}`;
  let source = input; const previous = 'case "schematic-relevance-run-prefix":';
  if (!source.includes('case "schematic-relevance-run-guard":')) { if (source.split(previous).length !== 2) { throw new Error("SCHEMATIC_RUN_GUARD_ADMISSION"); } source = source.replace(previous, `case "schematic-relevance-run-guard":${previous}`); }
  source = installOwnedNativeDispatch(source, dispatch, "        'schematic-relevance-run-prefix' {");
  source = installNativeCompileOnlyHook(source, "    [EasyedaSchematicRelevanceRunGuardProtocol]::VerifySmoke()", "    [EasyedaSchematicRelevanceRunPrefixProtocol]::VerifySmoke()");
  const start = source.indexOf(begin), stop = source.indexOf(end);
  if (start !== -1 || stop !== -1) { if (start === -1 || stop < start || source.includes(begin, start + begin.length) || source.includes(end, stop + end.length)) { throw new Error("SCHEMATIC_RUN_GUARD_MARKERS"); } return source.slice(0, start) + native + source.slice(stop + end.length); }
  const anchor = "// BEGIN ORIGINAL SCHEMATIC RUN PREFIX READS"; if (source.split(anchor).length !== 2) { throw new Error("SCHEMATIC_RUN_GUARD_NATIVE_ANCHOR"); } return source.replace(anchor, `${native}\n${anchor}`);
}
