/** Exact private protocol tables using the shared build-only source factory. */
import {currentSchematicRelevanceUiCodecNativeSource} from "./current-schematic-relevance-ui-codec-native-source.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_UPLOAD_MODEL_CALLS as CALLS } from "./current-schematic-relevance-upload-model-protocol.ts";
import { currentSchematicRelevanceUploadModelCases, currentSchematicRelevanceUploadModelTemplate } from "./current-schematic-relevance-upload-model-wire.ts";

export function currentSchematicRelevanceUploadModelNativeSource():string{
  const cases = currentSchematicRelevanceUploadModelCases();
  const rows = cases.map(command => { const row = currentSchematicRelevanceUploadModelTemplate(command); return [row.phase, row.method, row.names.join(","), row.template]; });
  return currentSchematicRelevanceUiCodecNativeSource({className:"EasyedaSchematicRelevanceUploadModelProtocol",errorCode:"schematic-upload-model-codec",tableError:"SCHEMATIC_UPLOAD_MODEL_FIXED_TABLE_BOUND",marker:"uploadmodel",rows,programs:CALLS.map(row=>row[1]),messages:cases.map(command=>`${JSON.stringify({id:83,method:command.method,params:command.params,sessionId:"original_ui"})}\0`)});
}
