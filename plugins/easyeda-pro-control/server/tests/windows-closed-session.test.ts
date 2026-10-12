import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { canonicalJson, sha256Json } from "../src/core.ts";
import { assertClosedSessionCopyAuthority, assertClosedSessionTerminationProof } from "../src/windows-authority.ts";
import type { ClosedSessionBinding, ClosedSessionCloseReceipt } from "../src/windows-authority.ts";
import { INPUT, closedSessionFixture, mintSyntheticClosedSessionProof } from "./helpers/windows-closed-session-fixture.ts";

async function prepared(): Promise<{
  fixture: ReturnType<typeof closedSessionFixture>; binding: ClosedSessionBinding;
  intent: Awaited<ReturnType<ReturnType<typeof closedSessionFixture>["supervisor"]["prepareClosedSessionClose"]>>;
}> {
  const fixture = closedSessionFixture();
  const binding = await fixture.capture();
  const intent = await fixture.supervisor.prepareClosedSessionClose({ ...binding, windowHandle: "12345" });
  return { fixture, binding, intent };
}
async function dispatched(): Promise<Awaited<ReturnType<typeof prepared>> & { closeReceipt: ClosedSessionCloseReceipt }> {
  const result = await prepared();
  const closeReceipt = await result.fixture.supervisor.requestClosedSessionNormalClose({ ...result.binding,
    intent: result.intent, confirmNormalClose: true });
  return { ...result, closeReceipt };
}
function count(fixture: ReturnType<typeof closedSessionFixture>, action: string): number {
  return fixture.requests.filter((entry) => entry["action"] === action).length;
}

void test("closed-session additions preserve the original recovery function body", async () => {
  const source = await readFile(new URL("../src/windows-authority.ts", import.meta.url), "utf8");
  const end = "\n  }\n", start = "  async function proveTerminated(";
  const body = source.slice(source.indexOf(start), source.indexOf(end, source.indexOf(start)) + end.length);
  assert.equal(Buffer.byteLength(body), 2374);
  assert.equal(createHash("sha256").update(body).digest("hex"), "6057846cd982f3740a31ccdc82590f56f76c9bde0b3cfc4a47a3a51c8f7606c4");
});

void test("normal-close acknowledgment is not termination; proof binds original session and no replacement", async () => {
  const { fixture, binding, intent, closeReceipt } = await dispatched();
  assert.equal(closeReceipt.terminationProved, false);
  assert.equal(count(fixture, "prove-terminated"), 0);
  await assert.rejects(assertClosedSessionTerminationProof(closeReceipt), /not issued/u);
  const proof = await fixture.supervisor.proveClosedSession({ ...binding, intent, closeReceipt });
  assert.equal(await assertClosedSessionTerminationProof(proof), proof);
  assert.equal(proof["operationId"], binding.operationId);
  assert.equal(proof["phase"], binding.phase);
  assert.equal(proof["bridgeSessionSha256"], sha256Json(binding.bridgeSession));
  assert.equal(proof["runtimeIdentitySha256"], sha256Json(binding.runtimeIdentity));
  assert.equal(proof.launchSha256, sha256Json(binding.launch));
  assert.equal(proof.queuedWritesPersisted, "not-proved");
  assert.equal(proof.persistentWorkReplayExcluded, "not-proved");
  assert.deepEqual(fixture.requests.map((entry) => entry["action"]), ["launch", "capture", "normal-close", "prove-terminated"]);
});

void test("proof requires retained acknowledgment, not a caller's plausible receipt", async () => {
  const { fixture, binding, intent } = await prepared();
  const fake: ClosedSessionCloseReceipt = {
    schema: "easyeda-pro-control.closed-session-close-dispatch.v1", closeIntentSha256: intent.closeIntentSha256,
    closeDispatched: true, saveOrDiscardSelected: false, terminationProved: false, closeReceiptSha256: "a".repeat(64),
  };
  await assert.rejects(fixture.supervisor.proveClosedSession({ ...binding, intent, closeReceipt: fake }), /acknowledged/u);
  assert.equal(count(fixture, "prove-terminated"), 0);
});

