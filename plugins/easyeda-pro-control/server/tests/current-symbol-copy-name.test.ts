import assert from "node:assert/strict";
import { test } from "node:test";
import { deriveCurrentSymbolCopyName } from "../src/current-symbol-copy-name.ts";

void test("copy name uses all supplied case-folded titles and returns an immutable result", () => {
  const titles = Object.freeze(["OpAmp", "opamp_1", "Unrelated"]);
  const result = deriveCurrentSymbolCopyName("OpAmp", titles);
  assert.deepEqual(result, { name: "OpAmp_2", collisions: 2 });
  assert.ok(Object.isFrozen(result));
  assert.deepEqual(titles, ["OpAmp", "opamp_1", "Unrelated"]);
  assert.equal(Object.hasOwn(result, "executionAuthorized"), false);
});

void test("copy name preserves the native literal Number suffix behavior without trimming", () => {
  const cases = [
    ["OpAmp_01", "OpAmp_2"], ["OpAmp_", "OpAmp_1"], ["_", "__1"], ["__", "___1"],
    ["A_  ", "A_1"], ["A_1e2", "A_101"], ["A_0x10", "A_17"], ["A_-1", "A_0"],
    ["A_1.5", "A_2.5"], [" Name ", " Name _1"], ["a_i", "a_i_1"],
  ] as const;
  for (const [source, expected] of cases) {
    assert.deepEqual(deriveCurrentSymbolCopyName(source, [source]), { name: expected, collisions: 1 });
  }
});

void test("copy name admits the 501st checked candidate but refuses the unchecked exhausted return", () => {
  const titles = ["A", ...Array.from({ length: 499 }, (_, index) => `A_${index + 1}`)];
  assert.deepEqual(deriveCurrentSymbolCopyName("A", titles), { name: "A_500", collisions: 500 });
  titles.push("A_500");
  assert.throws(() => deriveCurrentSymbolCopyName("A", titles), /search exhausted/u);
  assert.throws(() => deriveCurrentSymbolCopyName("A_9007199254740992", ["A_9007199254740992"]), /search exhausted/u);
});

void test("copy name admits uppercase I only when both native ASCII foldings agree on every collision", () => {
  const cases = [
    { source: "IC", titles: ["IC"], expected: "IC_1", collisions: 1 },
    { source: "IC", titles: ["IC", "Ic_1", "UnrelatedI"], expected: "IC_2", collisions: 2 },
    { source: "Resistor", titles: ["Resistor", "UNUSED_IC_SYMBOL"], expected: "Resistor_1", collisions: 1 },
    { source: "VALIDATION_SYMBOL", titles: ["VALIDATION_SYMBOL", "UNUSED_IC_SYMBOL"], expected: "VALIDATION_SYMBOL_1", collisions: 1 },
    { source: "iC", titles: ["iC", "ic_1", "OTHER_I"], expected: "iC_2", collisions: 2 },
  ];
  for (const { source, titles, expected, collisions } of cases) {
    const result = deriveCurrentSymbolCopyName(source, titles);
    assert.deepEqual(result, { name: expected, collisions });
    for (const locale of ["en", "tr", "az", "lt"]) {
      const names = titles.map((title) => title.toLocaleLowerCase(locale));
      assert.equal(new Set(names).size, titles.length);
      assert.equal(names.includes(result.name.toLocaleLowerCase(locale)), false);
      assert.equal(names.includes(source.toLocaleLowerCase(locale)), true);
    }
  }
});

void test("copy name refuses locale-dependent collisions in either direction before returning a name", () => {
  for (const [source, peer] of [["IC", "ic_1"], ["ic", "IC_1"], ["Mix", "MIx_1"], ["MIx", "Mix_1"]] as const) {
    assert.throws(() => deriveCurrentSymbolCopyName(source, [source, peer]), /locale-dependent collision/u);
  }
  assert.throws(() => deriveCurrentSymbolCopyName("IC", ["IC", "Ic_1", "ic_2"]), /locale-dependent collision/u);
  // An unused ambiguous title still cannot bypass complete-inventory uniqueness.
  assert.throws(() => deriveCurrentSymbolCopyName("A", ["A", "UNUSED_I", "unused_i"]), /duplicate folded/u);
  assert.throws(() => deriveCurrentSymbolCopyName("IC", ["IC", "ic"]), /duplicate folded/u);
});

