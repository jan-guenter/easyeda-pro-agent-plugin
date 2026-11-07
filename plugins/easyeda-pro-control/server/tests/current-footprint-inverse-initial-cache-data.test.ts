/** Pinned parser plus exact own-descriptor encoder only. No app or cache IO. */
import assert from "node:assert/strict";
import { Script } from "node:vm";
import { test } from "node:test";
import { sha256Text } from "../src/core.ts";
import { deriveCurrentFootprintInverseInitialCacheData } from "../src/current-footprint-inverse-initial-cache-data.ts";
import { CURRENT_FOOTPRINT_INVERSE_INITIAL_HEAD_ENCODER } from "../src/current-footprint-inverse-initial-cache-programs.ts";
import { CURRENT_GENERATED_INITIAL_DATA_ENCODER } from "../src/current-generated-initial-cache-programs.ts";
import { deriveCurrentFootprintSavedFlowCacheData } from "../src/current-footprint-saved-flow-cache-data.ts";

const branchUuid = "b".repeat(32), historyUuid = "c".repeat(32), projectUuid = "a".repeat(64);
const line = (type: string, body: unknown, extra: object = {}): string => `${JSON.stringify({ type, ...extra })}||${JSON.stringify(body)}|\n`;
function fixture(): ReturnType<typeof deriveCurrentFootprintSavedFlowCacheData> {
  const plaintext = line("EDIT_HEAD", { uuid: "actor", updateTime: 1000 }) + Array.from({ length: 17 }, (_, index) => {
    const uuid = (index + 1).toString(16).padStart(16, "0");
    return line("DOCHEAD", { uuid, docType: "FOOTPRINT", client: "native" }, { ticket: 1 }) + line("META", { title: `Footprint ${String(index)}` }, { id: "META", ticket: index + 2 });
  }).join("");
  return deriveCurrentFootprintSavedFlowCacheData({ projectUuid, branchUuid, headHistoryUuid: historyUuid,
    heads: [{ id: 1, uuid: historyUuid, parent: null, key: "d".repeat(32), is_lock: 1, num: 0, snapshot_num: 0, created_at: null, updated_at: null, lock_time: null }], chunks: [{ historyUuid, ordinal: 0, plaintext, plaintextSha256: sha256Text(plaintext) }] });
}
const own = 'const bad=()=>{throw new Error("inert head graph refusal")},seen=[];const own=(o,k)=>{const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,"value"))bad();seen.push(d);return d.value;};';
function encoder(program: string, text: string, limits: ReturnType<typeof deriveCurrentFootprintInverseInitialCacheData>["headLimits"], change = ""): unknown {
  const source = `(()=>{const value=JSON.parse(payload);${own}const nodes=${String(limits.nodes)},depthLimit=${String(limits.depth)},arrayLimit=${String(limits.array)},keyLimit=${String(limits.keys)},stringLimit=${String(limits.string)};${change}${program};return encode(value,0);})()`;
  return new Script(source).runInNewContext({ payload: text }, { timeout: 1000, contextCodeGeneration: { strings: false, wasm: false } });
}
void test("inverse full saved footprint head derives exact limits beyond generated array4", () => {
  const source = fixture(); const data = deriveCurrentFootprintInverseInitialCacheData(source);
  assert.equal(data.jobs.length, 2); assert.equal(data.jobs[0]?.kind, "flow"); assert.ok(data.jobs[0]?.key.endsWith("-FOOTPRINT")); assert.equal(data.headLimits.array, 17);
  assert.equal(data.cacheContinuationAuthorized, false); assert.equal(encoder(CURRENT_FOOTPRINT_INVERSE_INITIAL_HEAD_ENCODER, source.headIndex.body, data.headLimits), source.headIndex.body);
  assert.throws(() => encoder(CURRENT_GENERATED_INITIAL_DATA_ENCODER, source.headIndex.body, data.headLimits));
  assert.throws(() => encoder(CURRENT_FOOTPRINT_INVERSE_INITIAL_HEAD_ENCODER, source.headIndex.body, { ...data.headLimits, nodes: data.headLimits.nodes - 1 }));
  assert.throws(() => deriveCurrentFootprintInverseInitialCacheData({ ...source, headIndex: { ...source.headIndex, body: `${source.headIndex.body} ` } }));
});
void test("cache graph receipt rejects aliases, corruption and getter input without invoking it", () => {
  const source = fixture(); const data = deriveCurrentFootprintInverseInitialCacheData(source);
  assert.throws(() => deriveCurrentFootprintInverseInitialCacheData({ ...source, bodies: [...source.bodies, ...source.bodies] }));
  let reads = 0; assert.throws(() => deriveCurrentFootprintInverseInitialCacheData(Object.defineProperty({}, "headIndex", { get() { reads += 1; return source.headIndex; } }))); assert.equal(reads, 0);
  assert.throws(() => encoder(CURRENT_FOOTPRINT_INVERSE_INITIAL_HEAD_ENCODER, source.headIndex.body, data.headLimits, 'Object.defineProperty(value[0],"uuid",{get(){bad();}});'));
});
