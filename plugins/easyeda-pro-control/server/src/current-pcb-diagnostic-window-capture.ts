/** Original-window image data only. Native process/frame custody is supplied by
 * the retained visual owner, never by this parser or a copied image descriptor. */
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

export const CURRENT_WINDOW_CAPTURE_LIMITS = Object.freeze({ maximumDimension: 4096, maximumPixels: 4_194_304,
  maximumPngBytes: 262_144, maximumBase64Units: 349_528, maximumReplyBytes: 360_000, nativePrintMilliseconds: 1000 });
const LIMITS = CURRENT_WINDOW_CAPTURE_LIMITS;
const integer = z.number().int().min(-1_000_000).max(1_000_000).refine(value => !Object.is(value, -0));
const digest = z.string().regex(/^[a-f0-9]{64}$/u);
const schema = z.object({ schema: z.literal("easyeda-pro-control.original-window-png.v1"),
  hwnd: z.string().regex(/^[1-9][0-9]{0,18}$/u), width: z.number().int().min(320).max(LIMITS.maximumDimension),
  height: z.number().int().min(200).max(LIMITS.maximumDimension),
  bounds: z.object({ left: integer, top: integer, right: integer, bottom: integer }).strict(),
  pngBase64: z.string().min(4).max(LIMITS.maximumBase64Units), pngBytes: z.number().int().positive().max(LIMITS.maximumPngBytes),
  pngSha256: digest, allRgbZero: z.boolean(), method: z.literal("wm-print-to-owned-dib"),
  printMessageAcknowledged: z.literal(true), nativeResourcesRetained: z.literal(true), renderCompletionVerified: z.literal(false),
}).strict();
export type CurrentWindowCaptureObservation = Omit<z.infer<typeof schema>, "pngBase64">;
export interface CurrentWindowCapture { readonly observation: Readonly<CurrentWindowCaptureObservation>; readonly png: Buffer }
const identity = z.object({ device: z.string().regex(/^[0-9]{1,32}$/u), inode: z.string().regex(/^[0-9]{1,32}$/u) }).strict();
const target = z.object({ projectUuid: z.string().regex(/^[a-f0-9]{64}$/u), branchUuid: z.string().regex(/^[a-f0-9]{32}$/u),
  documentUuid: z.string().regex(/^(?:[a-f0-9]{16}|[a-f0-9]{32})$/u), tabId: z.string().max(97) }).strict();
export const currentWindowCaptureResultSchema = schema.omit({ pngBase64: true }).extend({
  schema: z.literal("easyeda-pro-control.window-capture-result.v1"), target,
  image: z.object({ path: z.string().max(4096), bytes: z.number().int().positive().max(LIMITS.maximumPngBytes),
    sha256: digest, identity, kind: z.literal("original-window-png"), mtimeMs: z.number() }).strict(),
  mimeType: z.literal("image/png"), imageScope: z.literal("original-root-window-wm-print"), canvasOnly: z.literal(false),
  pixelState: z.enum(["all-rgb-zero", "rgb-nonzero"]), windowPixelsOnly: z.literal(true), incompletePixelsPossible: z.literal(true),
  stalePixelsPossible: z.literal(true), occlusionEffectsPossible: z.literal(true), pixelStabilityVerified: z.literal(false),
  completeBoardVerified: z.literal(false), cadAuthority: z.literal(false), persistenceVerified: z.literal(false), executionAuthorized: z.literal(false),
}).strict().refine(value => value.width * value.height <= LIMITS.maximumPixels &&
  value.bounds.right - value.bounds.left === value.width && value.bounds.bottom - value.bounds.top === value.height &&
  value.image.bytes === value.pngBytes && value.image.sha256 === value.pngSha256 &&
  value.pixelState === (value.allRgbZero ? "all-rgb-zero" : "rgb-nonzero"), "Capture geometry, artifact or pixel summary differs.");
function refuse(reason: string): never { throw new Error(`PCB_WINDOW_CAPTURE_${reason}`); }

/** Copy own data before Zod inspects rejected input. This separate, closed image
 * packet permits one bounded base64 field without widening clock-reply limits. */