const bindingMutations: readonly [string, (binding: ClosedSessionBinding) => ClosedSessionBinding][] = [
  ["operation", (binding) => ({ ...binding, operationId: "another" })],
  ["phase", (binding) => ({ ...binding, phase: "another" })],
  ["attempt", (binding) => ({ ...binding, challengeAttempt: 2 })],
  ["bridge session", (binding) => ({ ...binding, bridgeSession: { ...binding.bridgeSession, sequence: 2 } })],
  ["runtime generation", (binding) => ({ ...binding, runtimeIdentity: { ...binding.runtimeIdentity, generation: "another" } })],
  ["helper", (binding) => ({ ...binding, launch: { ...binding.launch, helperInstance: "f".repeat(32) } })],
  ["Job", (binding) => ({ ...binding, launch: { ...binding.launch, jobId: "f".repeat(32) } })],
  ["root generation", (binding) => ({ ...binding, launch: { ...binding.launch,
    root: { ...binding.launch.root, startIdentity: `win32:639247486999999999:job:${binding.launch.jobId}` } } })],
  ["authority", (binding) => ({ ...binding, executionAuthority: { ...binding.executionAuthority, processes: [] } })],
];
for (const [label, mutate] of bindingMutations) {
  void test(`changed ${label} refuses before normal close`, async () => {
    const { fixture, binding, intent } = await prepared();
    await assert.rejects(fixture.supervisor.requestClosedSessionNormalClose({ ...mutate(binding), intent, confirmNormalClose: true }), /retained|reservation/u);
    assert.equal(count(fixture, "normal-close"), 0);
  });
}

for (const [label, close] of [
  ["refused", { closeDispatched: false }], ["wrong Job", { jobId: "f".repeat(32) }],
  ["prompt selection", { saveOrDiscardSelected: true }],
] as const) {
  void test(`close ${label} consumes the attempt without minting acknowledgment`, async () => {
    const { fixture, binding, intent } = await prepared();
    fixture.behavior.close = close;
    await assert.rejects(fixture.supervisor.requestClosedSessionNormalClose({ ...binding, intent, confirmNormalClose: true }), /acknowledgment/u);
    fixture.behavior.close = {};
    await assert.rejects(fixture.supervisor.requestClosedSessionNormalClose({ ...binding, intent, confirmNormalClose: true }), /already attempted/u);
    assert.equal(count(fixture, "normal-close"), 1);
  });
}

void test("lost close return cannot be retried; reserved generic close cannot bypass it", async () => {
  const { fixture, binding, intent } = await prepared();
  fixture.behavior.errorAction = "normal-close";
  await assert.rejects(fixture.supervisor.requestClosedSessionNormalClose({ ...binding, intent, confirmNormalClose: true }), /request refused/u);
  fixture.behavior.errorAction = undefined;
  await assert.rejects(fixture.supervisor.requestClosedSessionNormalClose({ ...binding, intent, confirmNormalClose: true }), /already attempted/u);
  await assert.rejects(fixture.supervisor.requestNormalClose({ launch: binding.launch, windowHandle: "12345", confirmNormalClose: true }), /cannot bypass/u);
  assert.equal(count(fixture, "normal-close"), 1);
});

void test("reservation prevents duplicate preparation and generic close before dispatch", async () => {
  const { fixture, binding } = await prepared();
  await assert.rejects(fixture.supervisor.prepareClosedSessionClose({ ...binding, windowHandle: "12345" }), /reservation/u);
  await assert.rejects(fixture.supervisor.requestNormalClose({ launch: binding.launch, windowHandle: "12345", confirmNormalClose: true }), /cannot bypass/u);
  assert.equal(count(fixture, "normal-close"), 0);
});

