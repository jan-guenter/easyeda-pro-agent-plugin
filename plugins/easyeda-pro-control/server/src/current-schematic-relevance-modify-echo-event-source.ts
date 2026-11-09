/** Complete selected UI publisher and constructor-created Echo family.
 * Source identity alone grants no subscription or native event ownership. */
import { freezeDeep } from "./sqlite-inventory-core.ts";
import { qualifyCurrentSchematicRelevanceModifyEchoSource as handler } from "./current-schematic-relevance-modify-echo-source.ts";
import { qualifyCurrentSchematicRelevanceCanvasEchoSource as receiver } from "./current-schematic-relevance-canvas-echo-source.ts";

export const CURRENT_SCHEMATIC_RELEVANCE_MODIFY_ECHO_EVENT_SOURCE = freezeDeep({ frame: "[this,K]", topicTemplate: "/pro-mgr/canvas/{uuid}/update", publishers: [{ variant: 0, name: "XE", start: 772_240, end: 782_108 }, { variant: 1, name: "MP", start: 1_795_652, end: 1_805_520 }] } as const);
/** Reuse both complete assets and their independently pinned handler,
 * selected publisher class, initProject callback, task and receiver spans. */
export function qualifyCurrentSchematicRelevanceModifyEchoEventSource(source: string): 0 | 1 {
  const selected = handler(source); if (receiver(source) !== selected) { throw new Error("SCH_UI_ECHO_SOURCE_FAMILY"); } return selected;
}
