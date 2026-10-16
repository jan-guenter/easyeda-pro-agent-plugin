/** Fixed current Date program inside the maintained scratch wire protocol.
 * The helper retains clock-controls.v1 only. The full current scan must finish
 * before its controlsAfter can be returned; no historical APP relation is used.
 */
import { canonicalJson, sha256Json, sha256Text } from "./core.ts";
import { createHash } from "node:crypto";
import { constants } from "node:fs";
import { lstat, open } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { buildMainReferenceProgram, validateMainReferenceRequest } from "./closed-symbol-main-reference-program.ts";
import { compileMainReferenceV3Metadata } from "./closed-symbol-main-reference-v3-metadata.ts";
import type { MainReferenceV3Metadata } from "./closed-symbol-main-reference-v3-metadata.ts";
import { CURRENT_AGED_SQL_DATE_PARSER_SOURCE, buildCurrentAgedSqlClockControls } from "./current-aged-sql-clock-controls.ts";
import { buildMainClockReference, exact } from "./symbol-clock-controls.ts";
import { CURRENT_MAIN_REFERENCE_HELPER_IDENTITY, CURRENT_MAIN_REFERENCE_RUNTIME_PINS, CURRENT_MAIN_REFERENCE_RUNTIME_PROFILE_SHA256,
  CURRENT_MAIN_REFERENCE_VERSIONS } from "./current-main-reference-helper-identity.ts";

const PROFILE = "private.current-aged-sql-reference-program.v1";
export interface CurrentAgedSqlReferenceMetadata extends MainReferenceV3Metadata {
  readonly profile: typeof PROFILE;
  readonly parserSource: typeof CURRENT_AGED_SQL_DATE_PARSER_SOURCE;
  readonly scanPolicy: "two-exhaustive-current-scans-before-controls-after-wire-result";
}
function need(condition: boolean): asserts condition {
  if (!condition) { throw new Error("Current aged SQL reference program refused."); }
}
function replaceOnce(text: string, before: string, after: string): string {
  need(before.length > 0 && text.split(before).length === 2);
  return text.replace(before, after);
}

/** Source composition selects exactly two maintained fixed compilers. Neither
 * the caller nor the wire request can choose code, paths, parser or scan policy.
 * Existing main/native ownership and historical program bytes stay unchanged.
 */
export function buildCurrentAgedSqlReferenceProgram(input: unknown): string {
  const request = validateMainReferenceRequest(input);
  const scope = { createdAtLiteral: request.createdAtLiteral, referenceUtcMs: request.referenceUtcMs };
  const original = replaceOnce(buildMainReferenceProgram(request), "assert.equal(identity.electron,'41.2.1-jlc-sa-win-x64.2');",
    `assert.equal(identity.electron,${JSON.stringify(CURRENT_MAIN_REFERENCE_VERSIONS.electron)});`);
  const controls = buildMainClockReference(scope);
  const current = buildCurrentAgedSqlClockControls(scope, "main-reference");
  return replaceOnce(original, controls, `(()=>{const currentAgedControls=${current};
const before=currentAgedControls.controlsBefore,after=currentAgedControls.controlsAfter;
if(JSON.stringify(before.epochs)!==JSON.stringify(after.epochs)||JSON.stringify(before.sql)!==JSON.stringify(after.sql)||
 before.clockAfter.epochMs>after.clockBefore.epochMs||after.clockAfter.epochMs-before.clockBefore.epochMs>10000||
 before.clockBefore.offsetMinutes!==after.clockAfter.offsetMinutes)throw new Error('CURRENT_AGED_SQL_REFERENCE_REFUSED');
return currentAgedControls.controlsAfter;})()`);
}

