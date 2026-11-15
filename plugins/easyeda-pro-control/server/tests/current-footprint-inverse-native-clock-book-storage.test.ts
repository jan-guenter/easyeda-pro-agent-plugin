/** Immutable guard-token comparisons for the native-only clock carrier change. */
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { test } from "node:test";
import { currentPcbDiagnosticCSharpLexicalTokens as tokenize } from "../src/current-pcb-diagnostic-csharp-spacing.ts";
import { currentFootprintInverseNativeDeleteClockNativeSource as clock } from "../src/current-footprint-inverse-native-delete-clock-native.ts";
import { currentFootprintInverseNativeDeleteClockRegistrationNativeSource as registration } from "../src/current-footprint-inverse-native-delete-clock-registration-native.ts";

// Twelve production method pins are unchanged. The smoke pin now admits the
// Correct 64-digit original project domain, independently compiled with C#5.
// Prior smoke: d89a89b44e894c1317ccb878cd57372d3b5fcd8c8777c2a19bfc5b8089da7459.
const expectedMethods = [
  [
    "DncOrderValues",
    "fae2488042201d6992040b8e096e8ddcc85591caebb713c9b8b2cab20582c6ff"
  ],
  [
    "AssertDnc",
    "43ce814c4a18a877a855e9adfd40e34814a4238a4932594fa3df2670d1ee07ac"
  ],
  [
    "ControlNativeDeleteClock",
    "408f0465a963fad6e8cb3a8078eaff65c085379638f502ad4ddec210e79ed047"
  ],
  [
    "DncScalar",
    "9b1b69424931bf0a6897a5c6ed020f259942960c33b7d5848503b3a9ad53c8d1"
  ],
  [
    "NativeDeleteClockMessage",
    "4e61c74ca0af0e6b0b2ec4134c361b34f8272d09b4e2bba1a52397fc8fd31990"
  ],
  [
    "SendNativeDeleteClock",
    "e2c892a81a30022bfcd7e8b5bf2da649130eddd6f654c7dd82c285a3f63d4915"
  ],
  [
    "VerifyNativeDeleteClockSmoke",
    "babab516e05a6b4b2c36e4a2252f57dd914dcfe3d86db682c1d3591373741800"
  ],
  [
    "AssertDncr",
    "6f69e5ad44a691fafc4d342e245f88d1db094add43ccf0325c714b3d99d9225e"
  ],
  [
    "ControlNativeDeleteClockRegistration",
    "deaa601a5a327ce2bf2f53f85190c2fbccf4cc191fb150697949a05f45201353"
  ],
  [
    "DncrScalar",
    "8369a69ac4586f66ce1964fb4fdae76017ab77ab17c55cbb0e7dd1df6ac1fa67"
  ],
  [
    "NativeDeleteClockRegistrationMessage",
    "881cb9669b0e6725e32b5c9c8f4b5f81aef4e03f8b48c8a7cf7db8c1cfb3a147"
  ],
  [
    "SendNativeDeleteClockRegistration",
    "777253daf94326219d7eac66ac45a012301bb6444d0abea799c1e1cc0f949f42"
  ],
  [
    "VerifyNativeDeleteClockRegistrationSmoke",
    "fe86740e29d94d444cece92985d2935299056b12825f9ba3689f626002b5d2f4"
  ]
] as const;
type Token = ReturnType<typeof tokenize>[number];
function closeAt(active: readonly Token[], start: number, open: string, close: string): number {
  let depth = 0;
  for (let index = start; index < active.length; index += 1) {
    const value = active[index]?.text;
    if (value === open) { depth += 1; } else if (value === close) { depth -= 1; if (depth === 0) { return index; } }
  }
  throw new Error("Unbalanced immutable C# method");
}
function methodAt(active: readonly Token[], index: number): readonly (readonly [string, string])[] | null {
  const close = closeAt(active, index + 1, "(", ")");
  if (active[close + 1]?.text !== "{") { return null; }
  const end = closeAt(active, close + 1, "{", "}"); let begin = index - 1;
  while (["public", "private", "static", "internal", "protected"].includes(active[begin - 1]?.text ?? "")) { begin -= 1; }
  return active.slice(begin, end + 1).map(value => [value.kind, value.text] as const);
}
void test("native clock storage preserves twelve original guard methods and the corrected 64-digit smoke", () => {
  const source = (clock() + registration()).replaceAll(/DncE\("([a-z-]+)"\)/gu, 'Error("inverse-native-delete-clock-$1")')
    .replaceAll(/DncrE\("([a-z-]+)"\)/gu, 'Error("inverse-native-delete-clock-registration-$1")');
  const active = tokenize(source).filter(token => token.kind !== "space" && token.kind !== "comment");
  for (const [name, expected] of expectedMethods) {
    const found = active.flatMap((token, index) => {
      if (token.text !== name || active[index + 1]?.text !== "(") { return []; }
      const method = methodAt(active, index); return method === null ? [] : [method];
    });
    assert.equal(found.length, 1); assert.equal(createHash("sha256").update(JSON.stringify(found[0])).digest("hex"), expected, name);
  }
});
