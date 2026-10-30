/** Real resource-ledger checks with synthetic owner references. No native
 * process, main inspector, application or execution authority is supplied. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { CurrentFootprintCopyForwardMainAccounting as Accounting } from "../src/current-footprint-copy-forward-main-accounting.ts";
import { CurrentFootprintCopyForwardResourceLedger as Ledger, requireOriginalForwardLedgerBinding } from "../src/current-footprint-copy-forward-capacity.ts";
import { CURRENT_FOOTPRINT_COPY_MAIN_TRANSPORT as MAIN } from "../src/current-footprint-copy-main-transport-contract.ts";

function fixture(): Readonly<{ ledger: Ledger; original: object; accounting: Accounting }> {
  const ledger = new Ledger(), original = Object.freeze({}); ledger.bind("forward-writer", original);
  return { ledger, original, accounting: new Accounting(ledger, original) };
}
const bytes = (text: string): string => Buffer.from(text).toString("base64");

void test("main accounting charges native wire bytes and every frame before exposing buffered payload", () => {
  const f = fixture(), first = bytes("abc\0");
  assert.equal(f.accounting.capture({ bytes: first, receivedBytes: 11, frames: 2 }), first);
  assert.equal(f.ledger.status().mainFrames, 2);
  assert.deepEqual(f.accounting.status(), { failed: false, receivedBytes: 11, frames: 2, deliveredBytes: 4, executionAuthorized: false });
  for (let poll = 0; poll < 2; poll += 1) { assert.equal(f.accounting.capture({ bytes: "", receivedBytes: 11, frames: 2 }), ""); }
  const buffered = bytes("more\0"); assert.equal(f.accounting.capture({ bytes: buffered, receivedBytes: 11, frames: 2 }), buffered);
  assert.equal(f.accounting.capture({ bytes: "", receivedBytes: 20, frames: 4 }), "");
  assert.equal(f.accounting.status().deliveredBytes, 9); assert.equal(f.ledger.status().mainFrames, 4);
  // Charge remaining native-wire allowance to distinguish wire from text.
  // The final one-byte refusal would disappear if only returned text counted.
  f.ledger.consumeBytes("forward-writer", f.original, "main", MAIN.totalReceivedBytes - 20);
  assert.throws(() => { f.ledger.consumeBytes("forward-writer", f.original, "main", 1); }, /CAPACITY_BYTES/u);
});

void test("native WebSocket header bytes cannot become phantom decoded payload", () => {
  for (const raw of [{ bytes: bytes("abc"), receivedBytes: 2, frames: 1 },
    { bytes: bytes("a\0"), receivedBytes: 2, frames: 1 }, { bytes: bytes("abc\0"), receivedBytes: 4, frames: 1 }]) {
    const f = fixture(); assert.throws(() => f.accounting.capture(raw), /PAYLOAD_DRIFT/u);
    assert.equal(f.accounting.status().deliveredBytes, 0); assert.equal(f.ledger.status().mainFrames, 0);
  }
  const empty = fixture(), nul = bytes("\0");
  assert.equal(empty.accounting.capture({ bytes: nul, receivedBytes: 2, frames: 1 }), nul);
  assert.equal(empty.accounting.capture({ bytes: "", receivedBytes: 2, frames: 1 }), "");
});

void test("counter reset or counterless payload replay consumes the adapter without refunding observations", () => {
  for (const next of [{ bytes: "", receivedBytes: 7, frames: 2 }, { bytes: "", receivedBytes: 8, frames: 1 },
    { bytes: bytes("123456789"), receivedBytes: 8, frames: 2 }]) {
    const f = fixture(); f.accounting.capture({ bytes: bytes("abc\0"), receivedBytes: 8, frames: 2 });
    assert.throws(() => f.accounting.capture(next), /COUNTER_DRIFT|PAYLOAD_DRIFT/u);
    assert.deepEqual(f.accounting.status(), { failed: true, receivedBytes: 8, frames: 2, deliveredBytes: 4, executionAuthorized: false });
    assert.equal(f.ledger.status().mainFrames, 2);
    assert.throws(() => f.accounting.capture({ bytes: "", receivedBytes: 8, frames: 2 }), /UNAVAILABLE/u);
  }
});

void test("complete fixed chunk and cumulative native limits remain usable without renewal", () => {
  const f = fixture(), payload = Buffer.alloc(32_768).toString("base64");
  assert.equal(f.accounting.capture({ bytes: payload, receivedBytes: 32_782, frames: 1 }), payload);
  assert.equal(f.accounting.capture({ bytes: "", receivedBytes: MAIN.totalReceivedBytes, frames: MAIN.frames }), "");
  assert.equal(f.accounting.capture({ bytes: "", receivedBytes: MAIN.totalReceivedBytes, frames: MAIN.frames }), "");
  assert.equal(f.ledger.status().mainFrames, MAIN.frames);
  assert.equal(f.accounting.status().receivedBytes, MAIN.totalReceivedBytes);
  assert.throws(() => f.accounting.capture({ bytes: "", receivedBytes: MAIN.totalReceivedBytes + 1, frames: MAIN.frames }), /COUNT/u);
  assert.equal(f.accounting.status().failed, true);
});

void test("malformed, excessive or noncanonical helper data is rejected before ledger charging", () => {
  const good = { bytes: "", receivedBytes: 0, frames: 0 };
  for (const raw of [null, [], { ...good, extra: true }, { ...good, [Symbol("extra")]: true },
    { ...good, receivedBytes: -0 }, { ...good, receivedBytes: Number.NaN }, { ...good, receivedBytes: 1.1 },
    { ...good, receivedBytes: MAIN.totalReceivedBytes + 1 }, { ...good, frames: MAIN.frames + 1 },
    { ...good, receivedBytes: 1, frames: 1 }, { ...good, bytes: "YQ=" }, { ...good, bytes: "YR==" },
    { ...good, bytes: Buffer.alloc(32_769).toString("base64") }, { ...good, bytes: bytes("a"), receivedBytes: 10 }]) {
    const f = fixture(); assert.throws(() => f.accounting.capture(raw), /FOOTPRINT_FORWARD_MAIN_ACCOUNTING/u);
    assert.equal(f.accounting.status().failed, true); assert.equal(f.ledger.status().mainFrames, 0);
    f.ledger.consumeBytes("forward-writer", f.original, "main", MAIN.totalReceivedBytes);
    assert.throws(() => f.accounting.capture(good), /UNAVAILABLE/u);
  }
});

void test("helper accessors, proxies and coercion hooks are never invoked", () => {
  let hooks = 0;
  const good = { bytes: "", receivedBytes: 0, frames: 0 };
  const accessor = Object.defineProperty({ ...good }, "receivedBytes", { enumerable: true,
    get: (): number => { hooks += 1; return 0; } });
  const proxy = new Proxy(good, { ownKeys: (): never => { hooks += 1; throw new Error("proxy hook"); } });
  const coercion = { valueOf: (): number => { hooks += 1; return 0; } };
  for (const raw of [accessor, proxy, { ...good, receivedBytes: coercion }, { ...good, bytes: coercion }]) {
    const f = fixture(); assert.throws(() => f.accounting.capture(raw)); assert.equal(f.ledger.status().mainFrames, 0);
  }
  assert.equal(hooks, 0);
});

void test("original ledger binding is stable and rejects forged instances, copied owners and replaced methods", () => {
  const f = fixture();
  const binding = requireOriginalForwardLedgerBinding(f.ledger);
  assert.equal(requireOriginalForwardLedgerBinding(f.ledger), binding); assert.ok(Object.isFrozen(binding));
  assert.throws(() => new Accounting(f.ledger, { ...f.original }), /ORIGINAL_GENERATION/u);
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- This hostile fixture deliberately lacks the real class's private fields and registry entry.
  const forged = Object.create(Ledger.prototype) as Ledger;
  assert.throws(() => new Accounting(forged, f.original), /ORIGINAL_LEDGER/u);
  const method = Object.getOwnPropertyDescriptor(Ledger.prototype, "consumeBytes"); assert.ok(method !== undefined);
  let replacements = 0;
  Object.defineProperty(Ledger.prototype, "consumeBytes", { ...method, value: (): void => { replacements += 1; } });
  try {
    assert.throws(() => f.accounting.capture({ bytes: "", receivedBytes: 2, frames: 1 }), /ORIGINAL_LEDGER_METHODS/u);
    assert.throws(() => requireOriginalForwardLedgerBinding(f.ledger), /ORIGINAL_LEDGER_METHODS/u);
  } finally { Object.defineProperty(Ledger.prototype, "consumeBytes", method); }
  assert.equal(replacements, 0); assert.equal(f.accounting.status().receivedBytes, 0);
  assert.throws(() => f.accounting.capture({ bytes: "", receivedBytes: 0, frames: 0 }), /UNAVAILABLE/u);
  const overridden = fixture(); Object.defineProperty(overridden.ledger, "status", { value: (): unknown => { replacements += 1; return {}; } });
  assert.throws(() => overridden.accounting.capture({ bytes: "", receivedBytes: 0, frames: 0 }), /ORIGINAL_LEDGER/u);
  assert.equal(replacements, 0);
});

void test("ledger refusal preserves consumed counters, leaves the accounting snapshot unchanged and cannot expose payload", () => {
  const f = fixture(); f.ledger.consumeBytes("forward-writer", f.original, "main", MAIN.totalReceivedBytes);
  assert.throws(() => f.accounting.capture({ bytes: bytes("a\0"), receivedBytes: 4, frames: 1 }), /CAPACITY_BYTES/u);
  assert.equal(f.ledger.status().failed, true); assert.equal(f.accounting.status().receivedBytes, 0);
  assert.equal(f.accounting.status().deliveredBytes, 0); assert.equal(f.accounting.status().failed, true);
  const frames = fixture();
  for (let frame = 0; frame < MAIN.frames; frame += 1) { frames.ledger.consumeMainFrame("forward-writer", frames.original, 0); }
  assert.throws(() => frames.accounting.capture({ bytes: "", receivedBytes: 2, frames: 1 }), /CAPACITY_MAIN_FRAME/u);
  assert.equal(frames.ledger.status().mainFrames, MAIN.frames);
  assert.equal(frames.accounting.status().frames, 0); assert.equal(frames.accounting.status().failed, true);
});

void test("accounting capture and status are immutable own functions despite prototype substitution", () => {
  const f = fixture(); assert.ok(Object.isFrozen(f.accounting));
  const capture = Object.getOwnPropertyDescriptor(f.accounting, "capture");
  assert.ok(capture !== undefined && capture.writable === false && capture.configurable === false);
  Object.defineProperty(Accounting.prototype, "capture", { configurable: true, value: (): string => "bypassed" });
  try {
    assert.equal(f.accounting.capture({ bytes: "", receivedBytes: 2, frames: 1 }), "");
    assert.equal(f.ledger.status().mainFrames, 1);
    assert.throws(() => Object.defineProperty(f.accounting, "capture", { value: (): string => "bypassed" }));
  } finally { assert.equal(Reflect.deleteProperty(Accounting.prototype, "capture"), true); }
});