void test("earlier generic close prevents later closed-session admission", async () => {
  const fixture = closedSessionFixture();
  const binding = await fixture.capture();
  await fixture.supervisor.requestNormalClose({ launch: binding.launch, windowHandle: "12345", confirmNormalClose: true });
  await assert.rejects(fixture.supervisor.prepareClosedSessionClose({ ...binding, windowHandle: "12345" }), /close attempt/u);
  assert.equal(count(fixture, "normal-close"), 1);
});

for (const [label, termination] of [
  ["late child remains", { jobEmpty: false }], ["retained process remains", { retainedProcessesExited: false }],
  ["wrong helper", { helperInstance: "f".repeat(32) }], ["wrong Job", { jobId: "f".repeat(32) }],
  ["wrong capture", { captureBindingSha256: "f".repeat(64) }],
  ["old time", { checkedAt: "2026-10-11T00:00:00.000Z" }], ["invalid time", { checkedAt: "invalid" }],
] as const) {
  void test(`termination rejects ${label}; a read-only retry does not repeat close`, async () => {
    const { fixture, binding, intent, closeReceipt } = await dispatched();
    fixture.behavior.termination = termination;
    await assert.rejects(fixture.supervisor.proveClosedSession({ ...binding, intent, closeReceipt }), /terminated|malformed/u);
    fixture.behavior.termination = {};
    const proof = await fixture.supervisor.proveClosedSession({ ...binding, intent, closeReceipt });
    assert.equal(await assertClosedSessionTerminationProof(proof), proof);
    assert.equal(count(fixture, "normal-close"), 1);
    assert.equal(count(fixture, "prove-terminated"), 2);
  });
}

void test("terminal proof export neither uses replacement generation nor releases any capture", async () => {
  const { fixture, binding, intent, closeReceipt } = await dispatched();
  const proof = await fixture.supervisor.proveClosedSession({ ...binding, intent, closeReceipt });
  assert.equal(await assertClosedSessionCopyAuthority(proof), proof);
  const second = await fixture.capture({ ...INPUT, bindingSha256: "9".repeat(64), operationId: "second-operation" });
  await assert.rejects(assertClosedSessionCopyAuthority(proof), /retained|intervening/u);
  const again = await fixture.supervisor.proveClosedSession({ ...binding, intent, closeReceipt });
  assert.equal(canonicalJson(again), canonicalJson(proof));
  assert.equal(await assertClosedSessionTerminationProof(again), again);
  assert.equal(count(fixture, "prove-terminated"), 1);
  assert.equal(count(fixture, "release-capture"), 0);
  // Reservation is Job-local, not a global ban on the unrelated second Job.
  await fixture.supervisor.requestNormalClose({ launch: second.launch, windowHandle: "54321", confirmNormalClose: true });
  await fixture.supervisor.releaseCapture(second.executionAuthority);
  assert.equal(count(fixture, "release-capture"), 1);
  assert.equal(await assertClosedSessionTerminationProof(proof), proof);
});

for (const label of ["helper lost", "source drift", "policy drift", "validator replaced", "released capture", "uncertain release", "released supervisor"]) {
  void test(`terminal proof cannot survive ${label}`, async () => {
    const { fixture, binding, intent, closeReceipt } = await dispatched();
    const proof = await fixture.supervisor.proveClosedSession({ ...binding, intent, closeReceipt });
    switch (label) {
      case "helper lost": { fixture.behavior.helperLost = true; break; }
      case "source drift": { fixture.behavior.helperDrift = true; break; }
      case "policy drift": { fixture.policy.helperSha256 = "f".repeat(64); break; }
      case "validator replaced": { fixture.policy.revalidateClosedSessionHelper = (): Promise<void> => Promise.resolve(); break; }
      case "released capture": { await fixture.supervisor.releaseCapture(binding.executionAuthority); break; }
      case "uncertain release": {
        fixture.behavior.released = { released: false };
        await assert.rejects(fixture.supervisor.releaseCapture(binding.executionAuthority), /not proved/u);
        break;
      }
      case "released supervisor": { await fixture.supervisor.release(); break; }
      default: { throw new Error("Unknown fixture mode"); }
    }
    await assert.rejects(assertClosedSessionTerminationProof(proof), /helper|policy|retained|released/u);
    await assert.rejects(fixture.supervisor.proveClosedSession({ ...binding, intent, closeReceipt }), /helper|policy|retained|released/u);
    assert.equal(count(fixture, "normal-close"), 1);
  });
}

