/** Original parent-renderer viewport image data. The retained visual owner
 * supplies CDP/session custody; this decoder grants no native or CAD authority.
 * PNG structure/filter rules: https://www.w3.org/TR/png-3/ . Ancillary payloads
 * remain opaque and byte-exact; color and metadata semantics are not evaluated. */
import { createHash } from "node:crypto";
import { join } from "node:path";
import { types } from "node:util";
import { crc32, inflateSync } from "node:zlib";
import { z } from "zod";
import { controlDataDirectory, ensureManagedDirectory, publishManagedAttachmentExclusive } from "./artifacts.ts";
import type { PublishedManagedAttachment } from "./artifacts.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";
import { currentPcb209VisualIdSchema } from "./current-pcb-209-visual-validation.ts";
import { currentDisposableOpenSealedTargetSchema } from "./current-disposable-open.ts";
import type { CurrentDisposableOpenSealedTarget } from "./current-disposable-open.ts";

export const CURRENT_RENDERER_CAPTURE_LIMITS = Object.freeze({ maximumDimension: 4096, maximumPixels: 4_194_304,
  maximumPngBytes: 262_144, maximumBase64Units: 349_528, maximumReplyBytes: 360_000, maximumResultBytes: 16_384 });
const LIMITS = CURRENT_RENDERER_CAPTURE_LIMITS;
const digest = z.string().regex(/^[a-f0-9]{64}(?![\s\S])/u);
const session = z.string().regex(/^[A-Za-z\d_.:-]{1,128}(?![\s\S])/u);
const rawSchema = z.object({ schema: z.literal("easyeda-pro-control.renderer-viewport-png.v1"), sessionId: session,
  pngBase64: z.string().min(4).max(LIMITS.maximumBase64Units), screenshotReplyReceived: z.literal(true), renderCompletionVerified: z.literal(false) }).strict();
const observationSchema = rawSchema.omit({ pngBase64: true }).extend({ width: z.number().int().positive().max(LIMITS.maximumDimension),
  height: z.number().int().positive().max(LIMITS.maximumDimension), pngBytes: z.number().int().positive().max(LIMITS.maximumPngBytes),
  pngSha256: digest, allRgbZero: z.boolean(), method: z.literal("cdp-page-capture-screenshot") }).strict();
export type CurrentRendererCaptureObservation = z.infer<typeof observationSchema>;
export interface CurrentRendererCapture { readonly observation: Readonly<CurrentRendererCaptureObservation>; readonly png: Buffer }
const identity = z.object({ device: z.string().regex(/^[0-9]{1,32}(?![\s\S])/u), inode: z.string().regex(/^[0-9]{1,32}(?![\s\S])/u) }).strict();
const target = z.object({ projectUuid: z.string().regex(/^[a-f0-9]{64}(?![\s\S])/u), branchUuid: z.string().regex(/^[a-f0-9]{32}(?![\s\S])/u),
  documentUuid: z.string().regex(/^(?:[a-f0-9]{16}|[a-f0-9]{32})(?![\s\S])/u), tabId: z.string().max(97) }).strict();
export const currentRendererCaptureResultSchema = observationSchema.extend({ schema: z.literal("easyeda-pro-control.renderer-capture-result.v1"), target,
  image: z.object({ path: z.string().max(4096), bytes: z.number().int().positive().max(LIMITS.maximumPngBytes), sha256: digest,
    identity, kind: z.literal("renderer-viewport-png"), mtimeMs: z.number() }).strict(),
  mimeType: z.literal("image/png"), imageScope: z.literal("original-parent-renderer-viewport"), canvasOnly: z.literal(false),
  pixelState: z.enum(["all-rgb-zero", "rgb-nonzero"]), pixelSummaryScope: z.literal("decoded-rgb-samples"),
  incompletePixelsPossible: z.literal(true), stalePixelsPossible: z.literal(true), pixelStabilityVerified: z.literal(false),
  colorAccuracyVerified: z.literal(false), alphaInterpretationVerified: z.literal(false), metadataSemanticsVerified: z.literal(false),
  completeBoardVerified: z.literal(false), cadAuthority: z.literal(false), persistenceVerified: z.literal(false), executionAuthorized: z.literal(false),
}).strict().refine(value => value.width * value.height <= LIMITS.maximumPixels && value.image.bytes === value.pngBytes &&
  value.image.sha256 === value.pngSha256 && value.pixelState === (value.allRgbZero ? "all-rgb-zero" : "rgb-nonzero"), "Renderer artifact or raw pixel summary differs.");

