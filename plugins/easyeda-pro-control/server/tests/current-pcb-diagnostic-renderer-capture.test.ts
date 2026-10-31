/** Bounded synthetic PNG data and managed publication only. No renderer,
 * screenshot request, native window or production project is exercised. */
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { access, readFile, stat } from "node:fs/promises";
import { test } from "node:test";
import { crc32, deflateSync } from "node:zlib";
import { CURRENT_RENDERER_CAPTURE_LIMITS as LIMITS, currentRendererCaptureArtifactPath, currentRendererCaptureResult,
  decodeCurrentRendererCapture, publishCurrentRendererCapture, requireCurrentRendererCaptureResult } from "../src/current-pcb-diagnostic-renderer-capture.ts";

const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
/** Encode a chunk independently of the parser so malformed structure can still
 * carry a valid CRC when a test targets ordering, encoding or decoded extent. */
function chunk(kind: string, data: Buffer): Buffer {
  const output = Buffer.alloc(data.length + 12); output.writeUInt32BE(data.length); output.write(kind, 4, "latin1"); data.copy(output, 8);
  output.writeUInt32BE(crc32(output.subarray(4, -4)), output.length - 4); return output;
}
function assemble(header: Buffer, chunks: readonly Buffer[]): Buffer { return Buffer.concat([signature, chunk("IHDR", header), ...chunks]); }
function packet(png: Buffer): Readonly<Record<string, unknown>> {
  return { schema: "easyeda-pro-control.renderer-viewport-png.v1", sessionId: "original-parent", pngBase64: png.toString("base64"),
    screenshotReplyReceived: true, renderCompletionVerified: false };
}
/** Inverse-filter a small explicit source raster. Stable sorting of candidate
 * distances implements Paeth's tie order independently from the decoder branch. */
function fixture(bpp: 3 | 4, filter: number, zero = false): Readonly<{ header: Buffer; filtered: Buffer; compressed: Buffer; png: Buffer }> {
  const height = 2, width = 3;
  const rowBytes = width * bpp;
  const filtered = Buffer.alloc((rowBytes + 1) * height), source = Buffer.alloc(rowBytes * height);
  for (let row = 0; row < height; row += 1) {
    for (let index = 0; index < rowBytes; index += 1) { source[row * rowBytes + index] = zero && index % bpp < 3 ? 0 : (11 + row * 37 + index * 53) % 256; }
  }
  for (let row = 0; row < height; row += 1) {
    filtered[row * (rowBytes + 1)] = filter;
    for (let index = 0; index < rowBytes; index += 1) {
      const left = index < bpp ? 0 : source[row * rowBytes + index - bpp] ?? 0, up = row === 0 ? 0 : source[(row - 1) * rowBytes + index] ?? 0;
      const corner = row === 0 || index < bpp ? 0 : source[(row - 1) * rowBytes + index - bpp] ?? 0;
      const predicted = left + up - corner;
      const paeth = [left, up, corner].map(value => ({ value, distance: Math.abs(predicted - value) })).toSorted((a, b) => a.distance - b.distance)[0]?.value ?? 0;
      const predictors = [0, left, up, Math.floor((left + up) / 2), paeth];
      filtered[row * (rowBytes + 1) + index + 1] = ((source[row * rowBytes + index] ?? 0) - (predictors[filter] ?? 0) + 256) % 256;
    }
  }
  const header = Buffer.alloc(13); header.writeUInt32BE(width); header.writeUInt32BE(height, 4); header[8] = 8; header[9] = bpp === 3 ? 2 : 6;
  // oxlint-disable-next-line node/no-sync -- Only the fixed small synthetic raster is compressed in this test fixture.
  const compressed = deflateSync(filtered);
  return { header, filtered, compressed, png: assemble(header, [chunk("IDAT", compressed), chunk("IEND", Buffer.alloc(0))]) };
}

