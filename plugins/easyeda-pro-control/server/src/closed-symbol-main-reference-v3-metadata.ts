/** Fixed v3 compiler data. No spawn, invocation registry or caller-selected asset. */
import { createHash } from "node:crypto";
import { constants } from "node:fs";
import { open } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { canonicalJson, sha256Json, sha256Text } from "./core.ts";
import { buildMainReferenceProgram, validateMainReferenceRequest } from "./closed-symbol-main-reference-program.ts";
import { RUNTIME_PINS } from "./closed-symbol-main-reference-runtime.ts";
import { MAIN_REFERENCE_HELPER_IDENTITY } from "./main-reference-helper-identity.ts";
import type { MainReferenceHelperIdentity } from "./main-reference-helper-identity.ts";

const SCRIPT_PINS = Object.freeze({
  "owner-command-v3.ps1": "67474d9304c7e1a99264a7f55a1690c154ceef5e3c31e92c9a6191637c0c5655",
  "stdin-decoder-v3.ps1": "83265055d35605f93cf70c8ccb0d8e8c340818d1cd45c3ef25885fe2a6cc23e7",
});
function need(value: boolean): asserts value { if (!value) { throw new Error("Main reference v3 metadata refused."); } }
function hash(value: string): void { need(/^[a-f0-9]{64}$/u.test(value)); }
async function pinnedBytes(url: URL, expectedHash: string, maximum: number, exactBytes?: number): Promise<Buffer> {
  // oxlint-disable-next-line no-bitwise -- Fixed packaged regular asset, never a symlink or FIFO.
  const handle = await open(fileURLToPath(url), constants.O_RDONLY | constants.O_NOFOLLOW | constants.O_NONBLOCK);
  try {
    const before = await handle.stat({ bigint: true });
    need(before.isFile() && before.nlink === 1n && before.size > 0n && before.size <= BigInt(maximum) &&
      (exactBytes === undefined || before.size === BigInt(exactBytes)));
    const bytes = Buffer.alloc(Number(before.size)); let offset = 0;
    while (offset < bytes.length) {
      const part = await handle.read(bytes, offset, bytes.length - offset, offset);
      need(part.bytesRead > 0); offset += part.bytesRead;
    }
    const end = await handle.read(Buffer.alloc(1), 0, 1, bytes.length);
    const after = await handle.stat({ bigint: true });
    need(end.bytesRead === 0 && after.isFile() && after.nlink === 1n && before.mode === after.mode &&
      before.size === after.size && before.ino === after.ino && before.dev === after.dev &&
      before.mtimeNs === after.mtimeNs && before.ctimeNs === after.ctimeNs &&
      createHash("sha256").update(bytes).digest("hex") === expectedHash);
    return bytes;
  } finally { await handle.close(); }
}
async function source(name: keyof typeof SCRIPT_PINS): Promise<string> {
  const bytes = await pinnedBytes(new URL(`../../scripts/main-reference/${name}`, import.meta.url), SCRIPT_PINS[name], 32_768);
  return new TextDecoder("utf-8", { fatal: true, ignoreBOM: true }).decode(bytes);
}
export interface MainReferenceV3Metadata {
  readonly request: ReturnType<typeof validateMainReferenceRequest>;
  readonly command: string; readonly stdin: string;
  readonly requestSha256: string; readonly mainSha256: string; readonly commandSha256: string;
  readonly sourcePins: Readonly<Record<string, string>>; readonly runtimePinsSha256: string;
  readonly helperIdentity: Readonly<MainReferenceHelperIdentity>;
  readonly stdinProfile: "private.main-reference-stdin.v3"; readonly stdinSha256: string;
}

/** Both live compilation and current-source historical comparison use these
 * exact bytes. This function never issues an invocable transport object. */
export async function compileMainReferenceV3Metadata(input: unknown): Promise<Readonly<MainReferenceV3Metadata>> {
  const request = validateMainReferenceRequest(input);
  const identity = MAIN_REFERENCE_HELPER_IDENTITY;
  need(identity !== null && identity.profile === "private.main-reference-helper.v1" &&
    Number.isSafeInteger(identity.bytes) && identity.bytes > 0 && identity.bytes <= 262_144);
  hash(identity.sha256); hash(identity.sourcesSha256);
  const helperIdentity = Object.freeze({ ...identity });
  const main = buildMainReferenceProgram(request), requestText = canonicalJson(request);
  const mainSha256 = sha256Text(main), requestSha256 = sha256Text(requestText);
  const [template, decoder, helper] = await Promise.all([
    source("owner-command-v3.ps1"), source("stdin-decoder-v3.ps1"),
    pinnedBytes(new URL("../bin/Easyeda.MainReference.dll", import.meta.url), identity.sha256, 262_144, identity.bytes),
  ]);
  const replacements = Object.freeze({ __NONCE__: request.nonce, __REQUEST_HASH__: requestSha256,
    __MAIN_HASH__: mainSha256, __HELPER_HASH__: identity.sha256, __HELPER_BYTES__: String(identity.bytes), __STDIN_DECODER__: decoder });
  let command = template;
  for (const [token, value] of Object.entries(replacements)) { need(command.split(token).length === 2); command = command.replace(token, value); }
  const stdinProfile = "private.main-reference-stdin.v3";
  const stdin = JSON.stringify({ profile: stdinProfile, helperBase64: helper.toString("base64"),
    mainBase64: Buffer.from(main).toString("base64"), requestBase64: Buffer.from(requestText).toString("base64") });
  // These are explicit v3 limits. Historical v2 retains its original 180000 cap.
  need(!/__[A-Z_]+__/u.test(command) && command.length > 0 && command.length <= 30_000 &&
    stdin.length > 0 && stdin.length <= 524_288 && Buffer.byteLength(stdin) === stdin.length &&
    Buffer.byteLength(main) > 0 && Buffer.byteLength(main) <= 100_000 &&
    Buffer.byteLength(requestText) > 0 && Buffer.byteLength(requestText) <= 8192);
  const sourcePins = Object.freeze({ ...SCRIPT_PINS, "Easyeda.MainReference.dll": identity.sha256, nativeSourcesSha256: identity.sourcesSha256 });
  return Object.freeze({ request, command, stdin, requestSha256, mainSha256, commandSha256: sha256Text(command), sourcePins,
    runtimePinsSha256: sha256Json(RUNTIME_PINS), helperIdentity, stdinProfile, stdinSha256: sha256Text(stdin) });
}
