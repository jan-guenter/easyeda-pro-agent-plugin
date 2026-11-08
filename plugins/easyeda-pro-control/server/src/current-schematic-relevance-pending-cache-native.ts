/** Exact private protocol tables using the shared build-only source factory. */
import {currentSchematicRelevanceUiCodecNativeSource} from "./current-schematic-relevance-ui-codec-native-source.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_PENDING_CACHE_CALLS as CALLS } from "./current-schematic-relevance-pending-cache-protocol.ts";
import { currentSchematicRelevancePendingCacheCases, currentSchematicRelevancePendingCacheTemplate } from "./current-schematic-relevance-pending-cache-wire.ts";

export function currentSchematicRelevancePendingCacheNativeSource():string{
  const cases = currentSchematicRelevancePendingCacheCases();
  const rows = cases.map(command => { const row = currentSchematicRelevancePendingCacheTemplate(command); return [row.phase, row.method, row.names.join(","), row.template]; });
  return currentSchematicRelevanceUiCodecNativeSource({className:"EasyedaSchematicRelevancePendingCacheProtocol",errorCode:"schematic-pending-cache-codec",tableError:"SCHEMATIC_PENDING_CACHE_FIXED_TABLE_BOUND",marker:"pendingcache",rows,programs:CALLS.map(row=>row[1]),messages:cases.map(command=>`${JSON.stringify({id:83,method:command.method,params:command.params,sessionId:"original_ui"})}\0`)});
}
