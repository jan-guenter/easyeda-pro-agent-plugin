/** Fixed native v4 wrapper for the immutable held v3 Wire callback. Marker
 * locations are derived against the actual evaluated wrapper, never an inner
 * standalone function. This source alone issues no writer or Save authority. */
import { CURRENT_SCHEMATIC_WIRE_WRITER_CALLBACK as CALLBACK, CURRENT_SCHEMATIC_WIRE_WRITER_FUNCTION as INNER } from "./current-schematic-wire-writer-programs.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export { CURRENT_SCHEMATIC_WIRE_EDIT_NAVIGATION_FUNCTION as CURRENT_SCHEMATIC_WIRE_WRITER_V4_NAVIGATION, CURRENT_SCHEMATIC_WIRE_EDIT_START_FUNCTION as CURRENT_SCHEMATIC_WIRE_WRITER_V4_START } from "./current-schematic-wire-edit-programs.ts";

export const CURRENT_SCHEMATIC_WIRE_WRITER_V4_GROUP = "easyeda-pro-control-schematic-wire-writer-native-v4";
export const CURRENT_SCHEMATIC_WIRE_WRITER_V4_STAGE = `async function(targetJson,stage,operationJson){"use strict";return Reflect.apply(${INNER},this,[JSON.parse(targetJson),stage,JSON.parse(operationJson)]);}`;
export const CURRENT_SCHEMATIC_WIRE_WRITER_V4_SCRIPT = `(${CURRENT_SCHEMATIC_WIRE_WRITER_V4_STAGE})`;
const roles = ["entry", "point-before", "point-after", "setter-before", "finish", "failure"] as const;
const start = CURRENT_SCHEMATIC_WIRE_WRITER_V4_SCRIPT.indexOf(CALLBACK);
if (start === -1 || CURRENT_SCHEMATIC_WIRE_WRITER_V4_SCRIPT.split(CALLBACK).length !== 2) { throw new Error("SCHEMATIC_WIRE_WRITER_V4_CALLBACK_ANCHOR"); }
function point(offset: number): Readonly<{ lineNumber: number; columnNumber: number }> {
  const prefix = CURRENT_SCHEMATIC_WIRE_WRITER_V4_SCRIPT.slice(0, offset); return Object.freeze({ lineNumber: prefix.split("\n").length - 1, columnNumber: prefix.length - prefix.lastIndexOf("\n") - 1 });
}
export const CURRENT_SCHEMATIC_WIRE_WRITER_V4_CALLBACK_LOCATION = point(start);
const markers = [...CALLBACK.matchAll(/debugger;/gu)].map(match => start + match.index);
if (markers.length !== roles.length) { throw new Error("SCHEMATIC_WIRE_WRITER_V4_MARKER_ROSTER"); }
export const CURRENT_SCHEMATIC_WIRE_WRITER_V4_MARKERS = freezeDeep(roles.map((role, index) => {
  const offset = markers[index]; if (offset === undefined) { throw new Error("SCHEMATIC_WIRE_WRITER_V4_MARKER_INDEX"); } const location = point(offset); return { role, lineNumber: location.lineNumber, columnNumber: location.columnNumber };
}));
export type CurrentSchematicWireWriterV4MarkerRole = typeof roles[number];
/** The two constructor marker pairs recur at their actual source locations.
 * Their lexical index must separately match the corresponding observation. */
export const CURRENT_SCHEMATIC_WIRE_WRITER_V4_CALLBACK_SEQUENCE = freezeDeep([
  { role: "entry", pointIndex: null }, { role: "point-before", pointIndex: 0 }, { role: "point-after", pointIndex: 0 },
  { role: "point-before", pointIndex: 1 }, { role: "point-after", pointIndex: 1 }, { role: "setter-before", pointIndex: null },
  { role: "finish", pointIndex: null },
] as const);
