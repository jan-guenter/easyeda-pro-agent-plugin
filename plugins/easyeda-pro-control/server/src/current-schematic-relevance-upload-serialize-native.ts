/** Exact private protocol tables using the shared build-only source factory. */
import {currentSchematicRelevanceUiCodecNativeSource} from "./current-schematic-relevance-ui-codec-native-source.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_UPLOAD_SERIALIZE_CALLS as CALLS } from "./current-schematic-relevance-upload-serialize-protocol.ts";
import { currentSchematicRelevanceUploadSerializeCases, currentSchematicRelevanceUploadSerializeTemplate } from "./current-schematic-relevance-upload-serialize-wire.ts";

export function currentSchematicRelevanceUploadSerializeNativeSource():string{
  const cases = currentSchematicRelevanceUploadSerializeCases();
  const rows = cases.map(command => { const row = currentSchematicRelevanceUploadSerializeTemplate(command); return [row.phase, row.method, row.names.join(","), row.template]; });
  return currentSchematicRelevanceUiCodecNativeSource({className:"EasyedaSchematicRelevanceUploadSerializeProtocol",errorCode:"schematic-upload-serialize-codec",tableError:"SCHEMATIC_UPLOAD_SERIALIZE_FIXED_TABLE_BOUND",marker:"uploadserialize",rows,programs:CALLS.map(row=>row[1]),messages:cases.map(command=>`${JSON.stringify({id:83,method:command.method,params:command.params,sessionId:"original_ui"})}\0`)});
}