void test("renderer PNG supports RGB/RGBA8, all standard filters and contiguous IDAT without visual authority", () => {
  for (const bpp of [3, 4] as const) {
    for (const filter of [0, 1, 2, 3, 4]) {
      for (const zero of [false, true]) {
        const value = fixture(bpp, filter, zero);
        const split = Math.floor(value.compressed.length / 2);
        const png = assemble(value.header, [chunk("IDAT", value.compressed.subarray(0, split)), chunk("IDAT", Buffer.alloc(0)),
          chunk("IDAT", value.compressed.subarray(split)), chunk("IEND", Buffer.alloc(0))]);
        const decoded = decodeCurrentRendererCapture(packet(png));
        assert.deepEqual(decoded.png, png); assert.equal(decoded.observation.width, 3); assert.equal(decoded.observation.height, 2);
        assert.equal(decoded.observation.pngBytes, png.length); assert.equal(decoded.observation.pngSha256, createHash("sha256").update(png).digest("hex"));
        assert.equal(decoded.observation.allRgbZero, zero); assert.equal(decoded.observation.renderCompletionVerified, false);
        assert.equal(Object.hasOwn(decoded.observation, "pngBase64"), false); assert.equal(Object.hasOwn(decoded.observation, "hwnd"), false);
      }
    }
  }
});

void test("renderer PNG retains one opaque ICC chunk byte-exact without using its compressed metadata as pixels", () => {
  const value = fixture(4, 4);
  // oxlint-disable-next-line node/no-sync -- A highly compressible synthetic profile is retained opaque; the parser inflates only IDAT.
  const profile = deflateSync(Buffer.alloc(1_048_576, 97));
  const metadata = Buffer.concat([Buffer.from("Opaque profile\0\0"), profile]);
  const png = assemble(value.header, [chunk("iCCP", metadata),
    chunk("IDAT", value.compressed), chunk("IEND", Buffer.alloc(0))]);
  const decoded = decodeCurrentRendererCapture(packet(png));
  assert.deepEqual(decoded.png, png); assert.equal(decoded.observation.allRgbZero, false);
  assert.equal(decoded.observation.pngSha256, createHash("sha256").update(png).digest("hex"));
});

void test("renderer PNG rejects unsupported encodings, critical chunks, broken framing and interrupted IDAT", () => {
  const end = chunk("IEND", Buffer.alloc(0)), value = fixture(3, 0);
  for (const change of [(data: Buffer): void => { data[8] = 16; }, (data: Buffer): void => { data[9] = 3; },
    (data: Buffer): void => { data[10] = 1; }, (data: Buffer): void => { data[11] = 1; }, (data: Buffer): void => { data[12] = 1; },
    (data: Buffer): void => { data.writeUInt32BE(0); }, (data: Buffer): void => { data.writeUInt32BE(4097); },
    (data: Buffer): void => { data.writeUInt32BE(4096); data.writeUInt32BE(4096, 4); }]) {
    const header = Buffer.from(value.header); change(header);
    const input = packet(assemble(header, [chunk("IDAT", value.compressed), end]));
    assert.throws(() => decodeCurrentRendererCapture(input), /PNG_ENCODING/u);
  }
  const corrupted = Buffer.from(value.png); corrupted[corrupted.length - 1] = ((corrupted.at(-1) ?? 0) + 1) % 256;
  const binaryType = chunk("ABCD", Buffer.alloc(0)); binaryType[4] = 0xC1; binaryType.writeUInt32BE(crc32(binaryType.subarray(4, -4)), binaryType.length - 4);
  const split = Math.floor(value.compressed.length / 2);
  for (const png of [corrupted, Buffer.concat([value.png, end]), value.png.subarray(0, -12), assemble(value.header, [end]),
    assemble(value.header, [chunk("ABCD", Buffer.alloc(0)), chunk("IDAT", value.compressed), end]),
    assemble(value.header, [binaryType, chunk("IDAT", value.compressed), end]),
    assemble(value.header, [chunk("aaab", Buffer.alloc(0)), chunk("IDAT", value.compressed), end]),
    assemble(value.header, [chunk("acTL", Buffer.alloc(8)), chunk("IDAT", value.compressed), end]),
    assemble(value.header, [chunk("IDAT", value.compressed.subarray(0, split)), chunk("tEXt", Buffer.from("Note\0split")), chunk("IDAT", value.compressed.subarray(split)), end]),
    assemble(value.header, [chunk("IDAT", value.compressed), chunk("pHYs", Buffer.alloc(9)), end]),
    assemble(value.header, [chunk("PLTE", Buffer.alloc(4)), chunk("IDAT", value.compressed), end]),
    assemble(value.header, [chunk("IHDR", value.header), chunk("IDAT", value.compressed), end])]) {
    assert.throws(() => decodeCurrentRendererCapture(packet(png)));
  }
});

