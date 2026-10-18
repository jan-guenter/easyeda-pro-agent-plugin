import assert from "node:assert/strict";
import { test } from "node:test";
import { CURRENT_SCHEMATIC_RENAME_OBSERVATION_LIMITATIONS, compareCurrentSchematicRenameObservation,
  decodeCurrentSchematicRenameObservation, validateCurrentSchematicRenameObservation } from "../src/current-schematic-rename-observation.ts";
import { CURRENT_SCHEMATIC_RENAME_PREFLIGHT_MAX_BYTES } from "../src/current-schematic-rename-preflight.ts";
import { PAYLOAD, REQUEST, encoded, schematicBaseline } from "./helpers/current-schematic-rename-observer-fixture.ts";
import { inventory } from "./helpers/symbol-sql-fixture.ts";

void test("SCH observation compares complete original historical SQL without granting native authority", async () => {
  const { before, metadata } = await schematicBaseline(), value = decodeCurrentSchematicRenameObservation(encoded(), metadata.request);
  const compared = compareCurrentSchematicRenameObservation(metadata, before, value);
  assert.deepEqual(value.peers, metadata.peers); assert.equal(compared["historicalMetadataMatched"], true);
  assert.equal(compared["sqlSha256"], before.logicalSha256); assert.equal(compared["projectionSha256"], metadata.projectionSha256);
  assert.ok(Object.isFrozen(value.peers)); assert.ok(Object.isFrozen(value.runtimeObservation.clockSamples)); assert.ok(Object.isFrozen(compared));
  for (const key of Object.keys(CURRENT_SCHEMATIC_RENAME_OBSERVATION_LIMITATIONS)) { assert.equal(Reflect.get(value, key), false); assert.equal(compared[key], false); }
  // Historical equality deliberately does not bind a present backend actor,
  // Client, queue or clock: this remains a comparison of supplied data.
  assert.doesNotThrow(() => compareCurrentSchematicRenameObservation(metadata, before, { ...PAYLOAD,
    clientTicketObservation: { ...PAYLOAD.clientTicketObservation, client: "f".repeat(16) },
    runtimeObservation: { ...PAYLOAD.runtimeObservation, actor: { ...PAYLOAD.runtimeObservation.actor, uuid: "a".repeat(32) } } }));
});
void test("SCH comparison rejects copied reader/projection identities and complete peer or ticket drift", async () => {
  const { before, metadata, path } = await schematicBaseline(), sameContent = await inventory(path);
  for (const reader of [structuredClone(before), sameContent]) { assert.throws(() => compareCurrentSchematicRenameObservation(metadata, reader, PAYLOAD), /original SQL metadata/u); }
  assert.throws(() => compareCurrentSchematicRenameObservation(structuredClone(metadata), before, PAYLOAD), /original SQL metadata/u);
  for (const value of [{ ...PAYLOAD, peers: PAYLOAD.peers.slice(0, 1) },
    { ...PAYLOAD, peers: PAYLOAD.peers.map((peer, index) => index === 1 ? { ...peer, version: "changed" } : peer) },
    { ...PAYLOAD, clientTicketObservation: { ...PAYLOAD.clientTicketObservation, maxTicket: 101 } }]) {
    assert.throws(() => compareCurrentSchematicRenameObservation(metadata, before, value), /complete original SQL/u);
  }
});
void test("SCH decoder refuses authority promotion, malformed rosters and unbounded or pending envelopes", () => {
  for (const key of Object.keys(CURRENT_SCHEMATIC_RENAME_OBSERVATION_LIMITATIONS)) {
    assert.throws(() => decodeCurrentSchematicRenameObservation(encoded({ ...PAYLOAD, [key]: true }), REQUEST));
  }
  for (const value of [{ ...PAYLOAD, extra: true }, { ...PAYLOAD, desiredTitle: "Different" }, { ...PAYLOAD, peers: [] },
    { ...PAYLOAD, peers: PAYLOAD.peers.toReversed() }, { ...PAYLOAD, peers: [PAYLOAD.peers[0], PAYLOAD.peers[0]] },
    { ...PAYLOAD, peers: PAYLOAD.peers.map(peer => ({ ...peer, name: "renamed sch", displayName: "Renamed SCH" })) },
    { ...PAYLOAD, clientTicketObservation: { ...PAYLOAD.clientTicketObservation, maxTicket: 0 } },
    { ...PAYLOAD, runtimeObservation: { ...PAYLOAD.runtimeObservation, clockProducerOwnershipVerified: true } }]) {
    assert.throws(() => decodeCurrentSchematicRenameObservation(encoded(value), REQUEST));
  }
  assert.throws(() => decodeCurrentSchematicRenameObservation({ pending: true }, REQUEST));
  assert.throws(() => decodeCurrentSchematicRenameObservation(encoded({ extra: "x".repeat(CURRENT_SCHEMATIC_RENAME_PREFLIGHT_MAX_BYTES) }), REQUEST));
});
void test("SCH decoder copies own data without accessors, exotic prototypes, symbols or sparse arrays", () => {
  let accessed = false; const get = (): never => { accessed = true; throw new Error("getter invoked"); };
  const peers = [...PAYLOAD.peers]; Object.defineProperty(peers, "0", { get });
  const sparse: unknown[] = []; sparse.length = 2;
  const exotic: unknown = Object.setPrototypeOf({ ...PAYLOAD }, { inherited: true });
  for (const value of [Object.defineProperty({ ...PAYLOAD }, "peers", { get }), { ...PAYLOAD, peers }, { ...PAYLOAD, peers: sparse },
    { ...PAYLOAD, [Symbol("private")]: true }, exotic]) {
    assert.throws(() => validateCurrentSchematicRenameObservation(REQUEST, value));
  }
  assert.throws(() => decodeCurrentSchematicRenameObservation(Object.defineProperty({}, "structuredContent", { get }), REQUEST));
  assert.equal(accessed, false);
});
void test("SCH observation refuses request, payload and envelope proxies without invoking traps", () => {
  let traps = 0;
  const trap = (): never => { traps += 1; throw new Error("proxy trap invoked"); };
  const proxied = <T extends object>(value: T): T => new Proxy(value, {
    get: trap, getPrototypeOf: trap, ownKeys: trap, getOwnPropertyDescriptor: trap,
  });
  for (const value of [proxied(PAYLOAD), { ...PAYLOAD, peers: proxied(PAYLOAD.peers) },
    { ...PAYLOAD, runtimeObservation: proxied(PAYLOAD.runtimeObservation) }]) {
    assert.throws(() => validateCurrentSchematicRenameObservation(REQUEST, value), /plain own data required/u);
  }
  for (const request of [proxied(REQUEST), { ...REQUEST, target: proxied(REQUEST.target) }]) {
    assert.throws(() => validateCurrentSchematicRenameObservation(request, PAYLOAD), /plain own data required/u);
  }
  const envelope = encoded(); assert.ok(envelope !== null && typeof envelope === "object");
  assert.throws(() => decodeCurrentSchematicRenameObservation(proxied(envelope), REQUEST), /plain own data required/u);
  const revoked = Proxy.revocable(PAYLOAD, {}); revoked.revoke();
  assert.throws(() => validateCurrentSchematicRenameObservation(REQUEST, revoked.proxy), /plain own data required/u);
  assert.equal(traps, 0);
});
