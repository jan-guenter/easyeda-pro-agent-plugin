import { canonicalJson, isRecord, sha256Json } from "./core.ts";
import type { NativeSourceSnapshot } from "./document-source.ts";

/** Pinned bR.correctEmptyNet sets tolerance to "default", whose encoder
 * emits the target-bearing tuple rather than omitting the prior null value.
 * This constructs an explicit intended effect, never normalizes readback.
 */
export function expectedNativeEmptyNetDefault(source: NativeSourceSnapshot): NativeSourceSnapshot {
  if (source.schema !== "easyeda-pro-control.document-source.v1" || source.sha256 !== sha256Json({ schema: source.schema, document: source.document, objects: source.objects })) { throw new Error("Invalid native empty-net source commitment."); }
  const id = '["RULE_SELECTOR",["NET",""]]';
  const target = source.objects.find((record) => record.id === id);
  if (target === undefined) { throw new Error("Missing reviewed native empty-net selector baseline."); }
  const keys = target.body["ruleKeyValue"];
  if (target.type !== "RULE_SELECTOR" || target.body["ruleOrder"] !== 4 || !isRecord(keys)) { throw new Error("Unknown native empty-net selector shape."); }
  const expectedKeys = { NET_LENGTH_TOLERANCE: ["default", null] };
  if (canonicalJson(keys) === canonicalJson(expectedKeys)) { return source; }
  if (canonicalJson(keys) !== "{}" || canonicalJson(target.body["copperValue"]) !== "{}" || canonicalJson(target.body["innerPlaneValue"]) !== "{}") { throw new Error("Native empty-net correction would alter unreviewed overrides."); }
  const changed = { ...target, body: { ...target.body, ruleKeyValue: expectedKeys } };
  const value = { schema: source.schema, document: source.document, objects: source.objects.map((record) => record === target ? changed : record) };
  return { ...value, sha256: sha256Json(value) };
}
