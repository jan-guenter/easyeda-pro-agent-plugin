/** Closed original frame paths for the one-listener, isolated Wire refresh. */
import { createHash } from "node:crypto";
import { captureQualifiedCurrentSchematicWireCompletionSource } from "./current-schematic-wire-completion-source.ts";
import { CURRENT_SCHEMATIC_WIRE_NET_GEOMETRY_PINS } from "./current-schematic-wire-net-geometry-pins.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const CURRENT_SCHEMATIC_WIRE_NET_GEOMETRY_ORDER = Object.freeze(["entry", "constructor", "create", "birth", "constructor", "create", "birth", "returned"] as const);
export type CurrentSchematicWireNetGeometryStep = typeof CURRENT_SCHEMATIC_WIRE_NET_GEOMETRY_ORDER[number];
export { CURRENT_SCHEMATIC_WIRE_NET_GEOMETRY_PINS } from "./current-schematic-wire-net-geometry-pins.ts";
export type CurrentSchematicWireNetGeometryRole = keyof typeof CURRENT_SCHEMATIC_WIRE_NET_GEOMETRY_PINS[0];

const shared = { deliver: 32_814, dispatch: 33_222 } as const;
// Suspended caller PCs point to the original call instructions.
// The dispatcher follows its original direct path.
export const CURRENT_SCHEMATIC_WIRE_NET_GEOMETRY_PCS = freezeDeep([
  { ...shared, entry: 278_514, returned: 279_438, listener: 279_874, bbox: 294_599,
    constructor: 462_990, reflect: 98_475, create: 98_546, factory: 101_807,
    birthCall: 278_823, birth: 278_875, iteration: 278_787 },
  { ...shared, entry: 141_848, returned: 142_772, listener: 143_208, bbox: 160_067,
    constructor: 326_429, reflect: 102_222, create: 102_293, factory: 105_554,
    birthCall: 142_157, birth: 142_209, iteration: 142_121 },
] as const);

export function qualifyCurrentSchematicWireNetGeometrySource(input: unknown): 0 | 1 {
  const { variant, scriptSource } = captureQualifiedCurrentSchematicWireCompletionSource(input);
  const pins: Readonly<Record<CurrentSchematicWireNetGeometryRole, { readonly start: number; readonly end: number; readonly bytes: number; readonly sha256: string }>> = CURRENT_SCHEMATIC_WIRE_NET_GEOMETRY_PINS[variant];
  for (const pin of Object.values(pins)) {
    const body = scriptSource.slice(pin.start, pin.end);
    if (Buffer.byteLength(body) !== pin.bytes || createHash("sha256").update(body).digest("hex") !== pin.sha256) {
      throw new Error("WIRE_NET_GEOMETRY_SOURCE");
    }
  }
  return variant;
}

export function currentSchematicWireNetGeometryFrames(variant: 0 | 1, step: CurrentSchematicWireNetGeometryStep): readonly (readonly [CurrentSchematicWireNetGeometryRole, number])[] {
  const pc = CURRENT_SCHEMATIC_WIRE_NET_GEOMETRY_PCS[variant];
  const ancestry = [["listener", pc.listener], ["deliver", pc.deliver], ["dispatch", pc.dispatch], ["bboxUpdate", pc.bbox]] as const;
  const paths: Readonly<Record<CurrentSchematicWireNetGeometryStep, readonly (readonly [CurrentSchematicWireNetGeometryRole, number])[]>> = {
    entry: [["refresh", pc.entry], ...ancestry],
    returned: [["refresh", pc.returned], ...ancestry],
    constructor: [["markerConstructor", pc.constructor], ["create", pc.reflect], ["factory", pc.factory], ["wireBirth", pc.birthCall], ["refresh", pc.iteration], ...ancestry],
    create: [["create", pc.create], ["factory", pc.factory], ["wireBirth", pc.birthCall], ["refresh", pc.iteration], ...ancestry],
    birth: [["wireBirth", pc.birth], ["refresh", pc.iteration], ...ancestry],
  };
  return paths[step];
}