void test("renderer PNG enforces exact zlib consumption, decoded capacity, filters and inert envelope bounds", () => {
  const end = chunk("IEND", Buffer.alloc(0)), value = fixture(4, 0);
  const invalidFilter = Buffer.from(value.filtered); invalidFilter[0] = 5;
  for (const pixels of [invalidFilter, value.filtered.subarray(1), Buffer.concat([value.filtered, Buffer.from([0])])]) {
    // oxlint-disable-next-line node/no-sync -- Tiny malformed rasters target bounded decoded length/filter checks, with valid chunk CRCs.
    const compressed = deflateSync(pixels);
    const input = packet(assemble(value.header, [chunk("IDAT", compressed), end]));
    assert.throws(() => decodeCurrentRendererCapture(input));
  }
  for (const compressed of [Buffer.concat([value.compressed, Buffer.from([0])]), Buffer.concat([value.compressed, value.compressed]), value.compressed.subarray(0, -1)]) {
    const input = packet(assemble(value.header, [chunk("IDAT", compressed), end]));
    assert.throws(() => decodeCurrentRendererCapture(input));
  }
  const original = packet(value.png);
  for (const change of [{ schema: "foreign" }, { sessionId: "x".repeat(129) }, { sessionId: "original-parent\n" }, { screenshotReplyReceived: false },
    { renderCompletionVerified: true }, { width: 3 }, { allRgbZero: false }, { pngBase64: `${value.png.toString("base64")}=` },
    { pngBase64: "A".repeat(LIMITS.maximumBase64Units + 1) }]) { assert.throws(() => decodeCurrentRendererCapture({ ...original, ...change })); }
  let getterInvoked = false; const accessor = { ...original };
  Object.defineProperty(accessor, "pngBase64", { enumerable: true, get: () => { getterInvoked = true; return ""; } });
  assert.throws(() => decodeCurrentRendererCapture(accessor)); assert.equal(getterInvoked, false);
  assert.throws(() => decodeCurrentRendererCapture(new Proxy(original, {})));
});

void test("renderer artifact publication rechecks its owner and binds the original session/target without overwrite", async () => {
  const rawWindowsPath = String.raw`C:\Synthetic\renderer-viewport.eprj2`;
  const selected = { rawWindowsPath, projectUuid: createHash("sha256").update(rawWindowsPath).digest("hex"), documentUuid: "a".repeat(16),
    expectedSourceSha256: "b".repeat(64), branchUuid: "c".repeat(32) };
  const binding = "d".repeat(64), operationId = "pcb209-visual-renderer-publication", value = fixture(4, 4);
  const input = packet(value.png);
  let checks = 0; const published = await publishCurrentRendererCapture(input, operationId, binding, () => { checks += 1; return Promise.resolve(); });
  const info = await stat(published.image.path);
  assert.equal(checks, 4); assert.deepEqual(await readFile(published.image.path), value.png); assert.equal(info.mode % 0o1000, 0o600);
  const result = currentRendererCaptureResult(published.observation, published.image, selected);
  requireCurrentRendererCaptureResult(result, selected, operationId, binding, "original-parent");
  for (const flag of ["canvasOnly", "renderCompletionVerified", "pixelStabilityVerified", "colorAccuracyVerified", "alphaInterpretationVerified", "metadataSemanticsVerified", "completeBoardVerified", "cadAuthority", "persistenceVerified", "executionAuthorized"]) {
    assert.equal(result[flag], false, flag);
  }
  assert.equal(result["imageScope"], "original-parent-renderer-viewport"); assert.equal(Object.hasOwn(result, "hwnd"), false);
  assert.throws(() => { requireCurrentRendererCaptureResult(result, selected, operationId, binding, "foreign-parent"); });
  assert.throws(() => { requireCurrentRendererCaptureResult(result, { ...selected, documentUuid: "f".repeat(16) }, operationId, binding, "original-parent"); });
  await assert.rejects(publishCurrentRendererCapture(input, operationId, binding, () => Promise.resolve()));
  assert.deepEqual(await readFile(published.image.path), value.png);
  const failedId = "pcb209-visual-renderer-owner-refusal";
  let failedChecks = 0;
  await assert.rejects(publishCurrentRendererCapture(input, failedId, binding, () => {
    failedChecks += 1; if (failedChecks === 3) { return Promise.reject(new Error("original owner changed")); } return Promise.resolve();
  }));
  assert.equal(failedChecks, 3);
  await assert.rejects(access(currentRendererCaptureArtifactPath(failedId, binding, published.observation.pngSha256)));
  assert.throws(() => currentRendererCaptureArtifactPath("../foreign", binding, published.observation.pngSha256));
});
