import assert from "node:assert/strict";
import { test } from "node:test";
import { installOwnedNativeDispatch } from "../src/native-owned-dispatch.ts";

const anchor = "        'base' {";
const first = "        'first' {\n          FixedFirst()\n        }\n";
const second = "        'second' {\n          FixedSecond()\n        }\n";
void test("interleaved independent dispatcher blocks retain exactly one copy through repeated generation", () => {
  const apply = (source: string): string => installOwnedNativeDispatch(installOwnedNativeDispatch(source, first, anchor), second, anchor);
  const once = apply(`${first}${anchor}\n        }\n`); assert.equal(apply(once), once);
  assert.equal(once, `${first}${second}${anchor}\n        }\n`);
});
void test("unknown, partial and duplicate owned dispatcher branches refuse", () => {
  const pair = `${first}${second}`;
  for (const source of [`${first}${anchor}\n`, `${pair}${first}${anchor}\n`, `${pair.replace("FixedSecond()", "ChangedSecond()")}${anchor}\n`]) {
    assert.throws(() => installOwnedNativeDispatch(source, pair, anchor), /NATIVE_OWNED_DISPATCH/u);
  }
});