async function currentHelperBytes(): Promise<Buffer> {
  const path = fileURLToPath(new URL("../bin/Easyeda.CurrentMainReference.dll", import.meta.url));
  const identity = CURRENT_MAIN_REFERENCE_HELPER_IDENTITY;
  // oxlint-disable-next-line no-bitwise -- One fixed packaged regular binary; no supplied path, symlink or special-file read.
  const handle = await open(path, constants.O_RDONLY | constants.O_NOFOLLOW | constants.O_NONBLOCK);
  try {
    const before = await handle.stat({ bigint: true });
    need(before.isFile() && before.nlink === 1n && before.size > 0n && before.size <= 262_144n && before.size === BigInt(identity.bytes));
    const bytes = Buffer.alloc(identity.bytes); let offset = 0;
    while (offset < bytes.length) {
      const part = await handle.read(bytes, offset, bytes.length - offset, offset);
      need(part.bytesRead > 0); offset += part.bytesRead;
    }
    const eof = await handle.read(Buffer.alloc(1), 0, 1, bytes.length);
    const after = await handle.stat({ bigint: true }), named = await lstat(path, { bigint: true });
    need(eof.bytesRead === 0 && createHash("sha256").update(bytes).digest("hex") === identity.sha256);
    for (const observed of [after, named]) {
      need(observed.isFile() && !observed.isSymbolicLink());
      for (const field of ["dev", "ino", "mode", "nlink", "uid", "gid", "size", "mtimeNs", "ctimeNs"] as const) { need(observed[field] === before[field]); }
    }
    return bytes;
  } finally { await handle.close(); }
}

/** New fixed compiler identity, same narrowly typed scratch wire envelope.
 * closedPlanSha256 is the current baseline-binding digest on this route. Its
 * historical field name does not grant a historical plan or APP-source owner.
 */
export async function compileCurrentAgedSqlReferenceMetadata(input: unknown): Promise<Readonly<CurrentAgedSqlReferenceMetadata>> {
  const base = await compileMainReferenceV3Metadata(input);
  const helper = await currentHelperBytes(), helperIdentity = CURRENT_MAIN_REFERENCE_HELPER_IDENTITY;
  const main = buildCurrentAgedSqlReferenceProgram(base.request), mainSha256 = sha256Text(main);
  need(Buffer.byteLength(main) > 0 && Buffer.byteLength(main) <= 100_000 && mainSha256 !== base.mainSha256);
  let command = replaceOnce(base.command, base.mainSha256, mainSha256);
  command = replaceOnce(command, base.helperIdentity.sha256, helperIdentity.sha256);
  command = replaceOnce(command, `$helperBytes=${base.helperIdentity.bytes}`, `$helperBytes=${helperIdentity.bytes}`);
  command = replaceOnce(command, "-ceq'Easyeda.MainReference'", "-ceq'Easyeda.CurrentMainReference'");
  const oldInput: unknown = JSON.parse(base.stdin);
  const fields = exact(oldInput, ["profile", "helperBase64", "mainBase64", "requestBase64"]);
  need(fields["profile"] === base.stdinProfile &&
    fields["mainBase64"] === Buffer.from(buildMainReferenceProgram(base.request)).toString("base64") &&
    fields["requestBase64"] === Buffer.from(canonicalJson(base.request)).toString("base64"));
  const stdin = JSON.stringify({ ...fields, helperBase64: helper.toString("base64"), mainBase64: Buffer.from(main).toString("base64") });
  need(stdin.length > 0 && stdin.length <= 524_288 && Buffer.byteLength(stdin) === stdin.length);
  return Object.freeze({ ...base, helperIdentity, runtimePinsSha256: sha256Json(CURRENT_MAIN_REFERENCE_RUNTIME_PINS),
    sourcePins: Object.freeze({ ...base.sourcePins, historicalCompilerNativeSourcesSha256: base.helperIdentity.sourcesSha256,
      "Easyeda.CurrentMainReference.dll": helperIdentity.sha256, nativeSourcesSha256: helperIdentity.sourcesSha256,
      currentRuntimeProfileSha256: CURRENT_MAIN_REFERENCE_RUNTIME_PROFILE_SHA256 }),
    profile: PROFILE, parserSource: CURRENT_AGED_SQL_DATE_PARSER_SOURCE,
    scanPolicy: "two-exhaustive-current-scans-before-controls-after-wire-result", command, stdin, mainSha256,
    commandSha256: sha256Text(command), stdinSha256: sha256Text(stdin) });
}
