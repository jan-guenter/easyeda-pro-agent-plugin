/** Exact private protocol tables using the shared build-only source factory. */
import {currentSchematicRelevanceUiCodecNativeSource} from "./current-schematic-relevance-ui-codec-native-source.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_STATUS_BUS_CALLS as CALLS } from "./current-schematic-relevance-status-bus-protocol.ts";
import { currentSchematicRelevanceStatusBusCases, currentSchematicRelevanceStatusBusTemplate } from "./current-schematic-relevance-status-bus-wire.ts";

export function currentSchematicRelevanceStatusBusNativeSource():string{
  const cases = currentSchematicRelevanceStatusBusCases();
  const rows = cases.map(command => { const row = currentSchematicRelevanceStatusBusTemplate(command); return [row.phase, row.method, row.names.join(","), row.template]; });
  return currentSchematicRelevanceUiCodecNativeSource({className:"EasyedaSchematicRelevanceStatusBusProtocol",errorCode:"schematic-status-bus-codec",tableError:"SCHEMATIC_STATUS_BUS_FIXED_TABLE_BOUND",marker:"statusbus",rows,programs:CALLS.map(row=>row[1]),messages:cases.map(command=>`${JSON.stringify({id:83,method:command.method,params:command.params,sessionId:"original_ui"})}\0`)});
}
