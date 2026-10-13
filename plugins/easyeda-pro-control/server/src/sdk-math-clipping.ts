import { z } from "zod";

export const SDK_CLIPPING_MAX_VERTICES = 16;
export const SDK_CLIPPING_MAX_POINTS = 192;
export const SDK_CLIPPING_MAX_RINGS = 32;
const integerCoordinate = z.number().int().min(-32_768).max(32_768);
const pointSchema = z.object({ x: integerCoordinate, y: integerCoordinate }).strict();
type Point = z.infer<typeof pointSchema>;
interface Edge { a: Point; b: Point; horizontal: boolean }
interface Arrangement { first: Edge[]; second: Edge[]; vertices: Point[] }
const same = (a: Point, b: Point): boolean => a.x === b.x && a.y === b.y;
const ordered = (a: Point, b: Point): boolean => a.x < b.x || a.x === b.x && a.y < b.y;
const within = (value: number, a: number, b: number): boolean => value >= Math.min(a, b) && value <= Math.max(a, b);

function openRing(ring: Point[]): Point[] {
  const first = ring[0], last = ring.at(-1);
  return first !== undefined && last !== undefined && same(first, last) ? ring.slice(0, -1) : ring;
}

function edgesOf(ring: Point[]): Edge[] {
  const points = openRing(ring);
  return points.map((point, index) => {
    const next = points[(index + 1) % points.length];
    if (next === undefined || same(point, next) || point.x !== next.x && point.y !== next.y) { throw new Error("Clipping needs nonzero orthogonal edges."); }
    return { a: ordered(point, next) ? point : next, b: ordered(point, next) ? next : point, horizontal: point.y === next.y };
  });
}

function exactCross(first: Edge, second: Edge): Point | undefined {
  if (first.horizontal === second.horizontal) { return undefined; }
  const horizontal = first.horizontal ? first : second;
  const vertical = first.horizontal ? second : first;
  const point = { x: vertical.a.x, y: horizontal.a.y };
  return within(point.x, horizontal.a.x, horizontal.b.x) && within(point.y, vertical.a.y, vertical.b.y) ? point : undefined;
}

function collinear(first: Edge, second: Edge): boolean {
  return first.horizontal === second.horizontal && (first.horizontal ? first.a.y === second.a.y : first.a.x === second.a.x);
}

function contact(first: Edge, second: Edge): boolean {
  if (first.horizontal !== second.horizontal) { return exactCross(first, second) !== undefined; }
  if (!collinear(first, second)) { return false; }
  const axis = first.horizontal ? "x" : "y";
  return first.a[axis] <= second.b[axis] && second.a[axis] <= first.b[axis];
}

function simpleRing(ring: Point[], alternating: boolean, limit: number): boolean {
  if (ring.length < 4 || ring.length > limit + 1) { return false; }
  const points = openRing(ring);
  if (points.length < 4 || points.length > limit) { return false; }
  let edges: Edge[];
  try { edges = edgesOf(points); } catch { return false; }
  for (const [index, edge] of edges.entries()) {
    const next = edges[(index + 1) % edges.length];
    if (next === undefined || alternating && next.horizontal === edge.horizontal) { return false; }
    for (let other = index + 2; other < edges.length; other += 1) {
      const candidate = edges[other];
      if ((index !== 0 || other !== edges.length - 1) && (candidate === undefined || contact(edge, candidate))) { return false; }
    }
  }
  let area = 0;
  for (const [index, point] of points.entries()) {
    const next = points[(index + 1) % points.length];
    if (next === undefined) { return false; }
    area += point.x * next.y - next.x * point.y;
  }
  return area !== 0;
}

