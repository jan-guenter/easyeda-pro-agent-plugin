/** Build-only fixed three-stage codec. The owning native reader must separately
 * enroll its actual cold-load context, target, holder and cleanup permission. */
import { createHash } from "node:crypto";
import { gzipSync } from "node:zlib";
import { CURRENT_SCHEMATIC_RELEVANCE_SAVED_SCENE_GROUP as GROUP, CURRENT_SCHEMATIC_RELEVANCE_SAVED_SCENE_FUNCTION as PROGRAM,
  currentSchematicRelevanceSavedSceneCommand, currentSchematicRelevanceSavedSceneWire } from "./current-schematic-relevance-saved-scene-protocol.ts";
import { currentPcbDiagnosticNativeHashVector } from "./current-pcb-diagnostic-fixed-table-native.ts";

const quote = (text: string): string => `@"${text.replaceAll('"', '""')}"`;
function program(): string {
  const bytes = Buffer.from(PROGRAM); if (bytes.length === 0 || bytes.length > 65_536) { throw new Error("SCHEMATIC_SAVED_SCENE_PROGRAM_BOUND"); }
  // oxlint-disable-next-line node/no-sync -- This packs only fixed build-time source; no runtime input or path is accepted.
  const compressed = gzipSync(bytes, { level: 9 });
  return `UnpackFixedProgram(${quote(compressed.toString("base64"))},${String(bytes.length)},${quote(createHash("sha256").update(bytes).digest("hex"))},${quote(createHash("sha256").update(compressed).digest("hex"))})`;
}
export function currentSchematicRelevanceSavedSceneNativeSource(): string {
  const target = { rawWindowsPath: `C:\\SyntheticTemp\\CodexEasyedaFixture_${"1".repeat(32)}\\Codex_schematic_relevance_${"2".repeat(16)}.eprj2`,
    projectUuid: "3".repeat(64), branchUuid: "4".repeat(32), schematicUuid: "5".repeat(32), pageUuid: "6".repeat(32), expectedSourceSha256: "7".repeat(64) };
  const operation = { operationId: "sch209-relevance-display-scene-codec", textId: "text", body: {}, peers: Array.from({ length: 6 }, (_, index) => ({ id: `peer${String(index)}`, type: "LINE", body: {} })), rootIds: ["text", "wire", "bus"] };
  const fields: string[] = [], hashes: string[] = [];
  for (const [index, phase] of ["capture", "observe", "release"].entries()) {
    if (phase !== "capture" && phase !== "observe" && phase !== "release") { throw new Error("SCHEMATIC_SAVED_SCENE_PHASE"); }
    const id = 801 + index; const command = phase === "release" ? currentSchematicRelevanceSavedSceneCommand(phase, "") : currentSchematicRelevanceSavedSceneCommand(phase, phase === "capture" ? "context" : "holder", { target, operation });
    const fixed = currentSchematicRelevanceSavedSceneWire(command, id, "session"); const { id: requestId, method, params, sessionId } = fixed.command;
    hashes.push(createHash("sha256").update(`${JSON.stringify({ id: requestId, method, params, sessionId })}\0`).digest("hex"));
    if (command.savedScenePhase !== "release") { fields.push(`var ${phase}=new System.Collections.Hashtable();${phase}[${quote(phase === "capture" ? "uniqueContextId" : "objectId") }]=${quote(phase === "capture" ? "context" : "holder")};${phase}["targetJson"]=${quote(command.params.arguments[0].value)};${phase}["operationJson"]=${quote(command.params.arguments[2].value)};`); }
  }
  return String.raw`
static readonly string schematicSavedSceneProgram=${program()};
static string SchematicSavedSceneText(System.Collections.IDictionary fields,string name,int maximum){if(fields==null||!fields.Contains(name)||!(fields[name] is string))throw Error("schematic-saved-scene-field");string text=(string)fields[name];if(text.Length<1||Encoding.UTF8.GetByteCount(text)>maximum||text.IndexOf('\0')>=0)throw Error("schematic-saved-scene-text");return text;}
static string SchematicSavedSceneSelector(string text){if(text==null||!System.Text.RegularExpressions.Regex.IsMatch(text,@"\A[A-Za-z0-9_.:-]{1,256}\z"))throw Error("schematic-saved-scene-selector");return text;}
public static string SchematicRelevanceSavedSceneProtocolMessage(int id,string session,string phase,System.Collections.IDictionary fields){
if(id<1||fields==null)throw Error("schematic-saved-scene-id");SchematicSavedSceneSelector(session);string method,parameters;
if(phase=="release"){if(fields.Count!=0)throw Error("schematic-saved-scene-fields");method="Runtime.releaseObjectGroup";parameters="\"objectGroup\":"+JsonString(${quote(GROUP)});}
else if(phase=="capture"||phase=="observe"){bool capture=phase=="capture";string selector=capture?"uniqueContextId":"objectId";if(fields.Count!=3)throw Error("schematic-saved-scene-fields");string receiver=SchematicSavedSceneSelector(SchematicSavedSceneText(fields,selector,256)),target=SchematicSavedSceneText(fields,"targetJson",16384),operation=SchematicSavedSceneText(fields,"operationJson",16384);method="Runtime.callFunctionOn";parameters="\"throwOnSideEffect\":false,\"silent\":true,\"awaitPromise\":true,\"generatePreview\":false,\"userGesture\":false,\"objectGroup\":"+JsonString(${quote(GROUP)})+",\"functionDeclaration\":"+JsonString(schematicSavedSceneProgram)+","+JsonString(selector)+":"+JsonString(receiver)+",\"arguments\":[{\"value\":"+JsonString(target)+"},{\"value\":"+JsonString(phase)+"},{\"value\":"+JsonString(operation)+"}],\"returnByValue\":"+(capture?"false":"true");}
else throw Error("schematic-saved-scene-phase");
string result="{\"id\":"+id.ToString(CultureInfo.InvariantCulture)+",\"method\":"+JsonString(method)+",\"params\":{"+parameters+"},\"sessionId\":"+JsonString(session)+"}\0";if(Encoding.UTF8.GetByteCount(result)>65536)throw Error("schematic-saved-scene-bound");return result;
}
public static void VerifySchematicRelevanceSavedSceneSmoke(){
${fields.join("\n")}
string[] phases={"capture","observe","release"};System.Collections.IDictionary[] values={capture,observe,new System.Collections.Hashtable()};string[] expected=${currentPcbDiagnosticNativeHashVector(hashes)};
for(int i=0;i<3;i++){string actual=SchematicRelevanceSavedSceneProtocolMessage(801+i,"session",phases[i],values[i]);using(var sha=System.Security.Cryptography.SHA256.Create()){if(BitConverter.ToString(sha.ComputeHash(Encoding.UTF8.GetBytes(actual))).Replace("-","").ToLowerInvariant()!=expected[i])throw Error("schematic-saved-scene-golden");}}
foreach(string denied in new[]{"save","modify","navigate"}){bool refused=false;try{SchematicRelevanceSavedSceneProtocolMessage(1,"session",denied,capture);}catch{refused=true;}if(!refused)throw Error("schematic-saved-scene-denied");}
}
`;
}
