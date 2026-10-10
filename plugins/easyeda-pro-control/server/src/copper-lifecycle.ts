import { canonicalJson, isRecord, sha256Json } from "./core.ts";
import { parseDocumentSource } from "./document-source.ts";
import type { NativeSourceObject, NativeSourceSnapshot } from "./document-source.ts";

export const COPPER_LIFECYCLE_PROFILE = "easyeda-pro-control.poured-arc-roundtrip.v1";
const MAX_ULPS = 4n;
const MAX_COORDINATE = 1_000_000;
interface Difference {
  readonly recordId: string;
  readonly copperId: string;
  readonly pathIndex: number;
  readonly operandIndex: number;
  readonly role: "arc-angle" | "arc-coordinate";
  readonly before: number;
  readonly after: number;
  readonly ulps: number;
  readonly absoluteDifference: number;
}
function same(left: unknown, right: unknown): boolean { return canonicalJson(left) === canonicalJson(right); }
function invalid(message: string): never { throw new Error(`Copper lifecycle: ${message}`); }
function checked(source: NativeSourceSnapshot): Map<string, NativeSourceObject> {
  if (source.schema !== "easyeda-pro-control.document-source.v1" || source.document["docType"] !== "PCB" || source.document["editVersion"] !== "3.2.149.88089769" ||
      source.sha256 !== sha256Json({ schema: source.schema, document: source.document, objects: source.objects }) || source.objects.length > 500_000) { return invalid("source commitment or pinned document profile changed."); }
  const objects = new Map(source.objects.map((entry) => [entry.id, entry]));
  if (objects.size !== source.objects.length) { return invalid("duplicate record identity."); }
  return objects;
}
function finite(value: unknown): number {
  if (typeof value !== "number" || !Number.isFinite(value)) { return invalid("path operand is not finite."); }
  return value;
}
function coordinate(value: unknown): void {
  if (Math.abs(finite(value)) > MAX_COORDINATE) { invalid("coordinate exceeds the reviewed roundtrip profile."); }
}
/** Native Ru(path) constructs ARC centers/angles; rf(pls) recomputes only arc
 * starts, terminal arc ends and sweep angles. Straight endpoints stay exact.
 * Unknown commands and degeneracy-changing arcs receive no tolerance.
 */
function arcOperands(path: readonly unknown[]): Map<number, Difference["role"]> {
  const eligible = new Map<number, Difference["role"]>();
  if (path.length < 6 || path.length > 200_000) { return invalid("unsupported changed path length."); }
  coordinate(path[0]); coordinate(path[1]);
  let position = 2;
  let previousPoint = 0;
  let lineMode = false;
  while (position < path.length) {
    const command = path[position];
    if (command === "ARC") {
      const angle = finite(path[position + 1]);
      if (Math.abs(angle) < 6 || Math.abs(angle) >= 360 || position + 3 >= path.length) { return invalid("arc degeneracy or full-circle conversion is outside this profile."); }
      coordinate(path[position + 2]); coordinate(path[position + 3]);
      if (path[previousPoint] === path[position + 2] && path[previousPoint + 1] === path[position + 3]) { return invalid("degenerate arc."); }
      eligible.set(previousPoint, "arc-coordinate"); eligible.set(previousPoint + 1, "arc-coordinate");
      eligible.set(position + 1, "arc-angle");
      if (position + 4 === path.length) { eligible.set(position + 2, "arc-coordinate"); eligible.set(position + 3, "arc-coordinate"); }
      previousPoint = position + 2; position += 4; lineMode = false;
    } else {
      if (command === "L") { position += 1; lineMode = true; }
      else if (!lineMode || typeof command !== "number") { return invalid("unreviewed changed path command."); }
      coordinate(path[position]); coordinate(path[position + 1]);
      previousPoint = position; position += 2;
    }
  }
  if (position !== path.length) { return invalid("incomplete path operands."); }
  return eligible;
}
function ulpDistance(before: number, after: number): number {
  if (!Number.isFinite(before) || !Number.isFinite(after) || Math.sign(before) !== Math.sign(after) || before === 0 || after === 0) { return invalid("nonfinite, zero-crossing or sign-changing operand."); }
  const data = new DataView(new ArrayBuffer(16));
  data.setFloat64(0, before); data.setFloat64(8, after);
  const left = data.getBigUint64(0), right = data.getBigUint64(8);
  const difference = left > right ? left - right : right - left;
  if (difference > MAX_ULPS) { return invalid("arc operand exceeds the fixed four-ULP reload bound."); }
  return Number(difference);
}
function comparePath(oldPath: unknown, newPath: unknown, recordId: string, copperId: string, pathIndex: number): Difference[] {
  if (same(oldPath, newPath)) { return []; }
  if (!Array.isArray(oldPath) || !Array.isArray(newPath) || oldPath.length !== newPath.length) { return invalid("path structure changed."); }
  const eligible = arcOperands(oldPath);
  arcOperands(newPath);
  const differences: Difference[] = [];
  for (let index = 0; index < oldPath.length; index += 1) {
    const oldValue: unknown = oldPath[index];
    const newValue: unknown = newPath[index];
    if (!same(oldValue, newValue)) {
      const role = eligible.get(index);
      if (role === undefined || typeof oldValue !== "number" || typeof newValue !== "number") { return invalid("non-arc operand or path command changed."); }
      differences.push({ recordId, copperId, pathIndex, operandIndex: index, role, before: oldValue, after: newValue,
        ulps: ulpDistance(oldValue, newValue), absoluteDifference: Math.abs(oldValue - newValue) });
      if (differences.length > 10_000) { return invalid("roundtrip difference report exceeds its bound."); }
    }
  }
  return differences;
}
function comparePoured(left: NativeSourceObject, right: NativeSourceObject): Difference[] {
  const oldFills = left.body["pourFill"];
  const newFills = right.body["pourFill"];
  if (!same({ ...left.body, pourFill: null }, { ...right.body, pourFill: null }) || !Array.isArray(oldFills) || !Array.isArray(newFills) || oldFills.length !== newFills.length || oldFills.length > 100_000) { return invalid("derived record fields or child count changed."); }
  const differences: Difference[] = [];
  const identities = new Set<string>();
  for (let fillIndex = 0; fillIndex < oldFills.length; fillIndex += 1) {
    const oldFill: unknown = oldFills[fillIndex];
    const newFill: unknown = newFills[fillIndex];
    if (!isRecord(oldFill) || !isRecord(newFill) || typeof oldFill["id"] !== "string" || identities.has(oldFill["id"]) ||
        !same({ ...oldFill, path: null }, { ...newFill, path: null }) || !Array.isArray(oldFill["path"]) || !Array.isArray(newFill["path"]) || oldFill["path"].length !== newFill["path"].length) { return invalid("copper identity, width, style or path count changed."); }
    identities.add(oldFill["id"]);
    for (let pathIndex = 0; pathIndex < oldFill["path"].length; pathIndex += 1) {
      differences.push(...comparePath(oldFill["path"][pathIndex], newFill["path"][pathIndex], left.id, oldFill["id"], pathIndex));
      if (differences.length > 10_000) { return invalid("roundtrip difference report exceeds its bound."); }
    }
  }
  return differences;
}

