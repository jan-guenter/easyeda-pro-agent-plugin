/** Diagnostic layout only. The inverse helper retains its old Component
 * codebook and does not carry these additional unreachable programs. */
import {createHash} from "node:crypto";
import {gzipSync} from "node:zlib";
import {CURRENT_PCB_209_COMPONENT_CLONED_POINT_BINDINGS_FUNCTION as BINDINGS,CURRENT_PCB_209_COMPONENT_CLONED_POINT_READ_FUNCTION as READ} from "./current-pcb-209-component-cloned-point-read.ts";
import {deriveCurrentPcb209ComponentClonedPointBudget} from "./current-pcb-209-component-cloned-point-source-profile.ts";

function packed(name:string,text:string):string{const bytes=Buffer.from(text);if(bytes.length>65_536){throw new Error("COMPONENT_CLONED_NATIVE_PROGRAM_BOUND");}
 // oxlint-disable-next-line node/no-sync -- Deterministic packing of bounded fixed source programs during generation only.
 const compressed=gzipSync(bytes,{level:9});return `static readonly string ${name}=UnpackFixedProgram("${compressed.toString("base64")}",${String(bytes.length)},"${createHash("sha256").update(bytes).digest("hex")}","${createHash("sha256").update(compressed).digest("hex")}");`;}
