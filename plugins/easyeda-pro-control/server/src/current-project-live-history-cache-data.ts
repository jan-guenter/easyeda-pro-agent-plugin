/** Closed data-only inputs to the fixed shared cache/sync algorithms.
 * Neither variant carries an owner, a continuation or a native grant. */
import type { CurrentPcbViaLiveHistoryCacheData } from "./current-pcb-via-live-history-cache-data.ts";
import type { CurrentSchematicRelevanceDisplayLiveHistoryCacheData } from "./current-schematic-relevance-display-live-history-cache-data.ts";

export type CurrentProjectLiveHistoryCacheData = CurrentPcbViaLiveHistoryCacheData | CurrentSchematicRelevanceDisplayLiveHistoryCacheData;