function refuse(reason: string): never { throw new Error(`PCB_RENDERER_CAPTURE_${reason}`); }

/** Copy bounded own data before schema reads. No proxy, accessor, exotic
 * prototype or oversized packet can trigger user code during decoding. */
function inert(input: unknown, depth = 0, budget?: { textBytes: number; nodes: number }): unknown {
  const available = budget ?? { textBytes: LIMITS.maximumReplyBytes, nodes: 256 };
  available.nodes -= 1; if (available.nodes < 0) { refuse("DATA_BOUND"); }
  if (typeof input === "string") {
    available.textBytes -= Buffer.byteLength(input);
    if (input.length > LIMITS.maximumBase64Units || !input.isWellFormed() || available.textBytes < 0) { refuse("TEXT_BOUND"); } return input;
  }
  if (input === null || typeof input === "boolean") { return input; }
  if (typeof input === "number") { if (!Number.isFinite(input) || Object.is(input, -0)) { refuse("NUMBER"); } return input; }
  if (typeof input !== "object" || types.isProxy(input) || depth > 3 || Array.isArray(input)) { refuse("DATA_ONLY"); }
  const keys = Reflect.ownKeys(input); const proto: unknown = Object.getPrototypeOf(input);
  if (proto !== Object.prototype && proto !== null || keys.length > 32) { refuse("OBJECT"); }
  const output: Record<string, unknown> = {};
  for (const key of keys) {
    if (typeof key !== "string" || key.length > 64) { refuse("KEY"); }
    const descriptor = Object.getOwnPropertyDescriptor(input, key);
    if (descriptor === undefined || !Object.hasOwn(descriptor, "value") || descriptor.enumerable !== true) { refuse("DESCRIPTOR"); }
    Object.defineProperty(output, key, { value: inert(descriptor.value, depth + 1, available), enumerable: true });
  }
  return Object.freeze(output);
}

interface Chunk { readonly kind: string; readonly data: Buffer; readonly end: number; }
interface PngHeader { readonly width: number; readonly height: number; readonly bpp: 3 | 4; }
interface ChunkState { readonly seen: Set<string>; paletteEntries: number | null; idatStarted: boolean; idatEnded: boolean; }
const beforePalette = new Set(["cHRM", "cICP", "gAMA", "iCCP", "mDCV", "cLLI", "sBIT", "sRGB"]);
const afterPalette = new Set(["bKGD", "hIST", "tRNS"]);
const beforeData = new Set([...beforePalette, ...afterPalette, "eXIf", "pHYs", "sPLT"]);
const uniqueAncillary = new Set([...beforeData, "tIME"]); uniqueAncillary.delete("sPLT");

/** Verify full chunk extents, ASCII type/reserved bits and CRC before examining
 * a payload. Each iteration advances at least12 bytes within the256KiB file. */
function chunk(bytes: Buffer, offset: number): Chunk {
  if (offset + 12 > bytes.length) { refuse("PNG_EXTENT"); }
  const length = bytes.readUInt32BE(offset);
  const end = offset + 12 + length;
  if (length > 2_147_483_647 || end > bytes.length) { refuse("PNG_EXTENT"); }
  const type = bytes.subarray(offset + 4, offset + 8);
  const reserved = type[2];
  if (type.some(value => !(value >= 65 && value <= 90 || value >= 97 && value <= 122)) || reserved === undefined || reserved < 65 || reserved > 90 ||
    crc32(bytes.subarray(offset + 4, end - 4)) !== bytes.readUInt32BE(end - 4)) { refuse("PNG_CHUNK"); }
  return { kind: type.toString("latin1"), data: bytes.subarray(offset + 8, end - 4), end };
}

