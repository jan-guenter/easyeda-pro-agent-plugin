/** Pure fixed preflight codec. Native owner/session/once guards stay in the
 * three existing callers; ordinary opening keeps its original103-ID bound. */
import { createHash } from "node:crypto";
import { CURRENT_PCB_DIAGNOSTIC_OPENING_FUNCTION } from "./current-pcb-diagnostic-opening.ts";
import { CURRENT_PCB_VIA_SAVED_READBACK_PROFILE as PROFILE } from "./current-pcb-via-saved-readback-profile.ts";

const path = String.raw`C:\Synthetic\saved-reader.eprj2`;
const project = createHash("sha256").update(path).digest("hex");
const ids = [1, PROFILE.renderer.opening + 1, PROFILE.renderer.activeReadOnly];
const hashes = ids.map(id => createHash("sha256").update(`${JSON.stringify({ id, method: "Runtime.callFunctionOn", params: {
 functionDeclaration: CURRENT_PCB_DIAGNOSTIC_OPENING_FUNCTION, uniqueContextId: "context",
 arguments: [{ value: { rawWindowsPath: path, projectUuid: project, documentUuid: "b".repeat(32), expectedSourceSha256: "d".repeat(64), branchUuid: "c".repeat(32) } }, { value: "preflight" }],
 returnByValue: true, awaitPromise: true, silent: true, generatePreview: false, userGesture: false, throwOnSideEffect: false,
}, sessionId: "session" })}\0`).digest("hex"));
if (ids[1] === undefined || ids[2] === undefined || ids[1] > ids[2]) { throw new Error("SAVED_VIA_PREFLIGHT_DERIVATION"); }

export function currentPcbViaSavedPreflightNativeSource(): string {
 return String.raw`
public static string SavedViaPreflightProtocolMessage(int id,string session,string context,string path,string project,string branch,string document,string source){
if(id<1||id>${String(PROFILE.renderer.activeReadOnly)})throw Error("saved-readback-preflight-id");
string encoded=OpeningProtocolMessageCore(false,1,session,context,"preflight",path,project,branch,document,source,false),prefix="{\"id\":1,";
if(!encoded.StartsWith(prefix,StringComparison.Ordinal))throw Error("saved-readback-preflight-prefix");
string message="{\"id\":"+id.ToString(CultureInfo.InvariantCulture)+","+encoded.Substring(prefix.Length);
if(Encoding.UTF8.GetByteCount(message)>65536)throw Error("saved-readback-preflight-bound");return message;
}
public static void VerifySavedViaLatePreflightSmoke(){
int[] ids={${ids.join(",")}};string[] hashes={${hashes.map(hash => JSON.stringify(hash)).join(",")}};
for(int i=0;i<ids.Length;i++){string value=SavedViaPreflightProtocolMessage(ids[i],"session","context",@"${path}","${project}",new string('c',32),new string('b',32),new string('d',64));using(var sha=SHA256.Create()){if(BitConverter.ToString(sha.ComputeHash(Encoding.UTF8.GetBytes(value))).Replace("-","").ToLowerInvariant()!=hashes[i])throw Error("saved-readback-preflight-golden");}}
foreach(int id in new[]{-1,0,${String(PROFILE.renderer.activeReadOnly+1)}}){bool refused=false;try{SavedViaPreflightProtocolMessage(id,"session","context",@"${path}","${project}",new string('c',32),new string('b',32),new string('d',64));}catch{refused=true;}if(!refused)throw Error("saved-readback-preflight-id-refusal");}
bool oldRefused=false;try{OpeningProtocolMessageCore(false,${String(PROFILE.renderer.opening+1)},"session","context","preflight",@"${path}","${project}",new string('c',32),new string('b',32),new string('d',64),false);}catch{oldRefused=true;}if(!oldRefused)throw Error("saved-readback-ordinary-cap-unchanged");
}
`;
}
