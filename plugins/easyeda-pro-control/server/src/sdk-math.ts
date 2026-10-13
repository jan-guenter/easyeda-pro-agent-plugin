import { z } from "zod";
import { EXACT_READ_ENVELOPE_SCHEMA } from "./exact-readers.ts";

export const SDK_MATH_API_VERSION = "0.3.50.ab46409c";
export const SDK_MATH_API_SHA256 = "021d155baafbcdc7b558da12f0834a8ee473aa37e276c6ea679936f952080c76";
export const SDK_MATH_MAX_VERTICES = 128;
export const SDK_MATH_MAX_BYTES = 32_768;
const coordinate = z.number().min(-1_000_000).max(1_000_000);
const pointSchema = z.object({ x: coordinate, y: coordinate }).strict();
type Point = z.infer<typeof pointSchema>;
interface ExactPoint { x: bigint; y: bigint }

/** Convert finite IEEE-754 coordinates to integers sharing the exact 2^-1074
 * scale. Shape admission must not round nearly collinear edges into equality.
 */
function exactCoordinate(value: number): bigint {
  const view = new DataView(new ArrayBuffer(8));
  view.setFloat64(0, value);
  const bits = view.getBigUint64(0);
  /* oxlint-disable eslint/no-bitwise -- Decode the exact IEEE-754 sign/exponent/mantissa; floating arithmetic would weaken shape admission. */
  const exponent = Number((bits >> 52n) & 2047n);
  const mantissa = (bits & ((1n << 52n) - 1n)) | (exponent === 0 ? 0n : 1n << 52n);
  const magnitude = mantissa << BigInt(Math.max(0, exponent - 1));
  return bits >> 63n === 0n ? magnitude : -magnitude;
  /* oxlint-enable eslint/no-bitwise */
}

