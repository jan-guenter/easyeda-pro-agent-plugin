import { once } from "node:events";
import process from "node:process";

const BOOTSTRAP_MAGIC = Buffer.from("EEB1", "ascii");
const BOOTSTRAP_HEADER_BYTES = 6;
const MINIMUM_SECRET_BYTES = 32;
const MAXIMUM_SECRET_BYTES = 256;

export const UPSTREAM_SUPERVISOR_READY_LINE =
  "easyeda-pro-control.upstream-supervisor-ready.v1";

function assertBridgeSecret(secret: string): void {
  const bytes = Buffer.byteLength(secret, "utf8");
  if (
    bytes < MINIMUM_SECRET_BYTES ||
    bytes > MAXIMUM_SECRET_BYTES ||
    !/^[A-Za-z0-9_-]+$/u.test(secret)
  ) {
    throw new Error("Upstream bridge bootstrap secret is invalid.");
  }
}

async function readExactBootstrapBytes(
  target: Buffer,
): Promise<void> {
  let offset = 0;
  while (offset < target.length) {
    const chunk: unknown = process.stdin.read(target.length - offset);
    if (Buffer.isBuffer(chunk)) {
      chunk.copy(target, offset);
      offset += chunk.length;
    } else {
      if (chunk !== null) {
        throw new TypeError(
          "Upstream bridge bootstrap channel emitted non-buffer bytes.",
        );
      }
      if (process.stdin.readableEnded) {
        throw new Error("Upstream bridge bootstrap channel closed early.");
      }
      await once(process.stdin, "readable", {
        signal: AbortSignal.timeout(5000),
      });
    }
  }
}

export function encodeBridgeBootstrapSecret(secret: string): Buffer {
  assertBridgeSecret(secret);
  const secretBytes = Buffer.from(secret, "utf8");
  const frame = Buffer.alloc(BOOTSTRAP_HEADER_BYTES + secretBytes.length);
  BOOTSTRAP_MAGIC.copy(frame, 0);
  frame.writeUInt16BE(secretBytes.length, BOOTSTRAP_MAGIC.length);
  secretBytes.copy(frame, BOOTSTRAP_HEADER_BYTES);
  secretBytes.fill(0);
  return frame;
}

export async function readBridgeBootstrapSecret(): Promise<string> {
  const header = Buffer.alloc(BOOTSTRAP_HEADER_BYTES);
  await readExactBootstrapBytes(header);
  try {
    if (!header.subarray(0, BOOTSTRAP_MAGIC.length).equals(BOOTSTRAP_MAGIC)) {
      throw new Error("Upstream bridge bootstrap header is invalid.");
    }
    const length = header.readUInt16BE(BOOTSTRAP_MAGIC.length);
    if (length < MINIMUM_SECRET_BYTES || length > MAXIMUM_SECRET_BYTES) {
      throw new Error("Upstream bridge bootstrap length is invalid.");
    }
    const bytes = Buffer.alloc(length);
    await readExactBootstrapBytes(bytes);
    try {
      const secret = bytes.toString("utf8");
      assertBridgeSecret(secret);
      return secret;
    } finally {
      bytes.fill(0);
    }
  } finally {
    header.fill(0);
  }
}
