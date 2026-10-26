/** Pure relation for a future fixed JSON.stringify(Tg.create(...)) reply.
 * No native wrapper, dispatch, clock witness or completion owner is issued. */
import { isRecord, sha256Text } from "./core.ts";
import { assertCurrentFootprintCopyV2FreshUuid, currentFootprintCopyV2Rows } from "./current-footprint-copy-v2-plan.ts";
import type { CurrentFootprintCopyV2Plan } from "./current-footprint-copy-v2-plan.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export type CurrentFootprintCopyV2ResultJson = string | number | boolean | null |
  readonly CurrentFootprintCopyV2ResultJson[] | { readonly [key: string]: CurrentFootprintCopyV2ResultJson };
export const CURRENT_FOOTPRINT_COPY_V2_NATIVE_RESULT_MAX_BYTES = 2_097_152;
const fields = Object.freeze(["uuid", "project_uuid", "title", "display_title", "docType", "creator", "createTime", "modifier",
  "description", "updateTime", "custom_tags", "owner", "source", "version", "path", "ticket"]);
const omitted = Object.freeze({ nativeObservationBound: false, executionAuthorized: false, producerBindingVerified: false,
  clockWindowVerified: false, localeObserved: false, ownerDetailsVerified: false, completionVerified: false, persistenceVerified: false } as const);
export interface CurrentFootprintCopyV2NativeResult extends Readonly<typeof omitted> {
  readonly profile: "private.current-footprint-copy-v2-native-result.v1";
  readonly returnedUuid: string;
  readonly envelope: Readonly<{ success: true; result: Readonly<Record<string, CurrentFootprintCopyV2ResultJson>> }>;
  readonly serializedEnvelope: string;
  readonly serializedEnvelopeSha256: string;
  readonly serializedEnvelopeBytes: number;
  readonly titleFoldCandidates: readonly ("default" | "turkish-azeri")[];
  readonly suppliedResultRelationVerified: true;
}
const originals = new WeakMap<object, CurrentFootprintCopyV2Plan>();
function need(condition: boolean, detail: string): asserts condition {
  if (!condition) { throw new Error(`Current footprint copy-v2 native result: ${detail}`); }
}
function exact(value: unknown, names: readonly string[]): asserts value is Record<string, CurrentFootprintCopyV2ResultJson> {
  need(isRecord(value) && Object.keys(value).length === names.length && names.every(name => Object.hasOwn(value, name)), "exact native fields required");
}
function checkedJson(parsed: unknown): asserts parsed is CurrentFootprintCopyV2ResultJson {
  const pending: { value: unknown; depth: number }[] = [{ value: parsed, depth: 0 }]; let count = 0;
  while (pending.length > 0) {
    const item = pending.pop(); count += 1;
    need(item !== undefined && count <= 4096 && item.depth <= 8, "native JSON tree capacity exceeded");
    const value = item.value;
    if (typeof value === "string") { need(value.isWellFormed(), "native JSON contains invalid Unicode"); }
    else if (typeof value === "number") { need(Number.isFinite(value) && !Object.is(value, -0), "native JSON number differs"); }
    else if (value !== null && typeof value !== "boolean") {
      need(Array.isArray(value) || isRecord(value), "native JSON value differs");
      const entries: [string, unknown][] = Object.entries(value);
      need(entries.length <= 512 && entries.every(([key]) => key.isWellFormed()), "native JSON field capacity exceeded");
      for (const [, child] of entries) { pending.push({ value: child, depth: item.depth + 1 }); }
      need(pending.length + count <= 4096, "native JSON tree capacity exceeded");
    }
  }
}
function capture(serialized: unknown): Readonly<{ value: CurrentFootprintCopyV2ResultJson; text: string; bytes: number }> {
  // Do not reflect on caller objects, even to format a schema error. The
  // Future fixed native wrapper must serialize the whole envelope itself.
  need(typeof serialized === "string" && serialized.isWellFormed() &&
    serialized.length <= CURRENT_FOOTPRINT_COPY_V2_NATIVE_RESULT_MAX_BYTES, "bounded primitive serialized reply required");
  const bytes = Buffer.byteLength(serialized);
  need(bytes <= CURRENT_FOOTPRINT_COPY_V2_NATIVE_RESULT_MAX_BYTES, "native reply UTF8 capacity exceeded");
  let parsed: unknown;
  try { parsed = JSON.parse(serialized) as unknown; } catch { throw new Error("Current footprint copy-v2 native result: invalid JSON"); }
  checkedJson(parsed);
  // JSON.stringify is the proposed wire contract. This rejects duplicate keys,
  // Alternative escapes, number spellings and hidden trailing JSON content.
  need(JSON.stringify(parsed) === serialized, "exact JSON.stringify serialization required");
  return { value: parsed, text: serialized, bytes };
}
function clock(value: unknown): asserts value is number {
  need(typeof value === "number" && Number.isSafeInteger(value) && value > 0 && value <= 8_640_000_000_000_000, "positive document clock required");
}

