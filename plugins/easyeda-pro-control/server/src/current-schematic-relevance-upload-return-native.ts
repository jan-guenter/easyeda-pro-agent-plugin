/** Exact private protocol tables using the shared build-only source factory. */
import {currentSchematicRelevanceUiCodecNativeSource} from "./current-schematic-relevance-ui-codec-native-source.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_UPLOAD_RETURN_CALLS as CALLS } from "./current-schematic-relevance-upload-return-protocol.ts";
import { currentSchematicRelevanceUploadReturnCases, currentSchematicRelevanceUploadReturnTemplate } from "./current-schematic-relevance-upload-return-wire.ts";

export function currentSchematicRelevanceUploadReturnNativeSource():string{
  const cases = currentSchematicRelevanceUploadReturnCases();
  const rows = cases.map(command => { const row = currentSchematicRelevanceUploadReturnTemplate(command); return [row.phase, row.method, row.names.join(","), row.template]; });
  return currentSchematicRelevanceUiCodecNativeSource({className:"EasyedaSchematicRelevanceUploadReturnProtocol",errorCode:"schematic-upload-return-codec",tableError:"SCHEMATIC_UPLOAD_RETURN_FIXED_TABLE_BOUND",marker:"uploadreturn",rows,programs:CALLS.map(row=>row[1]),messages:cases.map(command=>`${JSON.stringify({id:83,method:command.method,params:command.params,sessionId:"original_ui"})}\0`)});
}