void test("brand registry rejects serialized receipts, clones, object spread, fabricated verifier and mutation", async () => {
  const { proof } = await mintSyntheticClosedSessionProof();
  // oxlint-disable-next-line unicorn/prefer-structured-clone -- Prove that JSON round-trips lose authority independently of structuredClone.
  const serialized: unknown = JSON.parse(JSON.stringify(proof));
  for (const candidate of [serialized, structuredClone(proof), { ...proof },
    { validateClosedSessionProof: (): unknown => proof }, null, true]) {
    await assert.rejects(assertClosedSessionTerminationProof(candidate), /not issued/u);
    await assert.rejects(assertClosedSessionCopyAuthority(candidate), /not issued/u);
  }
  assert.equal(Object.isFrozen(proof), true);
  assert.throws(() => Object.assign(proof, { jobEmpty: false }), TypeError);
  assert.equal(await assertClosedSessionTerminationProof(proof), proof);
});

void test("helper source drift during close or termination cannot publish proof", async () => {
  for (const action of ["normal-close", "prove-terminated"]) {
    const { fixture, binding, intent } = await prepared();
    fixture.behavior.afterRequest = (observed): void => { if (observed === action) { fixture.behavior.helperDrift = true; } };
    if (action === "normal-close") {
      await assert.rejects(fixture.supervisor.requestClosedSessionNormalClose({ ...binding, intent, confirmNormalClose: true }), /source drift/u);
    } else {
      const closeReceipt = await fixture.supervisor.requestClosedSessionNormalClose({ ...binding, intent, confirmNormalClose: true });
      await assert.rejects(fixture.supervisor.proveClosedSession({ ...binding, intent, closeReceipt }), /source drift/u);
    }
    assert.equal(count(fixture, "normal-close"), 1);
  }
});

void test("concurrent normal-close calls dispatch at most once", async () => {
  const { fixture, binding, intent } = await prepared();
  const result = await Promise.allSettled([
    fixture.supervisor.requestClosedSessionNormalClose({ ...binding, intent, confirmNormalClose: true }),
    fixture.supervisor.requestClosedSessionNormalClose({ ...binding, intent, confirmNormalClose: true }),
  ]);
  assert.equal(result.filter((entry) => entry.status === "fulfilled").length, 1);
  assert.equal(result.filter((entry) => entry.status === "rejected").length, 1);
  assert.equal(count(fixture, "normal-close"), 1);
});

void test("concurrent termination checks cannot replace or invalidate the first issued proof", async () => {
  const { fixture, binding, intent, closeReceipt } = await dispatched();
  const results = await Promise.allSettled([
    fixture.supervisor.proveClosedSession({ ...binding, intent, closeReceipt }),
    fixture.supervisor.proveClosedSession({ ...binding, intent, closeReceipt }),
  ]);
  const fulfilled = results.filter((entry) => entry.status === "fulfilled");
  const rejected = results.filter((entry) => entry.status === "rejected");
  assert.equal(fulfilled.length, 1);
  assert.equal(rejected.length, 1);
  assert.match(String(rejected[0]?.reason), /already in progress/u);
  assert.equal(count(fixture, "prove-terminated"), 1);
  const proof = fulfilled[0]?.value;
  assert.notEqual(proof, undefined);
  assert.equal(await assertClosedSessionTerminationProof(proof), proof);
  assert.equal(await assertClosedSessionCopyAuthority(proof), proof);
  const cached = await fixture.supervisor.proveClosedSession({ ...binding, intent, closeReceipt });
  assert.equal(canonicalJson(cached), canonicalJson(proof));
  assert.equal(await assertClosedSessionTerminationProof(proof), proof);
  assert.equal(count(fixture, "prove-terminated"), 1);
});

