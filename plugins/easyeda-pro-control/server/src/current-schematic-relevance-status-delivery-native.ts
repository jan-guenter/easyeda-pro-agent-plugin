/** Exact private protocol tables using the shared build-only source factory. */
import {currentSchematicRelevanceUiCodecNativeSource} from "./current-schematic-relevance-ui-codec-native-source.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_STATUS_DELIVERY_CALLS as CALLS } from "./current-schematic-relevance-status-delivery-protocol.ts";
import { currentSchematicRelevanceStatusDeliveryCases, currentSchematicRelevanceStatusDeliveryTemplate } from "./current-schematic-relevance-status-delivery-wire.ts";

export function currentSchematicRelevanceStatusDeliveryNativeSource():string{
  const cases = currentSchematicRelevanceStatusDeliveryCases();
  const rows = cases.map(command => { const row = currentSchematicRelevanceStatusDeliveryTemplate(command); return [row.phase, row.method, row.names.join(","), row.template]; });
  return currentSchematicRelevanceUiCodecNativeSource({className:"EasyedaSchematicRelevanceStatusDeliveryProtocol",errorCode:"schematic-status-delivery-codec",tableError:"SCHEMATIC_STATUS_DELIVERY_FIXED_TABLE_BOUND",marker:"statusdelivery",rows,programs:CALLS.map(row=>row[1]),messages:cases.map(command=>`${JSON.stringify({id:83,method:command.method,params:command.params,sessionId:"original_ui"})}\0`)});
}
