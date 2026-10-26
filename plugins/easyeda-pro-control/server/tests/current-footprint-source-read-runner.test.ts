/** Synthetic complete SQLite inputs and original host callbacks. No connected
 * EasyEDA admission, native cache availability or writer support is claimed. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { prepareCurrentFootprintSourcePlan } from "../src/current-footprint-source-plan.ts";
import { CurrentFootprintSourceReadRunner, currentFootprintSourceReadPacketSchema } from "../src/current-footprint-source-read-runner.ts";
import type { CurrentFootprintCopySourceReadTransport } from "../src/current-footprint-copy-source-read-runner.ts";
import { currentFootprintCopyStatePacketSchema } from "../src/current-footprint-copy-state.ts";
import { IDS, encrypted, fixture, inventory, mutate } from "./helpers/symbol-sql-fixture.ts";

const CLIENT = "a".repeat(16), PROJECT = "1".repeat(64);
const IDENTITY = Object.freeze({ projectUuid: PROJECT, branchUuid: IDS.branch, windowTabId: "synthetic-window" });
const REQUEST = Object.freeze({ identity: IDENTITY, footprintUuid: IDS.target, client: CLIENT, maximumTicket: 100 });
const STATE = currentFootprintCopyStatePacketSchema.parse({ profile: "private.current-footprint-copy-state.v1", identity: IDENTITY,
  client: CLIENT, maximumTicket: 100, capturedUser: "own-undefined", samples: 2, originalConstructorManagerMatched: true,
  atomicSnapshotVerified: false, cacheBranchObserved: false, executionAuthorized: false, persistenceVerified: false });
const USER = Object.freeze({ uuid: IDS.actor, username: "synthetic", nickname: "", avatar: "local-avatar" });
const META = Object.freeze({ title: "Source", description: "Keep", tags: [], source: "" });
function head(ticket: number, updateTime: number): string {
  return `${JSON.stringify({ type: "DOCHEAD", ticket })}||${JSON.stringify({ docType: "FOOTPRINT", client: CLIENT, uuid: IDS.target,
    updateTime, version: String(updateTime), editVersion: "3.2.209", user: USER })}`;
}
function row(type: string, ticket: number, id: string, body: unknown, firstTicket?: number): string {
  return `${JSON.stringify({ type, ticket, id, ...(firstTicket === undefined ? {} : { firstTicket }) })}||${body === null ? "" : JSON.stringify(body)}`;
}
const CANVAS = row("CANVAS", 2, "CANVAS", { originX: 0 });
const TOMBSTONE = row("POLY", 4, "deleted", null, 3);
const PAD = row("PAD", 91, "pad", { number: "1", unknownField: [1, 2] });
const SOURCE = [head(101, 200), row("META", 91, "META", META), head(100, 200), CANVAS, TOMBSTONE, PAD].join("|\n");
const REORDERED = [head(101, 200), row("META", 91, "META", META), head(100, 200), PAD, CANVAS, TOMBSTONE].join("|\n");
function stateReply(): unknown {
  return { result: { type: "string", value: JSON.stringify({ schema: "easyeda-pro-control.current-footprint-copy-state.v1",
    identity: IDENTITY, client: CLIENT, maximumTicket: 100, capturedUser: "own-undefined" }) } };
}
function sourceReply(content: string, extra: Readonly<Record<string, unknown>> = {}): unknown {
  return { result: { type: "string", value: JSON.stringify({ schema: "easyeda-pro-control.current-footprint-copy-source-read.v1",
    ...REQUEST, capturedUser: "own-undefined", content, route: "native-cache-equivalent", sourceGetterDispatched: false,
    cacheRead: { keys: 2, bytes: 2048, atoms: 3 }, cacheWrites: 0, networkRequests: 0,
    cacheEffectsPossible: false, executionAuthorized: false, persistenceVerified: false, ...extra }) } };
}
async function prepared(): Promise<Awaited<ReturnType<typeof prepareCurrentFootprintSourcePlan>>> {
  const db = await fixture({ project: PROJECT, branch: IDS.branch, target: IDS.target });
  const raw = [
    `${JSON.stringify({ type: "EDIT_HEAD" })}||${JSON.stringify({ uuid: IDS.actor, username: "synthetic", nickname: "", updateTime: 100 })}`,
    head(80, 100), row("META", 90, "META", META), CANVAS, row("POLY", 3, "deleted", { shape: "old" }),
    head(100, 200), row("POLY", 4, "deleted", null), PAD,
  ].join("|\n");
  mutate(db.path, `UPDATE history_data SET dataStr='${encrypted(raw, IDS.oldHead, IDS.oldKey)}' WHERE uuid='${IDS.oldHead}'`);
  return prepareCurrentFootprintSourcePlan(await inventory(db.path), { projectUuid: PROJECT, branchUuid: IDS.branch, footprintUuid: IDS.target });
}
async function owned(options: Readonly<{ first?: string; second?: string; extra?: Readonly<Record<string, unknown>> }> = {}): Promise<Readonly<{
  runner: CurrentFootprintSourceReadRunner; transport: CurrentFootprintCopySourceReadTransport; calls: string[];
  plan: Awaited<ReturnType<typeof prepared>>; expire: () => void;
}>> {
  const calls: string[] = [], plan = await prepared(); let current = true, sources = 0;
  const transport: CurrentFootprintCopySourceReadTransport = {
    assertOriginalState: async state => { await Promise.resolve(); assert.equal(state, STATE); assert.ok(current, "owner lost"); },
    observeState: async (): Promise<unknown> => { calls.push("state"); await Promise.resolve(); return stateReply(); },
    readSource: async request => {
      calls.push("source"); assert.deepEqual(request, REQUEST); sources += 1; await Promise.resolve();
      return sourceReply(sources === 1 ? options.first ?? SOURCE : options.second ?? options.first ?? SOURCE, options.extra);
    },
  };
  return { runner: new CurrentFootprintSourceReadRunner(transport, STATE, plan), transport, calls, plan, expire: () => { current = false; } };
}

void test("source-only runner retains paired native order and verifies all keyed records including tombstones", async () => {
  for (const first of [SOURCE, REORDERED]) {
    const selected = await owned({ first });
    const packet = await selected.runner.observe();
    assert.equal(packet.content, first); assert.equal(packet.exactKeyedSourceVerified, true);
    assert.equal(packet.checkpointByteOrderMatched, false); assert.equal(packet.nativeOrderStable, true);
    assert.equal(packet.canvasRecords, 3); assert.equal(packet.tombstones, 1);
    assert.equal(packet.executionAuthorized, false); assert.equal(packet.persistenceVerified, false);
    assert.equal(Object.hasOwn(packet, "sourceGetterEquivalent"), false);
    assert.deepEqual(selected.calls, ["state", "source", "state", "state", "source", "state"]);
    assert.deepEqual(currentFootprintSourceReadPacketSchema.parse(packet), packet);
    assert.equal(await selected.runner.requireOriginal(packet), packet);
    await assert.rejects(selected.runner.observe(), /consumed/u);
    await assert.rejects(selected.runner.requireOriginal(structuredClone(packet)), /original/u);
  }
});
void test("source-only runner consumes mismatched bodies and changing native insertion order", async () => {
  for (const options of [{ first: SOURCE.replace('"number":"1"', '"number":"2"') }, { second: REORDERED }]) {
    const selected = await owned(options);
    await assert.rejects(selected.runner.observe(), /source|differ|record/iu);
    assert.equal(selected.runner.status().phase, "failed");
    assert.ok(selected.runner.retainedReplies().length >= 2);
    await assert.rejects(selected.runner.observe(), /consumed/u);
  }
});
void test("source-only runner rejects vendor-getter replies, forged plans and changed original callbacks", async () => {
  const direct = await owned({ extra: { route: "native-get-str", sourceGetterDispatched: true, cacheEffectsPossible: true,
    cacheRead: undefined, cacheWrites: undefined, networkRequests: undefined } });
  await assert.rejects(direct.runner.observe(), /source-only/u);
  const selected = await owned();
  assert.throws(() => new CurrentFootprintSourceReadRunner(selected.transport, STATE, structuredClone(selected.plan)), /original/u);
  Object.defineProperty(selected.transport, "readSource", { value: (): Promise<unknown> => Promise.resolve(sourceReply(SOURCE)) });
  await assert.rejects(selected.runner.observe(), /transport changed/u); assert.deepEqual(selected.calls, []);
  const lost = await owned(); lost.expire();
  await assert.rejects(lost.runner.observe(), /owner lost/u); assert.deepEqual(lost.calls, []);
});
void test("source-only packet refuses elevated order, execution and cache claims", async () => {
  const selected = await owned();
  const packet = await selected.runner.observe();
  for (const patch of [{ checkpointByteOrderMatched: true }, { nativeOrderStable: false }, { exactKeyedSourceVerified: false },
    { sourceGetterEquivalent: true }, { executionAuthorized: true }, { persistenceVerified: true }, { cacheWrites: 1 },
    { sourceGetterDispatched: true }, { content: `${packet.content} ` }, { canvasRecords: 2 }, { tombstones: 4 }]) {
    assert.equal(currentFootprintSourceReadPacketSchema.safeParse({ ...packet, ...patch }).success, false);
  }
});