/** Pinned209 worker0e7a4743: create1884898 returns get1880762, not a UUID.
 * uploadLocal2031202 calls parseFull238798 with no EDIT_HEAD. Under the
 * separately required own-undefined manager.user path, onDocHead275156 and
 * PROJECT.onHeadChange2119189 create the three undefined actor properties;
 * JSON.stringify therefore emits {} for creator/modifier. setEditData1857186
 * retains min/max clocks and the latest version, including equal clocks.
 * Ne1845081 uses default-locale lowercasing in local mode and ASCII folding
 * otherwise. The original plan's printable ASCII titles permit only these two
 * candidate spellings. Neither candidate identifies the actual locale.
 * Unknown projectDetails.owner data is retained completely within bounds;
 * only its UUID is compared. This supplied-data relation proves no call occurred.
 */
export function decodeCurrentFootprintCopyV2NativeResult(plan: CurrentFootprintCopyV2Plan,
  serializedEnvelope: unknown): CurrentFootprintCopyV2NativeResult {
  currentFootprintCopyV2Rows(plan);
  const captured = capture(serializedEnvelope), envelope = captured.value;
  exact(envelope, ["success", "result"]); need(envelope["success"] === true, "successful native envelope required");
  const result = envelope["result"]; exact(result, fields);
  const metadata = plan.destinationMetadata, owner = result["owner"], uuid = result["uuid"];
  need(typeof uuid === "string", "native destination UUID required"); assertCurrentFootprintCopyV2FreshUuid(plan, uuid);
  need(result["project_uuid"] === plan.source.projectUuid && result["path"] === plan.source.projectUuid && result["docType"] === 4 &&
    isRecord(owner) && owner["uuid"] === plan.ownerUuid, "native project or owner identity differs");
  need(Buffer.byteLength(JSON.stringify(owner)) <= 65_536, "native owner data capacity exceeded");
  need(result["display_title"] === metadata.title && result["description"] === metadata.description &&
    result["custom_tags"] === JSON.stringify(metadata.tags) && result["source"] === "" && result["ticket"] === plan.metadataTicket,
  "native destination metadata differs");
  exact(result["creator"], []); exact(result["modifier"], []);
  const createTime = result["createTime"], updateTime = result["updateTime"]; clock(createTime); clock(updateTime);
  need(createTime <= updateTime && result["version"] === String(updateTime), "native document clock relation differs");
  const titleFoldCandidates: ("default" | "turkish-azeri")[] = [];
  if (result["title"] === metadata.title.toLowerCase()) { titleFoldCandidates.push("default"); }
  if (result["title"] === metadata.title.replaceAll("I", "\u0131").toLowerCase()) { titleFoldCandidates.push("turkish-azeri"); }
  need(titleFoldCandidates.length > 0, "native title folding differs");
  const output: CurrentFootprintCopyV2NativeResult = freezeDeep({ profile: "private.current-footprint-copy-v2-native-result.v1",
    returnedUuid: uuid, envelope: { success: true, result }, serializedEnvelope: captured.text,
    serializedEnvelopeSha256: sha256Text(captured.text), serializedEnvelopeBytes: captured.bytes,
    titleFoldCandidates, suppliedResultRelationVerified: true, ...omitted });
  originals.set(output, plan); return output;
}

export function assertCurrentFootprintCopyV2NativeResultInputs(result: CurrentFootprintCopyV2NativeResult,
  plan: CurrentFootprintCopyV2Plan): void {
  currentFootprintCopyV2Rows(plan); need(originals.get(result) === plan, "original result and copy plan required");
}