function orientation(a: ExactPoint, b: ExactPoint, c: ExactPoint): bigint {
  return (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
}

function between(value: bigint, a: bigint, b: bigint): boolean {
  return (value >= a && value <= b) || (value >= b && value <= a);
}

function onSegment(a: ExactPoint, b: ExactPoint, point: ExactPoint): boolean {
  return between(point.x, a.x, b.x) && between(point.y, a.y, b.y);
}

function intersects(a: ExactPoint, b: ExactPoint, c: ExactPoint, d: ExactPoint): boolean {
  const first = orientation(a, b, c), second = orientation(a, b, d);
  const third = orientation(c, d, a);
  const fourth = orientation(c, d, b);
  if (first === 0n && onSegment(a, b, c) || second === 0n && onSegment(a, b, d) ||
      third === 0n && onSegment(c, d, a) || fourth === 0n && onSegment(c, d, b)) { return true; }
  return first !== 0n && second !== 0n && third !== 0n && fourth !== 0n &&
    (first > 0n) !== (second > 0n) && (third > 0n) !== (fourth > 0n);
}

function ringPoints(points: Point[]): ExactPoint[] {
  const first = points[0], last = points.at(-1);
  const closed = first !== undefined && last !== undefined && first.x === last.x && first.y === last.y;
  return (closed ? points.slice(0, -1) : points).map((point) => ({ x: exactCoordinate(point.x), y: exactCoordinate(point.y) }));
}

function simpleRing(points: Point[], convex = false): boolean {
  // Zod may run a refinement after reporting an array-size issue.
  if (points.length < 3 || points.length > SDK_MATH_MAX_VERTICES + 1) { return false; }
  const vertices = ringPoints(points);
  const count = vertices.length;
  if (count < 3 || count > SDK_MATH_MAX_VERTICES) { return false; }
  let area = 0n, turn = 0n;
  for (const [index, a] of vertices.entries()) {
    const b = vertices[(index + 1) % count], c = vertices[(index + 2) % count];
    if (b === undefined || c === undefined || a.x === b.x && a.y === b.y) { return false; }
    area += a.x * b.y - b.x * a.y;
    const cross = orientation(a, b, c);
    if (convex && (cross === 0n || turn !== 0n && (turn > 0n) !== (cross > 0n))) { return false; }
    if (cross !== 0n) { turn = cross; }
    // Adjacent edges may be collinear, but cannot double back over each other.
    if (cross === 0n && (a.x - b.x) * (c.x - b.x) + (a.y - b.y) * (c.y - b.y) > 0n) { return false; }
    for (let other = index + 2; other < count; other += 1) {
      if (index !== 0 || other !== count - 1) {
        const d = vertices[other], e = vertices[(other + 1) % count];
        if (d === undefined || e === undefined || intersects(a, b, d, e)) { return false; }
      }
    }
  }
  return area !== 0n;
}

const ringSchema = z.array(pointSchema).min(3).max(SDK_MATH_MAX_VERTICES + 1).refine(
  (points) => simpleRing(points), "One simple nonzero-area ring with at most 128 vertices is required; only a final closing duplicate is allowed.");
const convexRingSchema = ringSchema.refine((points) => simpleRing(points, true), "Containment requires a strictly convex outer ring.");
const bboxSchema = z.object({ minX: coordinate, minY: coordinate, maxX: coordinate, maxY: coordinate }).strict()
  .refine((box) => box.minX <= box.maxX && box.minY <= box.maxY, "BBox bounds must be ordered.");
const polygonArguments = z.object({ polygon: ringSchema }).strict();
const pointArguments = z.object({ polygon: ringSchema, point: pointSchema }).strict();
const centers = { centerX: coordinate.optional(), centerY: coordinate.optional() };
const pairedCenters = (value: { centerX?: number | undefined; centerY?: number | undefined }): boolean => (value.centerX === undefined) === (value.centerY === undefined);
const rotateArguments = z.object({ polygon: ringSchema, angle: z.number().min(-360_000).max(360_000), ...centers }).strict().refine(pairedCenters, "Supply both center coordinates or neither.");
const scaleArguments = z.object({ polygon: ringSchema, scaleX: z.number().min(-1000).max(1000), scaleY: z.number().min(-1000).max(1000).optional(), ...centers }).strict().refine(pairedCenters, "Supply both center coordinates or neither.");

export const sdkMathRequestSchema = z.discriminatedUnion("method", [
  z.object({ method: z.literal("eda.sys_Math.bboxIntersects"), arguments: z.object({ bbox1: bboxSchema, bbox2: bboxSchema }).strict() }).strict(),
  z.object({ method: z.literal("eda.sys_Math.calculateArea"), arguments: polygonArguments }).strict(),
  z.object({ method: z.literal("eda.sys_Math.calculatePerimeter"), arguments: polygonArguments }).strict(),
  z.object({ method: z.literal("eda.sys_Math.contains"), arguments: z.object({ polygon1: convexRingSchema, polygon2: ringSchema }).strict() }).strict(),
  z.object({ method: z.literal("eda.sys_Math.containsPoint"), arguments: pointArguments }).strict(),
  z.object({ method: z.literal("eda.sys_Math.distanceToPoint"), arguments: pointArguments }).strict(),
  z.object({ method: z.literal("eda.sys_Math.getBBox"), arguments: polygonArguments }).strict(),
  z.object({ method: z.literal("eda.sys_Math.getCentroid"), arguments: polygonArguments }).strict(),
  z.object({ method: z.literal("eda.sys_Math.translate"), arguments: z.object({ polygon: ringSchema, dx: coordinate, dy: coordinate }).strict() }).strict(),
  z.object({ method: z.literal("eda.sys_Math.rotate"), arguments: rotateArguments }).strict(),
  z.object({ method: z.literal("eda.sys_Math.scale"), arguments: scaleArguments }).strict(),
]);
export type SdkMathRequest = z.infer<typeof sdkMathRequestSchema>;
type MathMethod = SdkMathRequest["method"];
type ResultKind = "boolean" | "number" | "point" | "bbox" | "points";

const definitions: Record<MathMethod, { parameters: string[]; result: ResultKind; limitation: string }> = {
  "eda.sys_Math.bboxIntersects": { parameters: ["bbox1", "bbox2"], result: "boolean", limitation: "Touching bbox edges count as intersecting; this is not polygon intersection." },
  "eda.sys_Math.calculateArea": { parameters: ["polygon"], result: "number", limitation: "Absolute SDK shoelace area for one simple ring, in squared input-coordinate units." },
  "eda.sys_Math.calculatePerimeter": { parameters: ["polygon"], result: "number", limitation: "SDK perimeter includes the last-to-first edge even for an open point array." },
  "eda.sys_Math.contains": { parameters: ["polygon1", "polygon2"], result: "boolean", limitation: "SDK tests only inner vertices. The outer ring must be strictly convex; boundary classification remains the SDK ray-casting result, not a tolerance-aware guarantee." },
  "eda.sys_Math.containsPoint": { parameters: ["polygon", "point"], result: "boolean", limitation: "SDK ray casting classifies boundary points inconsistently; do not use this result as electrical connectivity or manufacturing clearance proof." },
  "eda.sys_Math.distanceToPoint": { parameters: ["polygon", "point"], result: "number", limitation: "Returns zero for both interior and boundary points. Zero is not proof of boundary membership." },
  "eda.sys_Math.getBBox": { parameters: ["polygon"], result: "bbox", limitation: "Extrema of the supplied point array only; no native primitive or curve bounds are read." },
  "eda.sys_Math.getCentroid": { parameters: ["polygon"], result: "point", limitation: "SDK signed-area centroid for one ring; nonfinite or out-of-bounds results refuse instead of becoming JSON null." },
  "eda.sys_Math.translate": { parameters: ["polygon", "dx", "dy"], result: "points", limitation: "Returns a new point array, preserving supplied point order and closure representation; does not move CAD objects." },
  "eda.sys_Math.rotate": { parameters: ["polygon", "angle", "centerX", "centerY"], result: "points", limitation: "Degrees, positive counterclockwise. Supply both center coordinates or neither; neither uses the SDK centroid." },
  "eda.sys_Math.scale": { parameters: ["polygon", "scaleX", "scaleY", "centerX", "centerY"], result: "points", limitation: "Omitted scaleY uses scaleX. Zero/negative factors are allowed and may collapse/reflect output. Both center coordinates or neither are required." },
};

const commonLimitations = [
  "API 0.3.50 implementation only, separately hash-admitted; absent from the old reviewed 0.2.53 runtime. Source implementation and offline tests are not connected validation.",
  "Strict finite JSON point arrays only, coordinates within +/-1e6, 3-128 distinct ring vertices, optional final closing duplicate. No holes, groups, curves, native handles, callbacks or arbitrary SDK paths.",
  "Calculations use supplied coordinate units without unit conversion. No document, project, viewport, selection, shared setting, file, network, Save or CAD mutation is involved.",
  "JSON Schema omits geometric and paired-center refinements; use the exact argument validator. SDK floating-point results are observations, not exact geometric, electrical or manufacturing guarantees.",
] as const;

export function parseSdkMathRequest(input: unknown): SdkMathRequest { return sdkMathRequestSchema.parse(input); }

export interface SdkMathDescriptor {
  path: MathMethod;
  method: MathMethod;
  inputSchema: Record<string, unknown>;
  parameters: string[];
  resultKind: ResultKind;
  limitations: string[];
  invocationEnabledByDiscovery: false;
  provenance: { version: string; apiSha256: string; implementationKind: "public-method-bounded-subset"; liveValidation: "not-recorded" };
}

export function sdkMathDescriptors(): SdkMathDescriptor[] {
  return sdkMathRequestSchema.options.map((schema) => {
    const method = schema.shape.method.value;
    const definition = definitions[method];
    return { path: method, method, inputSchema: z.toJSONSchema(schema), parameters: [...definition.parameters], resultKind: definition.result,
      limitations: [...commonLimitations, definition.limitation], invocationEnabledByDiscovery: false,
      provenance: { version: SDK_MATH_API_VERSION, apiSha256: SDK_MATH_API_SHA256, implementationKind: "public-method-bounded-subset", liveValidation: "not-recorded" } };
  });
}

export const sdkMathCatalogQuerySchema = z.object({ method: z.enum(sdkMathRequestSchema.options.map((schema) => schema.shape.method.value)).optional(), includeSchemas: z.boolean().default(false) }).strict();

export function querySdkMathCalculations(input: unknown = {}): Record<string, unknown> {
  const query = sdkMathCatalogQuerySchema.parse(input);
  const entries = sdkMathDescriptors().filter((entry) => query.method === undefined || entry.method === query.method)
    .map(({ inputSchema, ...entry }) => query.includeSchemas ? Object.assign(entry, { inputSchema }) : entry);
  return { offline: true, invocationEnabledByDiscovery: false, total: entries.length, entries };
}

export function validateSdkMathArguments(input: unknown): Record<string, unknown> {
  const result = sdkMathRequestSchema.safeParse(input);
  if (result.success) { return { valid: true, request: result.data, executionAuthorized: false }; }
  return { valid: false, executionAuthorized: false, issues: result.error.issues.slice(0, 16).map((issue) => ({ path: issue.path.map(String), message: issue.message.slice(0, 512) })) };
}

/** No app bootstrap or dynamic SDK path. The runtime owner must separately
 * admit the current public API bytes before executing this fixed program.
 */
export function buildSdkMathProgram(input: unknown): string {
  const request = parseSdkMathRequest(input);
  const definition = definitions[request.method];
  const method = request.method.slice("eda.sys_Math.".length);
  const argumentsCode = definition.parameters.map((parameter) => `args.${parameter}`).join(",");
  return `try {
const fail=()=>{throw new Error('SDK_MATH_INVALID_RESULT');};
const args=${JSON.stringify(request.arguments)};
const freeze=value=>{if(value&&typeof value==='object'){for(const child of Object.values(value))freeze(child);Object.freeze(value);}};freeze(args);
const owner=eda.sys_Math,method=owner?.${method};if(!owner||typeof method!=='function')fail();
const scalar=value=>{if(typeof value!=='number'||!Number.isFinite(value)||Math.abs(value)>1e15)fail();return value;};
const object=(value,keys)=>{if(!value||typeof value!=='object'||Array.isArray(value)||Reflect.ownKeys(value).length!==keys.length)fail();const out={};for(const key of keys){const item=Object.getOwnPropertyDescriptor(value,key);if(!item||!Object.hasOwn(item,'value')||!item.enumerable)fail();out[key]=scalar(item.value);}return out;};
const point=value=>{const result=object(value,['x','y']);if(Math.abs(result.x)>1e12||Math.abs(result.y)>1e12)fail();return result;};
const project=value=>{
 const kind=${JSON.stringify(definition.result)};
 if(kind==='boolean'){if(typeof value!=='boolean')fail();return value;}
 if(kind==='number'){const result=scalar(value);if(result<0)fail();return result;}
 if(kind==='point')return point(value);
 if(kind==='bbox'){const result=object(value,['minX','minY','maxX','maxY']);if(result.minX>result.maxX||result.minY>result.maxY)fail();return result;}
 if(!Array.isArray(value)||value.length!==args.polygon.length||Reflect.ownKeys(value).length!==value.length+1)fail();
 return Array.from({length:value.length},(_,index)=>{const item=Object.getOwnPropertyDescriptor(value,String(index));if(!item||!Object.hasOwn(item,'value')||!item.enumerable)fail();return point(item.value);});
};
const read=()=>project(method.call(owner,${argumentsCode}));
const first=read(),second=read();
if(eda.sys_Math!==owner||owner.${method}!==method||JSON.stringify(first)!==JSON.stringify(second))fail();
const json=JSON.stringify({ok:true,kind:'sdk-math',method:${JSON.stringify(request.method)},value:first});
const utf8Bytes=new TextEncoder().encode(json).byteLength;
const envelope={schema:${JSON.stringify(EXACT_READ_ENVELOPE_SCHEMA)},utf8Bytes,json};
if(utf8Bytes>${SDK_MATH_MAX_BYTES}||new TextEncoder().encode(JSON.stringify(envelope)).byteLength>${SDK_MATH_MAX_BYTES})fail();
return envelope;
}catch{throw new Error('SDK_MATH_CALCULATION_FAILED');}`;
}

const resultNumber = z.number().min(-1_000_000_000_000).max(1_000_000_000_000);
const resultPoint = z.object({ x: resultNumber, y: resultNumber }).strict();
const resultBbox = z.object({ minX: resultNumber, minY: resultNumber, maxX: resultNumber, maxY: resultNumber }).strict()
  .refine((box) => box.minX <= box.maxX && box.minY <= box.maxY);
const payloadSchema = z.object({ ok: z.literal(true), kind: z.literal("sdk-math"), method: z.string(), value: z.unknown() }).strict();

export function validateSdkMathResult(input: unknown, raw: unknown): Record<string, unknown> {
  const request = parseSdkMathRequest(input);
  const payload = payloadSchema.parse(raw);
  const definition = definitions[request.method];
  if (payload.method !== request.method) { throw new Error("SDK math result belongs to a different method."); }
  let value: unknown;
  switch (definition.result) {
    case "boolean": { value = z.boolean().parse(payload.value); break; }
    case "number": { value = z.number().min(0).max(1_000_000_000_000_000).parse(payload.value); break; }
    case "point": { value = resultPoint.parse(payload.value); break; }
    case "bbox": { value = resultBbox.parse(payload.value); break; }
    case "points": {
      const points = z.array(resultPoint).max(SDK_MATH_MAX_VERTICES + 1).parse(payload.value);
      if (!("polygon" in request.arguments) || points.length !== request.arguments.polygon.length) { throw new Error("SDK math transform changed the point count."); }
      value = points; break;
    }
    default: { throw new Error("Unsupported SDK math result."); }
  }
  return { ...payload, value, authority: "supplied-coordinate-calculation-only;not-cad-connectivity-or-manufacturing-proof",
    apiVersion: SDK_MATH_API_VERSION, apiSha256: SDK_MATH_API_SHA256, limitations: [...commonLimitations, definition.limitation] };
}
