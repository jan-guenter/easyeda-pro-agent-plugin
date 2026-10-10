import assert from "node:assert/strict";
import { test } from "node:test";
import { runInNewContext } from "node:vm";
import { sha256Json } from "../src/core.ts";
import { parseDocumentSource } from "../src/document-source.ts";
import { FLAT_DISPLAY_TRANSACTION_PROFILE, assertFlatDisplayBinding, assertFlatDisplayInverse, buildFlatDisplayProjectGuardExpression,
  flatDisplayOperation, prepareFlatDisplayProfile, verifyFlatDisplayObservation, verifyFlatDisplayPersistence } from "../src/flat-display-profile.ts";

import { branchUuid, context, encode, fixture, operation, ownerUuid, projectUuid, rehash, replaceSource } from "./flat-display-fixture.ts";

void test("flat display preparation binds nonempty endpoint topology, complete checkpoint and a reversible display-only effect", async () => {
  const before = fixture(), original = structuredClone(before);
  const prepared = await prepareFlatDisplayProfile({ operation, context, ...before });
  assert.deepEqual(before, original); assert.equal(prepared.binding.profile, FLAT_DISPLAY_TRANSACTION_PROFILE);
  assert.equal(prepared.binding.topology[0]?.pins[0]?.net, "SIGNAL"); assert.equal(prepared.binding.members.length, 3);
  assert.equal(prepared.binding.operationSha256, sha256Json(prepared.operation));
  assert.deepEqual(assertFlatDisplayInverse(prepared.binding, prepared.inverse), prepared.inverse);
  assert.doesNotThrow(() => { verifyFlatDisplayObservation(prepared.binding, operation, context, before.evidence, before.native, "before"); });
  const after = replaceSource(before, prepared.expectedSource, prepared.expectedNative);
  assert.doesNotThrow(() => { verifyFlatDisplayObservation(prepared.binding, operation, context, after.evidence, after.native, "after"); });
  assert.throws(() => { verifyFlatDisplayObservation(prepared.binding, operation, context, after.evidence, after.native, "before"); }, /phase source/u);
});

void test("flat display selection rejects mixed, electrical, deleting, translated and caller-supplied authority operations", () => {
  for (const step of [
    { id: "translate", action: "sch.component.translate", target: { primitiveId: "part" }, x: 10, y: 10 },
    { id: "delete", action: "sch.text.delete", target: { primitiveId: "text" } },
    { id: "wire", action: "sch.wire.delete", target: { primitiveId: "wire" } },
  ]) { assert.throws(() => flatDisplayOperation({ ...operation, operations: [...operation.operations, step] }), /display steps/u); }
  for (const extra of [{ topologyBinding: {} }, { code: "caller()" }, { profile: FLAT_DISPLAY_TRANSACTION_PROFILE }]) {
    assert.throws(() => flatDisplayOperation({ ...operation, ...extra }));
  }
});

void test("flat display refuses absent original fields, no-op, locked targets and NO_CONNECT before an inverse is admitted", async () => {
  for (const patch of [{ fontName: "Arial" }, { x: 0 }]) {
    await assert.rejects(prepareFlatDisplayProfile({ ...fixture(), context, operation: { ...operation,
      operations: [{ id: "text", action: "sch.text.display", target: { primitiveId: "text" }, patch }] } }), /complete stored-field inverse/u);
  }
  const locked = fixture(), model = locked.native.components[0]; assert.ok(model); model.locked = true;
  await assert.rejects(prepareFlatDisplayProfile({ ...locked, operation, context }), /initially locked/u);
  const marker = fixture(), page = marker.evidence.observation.pages[0]; assert.ok(page);
  const source = parseDocumentSource(page.source);
  const nextSource = parseDocumentSource(encode([...source.objects, { id: "no-connect", type: "ATTR", body: { parentId: "pin", key: "NO_CONNECT", value: "no", x: 0 } }]));
  const native = structuredClone(marker.native), pin = native.components[0]?.pins[0]; assert.ok(pin);
  pin.noConnect = { id: "no-connect", value: "no", body: { parentId: "pin", key: "NO_CONNECT", value: "no", x: 0 } }; native.source = encode(nextSource.objects);
  const observedPin = page.symbols[0]?.pins[0]; assert.ok(observedPin); observedPin.noConnectAttribute = { ...pin.noConnect, key: "NO_CONNECT" };
  const next = replaceSource(marker, nextSource, native);
  await assert.rejects(prepareFlatDisplayProfile({ ...next, context, operation: { ...operation,
    operations: [{ id: "marker", action: "sch.attribute.display", target: { primitiveId: "no-connect" }, patch: { x: 1 } }] } }), /no-connect marker/u);
});