// Qualification only: preserve Hpe's arithmetic order and endpoint preference.
// This is not a clipping implementation and never supplies the public result.
function sdkPerpendicularCross(first: Edge, second: Edge): Point | undefined {
  const sx = first.b.x - first.a.x, sy = first.b.y - first.a.y;
  const ax = second.b.x - second.a.x, ay = second.b.y - second.a.y;
  const lx = second.a.x - first.a.x, ly = second.a.y - first.a.y;
  const denominator = sx * ay - sy * ax;
  const firstPosition = (lx * ay - ly * ax) / denominator;
  if (firstPosition < 0 || firstPosition > 1) { return undefined; }
  const secondPosition = (lx * sy - ly * sx) / denominator;
  if (secondPosition < 0 || secondPosition > 1) { return undefined; }
  if (firstPosition === 0 || firstPosition === 1) { return { x: first.a.x + firstPosition * sx, y: first.a.y + firstPosition * sy }; }
  if (secondPosition === 0 || secondPosition === 1) { return { x: second.a.x + secondPosition * ax, y: second.a.y + secondPosition * ay }; }
  return { x: first.a.x + firstPosition * sx, y: first.a.y + firstPosition * sy };
}

function fragments(edge: Edge, points: Point[]): Edge[] {
  const candidates = [edge.a, edge.b, ...points];
  const result: Edge[] = [];
  for (const [index, first] of candidates.entries()) {
    for (const second of candidates.slice(index + 1)) {
      if (same(first, second)) { throw new Error("Duplicate clipping split point."); }
      result.push({ a: ordered(first, second) ? first : second, b: ordered(first, second) ? second : first, horizontal: edge.horizontal });
    }
  }
  return result;
}

function assertFragmentArithmetic(first: Edge, second: Edge): void {
  if (first.horizontal === second.horizontal) { return; }
  const expected = exactCross(first, second);
  for (const actual of [sdkPerpendicularCross(first, second), sdkPerpendicularCross(second, first)]) {
    if (expected === undefined ? actual !== undefined : actual === undefined || !same(expected, actual)) { throw new Error("Clipping intersection arithmetic is not exact for every possible fragment."); }
  }
}

function arrangement(polygon1: Point[], polygon2: Point[]): Arrangement {
  if (!simpleRing(polygon1, true, SDK_CLIPPING_MAX_VERTICES) || !simpleRing(polygon2, true, SDK_CLIPPING_MAX_VERTICES)) { throw new Error("Clipping requires simple alternating orthogonal rings with 4-16 vertices."); }
  const first = edgesOf(polygon1), second = edgesOf(polygon2);
  const firstSplits = first.map((): Point[] => []), secondSplits = second.map((): Point[] => []);
  const vertices = [...openRing(polygon1), ...openRing(polygon2)];
  for (const [i, a] of first.entries()) {
    for (const [j, b] of second.entries()) {
      if (collinear(a, b)) { throw new Error("Cross-operand collinear edge lines are unsupported, including disjoint aligned edges."); }
      const point = exactCross(a, b);
      if (point !== undefined) {
        if (same(point, a.a) || same(point, a.b) || same(point, b.a) || same(point, b.b)) { throw new Error("Clipping boundary contacts are unsupported."); }
        const aSplits = firstSplits[i], bSplits = secondSplits[j];
        if (aSplits === undefined || bSplits === undefined) { throw new Error("Clipping edge inventory changed."); }
        aSplits.push(point); bSplits.push(point); vertices.push(point);
        if (aSplits.length > 2 || bSplits.length > 2) { throw new Error("Clipping allows at most two crossings per edge."); }
      }
    }
  }
  const firstFragments = first.flatMap((edge, index) => fragments(edge, firstSplits[index] ?? []));
  const secondFragments = second.flatMap((edge, index) => fragments(edge, secondSplits[index] ?? []));
  for (const a of firstFragments) {
    for (const b of secondFragments) { assertFragmentArithmetic(a, b); }
  }
  return { first, second, vertices };
}

const inputRing = z.array(pointSchema).min(4).max(SDK_CLIPPING_MAX_VERTICES + 1);
export const sdkClippingArgumentsSchema = z.object({ polygon1: inputRing, polygon2: inputRing }).strict().superRefine((value, context) => {
  try { arrangement(value.polygon1, value.polygon2); }
  catch (error) { context.addIssue({ code: "custom", message: error instanceof Error ? error.message : "Unsupported clipping arguments." }); }
});
export type SdkClippingArguments = z.infer<typeof sdkClippingArgumentsSchema>;

