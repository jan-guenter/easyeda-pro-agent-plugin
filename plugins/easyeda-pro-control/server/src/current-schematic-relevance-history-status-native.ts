/** Exact private protocol tables using the shared build-only source factory. */
import {currentSchematicRelevanceUiCodecNativeSource} from "./current-schematic-relevance-ui-codec-native-source.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_HISTORY_STATUS_CALLS as CALLS } from "./current-schematic-relevance-history-status-protocol.ts";
import { currentSchematicRelevanceHistoryStatusCases, currentSchematicRelevanceHistoryStatusTemplate } from "./current-schematic-relevance-history-status-wire.ts";

export function currentSchematicRelevanceHistoryStatusNativeSource():string{
  const cases = currentSchematicRelevanceHistoryStatusCases();
  const rows = cases.map(command => { const row = currentSchematicRelevanceHistoryStatusTemplate(command); return [row.phase, row.method, row.names.join(","), row.template]; });
  return currentSchematicRelevanceUiCodecNativeSource({className:"EasyedaSchematicRelevanceHistoryStatusProtocol",errorCode:"schematic-history-status-codec",tableError:"SCHEMATIC_HISTORY_STATUS_FIXED_TABLE_BOUND",marker:"historystatus",rows,programs:CALLS.map(row=>row[1]),messages:cases.map(command=>`${JSON.stringify({id:83,method:command.method,params:command.params,sessionId:"original_ui"})}\0`)});
}