void test("flat display binds source/native endpoint identity instead of accepting contradictory retained scalar topology", async () => {
  const wrongNet = fixture();
  const pin = wrongNet.native.components[0]?.pins[0]; assert.ok(pin); pin.net = "OTHER";
  await assert.rejects(prepareFlatDisplayProfile({ ...wrongNet, operation, context }), /native pin/u);
  const forged = fixture(); forged.evidence.proof.topology[0]?.pins.push({ pinNumber: "2", net: "FORGED" });
  await assert.rejects(prepareFlatDisplayProfile({ ...forged, operation, context }), /exact verified observation/u);
  const wrongBody = fixture();
  const terminal = wrongBody.native.components[0]?.pins[0]; assert.ok(terminal); terminal.body["x"] = 5;
  await assert.rejects(prepareFlatDisplayProfile({ ...wrongBody, operation, context }), /native pin/u);
});

void test("flat display refuses mismatched owner, branch, checkpoint and context aliases", async () => {
  for (const mutate of [
    (value: ReturnType<typeof fixture>): void => { value.evidence = { ...value.evidence, history: { ...value.evidence.history, branchUuid: "f".repeat(32) } }; },
    (value: ReturnType<typeof fixture>): void => { value.evidence = { ...value.evidence, history: { ...value.evidence.history, projectOwnerUuid: "f".repeat(32) } }; },
    (value: ReturnType<typeof fixture>): void => { value.evidence = { ...value.evidence, history: { ...value.evidence.history, checkpointSha256: "f".repeat(64) } }; },
    (value: ReturnType<typeof fixture>): void => { value.evidence = { ...value.evidence, checkpoint: { ...value.evidence.checkpoint, source: "/tmp/other.eprj2" } }; },
  ]) { const value = fixture(); mutate(value); await assert.rejects(prepareFlatDisplayProfile({ ...value, operation, context })); }
  for (const alteredContext of [
    { ...context, project: { ...context.project, projectUuid: "f".repeat(64) } },
    { ...context, document: { ...context.document, documentUuid: "other" } },
    { ...context, document: { ...context.document, parentProjectUuid: "other" } },
    { ...context, document: { ...context.document, parentLibraryUuid: "library" } },
  ]) { await assert.rejects(prepareFlatDisplayProfile({ ...fixture(), operation, context: alteredContext })); }
});

void test("flat display requires all stored target fields and every declared page", async () => {
  const value = fixture();
  const documents = structuredClone(value.evidence.history.documents), page = documents.find((document) => document.uuid === "page"), target = page?.records.find((record) => record.id === "text");
  assert.ok(target); target.body["x"] = 999;
  value.evidence = { ...value.evidence, history: rehash({ ...value.evidence.history, documents }) };
  await assert.rejects(prepareFlatDisplayProfile({ ...value, operation, context }), /baseline.*differs/u);
  const twoPages = fixture();
  const original = twoPages.evidence.history.documents.find((document) => document.uuid === "page"); assert.ok(original);
  twoPages.evidence = { ...twoPages.evidence, history: rehash({ ...twoPages.evidence.history, documents: [...twoPages.evidence.history.documents,
    { ...structuredClone(original), uuid: "page2", metadata: { ...original.metadata, uuid: "page2" } }] }) };
  await assert.rejects(prepareFlatDisplayProfile({ ...twoPages, operation, context }), /one complete/u);
});

void test("flat display phases preserve complete peer membership and reject operation, inverse and legacy binding substitution", async () => {
  const value = fixture();
  const prepared = await prepareFlatDisplayProfile({ ...value, operation, context });
  const altered = structuredClone(value), documents = structuredClone(altered.evidence.history.documents), pcb = documents.find((document) => document.uuid === "pcb");
  assert.ok(pcb); const meta = pcb.records[0]; assert.ok(meta); meta.body["title"] = "Changed";
  altered.evidence = { ...altered.evidence, history: rehash({ ...altered.evidence.history, documents }) };
  assert.throws(() => { verifyFlatDisplayObservation(prepared.binding, operation, context, altered.evidence, altered.native, "before"); }, /peer document/u);
  assert.throws(() => assertFlatDisplayBinding(prepared.binding.topology, operation, context));
  assert.throws(() => assertFlatDisplayBinding({ ...prepared.binding, profile: "legacy" }, operation, context));
  assert.throws(() => assertFlatDisplayBinding({ ...prepared.binding, authority: true }, operation, context));
  assert.throws(() => assertFlatDisplayBinding(prepared.binding, { ...operation, id: "replacement" }, context), /sealed binding/u);
  assert.throws(() => assertFlatDisplayInverse(prepared.binding, { ...prepared.inverse, id: "replacement" }), /complete inverse/u);
});