function closeRing(ring: Point[]): Point[] {
  const opened = openRing(ring);
  const first = opened[0];
  if (first === undefined) { throw new Error("Empty clipping ring."); }
  return [...opened, { ...first }];
}

export function closeSdkClippingArguments(input: unknown): SdkClippingArguments {
  const parsed = sdkClippingArgumentsSchema.parse(input);
  return { polygon1: closeRing(parsed.polygon1), polygon2: closeRing(parsed.polygon2) };
}

export const SDK_CLIPPING_METHODS = ["eda.sys_Math.intersects", "eda.sys_Math.union", "eda.sys_Math.subtract", "eda.sys_Math.intersection", "eda.sys_Math.xor"] as const;
export type SdkClippingMethod = typeof SDK_CLIPPING_METHODS[number];
export function isSdkClippingMethod(method: string): method is SdkClippingMethod { return SDK_CLIPPING_METHODS.some((candidate) => candidate === method); }
export const SDK_CLIPPING_LIMITATION = "Clipping subset: one simple alternating orthogonal integer ring per operand, +/-32768 coordinates, 4-16 vertices; copied explicit closure. No input holes/groups, cross-operand collinear lines (even disjoint), boundary contacts or more than two crossings per edge. Exact all-fragment arithmetic required. Complete bounded groups/holes/empty results retained; output components may share vertices. Self-touching output rings or touching outer/hole boundaries refuse after execution without repair or truncation. Module-local clipping scratch/counter changes are not CAD mutations.";

function containsPoint(edges: Edge[], point: Point): boolean {
  let inside = false;
  for (const edge of edges) {
    if (!edge.horizontal && (edge.a.y > point.y) !== (edge.b.y > point.y) && edge.a.x > point.x) { inside = !inside; }
  }
  return inside;
}

const outputRing = z.array(pointSchema).min(5).max(SDK_CLIPPING_MAX_POINTS);
const groupSchema = z.array(z.object({ outer: outputRing, holes: z.array(outputRing).max(SDK_CLIPPING_MAX_RINGS - 1) }).strict()).max(SDK_CLIPPING_MAX_RINGS);
type Group = z.infer<typeof groupSchema>;

function resultGroups(raw: unknown, accepted: Arrangement): Group {
  const groups = groupSchema.parse(raw);
  let count = 0, rings = 0;
  for (const group of groups) {
    for (const ring of [group.outer, ...group.holes]) {
      count += ring.length; rings += 1;
      if (count > SDK_CLIPPING_MAX_POINTS || rings > SDK_CLIPPING_MAX_RINGS) { throw new Error("Clipping result exceeds its complete output budget."); }
      const first = ring[0], last = ring.at(-1);
      if (first === undefined || last === undefined || !same(first, last) || !simpleRing(ring, false, SDK_CLIPPING_MAX_POINTS - 1)) { throw new Error("Malformed clipping result ring."); }
      if (ring.some((point) => !accepted.vertices.some((candidate) => same(candidate, point)))) { throw new Error("Clipping returned a point outside the admitted arrangement."); }
    }
    const outer = edgesOf(group.outer);
    for (const hole of group.holes) {
      const point = hole[0];
      if (point === undefined || !containsPoint(outer, point) || outer.some((edge) => edgesOf(hole).some((candidate) => contact(edge, candidate)))) { throw new Error("Clipping hole is not strictly inside its outer ring."); }
    }
  }
  return groups;
}

function regionExpected(method: SdkClippingMethod, first: boolean, second: boolean): boolean {
  switch (method) {
    case "eda.sys_Math.union": { return first || second; }
    case "eda.sys_Math.subtract": { return first && !second; }
    case "eda.sys_Math.xor": { return first !== second; }
    case "eda.sys_Math.intersection":
    case "eda.sys_Math.intersects": { return first && second; }
    default: { throw new Error("Unknown clipping method."); }
  }
}

function regionCount(groups: { outer: Edge[]; holes: Edge[][] }[], point: Point): number {
  let result = 0;
  for (const group of groups) {
    const holes = group.holes.filter((hole) => containsPoint(hole, point)).length;
    if (holes > 1) { throw new Error("Clipping result holes overlap."); }
    if (containsPoint(group.outer, point) && holes === 0) { result += 1; }
  }
  return result;
}

