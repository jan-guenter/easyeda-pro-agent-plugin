/** Exact private protocol tables using the shared build-only source factory. */
import {currentSchematicRelevanceUiCodecNativeSource} from "./current-schematic-relevance-ui-codec-native-source.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_UPLOAD_ENTRY_CALLS as CALLS } from "./current-schematic-relevance-upload-entry-protocol.ts";
import { currentSchematicRelevanceUploadEntryCases, currentSchematicRelevanceUploadEntryTemplate } from "./current-schematic-relevance-upload-entry-wire.ts";

export function currentSchematicRelevanceUploadEntryNativeSource():string{
  const cases = currentSchematicRelevanceUploadEntryCases();
  const rows = cases.map(command => { const row = currentSchematicRelevanceUploadEntryTemplate(command); return [row.phase, row.method, row.names.join(","), row.template]; });
  return currentSchematicRelevanceUiCodecNativeSource({className:"EasyedaSchematicRelevanceUploadEntryProtocol",errorCode:"schematic-upload-entry-codec",tableError:"SCHEMATIC_UPLOAD_ENTRY_FIXED_TABLE_BOUND",marker:"uploadentry",rows,programs:CALLS.map(row=>row[1]),messages:cases.map(command=>`${JSON.stringify({id:83,method:command.method,params:command.params,sessionId:"original_ui"})}\0`)});
}