/** Comparison only: never normalizes stored/exported geometry or its hashes.
 * The four-ULP bound is an intentionally narrow admission profile, not an
 * error theorem for arbitrary native geometry. It cannot accumulate per load.
 */
export function verifyCopperLifecycleEquivalence(reference: NativeSourceSnapshot, observed: NativeSourceSnapshot): Record<string, unknown> {
  const oldRecords = checked(reference);
  const newRecords = checked(observed);
  if (!same(reference.document, observed.document) || !same([...oldRecords.keys()].toSorted(), [...newRecords.keys()].toSorted())) { return invalid("document or record identities changed."); }
  const differences: Difference[] = [];
  for (const [id, oldRecord] of oldRecords) {
    const newRecord = newRecords.get(id);
    if (newRecord === undefined || oldRecord.type !== newRecord.type) { return invalid("record type changed."); }
    if (!same(oldRecord, newRecord)) {
      if (oldRecord.type !== "POURED") { return invalid("non-derived record changed."); }
      const parents = [...oldRecords.values()].filter((record) => record.type === "POUR" && id === JSON.stringify(["POURED", record.id]));
      if (parents.length !== 1) { return invalid("derived parent identity is not exact."); }
      differences.push(...comparePoured(oldRecord, newRecord));
      if (differences.length > 10_000) { return invalid("roundtrip difference report exceeds its bound."); }
    }
  }
  return { profile: COPPER_LIFECYCLE_PROFILE, exact: differences.length === 0, referenceSha256: reference.sha256, observedSha256: observed.sha256,
    maxUlps: Number(MAX_ULPS), differenceCount: differences.length, differences, scope: "poured-arc-operands-only-from-fixed-persisted-reference" };
}

export function verifyCopperSaveAcknowledgment(ack: unknown, afterPhase: unknown, expected: NativeSourceSnapshot): void {
  if (!isRecord(afterPhase) || !isRecord(afterPhase["payload"]) || typeof afterPhase["payload"]["source"] !== "string" ||
      parseDocumentSource(afterPhase["payload"]["source"]).sha256 !== expected.sha256 || !isRecord(afterPhase["payload"]["read_consistency"])) { return invalid("saved phase is not bound to the verified source."); }
  const consistency = afterPhase["payload"]["read_consistency"];
  if (consistency["stable"] !== true || typeof consistency["snapshotSha256"] !== "string" || !/^[a-f0-9]{64}$/u.test(consistency["snapshotSha256"])) { return invalid("saved phase lacks exact read commitment."); }
  if (!isRecord(ack) || ack["ok"] !== true || ack["saved"] !== true || ack["closed"] !== true || ack["reopened"] !== true || !isRecord(ack["document"]) ||
      ack["document"]["uuid"] !== expected.document["uuid"] || ack["document"]["documentType"] !== 3 || !isRecord(ack["exactSaveGuard"])) { return invalid("retained save/reopen acknowledgment is incomplete."); }
  const guard = ack["exactSaveGuard"];
  if (guard["passes"] !== 2 || guard["saveInvokedInSameExecution"] !== true || guard["publicCompareAndSwapAvailable"] !== false ||
      !same(guard["labels"], ["pcb-source"]) || !same(guard["snapshotSha256"], [consistency["snapshotSha256"]])) { return invalid("retained save guard is not bound to the verified after phase."); }
}