/** Checks region membership, not a substitute result. Every boundary coordinate
 * belongs to the finite arrangement, so half-integer cell samples cover all
 * positive-area regions and allow XOR components to share vertices.
 */
export function validateSdkClippingResult(input: unknown, method: SdkClippingMethod, raw: unknown): boolean | Group {
  const args = sdkClippingArgumentsSchema.parse(input);
  const accepted = arrangement(args.polygon1, args.polygon2);
  const groups = method === "eda.sys_Math.intersects" ? [] : resultGroups(raw, accepted);
  const result = groups.map((group) => ({ outer: edgesOf(group.outer), holes: group.holes.map(edgesOf) }));
  const xs = [...new Set(accepted.vertices.map((point) => point.x))].toSorted((a, b) => a - b);
  const ys = [...new Set(accepted.vertices.map((point) => point.y))].toSorted((a, b) => a - b);
  let overlaps = false;
  for (const [xIndex, x] of xs.slice(0, -1).entries()) {
    const nextX = xs[xIndex + 1]; if (nextX === undefined) { throw new Error("Missing clipping cell boundary."); }
    for (const [yIndex, y] of ys.slice(0, -1).entries()) {
      const nextY = ys[yIndex + 1]; if (nextY === undefined) { throw new Error("Missing clipping cell boundary."); }
      const point = { x: (x + nextX) / 2, y: (y + nextY) / 2 };
      const first = containsPoint(accepted.first, point), second = containsPoint(accepted.second, point);
      overlaps ||= first && second;
      if (method !== "eda.sys_Math.intersects") {
        const expected = regionExpected(method, first, second);
        const actual = regionCount(result, point);
        if (actual !== Number(expected)) { throw new Error("Clipping result does not match the complete bounded input regions."); }
      }
    }
  }
  if (method === "eda.sys_Math.intersects") {
    if (typeof raw !== "boolean" || raw !== overlaps) { throw new Error("Clipping intersection predicate contradicts the admitted regions."); }
    return raw;
  }
  return groups;
}

/** Fixed projection included only in group-returning SDK programs. */
export const SDK_CLIPPING_GROUP_PROJECTION = `const clipArray=(value,limit)=>{if(!Array.isArray(value)||value.length>limit||Reflect.ownKeys(value).length!==value.length+1)fail();return Array.from({length:value.length},(_,index)=>{const item=Object.getOwnPropertyDescriptor(value,String(index));if(!item||!Object.hasOwn(item,'value')||!item.enumerable)fail();return item.value;});};
const clipFields=value=>{if(!value||typeof value!=='object'||Array.isArray(value)||Reflect.ownKeys(value).length!==2)fail();const outer=Object.getOwnPropertyDescriptor(value,'outer'),holes=Object.getOwnPropertyDescriptor(value,'holes');if(!outer||!holes||!Object.hasOwn(outer,'value')||!Object.hasOwn(holes,'value')||!outer.enumerable||!holes.enumerable)fail();return{outer:outer.value,holes:holes.value};};
const clipGroups=value=>{let points=0,rings=0;const ring=raw=>{const entries=clipArray(raw,${SDK_CLIPPING_MAX_POINTS});points+=entries.length;rings++;if(entries.length<5||points>${SDK_CLIPPING_MAX_POINTS}||rings>${SDK_CLIPPING_MAX_RINGS})fail();const projected=entries.map(value=>{const p=point(value);if(!Number.isInteger(p.x)||!Number.isInteger(p.y)||Math.abs(p.x)>32768||Math.abs(p.y)>32768)fail();return p;});if(projected[0].x!==projected.at(-1).x||projected[0].y!==projected.at(-1).y)fail();return projected;};return clipArray(value,${SDK_CLIPPING_MAX_RINGS}).map(raw=>{const group=clipFields(raw);return{outer:ring(group.outer),holes:clipArray(group.holes,${SDK_CLIPPING_MAX_RINGS - 1}).map(ring)};});};`;