void test("flat display baseline indexing never collapses duplicate durable record identities", async () => {
  for (const changedBody of [false, true]) {
    const value = fixture();
    const documents = value.evidence.history.documents.map((document) => {
      if (document.uuid !== "page") { return document; }
      const original = document.records.find((record) => record.id === "text"); assert.ok(original);
      const duplicate = { ...structuredClone(original), body: { ...original.body, ...(changedBody ? { x: 999 } : {}) } };
      return { ...document, records: [...document.records, duplicate] };
    });
    value.evidence = { ...value.evidence, history: rehash({ ...value.evidence.history, documents }) };
    await assert.rejects(prepareFlatDisplayProfile({ ...value, operation, context }), /complete stored\/source target record membership/u);
  }
});

void test("flat display preparation captures caller data before cooperative yields", async () => {
  const value = fixture();
  const input = { ...value, operation: structuredClone(operation), context: structuredClone(context) };
  const pending = prepareFlatDisplayProfile(input); input.operation.id = "substitution"; input.context.project.path = "/tmp/other.eprj2";
  const prepared = await pending; assert.equal(prepared.operation.id, operation.id); assert.equal(prepared.binding.projectPath, context.project.path);
});

void test("flat display durable classification admits only complete baseline or exact intended effect and rejects collateral target or peer records", async () => {
  const before = fixture(), prepared = await prepareFlatDisplayProfile({ ...before, context, operation });
  const after = replaceSource(before, prepared.expectedSource, prepared.expectedNative);
  const input = { binding: prepared.binding, operation, context, baseline: before.evidence.history, before: parseDocumentSource(before.native.source),
    beforeNative: before.native, current: prepared.expectedSource, currentNative: prepared.expectedNative, evidence: after.evidence, allowAfter: true };
  const intended = await verifyFlatDisplayPersistence(input);
  const unchanged = await verifyFlatDisplayPersistence({ ...input, evidence: { ...after.evidence, history: before.evidence.history } });
  assert.equal(intended["classification"], "exact-intended-effect");
  assert.equal(unchanged["classification"], "unchanged-baseline");
  for (const kind of ["target", "partial", "peer", "member"] as const) {
    const documents = [...structuredClone(after.evidence.history.documents)];
    const target = documents.find((document) => document.uuid === (kind === "peer" ? "pcb" : "page")); assert.ok(target);
    if (kind === "member") { documents.pop(); }
    else {
      const row = target.records.find((record) => record.id === (kind === "partial" ? "text" : "META")); assert.ok(row);
      if (kind === "partial") { row.body["y"] = 0; } else { row.body["title"] = "Collateral"; }
    }
    const evidence = { ...after.evidence, history: rehash({ ...after.evidence.history, documents }) };
    await assert.rejects(verifyFlatDisplayPersistence({ ...input, evidence }));
  }
});

void test("fixed flat project guard binds ownership and refuses host/project replacement across awaits and between passes", async () => {
  const binding = { projectUuid, ownerUuid, branchUuid };
  for (const drift of ["none", "branch", "owner", "project-object", "host-object", "between"] as const) {
    const project = { projectId: projectUuid, branchUuid, isV2Format: false };
    const metadata = { uuid: projectUuid, owner: { uuid: ownerUuid }, currentBranch: branchUuid, isV2Format: false };
    const runtime: { gVars?: object } = {};
    const host = { currentProject: project, isHistoryMode: false, messageBus: { rpcCall: async (topic: string, args: unknown): Promise<{ message: object }> => {
      assert.equal(topic, "/PrjDB/project/getData"); assert.deepEqual(structuredClone(args), [projectUuid]);
      await Promise.resolve();
      if (drift === "branch") { project.branchUuid = "f".repeat(32); }
      if (drift === "owner") { metadata.owner.uuid = "f".repeat(32); }
      if (drift === "project-object") { host.currentProject = { ...project }; }
      if (drift === "host-object") { runtime.gVars = { ...host }; }
      return { message: metadata };
    } } };
    runtime.gVars = host;
    const guard: unknown = runInNewContext(buildFlatDisplayProjectGuardExpression(binding), runtime); assert.ok(guard !== null && typeof guard === "object");
    const read: unknown = Reflect.get(guard, "read"); assert.ok(typeof read === "function");
    const check: unknown = Reflect.get(guard, "check"); assert.ok(typeof check === "function");
    const call = (): Promise<unknown> => Promise.resolve(Reflect.apply(read, undefined, []));
    if (["none", "between"].includes(drift)) {
      await call(); if (drift === "between") { runtime.gVars = { ...host }; assert.throws(() => Reflect.apply(check, undefined, []), /PROJECT_DRIFT/u); await assert.rejects(call(), /PROJECT_DRIFT/u); } else { await call(); }
    } else { await assert.rejects(call(), /PROJECT_/u); }
  }
  assert.throws(() => buildFlatDisplayProjectGuardExpression({ ...binding, projectUuid: "caller()" }));
});
