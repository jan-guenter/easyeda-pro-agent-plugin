/** Exact ordinary block entry/catch/return positions for the original bbox
 * callback. Source/point data supply no held-event or continuation ownership. */
import { qualifyCurrentSchematicWireCompletionSource } from "./current-schematic-wire-completion-source.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const CURRENT_SCHEMATIC_WIRE_BBOX_POINTS = freezeDeep([
  {
    "variant": 0,
    "entry": {
      "lineNumber": 3606,
      "columnNumber": 293_206
    },
    "caught": {
      "lineNumber": 3606,
      "columnNumber": 293_412
    },
    "returned": {
      "lineNumber": 3606,
      "columnNumber": 293_506
    }
  },
  {
    "variant": 1,
    "entry": {
      "lineNumber": 4105,
      "columnNumber": 158_674
    },
    "caught": {
      "lineNumber": 4105,
      "columnNumber": 158_880
    },
    "returned": {
      "lineNumber": 4105,
      "columnNumber": 158_974
    }
  }
] as const);
/** The complete installed bundle and callback must match before these points
 * can participate in an original owner. */
export function qualifyCurrentSchematicWireBboxSource(input: unknown): 0 | 1 { return qualifyCurrentSchematicWireCompletionSource(input); }