function inert(input: unknown, depth = 0): unknown {
  if (typeof input === "string") {
    if (input.length > LIMITS.maximumBase64Units || !input.isWellFormed()) { refuse("TEXT_BOUND"); } return input;
  }
  if (input === null || typeof input === "boolean") { return input; }
  if (typeof input === "number") { if (!Number.isFinite(input) || Object.is(input, -0)) { refuse("NUMBER"); } return input; }
  if (typeof input !== "object" || types.isProxy(input) || depth > 1 || Array.isArray(input)) { refuse("DATA_ONLY"); }
  const keys = Reflect.ownKeys(input); const proto: unknown = Object.getPrototypeOf(input);
  if (proto !== Object.prototype && proto !== null || keys.length > 16) { refuse("OBJECT"); }
  const output: Record<string, unknown> = {};
  for (const key of keys) {
    if (typeof key !== "string" || key.length > 64) { refuse("KEY"); }
    const descriptor = Object.getOwnPropertyDescriptor(input, key);
    if (descriptor === undefined || !Object.hasOwn(descriptor, "value") || descriptor.enumerable !== true) { refuse("DESCRIPTOR"); }
    Object.defineProperty(output, key, { value: inert(descriptor.value, depth + 1), enumerable: true });
  }
  return Object.freeze(output);
}

/** The fixed encoder emits only RGB8, filter0, one IHDR/IDAT/IEND. Verify all
 * chunks, consumed zlib bytes and the entire bounded decoded image, not a header. */
function pngPixels(bytes: Buffer, width: number, height: number): boolean {
  if (bytes.length < 63 || bytes.length > LIMITS.maximumPngBytes ||
      !bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) { refuse("PNG_SIGNATURE"); }
  let offset = 8; let compressed: Buffer | undefined;
  for (const kind of ["IHDR", "IDAT", "IEND"]) {
    if (offset + 12 > bytes.length) { refuse("PNG_EXTENT"); }
    const length = bytes.readUInt32BE(offset); const end = offset + 12 + length;
    if (end > bytes.length || bytes.toString("ascii", offset + 4, offset + 8) !== kind ||
        crc32(bytes.subarray(offset + 4, end - 4)) !== bytes.readUInt32BE(end - 4)) { refuse("PNG_CHUNK"); }
    const data = bytes.subarray(offset + 8, end - 4);
    if (kind === "IHDR") {
      if (length !== 13 || data.readUInt32BE(0) !== width || data.readUInt32BE(4) !== height ||
          !data.subarray(8).equals(Buffer.from([8, 2, 0, 0, 0]))) { refuse("PNG_HEADER"); }
    } else if (kind === "IDAT") { if (length < 6) { refuse("PNG_IDAT"); } compressed = data; }
    else if (length !== 0) { refuse("PNG_END"); }
    offset = end;
  }
  if (offset !== bytes.length || compressed === undefined) { refuse("PNG_TRAILING"); }
  const rowBytes = width * 3 + 1; const expected = rowBytes * height;
  // oxlint-disable-next-line node/no-sync -- One fixed PNG is at most256KiB compressed and12.6MiB decoded; no app RPC is invoked here.
  const inflated: unknown = inflateSync(compressed, { info: true, maxOutputLength: expected });
  const decoded = z.object({ buffer: z.instanceof(Buffer), engine: z.object({ bytesWritten: z.number().int().nonnegative() }) }).parse(inflated);
  if (decoded.buffer.length !== expected || decoded.engine.bytesWritten !== compressed.length) { refuse("PNG_DECODED_LENGTH"); }
  let allZero = true;
  for (let row = 0; row < height; row += 1) {
    const first = row * rowBytes;
    if (decoded.buffer[first] !== 0) { refuse("PNG_FILTER"); }
    for (let index = first + 1; index < first + rowBytes; index += 1) { if (decoded.buffer[index] !== 0) { allZero = false; } }
  }
  return allZero;
}