function one(source:string,from:string,to:string):string{if(source.split(from).length!==2){throw new Error(`COMPONENT_CLONED_NATIVE_ANCHOR:${from.slice(0,64)}`);}return source.replace(from,to);}
export function extendCurrentPcbComponentClonedSpatialNativeSource(input:string):string{
 const budget=deriveCurrentPcb209ComponentClonedPointBudget(11);if(budget.calleeProperties!==295||budget.spatialStage!==316||budget.fullWorkflow!==419){throw new Error("COMPONENT_CLONED_NATIVE_DERIVATION");}
 const readMessage=`${JSON.stringify({id:418,method:"Runtime.callFunctionOn",params:{throwOnSideEffect:false,silent:true,awaitPromise:false,generatePreview:false,userGesture:false,objectId:"bundle",functionDeclaration:READ,objectGroup:"easyeda-pro-control-pcb209-spatial-v1",returnByValue:true,arguments:[{value:{kind:"point",xMil:0,yMil:0}}]},sessionId:"s"})}\0`;
 const readSha=createHash("sha256").update(readMessage).digest("hex");
 let source=input;
 source=one(source,'phase=="bindings-component"||phase=="read-component"?"false":"true"','phase=="bindings-component"||phase=="read-component"||phase=="bindings-component-cloned"||phase=="read-component-cloned"?"false":"true"');
 source=one(source,'phase=="handler"||phase=="functions"||phase=="bindings-component"||phase=="read-component"','phase=="handler"||phase=="functions"||phase=="bindings-component"||phase=="read-component"||phase=="bindings-component-cloned"||phase=="read-component-cloned"');
 source=one(source,'phase=="bindings-component"?ComponentBindingsFunction:ComponentReadFunction','phase=="bindings-component-cloned"?ComponentClonedBindingsFunction:phase=="read-component-cloned"?ComponentClonedReadFunction:phase=="bindings-component"?ComponentBindingsFunction:ComponentReadFunction');
 source=one(source,'(phase=="read-component"?"true":"false")','(phase=="read-component"||phase=="read-component-cloned"?"true":"false")');
 source=one(source,'if(phase=="bindings-component"){expected.Add("callbackObjectId");','if(phase=="bindings-component"||phase=="bindings-component-cloned"){expected.Add("callbackObjectId");');
 source=one(source,'if(phase=="read-component"){expected.AddRange','if(phase=="read-component"||phase=="read-component-cloned"){expected.AddRange');
 const start=source.indexOf('void ComponentSequence(');const end=source.indexOf('\npublic void SendComponentSpatial(',start);if(start===-1||end<start){throw new Error("COMPONENT_CLONED_NATIVE_SEQUENCE");}
 source=source.slice(0,start)+String.raw`void ComponentSequence(int id,string session,string phase,System.Collections.IDictionary fields){
if(!componentSpatial209)throw Error("component-purpose");if(componentReleased||componentPcbSession==null||session!=componentPcbSession||session!=componentParentSession||session!=componentSourceSession)throw Error("component-original-context");
if(phase=="release"){if(componentStage==0)throw Error("component-sequence");componentReleased=true;return;}if(id>418)throw Error("component-cleanup-reserve");
if(phase=="properties"){if(componentStage<1||componentStage>4)throw Error("component-sequence");return;}
if(phase=="read-component"||phase=="read-component-cloned"){if(componentStage<4||componentStage>5||componentClonedSelected!=(phase=="read-component-cloned")||componentReads>=(componentClonedSelected?11:16))throw Error("component-read-sequence");componentReads++;componentStage=5;return;}
string selected=phase=="bindings-component-cloned"?"bindings-component":phase;string[] steps={"wrapper","handler","bindings-component","functions"};if(componentStage>=steps.Length||steps[componentStage]!=selected)throw Error("component-sequence");
if(phase=="wrapper"){if(componentContext!=null)throw Error("component-context-consumed");componentContext=SpatialText(fields,"uniqueContextId",128);}
if(phase=="bindings-component"||phase=="bindings-component-cloned"){if((string)fields["projectUuid"]!=componentProject||(string)fields["documentUuid"]!=componentDocument)throw Error("component-scene-target");componentClonedSelected=phase=="bindings-component-cloned";}componentStage++;}
`+source.slice(end);
 source=one(source,'public static void VerifyComponentSpatialSmoke(){','public static void VerifyComponentSpatialSmoke(){VerifyComponentClonedSpatialSmoke();');
 const tail='// END GENERATED COMPONENT SPATIAL419';
 return one(source,tail,`public sealed partial class EasyedaDiagnosticOwner {\nbool componentClonedSelected;\n${packed("ComponentClonedBindingsFunction",BINDINGS)}\n${packed("ComponentClonedReadFunction",READ)}\n${String.raw`
public static void VerifyComponentClonedSpatialSmoke(){
var owner=CreateComponentSpatial209();owner.componentParentSession="s";owner.componentPcbSession="s";owner.componentSourceSession="s";owner.componentProject=new string('a',64);owner.componentDocument=new string('a',32);
var fields=new System.Collections.Hashtable();fields["uniqueContextId"]="context";owner.ComponentSequence(1,"s","wrapper",fields);owner.ComponentSequence(2,"s","handler",fields);fields.Clear();fields["projectUuid"]=owner.componentProject;fields["documentUuid"]=owner.componentDocument;owner.ComponentSequence(3,"s","bindings-component-cloned",fields);owner.ComponentSequence(4,"s","functions",fields);
bool refused=false;try{owner.ComponentSequence(5,"s","read-component",fields);}catch{refused=true;}if(!refused||owner.componentReads!=0)throw Error("component-cloned-mixing-smoke");for(int i=0;i<11;i++)owner.ComponentSequence(5+i,"s","read-component-cloned",fields);refused=false;try{owner.ComponentSequence(16,"s","read-component-cloned",fields);}catch{refused=true;}if(!refused||owner.componentReads!=11)throw Error("component-cloned-read-cap-smoke");
fields.Clear();fields["objectId"]="bundle";fields["queryKind"]="point";fields["xMil"]=0;fields["yMil"]=0;string message=ComponentSpatialProtocolMessage(418,"Runtime.callFunctionOn","s","read-component-cloned",fields);if(message.IndexOf(JsonString(ComponentClonedReadFunction),StringComparison.Ordinal)<0||Encoding.UTF8.GetByteCount(message)>65536)throw Error("component-cloned-fixed-program-smoke");
using(SHA256 sha=SHA256.Create())if(BitConverter.ToString(sha.ComputeHash(Encoding.UTF8.GetBytes(message))).Replace("-","").ToLowerInvariant()!="${readSha}")throw Error("component-cloned-js-native-byte-parity-smoke");
fields.Clear();owner.ComponentSequence(419,"s","release",fields);if(!owner.componentReleased)throw Error("component-cloned-release-smoke");
}
`}\n}\n${tail}`);
}
