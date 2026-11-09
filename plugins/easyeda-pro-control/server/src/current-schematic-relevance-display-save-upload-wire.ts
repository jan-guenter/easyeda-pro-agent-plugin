/** Fixed inert Save-local and first-upload codecs, with distinct owner selectors. */
import { currentPcbViaLocalUploadWire } from "./current-pcb-via-local-upload-wire.ts";
import { currentPcbViaUploadRequestWire } from "./current-pcb-via-upload-request-wire.ts";
import { currentProjectSaveProducerNativeCases, validateCurrentProjectSaveProducerCommand } from "./current-project-save-producer-protocol.ts";
import { currentProjectSaveProducerTemplate, currentProjectSaveProducerWire } from "./current-project-save-producer-wire.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const CURRENT_SCHEMATIC_RELEVANCE_SAVE_UPLOAD_REQUESTS = Object.freeze({ local:20, upload:9, localCacheMetadata:14 });
export function currentSchematicRelevanceDisplayLocalWire(input: unknown, id: number): ReturnType<typeof currentPcbViaLocalUploadWire> { const wire=currentPcbViaLocalUploadWire(input,id); return freezeDeep({...wire,request:{...wire.request,action:"schematic-relevance-display-save-local"}}); }
export function currentSchematicRelevanceDisplayUploadWire(input: unknown, id: number): ReturnType<typeof currentPcbViaUploadRequestWire> { const wire=currentPcbViaUploadRequestWire(input,id); return freezeDeep({...wire,request:{...wire.request,action:"schematic-relevance-display-save-upload"}}); }
export function currentSchematicRelevanceDisplayLocalCacheWire(input: unknown, id: number): ReturnType<typeof currentProjectSaveProducerWire> {
  const command=validateCurrentProjectSaveProducerCommand(input); let allowed=false;
  if(command.phase==="project-save-producer-frame"||command.phase==="project-save-producer-receiver"){allowed=command.role==="headEntry"||command.role==="headPromise"||command.role==="headSuccess";}
  else if(command.phase==="project-save-producer-cache-caller"||command.phase==="project-save-producer-cache-receiver"){allowed=command.cacheRole==="localUpload";}
  else {allowed=command.phase==="project-save-producer-properties"||command.phase==="project-save-producer-cache-properties"||command.phase==="project-save-producer-cache-promise"||command.phase==="project-save-producer-cache-promise-properties";}
  if(!allowed){throw new Error("SCHEMATIC_RELEVANCE_LOCAL_CACHE_FIXED_OBSERVATION");}
  const wire=currentProjectSaveProducerWire(command,id,"schematic");return freezeDeep({...wire,request:{...wire.request,action:"schematic-relevance-display-save-local-cache"}});
}
export function currentSchematicRelevanceDisplayLocalCachePhases():readonly string[]{return freezeDeep(currentProjectSaveProducerNativeCases().filter(command=>{try{currentSchematicRelevanceDisplayLocalCacheWire(command,1);return true;}catch{return false;}}).map(command=>currentProjectSaveProducerTemplate(command).phase));}