/** Admit only noninterlaced RGB/RGBA8 with the standard compression/filter
 * methods. Dimensions and total decoded capacity are checked before inflate. */
function header(value: Chunk): PngHeader {
  if (value.kind !== "IHDR" || value.data.length !== 13) { refuse("PNG_HEADER"); }
  const height = value.data.readUInt32BE(4), width = value.data.readUInt32BE(0);
  if (width < 1 || height < 1 || width > LIMITS.maximumDimension || height > LIMITS.maximumDimension || width * height > LIMITS.maximumPixels ||
    value.data[8] !== 8 || value.data[9] !== 2 && value.data[9] !== 6 || value.data[10] !== 0 || value.data[11] !== 0 || value.data[12] !== 0) { refuse("PNG_ENCODING"); }
  return { width, height, bpp: value.data[9] === 2 ? 3 : 4 };
}

/** Preserve ancillary payload bytes without interpreting text, profiles or
 * transparency. Check standard ordering/multiplicity; unknown ancillary chunks
 * retain only their structural/CRC validation. Animation is outside this route. */
function ancillary(value: Chunk, state: ChunkState, image: PngHeader): void {
  const name = value.kind;
  if (["acTL", "fcTL", "fdAT"].includes(name)) { refuse("PNG_ANIMATION"); }
  if (beforeData.has(name) && state.idatStarted || beforePalette.has(name) && state.paletteEntries !== null ||
    uniqueAncillary.has(name) && state.seen.has(name) || name === "hIST" && state.paletteEntries === null || name === "tRNS" && image.bpp === 4) { refuse("PNG_ANCILLARY_ORDER"); }
  state.seen.add(name);
}

/** Standard Paeth tie order is left, then up, then upper-left. */
function paeth(left: number, up: number, upperLeft: number): number {
  const predicted = left + up - upperLeft;
  const a = Math.abs(predicted - left), b = Math.abs(predicted - up), c = Math.abs(predicted - upperLeft);
  if (a <= b && a <= c) { return left; } return b <= c ? up : upperLeft;
}

/** Decode every scanline with two bounded row buffers. Alpha participates in
 * filtering but not the raw RGB-zero summary; no color/alpha display model is
 * inferred from these samples or from opaque ancillary metadata. */
function pixels(compressed: Buffer, image: PngHeader): boolean {
  const rowBytes = image.width * image.bpp;
  const expected = (rowBytes + 1) * image.height;
  // oxlint-disable-next-line node/no-sync -- One bounded screenshot is at most256KiB compressed and16.8MiB decoded; no application call occurs here.
  const inflated: unknown = inflateSync(compressed, { info: true, maxOutputLength: expected });
  const decoded = z.object({ buffer: z.instanceof(Buffer), engine: z.object({ bytesWritten: z.number().int().nonnegative() }) }).parse(inflated);
  if (decoded.buffer.length !== expected || decoded.engine.bytesWritten !== compressed.length) { refuse("PNG_DECODED_LENGTH"); }
  let allZero = true, current = Buffer.alloc(rowBytes), previous = Buffer.alloc(rowBytes);
  for (let row = 0; row < image.height; row += 1) {
    const first = row * (rowBytes + 1);
    const filter = decoded.buffer[first];
    if (filter === undefined || filter > 4) { refuse("PNG_FILTER"); }
    for (let index = 0; index < rowBytes; index += 1) {
      const encoded = decoded.buffer[first + 1 + index]; if (encoded === undefined) { refuse("PNG_FILTER_DATA"); }
      const left = index < image.bpp ? 0 : current[index - image.bpp] ?? 0, up = previous[index] ?? 0, upperLeft = index < image.bpp ? 0 : previous[index - image.bpp] ?? 0;
      let predictor = 0;
      if (filter === 1) { predictor = left; }
      else if (filter === 2) { predictor = up; }
      else if (filter === 3) { predictor = Math.floor((left + up) / 2); }
      else if (filter === 4) { predictor = paeth(left, up, upperLeft); }
      const value = (encoded + predictor) % 256; current[index] = value;
      if (index % image.bpp < 3 && value !== 0) { allZero = false; }
    }
    const reusable = previous; previous = current; current = reusable;
  }
  return allZero;
}

