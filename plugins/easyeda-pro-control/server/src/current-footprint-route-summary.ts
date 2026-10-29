/** Bounded inspect projection. Complete original observations stay in their
 * retained owner; digests describe canonical JSON, never native raw-frame bytes. */
import { types } from "node:util";
import { canonicalJson, sha256Text } from "./core.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const CURRENT_FOOTPRINT_ROUTE_SUMMARY_BYTES = 128 * 1024;
const MAX_ORIGINAL_BYTES = 64 * 1024 * 1024;
function fail(): never { throw new Error("FOOTPRINT_ROUTE_SUMMARY_BOUND"); }
function capture(input: unknown): unknown {
  let nodes = 0, reservedBytes = 0;
  const reserve = (bytes: number): void => { reservedBytes += bytes; if (reservedBytes > MAX_ORIGINAL_BYTES) { fail(); } };
  const active = new Set<object>();
  const visit = (value: unknown, depth: number): unknown => {
    nodes += 1; if (nodes > 1_000_000 || depth > 32) { return fail(); }
    if (value === null || typeof value === "boolean") { reserve(value === null ? 4 : 5); return value; }
    if (typeof value === "number") { if (!Number.isFinite(value) || Object.is(value, -0)) { return fail(); } reserve(32); return value; }
    if (typeof value === "string") { if (value.length > 20 * 1024 * 1024 || !value.isWellFormed()) { return fail(); } reserve(Buffer.byteLength(JSON.stringify(value))); return value; }
    if (typeof value !== "object" || types.isProxy(value) || active.has(value)) { return fail(); }
    active.add(value);
    const own = (key: string): unknown => {
      const descriptor = Object.getOwnPropertyDescriptor(value, key);
      if (descriptor === undefined || !Object.hasOwn(descriptor, "value") || descriptor.enumerable !== true) { return fail(); }
      return descriptor.value as unknown;
    };
    let result: unknown;
    if (Array.isArray(value)) {
      if (Object.getPrototypeOf(value) !== Array.prototype || value.length > 100_000 || Reflect.ownKeys(value).length !== value.length + 1) { return fail(); }
      reserve(2 + value.length);
      result = Array.from({ length: value.length }, (_, index) => visit(own(String(index)), depth + 1));
    } else {
      const prototype: unknown = Object.getPrototypeOf(value);
      const keys = Reflect.ownKeys(value);
      if (prototype !== Object.prototype && prototype !== null || keys.length > 4096) { return fail(); }
      reserve(2 + keys.length);
      const object: Record<string, unknown> = {};
      for (const key of keys) {
        if (typeof key !== "string" || key.length > 256 || !key.isWellFormed()) { return fail(); }
        reserve(Buffer.byteLength(JSON.stringify(key)) + 1);
        Object.defineProperty(object, key, { value: visit(own(key), depth + 1), enumerable: true });
      }
      result = object;
    }
    active.delete(value); return result;
  };
  return visit(input, 0);
}

export function publicCurrentFootprintRouteSummary(input: unknown): Readonly<Record<string, unknown>> | null {
  if (input === null) { return null; }
  const original = capture(input); const encoded = canonicalJson(original);
  const jsonBytes = Buffer.byteLength(encoded); if (jsonBytes > MAX_ORIGINAL_BYTES) { return fail(); }
  const replyDigests: { sha256: string; jsonBytes: number }[] = [];
  const digestIndices = new Map<string, number>();
  const replyGroups: { path: string; indexes: number[] }[] = [];
  const statuses: { path: string; value: boolean | number }[] = [];
  const visit = (value: unknown, path: string, depth: number): void => {
    if (value === null || typeof value !== "object" || Array.isArray(value)) { return; }
    for (const [key, item] of Object.entries(value)) {
      const selected = path.length === 0 ? key : `${path}.${key}`;
      if (typeof item === "boolean" || typeof item === "number" && Number.isSafeInteger(item)) {
        if (depth <= 5) { statuses.push({ path: selected, value: item }); }
      } else if (Array.isArray(item) && /(?:^replies$|Replies$)/u.test(key)) {
        const indexes = item.map(reply => {
          const text = canonicalJson(reply); const sha256 = sha256Text(text);
          let index = digestIndices.get(sha256);
          if (index === undefined) {
            if (replyDigests.length >= 2048) { return fail(); }
            index = replyDigests.length; digestIndices.set(sha256, index); replyDigests.push({ sha256, jsonBytes: Buffer.byteLength(text) });
          }
          return index;
        });
        replyGroups.push({ path: selected, indexes });
      } else { visit(item, selected, depth + 1); }
      if (statuses.length > 512 || replyGroups.length > 128) { fail(); }
    }
  };
  visit(original, "", 0);
  const result = { schema: "easyeda-pro-control.footprint-route-retained-summary.v1", summaryOnly: true,
    fullObservationRetainedInOriginalOwner: true, fullObservationPersisted: false, rawRepliesInline: false,
    jsonBytes, sha256: sha256Text(encoded), digestEncoding: "canonical-json-utf8", statuses, replyDigests, replyGroups,
    originalOwnerAuthority: false, executionAuthorized: false, saveAuthorized: false };
  if (Buffer.byteLength(canonicalJson(result)) > CURRENT_FOOTPRINT_ROUTE_SUMMARY_BYTES) { return fail(); }
  return freezeDeep(result);
}