void test("copy name retains its candidate bound when uppercase I is admitted", () => {
  const titles = ["IC", ...Array.from({ length: 499 }, (_, index) => `IC_${index + 1}`)];
  assert.deepEqual(deriveCurrentSymbolCopyName("IC", titles), { name: "IC_500", collisions: 500 });
  assert.throws(() => deriveCurrentSymbolCopyName("IC", [...titles, "ic_500"]), /locale-dependent collision/u);
  assert.throws(() => deriveCurrentSymbolCopyName("IC", [...titles, "IC_500"]), /search exhausted/u);
});

void test("copy name refuses non-ASCII titles, controls, empty names and invalid generated names", () => {
  for (const source of ["", "\u0130c", "\u212Amp", "Op\nAmp", "A\u007F", "A".repeat(513)]) {
    assert.throws(() => deriveCurrentSymbolCopyName(source, [source]), /policy/u);
  }
  for (const peer of ["\u0130c", "\u0131c", "\u00C9", "bad\tname"]) {
    assert.throws(() => deriveCurrentSymbolCopyName("A", ["A", peer]), /policy/u);
  }
  assert.throws(() => deriveCurrentSymbolCopyName("A_1e309", ["A_1e309"]), /policy/u);
  assert.throws(() => deriveCurrentSymbolCopyName("IC_-1e309", ["IC_-1e309"]), /policy/u);
  assert.throws(() => deriveCurrentSymbolCopyName("A_Infinity", ["A_Infinity"]), /policy/u);
  assert.throws(() => deriveCurrentSymbolCopyName("A".repeat(512), ["A".repeat(512)]), /policy/u);
});

void test("copy name requires exact source membership and refuses ambiguous folded inventories", () => {
  assert.throws(() => deriveCurrentSymbolCopyName("A", ["B"]), /exact source/u);
  assert.throws(() => deriveCurrentSymbolCopyName("A", ["a"]), /exact source/u);
  assert.throws(() => deriveCurrentSymbolCopyName("A", ["A", "a"]), /duplicate folded/u);
  assert.throws(() => deriveCurrentSymbolCopyName("A", ["A", "A"]), /duplicate folded/u);
});

void test("copy name rejects sparse, accessor, inherited and extended inventory entries without evaluating getters", () => {
  let reads = 0;
  const accessor = ["A"];
  Object.defineProperty(accessor, "0", { get: () => { reads += 1; return "A"; } });
  const inherited: string[] = [];
  inherited.length = 1;
  Object.setPrototypeOf(inherited, { 0: "A" });
  const extra = ["A"];
  Object.defineProperty(extra, "extra", { value: "B" });
  const symbolic = ["A"];
  Object.defineProperty(symbolic, Symbol("extra"), { value: "B" });
  const sparse = ["A"];
  sparse.length = 2;
  for (const titles of [accessor, inherited, extra, symbolic, sparse]) {
    assert.throws(() => deriveCurrentSymbolCopyName("A", titles), /inventory/u);
  }
  assert.equal(reads, 0);
});

void test("copy name bounds complete inventories and validates runtime scalar shapes", () => {
  assert.throws(() => deriveCurrentSymbolCopyName("A", []), /count/u);
  assert.throws(() => deriveCurrentSymbolCopyName("A", Array.from({ length: 4097 }, (_, index) => `A_${index}`)), /count/u);
  const large = ["A", ...Array.from({ length: 2049 }, (_, index) => `${String(index).padStart(4, "0")}${"x".repeat(508)}`)];
  assert.throws(() => deriveCurrentSymbolCopyName("A", large), /byte bound/u);
  for (const title of [null, 1, {}, true]) {
    assert.throws(() => Reflect.apply(deriveCurrentSymbolCopyName, undefined, [title, [title]]), /policy/u);
    assert.throws(() => Reflect.apply(deriveCurrentSymbolCopyName, undefined, ["A", ["A", title]]), /policy/u);
  }
  for (const titles of [null, "A", { 0: "A", length: 1 }]) {
    assert.throws(() => Reflect.apply(deriveCurrentSymbolCopyName, undefined, ["A", titles]), /count/u);
  }
});