/** Accept complete static PNG containers only. Contiguous IDAT chunks form one
 * consumed zlib stream. Original bytes, including ancillary chunks, are retained. */
function pngPixels(bytes: Buffer): Readonly<{ width: number; height: number; allRgbZero: boolean }> {
  if (bytes.length < 57 || bytes.length > LIMITS.maximumPngBytes || !bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) { refuse("PNG_SIGNATURE"); }
  const first = chunk(bytes, 8), image = header(first), parts: Buffer[] = [];
  const state: ChunkState = { seen: new Set(), paletteEntries: null, idatStarted: false, idatEnded: false };
  let ended = false, offset = first.end;
  while (offset < bytes.length) {
    const value = chunk(bytes, offset); offset = value.end;
    if (value.kind !== "IDAT" && state.idatStarted) { state.idatEnded = true; }
    if (value.kind === "IEND") { if (value.data.length > 0 || !state.idatStarted) { refuse("PNG_END"); } ended = true; break; }
    if (value.kind === "IDAT") {
      if (state.idatEnded) { refuse("PNG_IDAT_ORDER"); } state.idatStarted = true; parts.push(value.data);
    } else if (value.kind === "PLTE") {
      if (state.paletteEntries !== null || state.idatStarted || value.data.length < 3 || value.data.length > 768 || value.data.length % 3 !== 0 ||
        [...afterPalette].some(name => state.seen.has(name))) { refuse("PNG_PALETTE"); }
      state.paletteEntries = value.data.length / 3;
    } else if (/^[A-Z]/u.test(value.kind)) { refuse("PNG_CRITICAL_CHUNK"); }
    else { ancillary(value, state, image); }
  }
  if (!ended || offset !== bytes.length) { refuse("PNG_TRAILING"); }
  const compressed = Buffer.concat(parts); if (compressed.length < 6) { refuse("PNG_IDAT"); }
  return { width: image.width, height: image.height, allRgbZero: pixels(compressed, image) };
}

/** Derive dimensions, digest and raw RGB-zero status from the complete bounded
 * image. The wrapper records receipt; original-session custody remains the
 * retained owner's job and cannot be recreated by this packet. */
export function decodeCurrentRendererCapture(input: unknown): CurrentRendererCapture {
  const safe = inert(input);
  if (Buffer.byteLength(JSON.stringify(safe)) > LIMITS.maximumReplyBytes) { refuse("REPLY_BOUND"); }
  const value = rawSchema.parse(safe);
  if (value.pngBase64.length % 4 !== 0 || !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/u.test(value.pngBase64)) { refuse("BASE64"); }
  const png = Buffer.from(value.pngBase64, "base64"); if (png.toString("base64") !== value.pngBase64) { refuse("BASE64"); }
  const summary = pngPixels(png), { pngBase64: _encoded, ...raw } = value;
  const pngSha256 = createHash("sha256").update(png).digest("hex");
  const observation = observationSchema.parse({ ...raw, ...summary, pngBytes: png.length, pngSha256, method: "cdp-page-capture-screenshot" });
  return Object.freeze({ png, observation: freezeDeep(observation) });
}

/** Deterministic, separate artifact namespace binds the image candidate to one
 * visual operation and original generation before any publication await. */
