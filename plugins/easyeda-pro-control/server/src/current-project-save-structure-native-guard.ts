/** Purpose-specific native guards for the shared fixed structure vocabulary.
 * There is no public history grant setter; original SQL callbacks must supply
 * that separate authority before any publication continuation can be mounted. */
import { CURRENT_PROJECT_SAVE_STRUCTURE_REQUESTS as REQUESTS, CURRENT_PROJECT_SAVE_STRUCTURE_CONSTRUCTION_SEQUENCE as SEQUENCE } from "./current-project-save-structure-protocol.ts";

export function currentProjectSaveStructureNativeGuard(purpose: "via" | "schematic"): string {
  const prefix = purpose === "via" ? "via" : "schematic";
  const name = purpose === "via" ? "Via" : "SchematicDisplay";
  const save = purpose === "via" ? "viaSdkStages[4]" : "schematicDisplayStages[6]";
  const fresh = purpose === "via" ? "CreatePcbViaWrite209()" : "CreateSchematicDisplayWrite209()";
  const original = purpose === "via" ? "pcbViaWrite209&&!viaAbortAttempted" : "schematicDisplayWrite209&&!schematicDisplayAbort";
  return `
readonly System.Collections.Generic.HashSet<string> ${prefix}StructurePoints=new System.Collections.Generic.HashSet<string>();
int ${prefix}StructureNormal,${prefix}StructureCleanup,${prefix}ProducerConstructorStep,${prefix}ProducerConstructorRemovals;bool ${prefix}StructureSourceRead,${prefix}StructureBootstrapResumed,${prefix}StructureHistoryGranted=false;
void Admit${name}SaveStructureObserver(string phase,System.Collections.IDictionary fields){
if(!(${original})||${prefix}WorkerSession==null)throw Error("project-save-structure-purpose");
bool cleanup=phase=="project-save-structure-remove"||phase=="project-save-structure-release";
if(cleanup?${prefix}StructureCleanup>=${String(REQUESTS.cleanup)}:${prefix}StructureNormal>=${String(REQUESTS.normal)})throw Error("project-save-structure-budget");
if(${prefix}WorkerStage==6&&${prefix}WorkerSourceRead){
if(phase=="project-save-structure-source"){if(${prefix}StructureSourceRead||fields["scriptId"] as string!=${prefix}WorkerProjectScript)throw Error("project-save-structure-source-once");${prefix}StructureSourceRead=true;}
else if(phase.StartsWith("project-save-structure-arm-",StringComparison.Ordinal)){string role=phase.Substring("project-save-structure-arm-".Length);if(!${prefix}StructureSourceRead||fields["scriptId"] as string!=${prefix}WorkerProjectScript||Array.IndexOf(new[]{"producerUpload","producerBase","producerCooperation","producerSerial","producerDebounce","producerProject","bootstrap","packet","response","callbackReturn","initialFinally","queuedFinally"},role)<0||!${prefix}StructurePoints.Add(role))throw Error("project-save-structure-arm-once");}
else throw Error("project-save-structure-before-source-resume");
}else{
if(${prefix}WorkerStage!=7||!${prefix}StructureSourceRead||${prefix}StructurePoints.Count!=12||phase=="project-save-structure-source"||phase.StartsWith("project-save-structure-arm-",StringComparison.Ordinal))throw Error("project-save-structure-bootstrap-required");
if(phase.StartsWith("project-save-structure-resume-producer",StringComparison.Ordinal)){string[] sequence=new[]{${SEQUENCE.map(role => `"${role}"`).join(",")}};if(${prefix}StructureBootstrapResumed||${save}||${prefix}ProducerConstructorStep>=sequence.Length||phase!="project-save-structure-resume-"+sequence[${prefix}ProducerConstructorStep])throw Error("project-save-structure-constructor-order");${prefix}ProducerConstructorStep++;}
else if(phase=="project-save-structure-resume-bootstrap"){if(${prefix}StructureBootstrapResumed||${prefix}ProducerConstructorStep!=7||${prefix}ProducerConstructorRemovals!=6||${save})throw Error("project-save-structure-bootstrap-resume-once");${prefix}StructureBootstrapResumed=true;}
else if(phase.StartsWith("project-save-structure-resume-",StringComparison.Ordinal)){if(!${prefix}StructureBootstrapResumed||!${save}||!${prefix}StructureHistoryGranted)throw Error("project-save-structure-original-history-required");}
else if(!${prefix}StructureBootstrapResumed&&cleanup){if(phase!="project-save-structure-remove"||${prefix}ProducerConstructorStep!=7||${prefix}ProducerConstructorRemovals>=6)throw Error("project-save-structure-cleanup-before-construction");${prefix}ProducerConstructorRemovals++;}
}
if(cleanup)${prefix}StructureCleanup++;else ${prefix}StructureNormal++;
}
public static void Verify${name}SaveStructureGuardSmoke(){var owner=${fresh};var fields=new System.Collections.Hashtable(System.StringComparer.Ordinal);fields.Add("scriptId","original_project");owner.${prefix}WorkerSession="original_worker";owner.${prefix}WorkerStage=6;owner.${prefix}WorkerSourceRead=true;owner.${prefix}WorkerProjectScript="original_project";owner.Admit${name}SaveStructureObserver("project-save-structure-source",fields);
foreach(string role in new[]{"producerUpload","producerBase","producerCooperation","producerSerial","producerDebounce","producerProject","bootstrap","packet","response","callbackReturn","initialFinally","queuedFinally"})owner.Admit${name}SaveStructureObserver("project-save-structure-arm-"+role,fields);
owner.${prefix}WorkerStage=7;owner.${prefix}WorkerSourceRead=false;bool orderRefused=false;try{owner.Admit${name}SaveStructureObserver("project-save-structure-resume-producerBase",new System.Collections.Hashtable());}catch(System.InvalidOperationException){orderRefused=true;}if(!orderRefused||owner.${prefix}ProducerConstructorStep!=0)throw Error("project-save-structure-constructor-order-smoke");foreach(string role in new[]{${SEQUENCE.map(role => `"${role}"`).join(",")}})owner.Admit${name}SaveStructureObserver("project-save-structure-resume-"+role,new System.Collections.Hashtable());for(int i=0;i<6;i++)owner.Admit${name}SaveStructureObserver("project-save-structure-remove",new System.Collections.Hashtable());owner.Admit${name}SaveStructureObserver("project-save-structure-resume-bootstrap",new System.Collections.Hashtable());
foreach(string role in new[]{"producerUpload","producerBase","producerCooperation","producerSerial","producerDebounce","producerProject","bootstrap","packet","response","callbackReturn","initialFinally","queuedFinally"}){bool refused=false;try{owner.Admit${name}SaveStructureObserver("project-save-structure-resume-"+role,new System.Collections.Hashtable());}catch(System.InvalidOperationException){refused=true;}if(!refused)throw Error("project-save-structure-original-history-smoke");}
owner.originalMain.Release();
}
`;
}
