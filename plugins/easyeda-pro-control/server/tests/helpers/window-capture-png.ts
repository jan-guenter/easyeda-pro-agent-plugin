/** Synthetic fixed-format PNG; never reads an application or user image. */
import { createHash } from "node:crypto";
import { crc32, deflateSync } from "node:zlib";

function chunk(kind: string, body: Buffer): Buffer {
    const value = Buffer.alloc(body.length + 12); value.writeUInt32BE(body.length); value.write(kind, 4, "ascii"); body.copy(value, 8);
    value.writeUInt32BE(crc32(value.subarray(4, -4)), value.length - 4); return value;
}

export function windowCapturePacket(zero = false): Record<string, unknown> {
  const width = 320; const height = 200; const pixels = Buffer.alloc((width * 3 + 1) * height);
  if (!zero) { pixels[1] = 255; }
  const header = Buffer.alloc(13); header.writeUInt32BE(width); header.writeUInt32BE(height, 4); header[8] = 8; header[9] = 2;
  // oxlint-disable-next-line node/no-sync -- One tiny constant synthetic test image, never runtime input.
  const encoded = deflateSync(pixels);
  const png = Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk("IHDR", header), chunk("IDAT", encoded), chunk("IEND", Buffer.alloc(0))]);
  return { schema: "easyeda-pro-control.original-window-png.v1", hwnd: "12345", width, height,
    bounds: { left: 0, top: 0, right: width, bottom: height }, pngBase64: png.toString("base64"), pngBytes: png.length,
    pngSha256: createHash("sha256").update(png).digest("hex"), allRgbZero: zero, method: "wm-print-to-owned-dib",
    printMessageAcknowledged: true, nativeResourcesRetained: true, renderCompletionVerified: false };
}