export function currentRendererCaptureArtifactPath(operationId: string, bindingSha256: string, pngSha256: string): string {
  currentPcb209VisualIdSchema.parse(operationId); digest.parse(bindingSha256); digest.parse(pngSha256);
  return join(controlDataDirectory(), "artifacts", "renderer-viewport-captures", `${operationId}-${bindingSha256}-${pngSha256}.png`);
}

/** Publish an exclusive managed image with original-owner checks around every
 * publication phase. A failed later reproof grants no native capture retry. */
export async function publishCurrentRendererCapture(input: unknown, operationId: string, bindingSha256: string,
  assertOriginal: () => Promise<void>): Promise<Readonly<{ observation: Readonly<CurrentRendererCaptureObservation>; image: PublishedManagedAttachment }>> {
  const capture = decodeCurrentRendererCapture(input), destination = currentRendererCaptureArtifactPath(operationId, bindingSha256, capture.observation.pngSha256);
  await assertOriginal(); await ensureManagedDirectory(join(controlDataDirectory(), "artifacts", "renderer-viewport-captures")); await assertOriginal();
  const image = await publishManagedAttachmentExclusive(destination, "Original EasyEDA parent-renderer viewport PNG", capture.png, "renderer-viewport-png", assertOriginal);
  await assertOriginal(); return Object.freeze({ observation: capture.observation, image });
}

/** Bind the data/artifact to the selected target without treating renderer pixels
 * or source metadata as canvas, stable render, color or saved-design proof. */
export function currentRendererCaptureResult(observation: CurrentRendererCaptureObservation, image: PublishedManagedAttachment,
  input: CurrentDisposableOpenSealedTarget): Readonly<Record<string, unknown>> {
  const selected = currentDisposableOpenSealedTargetSchema.parse(input);
  const result = { ...observation, schema: "easyeda-pro-control.renderer-capture-result.v1", image,
    target: { projectUuid: selected.projectUuid, branchUuid: selected.branchUuid, documentUuid: selected.documentUuid,
      tabId: `${selected.documentUuid}@${selected.projectUuid}` }, mimeType: "image/png", imageScope: "original-parent-renderer-viewport",
    canvasOnly: false, pixelState: observation.allRgbZero ? "all-rgb-zero" : "rgb-nonzero", pixelSummaryScope: "decoded-rgb-samples",
    incompletePixelsPossible: true, stalePixelsPossible: true, pixelStabilityVerified: false,
    colorAccuracyVerified: false, alphaInterpretationVerified: false, metadataSemanticsVerified: false,
    completeBoardVerified: false, cadAuthority: false, persistenceVerified: false, executionAuthorized: false };
  if (Buffer.byteLength(JSON.stringify(result)) > LIMITS.maximumResultBytes) { refuse("RESULT_BOUND"); }
  return freezeDeep(currentRendererCaptureResultSchema.parse(result));
}

/** Validate the original session, target and exact managed candidate path. The
 * returned schema match supplies no original-process custody or execution right. */
export function requireCurrentRendererCaptureResult(input: unknown, selected: CurrentDisposableOpenSealedTarget,
  operationId: string, bindingSha256: string, sessionId: string): void {
  const safe = inert(input); if (Buffer.byteLength(JSON.stringify(safe)) > LIMITS.maximumResultBytes) { refuse("RESULT_BOUND"); }
  const result = currentRendererCaptureResultSchema.parse(safe);
  if (result.sessionId !== sessionId || result.target.projectUuid !== selected.projectUuid || result.target.branchUuid !== selected.branchUuid ||
      result.target.documentUuid !== selected.documentUuid || result.target.tabId !== `${selected.documentUuid}@${selected.projectUuid}` ||
      result.image.path !== currentRendererCaptureArtifactPath(operationId, bindingSha256, result.pngSha256)) { refuse("RESULT_TARGET"); }
}
