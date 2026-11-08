/** Exact private protocol tables using the shared build-only source factory. */
import {currentSchematicRelevanceUiCodecNativeSource} from "./current-schematic-relevance-ui-codec-native-source.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_UPLOAD_CM_CALLS as CALLS } from "./current-schematic-relevance-upload-cm-protocol.ts";
import { currentSchematicRelevanceUploadCmCases, currentSchematicRelevanceUploadCmTemplate } from "./current-schematic-relevance-upload-cm-wire.ts";

export function currentSchematicRelevanceUploadCmNativeSource():string{
  const cases = currentSchematicRelevanceUploadCmCases();
  const rows = cases.map(command => { const row = currentSchematicRelevanceUploadCmTemplate(command); return [row.phase, row.method, row.names.join(","), row.template]; });
  return currentSchematicRelevanceUiCodecNativeSource({className:"EasyedaSchematicRelevanceUploadCmProtocol",errorCode:"schematic-upload-cm-codec",tableError:"SCHEMATIC_UPLOAD_CM_FIXED_TABLE_BOUND",marker:"uploadcm",rows,programs:CALLS.map(row=>row[1]),messages:cases.map(command=>`${JSON.stringify({id:83,method:command.method,params:command.params,sessionId:"original_ui"})}\0`)});
}
