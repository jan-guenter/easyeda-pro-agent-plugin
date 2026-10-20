/** Pure default-font box prediction for the existing fixed first-String plan.
 * No font API, lazy cache, vendor serializer or live renderer is evaluated.
 * This models a bounding rectangle, not outlines, state flags or rendering. */
import { canonicalJson, sha256Text } from "./core.ts";
import { decodeCurrentPcbDiagnosticRawStringsReply } from "./current-pcb-diagnostic-raw-strings.ts";
import { requireOriginalCurrentPcbStringCreate } from "./current-pcb-string-create.ts";
import type { CurrentPcbStringCreateCandidate } from "./current-pcb-string-create.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

// Maximal x of each printable non-space ASCII glyph, in codepoint order33..126.
// Extracted as inert numeric data from Qy.fontPath3628338..3635614 in PCB217199c8.
// Complete literal SHA77fb93d6c3f1e02e158f64247348fd07aa23b5d15737627d9eb0e6825c11e37f.
// Every included path has at least two points, so its max endpoint contributes
// To the line bbox. No vendor path string or executable font code is included.
export const CURRENT_PCB_DEFAULT_GLYPH_MAX_X: readonly number[] = Object.freeze([
  2, 8, 15, 14, 18, 20, 2, 7, 7, 10, 18, 2, 18, 2, 18, 14,
  5, 14, 14, 15, 14, 13, 14, 14, 13, 2, 2, 16, 18, 16, 12, 21,
  16, 14, 15, 14, 13, 13, 15, 14, 0, 10, 14, 12, 16, 14, 16, 14,
  16, 14, 14, 14, 14, 16, 20, 14, 16, 14, 7, 14, 7, 16, 18, 4,
  12, 12, 12, 12, 12, 8, 12, 11, 2, 6, 11, 0, 22, 11, 13, 12,
  12, 8, 11, 8, 11, 12, 16, 11, 13, 11, 5, 0, 5, 18,
]);
const LIMITS = Object.freeze({ liveGlyphTableVerified: false, outlineVerified: false,
  dataStateVerified: false, completeGeometryVerified: false, renderingVerified: false,
  completeEffectVerified: false, persistenceVerified: false, executionAuthorized: false } as const);
interface Point { readonly x: number; readonly y: number }
interface Box {
  readonly layerId: 3; readonly locked: false;
  readonly leftLow: Point; readonly leftUp: Point; readonly rightLow: Point; readonly rightUp: Point;
}
export interface CurrentPcbStringDefaultGeometry extends Readonly<typeof LIMITS> {
  readonly profile: "private.current-pcb-string-default-geometry.v1";
  readonly requestSha256: string; readonly width: number; readonly height: 12;
  readonly expectedBox: Box; readonly expectedBoxProjectionSha256: string;
}

/** Qd3854772/BFe3855724: fontSize excludes stroke, glyph endpoints round to
 * Two decimals before extrema/advance; spaces advance without adding paths.
 * The bounding builder starts at0 and extends by half the stroke. Trailing
 * Spaces therefore do NOT increase width. Preserve native operation order. */
export function planCurrentPcbStringDefaultGeometry(input: CurrentPcbStringCreateCandidate): CurrentPcbStringDefaultGeometry {
  const candidate = requireOriginalCurrentPcbStringCreate(input);
  const model = candidate.expectedModelScalars;
  const stroke = model.strokeWidth;
  const font = model.fontSize - stroke, scale = font / 32;
  let cursor = stroke / 2, maximum = 0;
  for (const character of model.value) {
    if (character === " ") { cursor += font * 0.7; }
    else {
      const metric = CURRENT_PCB_DEFAULT_GLYPH_MAX_X[(character.codePointAt(0) ?? 0) - 33];
      if (metric === undefined) { throw new Error("PCB_STRING_DEFAULT_GEOMETRY_GLYPH"); }
      const endpoint = Math.round((cursor + scale * metric) * 100 + 1e-10) / 100;
      maximum = Math.max(maximum, endpoint);
      cursor = Math.max(cursor, endpoint) + stroke + font * 0.15;
    }
  }
  const height = model.fontSize, width = maximum + stroke / 2;
  // Layer3/nonmirrored, rotation0, LEFTLOW origin: h3 returns S.ORIGIN;
  // Ae.getMatrix4 and rd.reset4@3986183 give these exact unrounded sums.
  const { x, y } = model.position;
  const expectedBox: Box = { layerId: 3, locked: false,
    leftLow: { x, y }, leftUp: { x, y: y + height },
    rightLow: { x: width + x, y }, rightUp: { x: width + x, y: height + y } };
  return freezeDeep({ profile: "private.current-pcb-string-default-geometry.v1", requestSha256: candidate.requestSha256,
    width, height, expectedBox, expectedBoxProjectionSha256: sha256Text(canonicalJson(expectedBox)), ...LIMITS });
}

/** A source-derived supplied-data rectangle comparison, not original glyph or
 * Complete model admission. Raw String decoder preserves strict numeric/field
 * Framing; no epsilon, DTO conversion or width-only comparison is accepted. */
export function compareCurrentPcbStringDefaultGeometry(candidate: CurrentPcbStringCreateCandidate,
  rawReply: unknown, primitiveId: string): Readonly<CurrentPcbStringDefaultGeometry & { suppliedBoxMatchesPrediction: true }> {
  const plan = planCurrentPcbStringDefaultGeometry(candidate), raw = decodeCurrentPcbDiagnosticRawStringsReply(rawReply);
  const model = raw.models[0];
  if (raw.managerModelCount !== 1 || model?.globalIndex !== primitiveId || model.box.kind !== "value" ||
      model.value !== candidate.expectedModelScalars.value || model.matrixChange ||
      canonicalJson(model.box.value) !== canonicalJson(plan.expectedBox)) {
    throw new Error("PCB_STRING_DEFAULT_GEOMETRY_BOX");
  }
  return freezeDeep({ ...plan, suppliedBoxMatchesPrediction: true });
}