void test("changed intent or acknowledged receipt cannot inherit the issued proof", async () => {
  const { fixture, binding, intent, closeReceipt } = await dispatched();
  await assert.rejects(fixture.supervisor.proveClosedSession({ ...binding,
    intent: { ...intent, windowHandle: "54321" }, closeReceipt }), /reservation/u);
  await assert.rejects(fixture.supervisor.proveClosedSession({ ...binding, intent,
    closeReceipt: { ...closeReceipt, closeReceiptSha256: "f".repeat(64) } }), /acknowledged/u);
  assert.equal(count(fixture, "prove-terminated"), 0);
});

void test("missing or drifted helper proof before close consumes the attempt without dispatch", async () => {
  for (const mode of ["missing", "drift"]) {
    const { fixture, binding, intent } = await prepared();
    if (mode === "missing") { delete fixture.policy.revalidateClosedSessionHelper; }
    else { fixture.behavior.helperDrift = true; }
    await assert.rejects(fixture.supervisor.requestClosedSessionNormalClose({ ...binding, intent, confirmNormalClose: true }), /helper/u);
    await assert.rejects(fixture.supervisor.requestClosedSessionNormalClose({ ...binding, intent, confirmNormalClose: true }), /already attempted/u);
    assert.equal(count(fixture, "normal-close"), 0);
  }
});

void test("a new supervised generation before termination cannot finish the old live proof", async () => {
  const { fixture, binding, intent, closeReceipt } = await dispatched();
  await fixture.supervisor.launch({ confirmLaunch: true });
  await assert.rejects(fixture.supervisor.proveClosedSession({ ...binding, intent, closeReceipt }), /retained/u);
  assert.equal(count(fixture, "prove-terminated"), 0);
});

void test("same-Job capture attempt invalidates copy admission but retains the terminal exit fact", async () => {
  const { fixture, proof } = await mintSyntheticClosedSessionProof();
  await assert.rejects(fixture.supervisor.capture(INPUT), /already used/u);
  assert.equal(await assertClosedSessionTerminationProof(proof), proof);
  await assert.rejects(assertClosedSessionCopyAuthority(proof), /intervening/u);
});

void test("refused release attempt also invalidates copy admission without consuming another capture", async () => {
  const { fixture, binding, intent, closeReceipt } = await dispatched();
  const proof = await fixture.supervisor.proveClosedSession({ ...binding, intent, closeReceipt });
  await assert.rejects(fixture.supervisor.releaseCapture({ ...binding.executionAuthority, authoritySha256: "f".repeat(64) }), /exact retained/u);
  assert.equal(await assertClosedSessionTerminationProof(proof), proof);
  await assert.rejects(assertClosedSessionCopyAuthority(proof), /intervening/u);
  assert.equal(count(fixture, "release-capture"), 0);
});

void test("copy validator catches a lifecycle change during its awaited helper validation", async () => {
  const { fixture, proof } = await mintSyntheticClosedSessionProof();
  fixture.behavior.onHelperCheck = async (): Promise<void> => {
    fixture.behavior.onHelperCheck = undefined;
    await assert.rejects(fixture.supervisor.capture(INPUT), /already used/u);
  };
  await assert.rejects(assertClosedSessionCopyAuthority(proof), /intervening/u);
  assert.equal(await assertClosedSessionTerminationProof(proof), proof);
});

void test("caller mutation during helper await cannot retarget the captured close binding", async () => {
  const { fixture, binding, intent } = await prepared();
  const input = { ...binding, intent, confirmNormalClose: true as const };
  fixture.behavior.onHelperCheck = (): Promise<void> => {
    input.operationId = "caller-mutated";
    Object.assign(input.intent, { windowHandle: "54321" });
    return Promise.resolve();
  };
  const receipt = await fixture.supervisor.requestClosedSessionNormalClose(input);
  assert.equal(receipt.closeIntentSha256, intent.closeIntentSha256);
  assert.equal(fixture.requests.at(-1)?.["windowHandle"], "12345");
  assert.equal(count(fixture, "normal-close"), 1);
});
