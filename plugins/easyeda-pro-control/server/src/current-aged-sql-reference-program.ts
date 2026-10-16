/** Fixed current Date program inside the maintained scratch wire protocol.
 * The helper retains clock-controls.v1 only. The full current scan must finish
 * before its controlsAfter can be returned; no historical APP relation is used.
 */
import { canonicalJson, sha256Text } from "./core.ts";
import { buildMainReferenceProgram, validateMainReferenceRequest } from "./closed-symbol-main-reference-program.ts";
import { compileMainReferenceV3Metadata } from "./closed-symbol-main-reference-v3-metadata.ts";
import type { MainReferenceV3Metadata } from "./closed-symbol-main-reference-v3-metadata.ts";
import { CURRENT_AGED_SQL_DATE_PARSER_SOURCE, buildCurrentAgedSqlClockControls } from "./current-aged-sql-clock-controls.ts";
import { buildMainClockReference, exact } from "./symbol-clock-controls.ts";

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
  const original = buildMainReferenceProgram(request);
  const controls = buildMainClockReference(scope);
  const current = buildCurrentAgedSqlClockControls(scope, "main-reference");
  return replaceOnce(original, controls, `(()=>{const currentAgedControls=${current};
const before=currentAgedControls.controlsBefore,after=currentAgedControls.controlsAfter;
if(JSON.stringify(before.epochs)!==JSON.stringify(after.epochs)||JSON.stringify(before.sql)!==JSON.stringify(after.sql)||
 before.clockAfter.epochMs>after.clockBefore.epochMs||after.clockAfter.epochMs-before.clockBefore.epochMs>10000||
 before.clockBefore.offsetMinutes!==after.clockAfter.offsetMinutes)throw new Error('CURRENT_AGED_SQL_REFERENCE_REFUSED');
return currentAgedControls.controlsAfter;})()`);
}

/** New fixed compiler identity, same narrowly typed scratch wire envelope.
 * closedPlanSha256 is the current baseline-binding digest on this route. Its
 * historical field name does not grant a historical plan or APP-source owner.
 */
export async function compileCurrentAgedSqlReferenceMetadata(input: unknown): Promise<Readonly<CurrentAgedSqlReferenceMetadata>> {
  const base = await compileMainReferenceV3Metadata(input);
  const main = buildCurrentAgedSqlReferenceProgram(base.request), mainSha256 = sha256Text(main);
  need(Buffer.byteLength(main) > 0 && Buffer.byteLength(main) <= 100_000 && mainSha256 !== base.mainSha256);
  const command = replaceOnce(base.command, base.mainSha256, mainSha256);
  const oldInput: unknown = JSON.parse(base.stdin);
  const fields = exact(oldInput, ["profile", "helperBase64", "mainBase64", "requestBase64"]);
  need(fields["profile"] === base.stdinProfile &&
    fields["mainBase64"] === Buffer.from(buildMainReferenceProgram(base.request)).toString("base64") &&
    fields["requestBase64"] === Buffer.from(canonicalJson(base.request)).toString("base64"));
  const stdin = JSON.stringify({ ...fields, mainBase64: Buffer.from(main).toString("base64") });
  need(stdin.length > 0 && stdin.length <= 524_288 && Buffer.byteLength(stdin) === stdin.length);
  return Object.freeze({ ...base, profile: PROFILE, parserSource: CURRENT_AGED_SQL_DATE_PARSER_SOURCE,
    scanPolicy: "two-exhaustive-current-scans-before-controls-after-wire-result", command, stdin, mainSha256,
    commandSha256: sha256Text(command), stdinSha256: sha256Text(stdin) });
}