export function decodeCurrentWindowCapture(input: unknown): CurrentWindowCapture {
  const safe = inert(input);
  if (Buffer.byteLength(JSON.stringify(safe), "utf8") > LIMITS.maximumReplyBytes) { refuse("REPLY_BOUND"); }
  const value = schema.parse(safe);
  if (value.width * value.height > LIMITS.maximumPixels || value.bounds.right - value.bounds.left !== value.width ||
      value.bounds.bottom - value.bounds.top !== value.height || value.pngBase64.length % 4 !== 0 ||
      !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/u.test(value.pngBase64)) { refuse("GEOMETRY_OR_BASE64"); }
  const png = Buffer.from(value.pngBase64, "base64");
  if (png.length !== value.pngBytes || png.toString("base64") !== value.pngBase64 ||
      createHash("sha256").update(png).digest("hex") !== value.pngSha256 || pngPixels(png, value.width, value.height) !== value.allRgbZero) {
    refuse("PNG_CONTENT");
  }
  const { pngBase64: _encoded, ...observation } = value;
  return Object.freeze({ observation: freezeDeep(observation), png });
}

/** Deterministic destination lets the original owner retain its exact candidate
 * before publication, even if a later owner reproof refuses the result. */
export function currentWindowCaptureArtifactPath(operationId: string, bindingSha256: string, pngSha256: string): string {
  currentPcb209VisualIdSchema.parse(operationId);
  digest.parse(bindingSha256); digest.parse(pngSha256);
  return join(controlDataDirectory(), "artifacts", "original-window-captures", `${operationId}-${bindingSha256}-${pngSha256}.png`);
}
export async function publishCurrentWindowCapture(input: unknown, operationId: string, bindingSha256: string,
  assertOriginal: () => Promise<void>): Promise<Readonly<{ observation: Readonly<CurrentWindowCaptureObservation>; image: PublishedManagedAttachment }>> {
  const capture = decodeCurrentWindowCapture(input);
  const destination = currentWindowCaptureArtifactPath(operationId, bindingSha256, capture.observation.pngSha256);
  await assertOriginal();
  await ensureManagedDirectory(join(controlDataDirectory(), "artifacts", "original-window-captures")); await assertOriginal();
  const image = await publishManagedAttachmentExclusive(destination, "Original EasyEDA window PNG", capture.png, "original-window-png", assertOriginal);
  await assertOriginal();
  return Object.freeze({ observation: capture.observation, image });
}

export function currentWindowCaptureResult(observation: CurrentWindowCaptureObservation, image: PublishedManagedAttachment,
  input: CurrentDisposableOpenSealedTarget): Readonly<Record<string, unknown>> {
  const selected = currentDisposableOpenSealedTargetSchema.parse(input);
  return freezeDeep(currentWindowCaptureResultSchema.parse({ ...observation, schema: "easyeda-pro-control.window-capture-result.v1", image,
    target: { projectUuid: selected.projectUuid, branchUuid: selected.branchUuid, documentUuid: selected.documentUuid,
      tabId: `${selected.documentUuid}@${selected.projectUuid}` }, mimeType: "image/png", imageScope: "original-root-window-wm-print",
    canvasOnly: false, pixelState: observation.allRgbZero ? "all-rgb-zero" : "rgb-nonzero", windowPixelsOnly: true,
    incompletePixelsPossible: true, stalePixelsPossible: true, occlusionEffectsPossible: true, pixelStabilityVerified: false,
    completeBoardVerified: false, cadAuthority: false, persistenceVerified: false, executionAuthorized: false }));
}
export function requireCurrentWindowCaptureResult(input: unknown, selected: CurrentDisposableOpenSealedTarget,
  operationId: string, bindingSha256: string, hwnd: string): void {
  const result = currentWindowCaptureResultSchema.parse(input);
  if (result.hwnd !== hwnd || result.target.projectUuid !== selected.projectUuid || result.target.branchUuid !== selected.branchUuid ||
      result.target.documentUuid !== selected.documentUuid || result.target.tabId !== `${selected.documentUuid}@${selected.projectUuid}` ||
      result.image.path !== currentWindowCaptureArtifactPath(operationId, bindingSha256, result.pngSha256)) { refuse("RESULT_TARGET"); }
}
